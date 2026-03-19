/**
 * Admin roles and fine-grained permissions for the recruiter dashboard.
 * Used by server (tRPC + routes) and client (UI visibility).
 */

export const ADMIN_TIERS = ["super_admin", "manager", "recruiter", "viewer"] as const;
export type AdminTier = (typeof ADMIN_TIERS)[number];

export const ADMIN_PERMISSIONS = [
  "applicants.view",
  "applicants.edit_status",
  "applicants.view_resume",
  "communications.send",
  "interviews.read",
  "interviews.manage",
  "system.notify",
  "admins.manage",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const ALL_TRUE: Record<AdminPermission, boolean> = Object.fromEntries(
  ADMIN_PERMISSIONS.map((k) => [k, true])
) as Record<AdminPermission, boolean>;

const ALL_FALSE: Record<AdminPermission, boolean> = Object.fromEntries(
  ADMIN_PERMISSIONS.map((k) => [k, false])
) as Record<AdminPermission, boolean>;

function pick(keys: AdminPermission[], value: boolean): Partial<Record<AdminPermission, boolean>> {
  const o = { ...ALL_FALSE };
  for (const k of keys) o[k] = value;
  return o;
}

/** Default capability matrix per tier (before JSON overrides on the user row). */
export function defaultPermissionsForTier(tier: AdminTier): Record<AdminPermission, boolean> {
  switch (tier) {
    case "super_admin":
      return { ...ALL_TRUE };
    case "manager":
      return {
        ...ALL_FALSE,
        ...pick(
          [
            "applicants.view",
            "applicants.edit_status",
            "applicants.view_resume",
            "communications.send",
            "interviews.read",
            "interviews.manage",
            "system.notify",
          ],
          true
        ),
      } as Record<AdminPermission, boolean>;
    case "recruiter":
      return {
        ...ALL_FALSE,
        ...pick(
          [
            "applicants.view",
            "applicants.edit_status",
            "applicants.view_resume",
            "communications.send",
            "interviews.read",
            "interviews.manage",
            "system.notify",
          ],
          true
        ),
      } as Record<AdminPermission, boolean>;
    case "viewer":
      return {
        ...ALL_FALSE,
        ...pick(["applicants.view", "applicants.view_resume", "interviews.read"], true),
      } as Record<AdminPermission, boolean>;
  }
}

export function parseAdminPermissionsJson(
  raw: string | null | undefined
): Partial<Record<AdminPermission, boolean>> | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const out: Partial<Record<AdminPermission, boolean>> = {};
    for (const key of ADMIN_PERMISSIONS) {
      if (key in (parsed as object) && typeof (parsed as Record<string, unknown>)[key] === "boolean") {
        out[key] = (parsed as Record<string, boolean>)[key];
      }
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

/**
 * Merge tier defaults with JSON overrides stored on the user.
 * Never grants `admins.manage` unless tier is super_admin (prevents DB escalation).
 */
export function mergePermissionOverrides(
  tier: AdminTier,
  overrides: Partial<Record<AdminPermission, boolean>> | null
): Record<AdminPermission, boolean> {
  const base = defaultPermissionsForTier(tier);
  if (overrides) {
    for (const k of ADMIN_PERMISSIONS) {
      if (k === "admins.manage") continue;
      if (typeof overrides[k] === "boolean") base[k] = overrides[k]!;
    }
  }
  if (tier === "super_admin") base["admins.manage"] = true;
  else base["admins.manage"] = false;
  return base;
}

export function parseAdminTier(raw: string | null | undefined): AdminTier | null {
  if (!raw) return null;
  return ADMIN_TIERS.includes(raw as AdminTier) ? (raw as AdminTier) : null;
}

/**
 * Effective permission map for a DB user row.
 * Legacy: role `admin` with null tier → treat as super_admin (full access).
 */
export function getEffectivePermissions(
  role: "user" | "admin",
  adminTier: string | null | undefined,
  adminPermissionsJson: string | null | undefined
): Record<AdminPermission, boolean> | null {
  if (role !== "admin") return null;
  let tier = parseAdminTier(adminTier);
  if (!tier) tier = "super_admin";
  const overrides = parseAdminPermissionsJson(adminPermissionsJson);
  return mergePermissionOverrides(tier, overrides);
}

export function hasAdminPermission(
  role: "user" | "admin",
  adminTier: string | null | undefined,
  adminPermissionsJson: string | null | undefined,
  perm: AdminPermission
): boolean {
  const eff = getEffectivePermissions(role, adminTier, adminPermissionsJson);
  return eff ? eff[perm] === true : false;
}

/** Human labels for settings UI */
export const ADMIN_TIER_LABELS: Record<AdminTier, string> = {
  super_admin: "Super admin (full access + team)",
  manager: "Manager (pipeline, comms, interviews)",
  recruiter: "Recruiter (same as manager)",
  viewer: "Viewer (read-only)",
};

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  "applicants.view": "View applicants & pipeline",
  "applicants.edit_status": "Change applicant status",
  "applicants.view_resume": "Open / download resumes",
  "communications.send": "Send SMS & email",
  "interviews.read": "View interviews & calendar info",
  "interviews.manage": "Schedule & update interviews",
  "system.notify": "Send internal owner notifications",
  "admins.manage": "Invite admins & edit roles",
};
