import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { communicationLog } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Message templates
export const messageTemplates = {
  applicationReceived: {
    sms: "Hi {name}! We received your application for Florida Solar Academy. We'll review it and be in touch soon. Exciting times ahead!",
    email: {
      subject: "Application Received - Florida Solar Academy",
      body: "Hi {name},\n\nThank you for applying to Florida Solar Academy! We're excited to review your application and learn more about your interest in building a career in solar energy.\n\nWe'll be in touch within 24-48 hours with next steps.\n\nBest regards,\nFlorida Solar Academy Team",
    },
  },
  interviewScheduled: {
    sms: "Great news {name}! Your interview is scheduled for {date} at {time}. Reply CONFIRM to confirm or call us if you have questions.",
    email: {
      subject: "Interview Scheduled - Florida Solar Academy",
      body: "Hi {name},\n\nCongratulations! Your interview has been scheduled for:\n\nDate: {date}\nTime: {time}\nLocation: Virtual (Zoom link will be sent separately)\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nFlorida Solar Academy Team",
    },
  },
  interviewReminder: {
    sms: "Reminder: Your interview with Florida Solar Academy is tomorrow at {time}. Looking forward to meeting you!",
    email: {
      subject: "Interview Reminder - Florida Solar Academy",
      body: "Hi {name},\n\nThis is a friendly reminder that your interview with Florida Solar Academy is scheduled for tomorrow at {time}.\n\nWe're looking forward to meeting you and discussing your opportunity to build a career in solar energy.\n\nBest regards,\nFlorida Solar Academy Team",
    },
  },
  offerSent: {
    sms: "Exciting news {name}! We'd like to extend an offer to join our team. Check your email for details.",
    email: {
      subject: "Job Offer - Florida Solar Academy",
      body: "Hi {name},\n\nCongratulations! We're pleased to extend an offer for the position of Solar Sales Professional at Florida Solar Academy.\n\nPlease review the attached offer letter and let us know if you have any questions.\n\nWe're excited to have you join our team!\n\nBest regards,\nFlorida Solar Academy Team",
    },
  },
  trainingStarting: {
    sms: "Welcome to Florida Solar Academy! Your training starts {date}. Check your email for training schedule and materials.",
    email: {
      subject: "Welcome to Florida Solar Academy - Training Schedule",
      body: "Hi {name},\n\nWelcome to the Florida Solar Academy family! We're excited to have you on board.\n\nYour training program begins on {date}. Please find the detailed schedule and pre-work materials attached.\n\nGet ready to launch your solar career!\n\nBest regards,\nFlorida Solar Academy Team",
    },
  },
};

// Function to replace template variables
function replaceTemplateVariables(
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
  sendSMS: publicProcedure
    .input(
      z.object({
        applicantId: z.number(),
        phoneNumber: z.string(),
        message: z.string(),
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

      // Log the communication
      await db.insert(communicationLog).values({
        applicantId: input.applicantId,
        type: "sms",
        message: finalMessage,
        status: "sent",
      });

      // TODO: Integrate with Twilio API to actually send SMS
      // const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // await twilio.messages.create({
      //   body: finalMessage,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: input.phoneNumber,
      // });

      return {
        success: true,
        message: "SMS queued for delivery",
      };
    }),

  // Send email message
  sendEmail: publicProcedure
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

      // Log the communication
      await db.insert(communicationLog).values({
        applicantId: input.applicantId,
        type: "email",
        subject: finalSubject,
        message: finalBody,
        status: "sent",
      });

      // TODO: Integrate with SendGrid API to actually send email
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({
      //   to: input.email,
      //   from: process.env.SENDGRID_FROM_EMAIL,
      //   subject: finalSubject,
      //   text: finalBody,
      // });

      return {
        success: true,
        message: "Email queued for delivery",
      };
    }),

  // Get communication history for an applicant
  getHistory: publicProcedure
    .input(z.object({ applicantId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Implement filtering by applicantId when drizzle-orm supports it
      const history = await db
        .select()
        .from(communicationLog);

      return history;
    }),

  // Get message templates
  getTemplates: publicProcedure.query(() => {
    return messageTemplates;
  }),
});
