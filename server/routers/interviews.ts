import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { interviews, applicants } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendSMS } from "../services/twilio";
import { sendEmail } from "../services/sendgrid";
import { getSchedulingUrl, getAvailableSlots, createSchedulingLink } from "../services/calendly";

export const interviewsRouter = router({
  // Schedule an interview
  schedule: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
        scheduledAt: z.date(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create interview record
      const result = await db.insert(interviews).values({
        applicantId: input.applicantId,
        scheduledAt: input.scheduledAt,
        status: "scheduled",
        notes: input.notes,
      });

      // Update applicant status to "screened"
      await db
        .update(applicants)
        .set({
          status: "screened",
          interviewScheduledAt: input.scheduledAt,
          updatedAt: new Date(),
        })
        .where(eq(applicants.id, input.applicantId));

      // Get applicant details for notification and messaging
      const applicant = await db
        .select()
        .from(applicants)
        .where(eq(applicants.id, input.applicantId))
        .limit(1);

      if (applicant[0]) {
        const dateStr = input.scheduledAt.toLocaleDateString();
        const timeStr = input.scheduledAt.toLocaleTimeString();

        // Notify owner
        await notifyOwner({
          title: "Interview Scheduled",
          content: `Interview scheduled for ${applicant[0].firstName} ${applicant[0].lastName} on ${dateStr} at ${timeStr}`,
        });

        // Send SMS confirmation to candidate
        if (applicant[0].phone) {
          await sendSMS(
            applicant[0].phone,
            `Great news ${applicant[0].firstName}! Your interview with Florida Solar Sales Academy is scheduled for ${dateStr} at ${timeStr}. Reply CONFIRM to confirm or call us if you have questions.`
          );
        }

        // Send email confirmation to candidate
        if (applicant[0].email) {
          await sendEmail(
            applicant[0].email,
            "Interview Scheduled - Florida Solar Sales Academy",
            `Hi ${applicant[0].firstName},\n\nCongratulations! Your interview has been scheduled for:\n\nDate: ${dateStr}\nTime: ${timeStr}\nLocation: Virtual (Zoom link will be sent separately)\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nFlorida Solar Sales Academy Team`
          );
        }
      }

      return {
        success: true,
        message: "Interview scheduled successfully",
      };
    }),

  // Get Calendly scheduling link for a candidate
  getSchedulingLink: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const applicant = await db
        .select()
        .from(applicants)
        .where(eq(applicants.id, input.applicantId))
        .limit(1);

      if (!applicant[0]) {
        throw new Error("Applicant not found");
      }

      // Try to create a personalized scheduling link
      const link = await createSchedulingLink(
        `${applicant[0].firstName} ${applicant[0].lastName}`,
        applicant[0].email
      );

      if (link) {
        return { bookingUrl: link.bookingUrl, configured: true };
      }

      // Fall back to generic scheduling URL
      const genericUrl = getSchedulingUrl();
      return {
        bookingUrl: genericUrl || "",
        configured: !!genericUrl,
      };
    }),

  // Get available Calendly time slots
  getAvailableSlots: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => {
      const slots = await getAvailableSlots(input.startDate, input.endDate);
      return slots;
    }),

  // Get interviews for an applicant
  getByApplicant: protectedProcedure
    .input(z.object({ applicantId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select()
        .from(interviews)
        .where(eq(interviews.applicantId, input.applicantId))
        .orderBy(desc(interviews.scheduledAt));

      return result;
    }),

  // Get all upcoming interviews
  getUpcoming: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const now = new Date();
    const result = await db
      .select()
      .from(interviews)
      .where(eq(interviews.status, "scheduled"))
      .orderBy(interviews.scheduledAt);

    return result.filter((i) => i.scheduledAt > now);
  }),

  // Update interview status
  updateStatus: protectedProcedure
    .input(
      z.object({
        interviewId: z.number(),
        status: z.enum(["scheduled", "completed", "no_show", "cancelled"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(interviews)
        .set({
          status: input.status,
          notes: input.notes,
          updatedAt: new Date(),
        })
        .where(eq(interviews.id, input.interviewId));

      // If interview is completed, update applicant status to "interviewed"
      if (input.status === "completed") {
        const interview = await db
          .select()
          .from(interviews)
          .where(eq(interviews.id, input.interviewId))
          .limit(1);

        if (interview[0]) {
          await db
            .update(applicants)
            .set({
              status: "interviewed",
              updatedAt: new Date(),
            })
            .where(eq(applicants.id, interview[0].applicantId));
        }
      }

      return {
        success: true,
        message: "Interview status updated",
      };
    }),

  // Send interview reminder
  sendReminder: protectedProcedure
    .input(
      z.object({
        interviewId: z.number(),
        reminderType: z.enum(["sms", "email", "both"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get interview and applicant details
      const interview = await db
        .select()
        .from(interviews)
        .where(eq(interviews.id, input.interviewId))
        .limit(1);

      if (!interview[0]) {
        throw new Error("Interview not found");
      }

      const applicant = await db
        .select()
        .from(applicants)
        .where(eq(applicants.id, interview[0].applicantId))
        .limit(1);

      if (!applicant[0]) {
        throw new Error("Applicant not found");
      }

      const timeStr = interview[0].scheduledAt.toLocaleTimeString();
      const dateStr = interview[0].scheduledAt.toLocaleDateString();

      // Send SMS reminder
      if ((input.reminderType === "sms" || input.reminderType === "both") && applicant[0].phone) {
        await sendSMS(
          applicant[0].phone,
          `Reminder ${applicant[0].firstName}: Your interview with Florida Solar Sales Academy is on ${dateStr} at ${timeStr}. Looking forward to meeting you!`
        );
      }

      // Send email reminder
      if ((input.reminderType === "email" || input.reminderType === "both") && applicant[0].email) {
        await sendEmail(
          applicant[0].email,
          "Interview Reminder - Florida Solar Sales Academy",
          `Hi ${applicant[0].firstName},\n\nThis is a friendly reminder that your interview with Florida Solar Sales Academy is scheduled for ${dateStr} at ${timeStr}.\n\nWe're looking forward to meeting you and discussing your opportunity to build a career in solar energy.\n\nBest regards,\nFlorida Solar Sales Academy Team`
        );
      }

      // Update reminder sent timestamp
      await db
        .update(interviews)
        .set({
          reminderSentAt: new Date(),
          reminderType: input.reminderType,
        })
        .where(eq(interviews.id, input.interviewId));

      return {
        success: true,
        message: "Reminder sent successfully",
      };
    }),

  // Get interview statistics
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allInterviews = await db.select().from(interviews);

    return {
      total: allInterviews.length,
      scheduled: allInterviews.filter((i) => i.status === "scheduled").length,
      completed: allInterviews.filter((i) => i.status === "completed").length,
      noShow: allInterviews.filter((i) => i.status === "no_show").length,
      cancelled: allInterviews.filter((i) => i.status === "cancelled").length,
    };
  }),
});
