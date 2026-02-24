import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicantStatus,
  getApplicantStats,
} from "../db";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";

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

      // Notify owner of new application
      await notifyOwner({
        title: "New Application Received",
        content: `${input.firstName} ${input.lastName} from ${input.city} has applied. Email: ${input.email}, Phone: ${input.phone}`,
      });

      return {
        success: true,
        message: "Application submitted successfully",
      };
    }),

  // Get all applicants with optional filters
  list: publicProcedure
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

  // Get a single applicant by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const applicant = await getApplicantById(input.id);
      return applicant;
    }),

  // Update applicant status
  updateStatus: publicProcedure
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

  // Get statistics
  stats: publicProcedure.query(async () => {
    const stats = await getApplicantStats();
    return stats;
  }),
});
