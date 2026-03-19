import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicantStatus,
  getApplicantStats,
  calculateQualificationScore,
  updateApplicantQualificationScore,
} from "../db";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";
import { sendEmail } from "../services/sendgrid";
import { messageTemplates, replaceTemplateVariables } from "./communications";

export const applicantsRouter = router({
  // Submit a new application with optional resume
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
        city: z.enum(["Tampa", "Miami", "Fort Lauderdale"]),
        experienceLevel: z.enum(["solar_sales", "outside_sales", "entry_level", "aspiring_leader"]),
        motivation: z.string().min(10),
        resumeBase64: z.string().optional(),
        resumeFileName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let resumeUrl: string | undefined;
      let resumeKey: string | undefined;

      // Upload resume to S3 if provided
      if (input.resumeBase64 && input.resumeFileName) {
        try {
          const buffer = Buffer.from(input.resumeBase64, "base64");
          const fileKey = `resumes/${input.email}-${Date.now()}-${input.resumeFileName}`;
          const result = await storagePut(fileKey, buffer, "application/pdf");
          resumeUrl = result.url;
          resumeKey = result.key;
        } catch (error) {
          console.error("Failed to upload resume:", error);
        }
      }

      // Create applicant record
      const applicant = await createApplicant({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        city: input.city,
        experienceLevel: input.experienceLevel,
        motivation: input.motivation,
        resumeUrl,
        resumeKey,
      });

      // Calculate and update qualification score
      const qualificationScore = calculateQualificationScore(
        input.experienceLevel,
        input.motivation
      );
      if (applicant) {
        await updateApplicantQualificationScore(applicant.id, qualificationScore);
      }

      // Confirmation email — Resend (RESEND_API_KEY) preferred, else SendGrid
      try {
        const tpl = messageTemplates.applicationReceived.email;
        await sendEmail(
          input.email,
          tpl.subject,
          replaceTemplateVariables(tpl.body, { name: input.firstName })
        );
      } catch (err) {
        console.error("[Applicants] Confirmation email failed (application still saved):", err);
      }

      // Notify owner via internal service if configured (never block submit)
      try {
        await notifyOwner({
          title: "New Application Received",
          content: `${input.firstName} ${input.lastName} from ${input.city} has applied (Score: ${qualificationScore}/100). Email: ${input.email}, Phone: ${input.phone}`,
        });
      } catch (err) {
        console.warn("[Applicants] Owner notification skipped or failed:", err);
      }

      return {
        success: true,
        message: "Application submitted successfully",
      };
    }),

  // Get all applicants with optional filters (admin only)
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        city: z.string().optional(),
        experienceLevel: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const applicants = await getApplicants(input);
      return applicants;
    }),

  // Get a single applicant by ID (admin only)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const applicant = await getApplicantById(input.id);
      return applicant;
    }),

  // Update applicant status (admin only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["new", "screened", "interviewed", "offered", "hired", "rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateApplicantStatus(input.id, input.status);
      return { success: true };
    }),

  // Get statistics (admin only)
  stats: protectedProcedure.query(async () => {
    const stats = await getApplicantStats();
    return stats;
  }),
});
