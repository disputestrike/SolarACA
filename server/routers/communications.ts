import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { communicationLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendSMS } from "../services/twilio";
import { sendEmail } from "../services/sendgrid";

// Message templates
export const messageTemplates = {
  applicationReceived: {
    sms: "Hi {name}! We received your application for Florida Solar Sales Academy. We'll review it and be in touch soon. Exciting times ahead!",
    email: {
      subject: "Application Received - Florida Solar Sales Academy",
      body: "Hi {name},\n\nThank you for applying to Florida Solar Sales Academy — we've received your application and resume (if you attached one).\n\nOur team reviews every submission. If your background is a strong fit, someone will reach out within 24–48 hours to schedule a phone screen.\n\nThank you for your interest in solar sales.\n\nBest regards,\nFlorida Solar Sales Academy Team",
    },
  },
  interviewScheduled: {
    sms: "Great news {name}! Your interview is scheduled for {date} at {time}. Reply CONFIRM to confirm or call us if you have questions.",
    email: {
      subject: "Interview Scheduled - Florida Solar Sales Academy",
      body: "Hi {name},\n\nCongratulations! Your interview has been scheduled for:\n\nDate: {date}\nTime: {time}\nLocation: Virtual (Zoom link will be sent separately)\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nFlorida Solar Sales Academy Team",
    },
  },
  interviewReminder: {
    sms: "Reminder {name}: Your interview with Florida Solar Sales Academy is tomorrow at {time}. Looking forward to meeting you!",
    email: {
      subject: "Interview Reminder - Florida Solar Sales Academy",
      body: "Hi {name},\n\nThis is a friendly reminder that your interview with Florida Solar Sales Academy is scheduled for tomorrow at {time}.\n\nWe're looking forward to meeting you and discussing your opportunity to build a career in solar energy.\n\nBest regards,\nFlorida Solar Sales Academy Team",
    },
  },
  offerSent: {
    sms: "Exciting news {name}! We'd like to extend an offer to join our team. Check your email for details.",
    email: {
      subject: "Job Offer - Florida Solar Sales Academy",
      body: "Hi {name},\n\nCongratulations! We're pleased to extend an offer for the position of Solar Sales Professional at Florida Solar Sales Academy.\n\nPlease review the attached offer letter and let us know if you have any questions.\n\nWe're excited to have you join our team!\n\nBest regards,\nFlorida Solar Sales Academy Team",
    },
  },
  trainingStarting: {
    sms: "Welcome to Florida Solar Sales Academy {name}! Your training starts {date}. Check your email for training schedule and materials.",
    email: {
      subject: "Welcome to Florida Solar Sales Academy - Training Schedule",
      body: "Hi {name},\n\nWelcome to the Florida Solar Sales Academy family! We're excited to have you on board.\n\nYour training program begins on {date}. Please find the detailed schedule and pre-work materials attached.\n\nGet ready to launch your solar career!\n\nBest regards,\nFlorida Solar Sales Academy Team",
    },
  },
};

// Function to replace template variables
export function replaceTemplateVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, "g"), value);
  }
  return result;
}

export const communicationsRouter = router({
  // Send SMS message
  sendSMS: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
        phoneNumber: z.string().min(1),
        message: z.string().min(1),
        templateKey: z.string().optional(),
        templateVariables: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let finalMessage = input.message;

      // If template is provided, use it
      if (input.templateKey) {
        const template = (messageTemplates as any)[input.templateKey];
        if (template?.sms) {
          finalMessage = template.sms;
          if (input.templateVariables) {
            const vars: Record<string, string> = {};
            for (const [key, value] of Object.entries(input.templateVariables)) {
              vars[key] = String(value);
            }
            finalMessage = replaceTemplateVariables(finalMessage, vars);
          }
        }
      }

      // Send SMS via Twilio
      const smsResult = await sendSMS(input.phoneNumber, finalMessage);

      // Log the communication
      await db.insert(communicationLog).values({
        applicantId: input.applicantId,
        type: "sms",
        message: finalMessage,
        status: smsResult.success ? "sent" : "failed",
      });

      return {
        success: smsResult.success,
        message: smsResult.success ? "SMS sent successfully" : `SMS failed: ${smsResult.error}`,
        sid: smsResult.sid,
      };
    }),

  // Send email message
  sendEmail: protectedProcedure
    .input(
      z.object({
        applicantId: z.number(),
        email: z.string().email(),
        subject: z.string(),
        body: z.string(),
        templateKey: z.string().optional(),
        templateVariables: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let finalSubject = input.subject;
      let finalBody = input.body;

      // If template is provided, use it
      if (input.templateKey) {
        const template = (messageTemplates as any)[input.templateKey];
        if (template?.email) {
          finalSubject = template.email.subject;
          finalBody = template.email.body;
          if (input.templateVariables) {
            const vars: Record<string, string> = {};
            for (const [key, value] of Object.entries(input.templateVariables)) {
              vars[key] = String(value);
            }
            finalSubject = replaceTemplateVariables(finalSubject, vars);
            finalBody = replaceTemplateVariables(finalBody, vars);
          }
        }
      }

      // Send email via SendGrid
      const emailResult = await sendEmail(input.email, finalSubject, finalBody);

      // Log the communication
      await db.insert(communicationLog).values({
        applicantId: input.applicantId,
        type: "email",
        subject: finalSubject,
        message: finalBody,
        status: emailResult.success ? "sent" : "failed",
      });

      return {
        success: emailResult.success,
        message: emailResult.success ? "Email sent successfully" : `Email failed: ${emailResult.error}`,
      };
    }),

  // Get communication history for an applicant
  getHistory: protectedProcedure
    .input(z.object({ applicantId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const history = await db
        .select()
        .from(communicationLog)
        .where(eq(communicationLog.applicantId, input.applicantId));

      return history;
    }),

  // Get message templates
  getTemplates: protectedProcedure.query(() => {
    return messageTemplates;
  }),
});
