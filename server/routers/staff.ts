import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  ADMIN_PERMISSIONS,
  ADMIN_TIER_LABELS,
  ADMIN_TIERS,
  type AdminPermission,
  type AdminTier,
} from "@shared/permissions";
import { createPermissionProcedure, router } from "../_core/trpc";
import type { TrpcContext } from "../_core/context";
import { ENV } from "../_core/env";
import * as db from "../db";
import { sendEmail, isEmailProviderConfigured } from "../services/sendgrid";
import { messageTemplates, replaceTemplateVariables } from "./communications";

function getPublicOrigin(req: TrpcContext["req"]): string {
  const xf = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim();
  const proto = xf || (req as { protocol?: string }).protocol || "https";
  const host = req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

const tierSchema = z.enum(ADMIN_TIERS as unknown as [AdminTier, ...AdminTier[]]);

function isEnvOwnerEmail(email: string | null | undefined) {
  if (!email || !ENV.adminEmail) return false;
  return email.trim().toLowerCase() === ENV.adminEmail.trim().toLowerCase();
}

function sanitizePermissionsInput(
  raw: Record<string, boolean> | undefined
): Partial<Record<AdminPermission, boolean>> | null {
  if (!raw) return null;
  const out: Partial<Record<AdminPermission, boolean>> = {};
  for (const k of ADMIN_PERMISSIONS) {
    if (Object.prototype.hasOwnProperty.call(raw, k) && typeof raw[k] === "boolean") {
      out[k] = raw[k];
    }
  }
  return Object.keys(out).length ? out : null;
}

function overridesToStoredJson(overrides: Partial<Record<AdminPermission, boolean>> | null) {
  if (!overrides || Object.keys(overrides).length === 0) return null;
  return JSON.stringify(overrides);
}

export const staffRouter = router({
  listPendingInvites: createPermissionProcedure("admins.manage").query(async () => {
    return db.listPendingStaffGrants();
  }),

  listAdmins: createPermissionProcedure("admins.manage").query(async () => {
    const rows = await db.listAdminUsers();
    return rows.map((u) => ({
      id: u.id,
      openId: u.openId,
      name: u.name,
      email: u.email,
      adminTier: u.adminTier,
      lastSignedIn: u.lastSignedIn,
      isEnvOwner: isEnvOwnerEmail(u.email),
    }));
  }),

  inviteByEmail: createPermissionProcedure("admins.manage")
    .input(
      z.object({
        email: z.string().email(),
        adminTier: tierSchema,
        permissionOverrides: z.record(z.string(), z.boolean()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const overrides = sanitizePermissionsInput(input.permissionOverrides ?? undefined);
      const json = overridesToStoredJson(overrides);
      await db.replacePendingStaffGrant({
        email: input.email,
        adminTier: input.adminTier,
        permissionsJson: json,
        createdByOpenId: ctx.user!.openId,
      });

      const origin = getPublicOrigin(ctx.req);
      const signInUrl = `${origin}/api/oauth/login`;
      const dashboardUrl = `${origin}/dashboard`;
      const roleLabel = ADMIN_TIER_LABELS[input.adminTier];
      const invitedByName = ctx.user?.name?.trim() || ctx.user?.email || "An administrator";
      const vars = {
        roleLabel,
        inviteeEmail: input.email.trim(),
        signInUrl,
        dashboardUrl,
        invitedByName,
      };
      const tpl = messageTemplates.staffInvite.email;
      const subject = replaceTemplateVariables(tpl.subject, vars);
      const body = replaceTemplateVariables(tpl.body, vars);

      let emailSent = false;
      let emailNote: string | undefined;

      if (!isEmailProviderConfigured()) {
        emailNote =
          "Invite saved, but no email provider is configured. Set RESEND_API_KEY (or SENDGRID_API_KEY) on the server, or send them the sign-in link yourself.";
        console.warn("[Staff] Invite email skipped:", emailNote);
      } else {
        try {
          const result = await sendEmail(input.email.trim(), subject, body);
          emailSent = result.success;
          if (!result.success && result.error) {
            emailNote = `Invite saved, but the email failed to send: ${result.error}`;
            console.error("[Staff] Invite email failed:", result.error);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          emailNote = `Invite saved, but the email failed: ${msg}`;
          console.error("[Staff] Invite email error:", err);
        }
      }

      return { success: true as const, emailSent, emailNote };
    }),

  cancelInvite: createPermissionProcedure("admins.manage")
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteStaffGrantById(input.id);
      return { success: true as const };
    }),

  updateMember: createPermissionProcedure("admins.manage")
    .input(
      z.object({
        openId: z.string().min(1),
        adminTier: tierSchema,
        permissionOverrides: z.record(z.string(), z.boolean()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const target = await db.getUserByOpenId(input.openId);
      if (!target || target.role !== "admin") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found" });
      }
      if (isEnvOwnerEmail(target.email) && input.adminTier !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot change primary owner tier" });
      }
      const overrides = sanitizePermissionsInput(input.permissionOverrides ?? undefined);
      const json = overridesToStoredJson(overrides);
      await db.updateUserAdminProfile(input.openId, {
        adminTier: input.adminTier,
        adminPermissions: json,
      });
      if (input.openId === ctx.user!.openId) {
        // self-update: session still valid; client should refetch me
      }
      return { success: true as const };
    }),

  revokeMember: createPermissionProcedure("admins.manage")
    .input(z.object({ openId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const target = await db.getUserByOpenId(input.openId);
      if (!target || target.role !== "admin") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found" });
      }
      if (isEnvOwnerEmail(target.email)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot revoke the primary owner (ADMIN_EMAIL)" });
      }
      if (input.openId === ctx.user!.openId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot revoke your own access" });
      }
      await db.demoteUserByOpenId(input.openId);
      return { success: true as const };
    }),
});
