import {
  ADMIN_PERMISSIONS,
  getEffectivePermissions,
  type AdminPermission,
} from "@shared/permissions";
import type { User } from "../../drizzle/schema";

export type MeUser = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  adminTier: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
  /** Resolved capability flags for the session user */
  effectivePermissions: Record<AdminPermission, boolean>;
  isSuperAdmin: boolean;
};

function emptyPermissions(): Record<AdminPermission, boolean> {
  return Object.fromEntries(ADMIN_PERMISSIONS.map((k) => [k, false])) as Record<
    AdminPermission,
    boolean
  >;
}

export function serializeMeUser(user: User): MeUser {
  const eff =
    getEffectivePermissions(user.role, user.adminTier, user.adminPermissions) ??
    emptyPermissions();
  const isSuperAdmin = eff["admins.manage"] === true;

  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    role: user.role,
    adminTier: user.adminTier ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSignedIn: user.lastSignedIn,
    effectivePermissions: eff,
    isSuperAdmin,
  };
}
