import { z } from "zod";
import { marketTerritoryZodEnum } from "@shared/markets";
import { publicProcedure, createPermissionProcedure, router } from "../_core/trpc";
import {
  createApplicant,
  getApplicants,
  getApplicantById,
  updateApplicantStatus,
  getApplicantStats,
  calculateQualificationScore,
  updateApplicantQualificationScore,
  updateApplicantResumeUrl,
  getApplicantEmailStatsMap,
  purgeAllRecruitingPipelineData,
} from "../db";
import { ENV } from "../_core/env";
import { mimeTypeForResumeFileName, sanitizeResumeFileName } from "../resumeMime";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";
import { sendEmail } from "../services/sendgrid";
import { messageTemplates, replaceTemplateVariables } from "./communications";

const applicantsView = createPermissionProcedure("applicants.view");
const applicantsEditStatus = createPermissionProcedure("applicants.edit_status");
const adminsManage = createPermissionProcedure("admins.manage");

export const applicantsRouter = router({
  // Submit a new application with optional resume
  submit: publicProcedure
    .input(
      z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        email: z.string().email().max(320),
        phone: z.string().min(10).max(20),
        city: marketTerritoryZodEnum,
        experienceLevel: z.enum(["solar_sales", "outside_sales", "entry_level", "aspiring_leader"]),
        /** Matches DB `text` / abuse limits — blocks multi‑MB spam bodies */
        motivation: z.string().min(10).max(50_000),
        resumeBase64: z.string().optional(),
        resumeFileName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let resumeUrl: string | undefined;
      let resumeKey: string | undefined;
      let resumeInlineBase64: string | undefined;
      let resumeStoredFileName: string | undefined;

      if (input.resumeBase64 && input.resumeFileName) {
        const safeName = sanitizeResumeFileName(input.resumeFileName);
        const buffer = Buffer.from(input.resumeBase64, "base64");
        const contentType = mimeTypeForResumeFileName(safeName);
        const fileKey = `resumes/${input.email}-${Date.now()}-${safeName}`;

        const forgeConfigured = Boolean(ENV.forgeApiUrl?.trim() && ENV.forgeApiKey?.trim());
        let storedInForge = false;

        if (forgeConfigured) {
          try {
            const result = await storagePut(fileKey, buffer, contentType);
            resumeUrl = result.url;
            resumeKey = result.key;
            storedInForge = true;
          } catch (error) {
            console.error("[Applicants] Forge storage upload failed, using database copy:", error);
          }
        } else {
          console.warn(
            "[Applicants] BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY not set — saving résumé in database"
          );
        }

        // Always persist the file when Forge is missing or upload fails (fixes “No PDF” in dashboard).
        if (!storedInForge) {
          resumeInlineBase64 = input.resumeBase64;
          resumeStoredFileName = safeName;
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
        resumeInlineBase64,
        resumeStoredFileName,
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
        const emailResult = await sendEmail(
          input.email,
          tpl.subject,
          replaceTemplateVariables(tpl.body, { name: input.firstName })
        );
        if (!emailResult.success) {
          console.error(
            "[Applicants] Confirmation email failed (application still saved):",
            emailResult.error ?? "unknown error"
          );
        }
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

  // Get all applicants with optional filters (admin + applicants.view)
  list: applicantsView
    .input(
      z.object({
        status: z.string().optional(),
        city: z.string().optional(),
        experienceLevel: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const rows = await getApplicants(input);
      const emailStats = await getApplicantEmailStatsMap();
      return rows.map((a) => {
        const { resumeInlineBase64: _blob, ...rest } = a;
        const key = a.email.toLowerCase();
        const stat = emailStats.get(key);
        const totalForEmail = stat?.total ?? 1;
        const firstId = stat?.firstId ?? a.id;
        const hasResumeBlob = Boolean(_blob && String(_blob).length > 0);
        return {
          ...rest,
          hasResumeBlob,
          emailApplicationTotal: totalForEmail,
          isReapplication: totalForEmail > 1 && a.id !== firstId,
          applicationOrdinal: a.id === firstId ? 1 : undefined,
        };
      });
    }),

  // Get a single applicant by ID
  getById: applicantsView
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const applicant = await getApplicantById(input.id);
      if (!applicant) return null;
      const { resumeInlineBase64: _blob, ...rest } = applicant;
      const hasResumeBlob = Boolean(_blob && String(_blob).length > 0);
      return { ...rest, hasResumeBlob };
    }),

  // Update applicant status
  updateStatus: applicantsEditStatus
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
  stats: applicantsView.query(async () => {
    const stats = await getApplicantStats();
    return stats;
  }),

  /** Super-admin only: delete all applicants, related pipeline rows, and talent waitlist (test reset). */
  purgeAllPipelineData: adminsManage.mutation(async () => {
    await purgeAllRecruitingPipelineData();
    return { success: true as const };
  }),
});
