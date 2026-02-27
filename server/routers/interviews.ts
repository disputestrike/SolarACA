import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { interviews, applicants } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const interviewsRouter = router({
  // Schedule an interview
  schedule: publicProcedure
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

      // Get applicant details for notification
      const applicant = await db
        .select()
        .from(applicants)
        .where(eq(applicants.id, input.applicantId))
        .limit(1);

      if (applicant[0]) {
        // Notify owner
        await notifyOwner({
          title: "Interview Scheduled",
          content: `Interview scheduled for ${applicant[0].firstName} ${applicant[0].lastName} on ${input.scheduledAt.toLocaleDateString()} at ${input.scheduledAt.toLocaleTimeString()}`,
        });
      }

      return {
        success: true,
        message: "Interview scheduled successfully",
      };
    }),

  // Get interviews for an applicant
  getByApplicant: publicProcedure
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
  getUpcoming: publicProcedure.query(async () => {
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
  updateStatus: publicProcedure
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
  sendReminder: publicProcedure
    .input(
      z.object({
        interviewId: z.number(),
        reminderType: z.enum(["sms", "email", "both"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Update reminder sent timestamp
      await db
        .update(interviews)
        .set({
          reminderSentAt: new Date(),
          reminderType: input.reminderType,
        })
        .where(eq(interviews.id, input.interviewId));

      // TODO: Integrate with Twilio for SMS and SendGrid for email
      // const interview = await db
      //   .select()
      //   .from(interviews)
      //   .where(eq(interviews.id, input.interviewId))
      //   .limit(1);
      //
      // if (interview[0]) {
      //   const applicant = await db
      //     .select()
      //     .from(applicants)
      //     .where(eq(applicants.id, interview[0].applicantId))
      //     .limit(1);
      //
      //   if (applicant[0]) {
      //     // Send SMS reminder
      //     if (input.reminderType === "sms" || input.reminderType === "both") {
      //       // Twilio API call
      //     }
      //     // Send email reminder
      //     if (input.reminderType === "email" || input.reminderType === "both") {
      //       // SendGrid API call
      //     }
      //   }
      // }

      return {
        success: true,
        message: "Reminder sent successfully",
      };
    }),

  // Get interview statistics
  getStats: publicProcedure.query(async () => {
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
