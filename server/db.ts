import { eq, desc, and, sql, isNull } from "drizzle-orm";
import { ENV } from "./_core/env";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import type { User } from "../drizzle/schema";
import {
  InsertUser,
  users,
  staffGrants,
  talentInterest,
  applicants,
  communicationLog,
  interviews,
  jobOffers,
} from "../drizzle/schema";

/** DB missing new columns/tables after deploy (migrations not applied yet). */
function isRecoverableSchemaError(err: unknown): boolean {
  let cur: unknown = err;
  for (let i = 0; i < 5 && cur != null; i++) {
    const e = cur as { errno?: number; message?: string; sqlMessage?: string; cause?: unknown };
    if (e.errno === 1054 || e.errno === 1146) return true;
    const m = `${e.sqlMessage ?? ""} ${e.message ?? ""}`.toLowerCase();
    if (m.includes("unknown column") || m.includes("doesn't exist")) return true;
    cur = e.cause;
  }
  return false;
}

async function legacyGetUserByOpenId(openId: string): Promise<User | undefined> {
  if (!ENV.databaseUrl) return undefined;
  const conn = await mysql.createConnection(ENV.databaseUrl);
  try {
    const [rows] = await conn.execute(
      "SELECT id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn FROM users WHERE openId = ? LIMIT 1",
      [openId]
    );
    const row = (rows as Record<string, unknown>[])[0];
    if (!row) return undefined;
    return {
      id: row.id as number,
      openId: row.openId as string,
      name: row.name as string | null,
      email: row.email as string | null,
      loginMethod: row.loginMethod as string | null,
      role: row.role as "user" | "admin",
      adminTier: null,
      adminPermissions: null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
      lastSignedIn: row.lastSignedIn as Date,
    };
  } finally {
    await conn.end();
  }
}

/** Upsert without adminTier/adminPermissions (older `users` table). */
async function legacyUpsertUser(user: InsertUser): Promise<void> {
  if (!ENV.databaseUrl) throw new Error("Database not available");
  const conn = await mysql.createConnection(ENV.databaseUrl);
  try {
    const lastSignedIn = user.lastSignedIn ?? new Date();
    await conn.execute(
      `INSERT INTO users (openId, name, email, loginMethod, lastSignedIn, role)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         email = VALUES(email),
         loginMethod = VALUES(loginMethod),
         lastSignedIn = VALUES(lastSignedIn),
         role = VALUES(role)`,
      [
        user.openId,
        user.name ?? null,
        user.email ?? null,
        user.loginMethod ?? "google",
        lastSignedIn,
        user.role ?? "user",
      ]
    );
  } finally {
    await conn.end();
  }
}

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      _db = drizzle(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    if (isRecoverableSchemaError(error)) {
      console.warn(
        "[Database] Drizzle upsert failed (schema likely behind migrations); retrying legacy upsert:",
        error
      );
      try {
        await legacyUpsertUser(user);
        return;
      } catch (e2) {
        console.error("[Database] Legacy upsert also failed:", e2);
        throw e2;
      }
    }
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export function normalizeStaffEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function getPendingStaffGrantByEmail(emailNorm: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const rows = await db
      .select()
      .from(staffGrants)
      .where(and(eq(staffGrants.email, emailNorm), isNull(staffGrants.consumedAt)))
      .limit(1);
    return rows[0];
  } catch (error) {
    if (isRecoverableSchemaError(error)) {
      console.warn("[Database] staffGrants lookup skipped (table/columns missing):", error);
      return undefined;
    }
    throw error;
  }
}

export async function listPendingStaffGrants() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(staffGrants)
    .where(isNull(staffGrants.consumedAt))
    .orderBy(desc(staffGrants.createdAt));
}

export async function replacePendingStaffGrant(input: {
  email: string;
  adminTier: string;
  permissionsJson?: string | null;
  createdByOpenId?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const emailNorm = normalizeStaffEmail(input.email);
  await db.delete(staffGrants).where(and(eq(staffGrants.email, emailNorm), isNull(staffGrants.consumedAt)));
  await db.insert(staffGrants).values({
    email: emailNorm,
    adminTier: input.adminTier,
    permissionsJson: input.permissionsJson ?? null,
    createdByOpenId: input.createdByOpenId ?? null,
  });
}

export async function consumeStaffGrantById(id: number) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(staffGrants).set({ consumedAt: new Date() }).where(eq(staffGrants.id, id));
  } catch (error) {
    if (isRecoverableSchemaError(error)) {
      console.warn("[Database] consumeStaffGrant skipped:", error);
      return;
    }
    throw error;
  }
}

export async function deleteStaffGrantById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(staffGrants).where(eq(staffGrants.id, id));
}

export async function listAdminUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, "admin")).orderBy(desc(users.lastSignedIn));
}

export async function demoteUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({
      role: "user",
      adminTier: null,
      adminPermissions: null,
      updatedAt: new Date(),
    })
    .where(eq(users.openId, openId));
}

export async function updateUserAdminProfile(
  openId: string,
  data: { adminTier: string; adminPermissions: string | null }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(users)
    .set({
      adminTier: data.adminTier,
      adminPermissions: data.adminPermissions,
      updatedAt: new Date(),
    })
    .where(and(eq(users.openId, openId), eq(users.role, "admin")));
}

export async function insertTalentInterest(data: {
  firstName: string;
  email: string;
  city: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(talentInterest).values({
    firstName: data.firstName,
    email: data.email,
    city: data.city,
  });
}

// Applicant queries

export async function createApplicant(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  experienceLevel: "solar_sales" | "outside_sales" | "entry_level" | "aspiring_leader";
  motivation: string;
  resumeUrl?: string;
  resumeKey?: string;
  resumeInlineBase64?: string;
  resumeStoredFileName?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(applicants).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    experienceLevel: data.experienceLevel,
    motivation: data.motivation,
    resumeUrl: data.resumeUrl || undefined,
    resumeKey: data.resumeKey || undefined,
    resumeInlineBase64: data.resumeInlineBase64 || undefined,
    resumeStoredFileName: data.resumeStoredFileName || undefined,
    status: "new",
    qualificationScore: 0,
  });

  const createdApplicant = await db
    .select()
    .from(applicants)
    .where(eq(applicants.email, data.email))
    .orderBy(desc(applicants.createdAt))
    .limit(1);

  return createdApplicant[0] || null;
}

/** Set public/download URL after insert when resume is stored inline (DB fallback). */
export async function updateApplicantResumeUrl(id: number, resumeUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(applicants)
    .set({ resumeUrl, updatedAt: new Date() })
    .where(eq(applicants.id, id));
}

export type ApplicantEmailStats = { total: number; firstId: number };

/** All-time counts per email (for re-apply / duplicate detection). */
export async function getApplicantEmailStatsMap(): Promise<Map<string, ApplicantEmailStats>> {
  const db = await getDb();
  if (!db) return new Map();

  const rows = await db
    .select({
      email: applicants.email,
      total: sql<number>`cast(count(*) as unsigned)`.mapWith(Number),
      firstId: sql<number>`min(${applicants.id})`.mapWith(Number),
    })
    .from(applicants)
    .groupBy(applicants.email);

  const map = new Map<string, ApplicantEmailStats>();
  for (const r of rows) {
    map.set(r.email.toLowerCase(), { total: r.total, firstId: r.firstId });
  }
  return map;
}

export async function getApplicants(filters?: {
  status?: string;
  city?: string;
  experienceLevel?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions: any[] = [];
  if (filters?.status) conditions.push(eq(applicants.status, filters.status as any));
  if (filters?.city) conditions.push(eq(applicants.city, filters.city));
  if (filters?.experienceLevel) conditions.push(eq(applicants.experienceLevel, filters.experienceLevel as any));

  const query = conditions.length > 0
    ? db.select().from(applicants).where(and(...conditions))
    : db.select().from(applicants);

  return query.orderBy(desc(applicants.createdAt));
}

export async function getApplicantById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(applicants)
    .where(eq(applicants.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateApplicantStatus(
  id: number,
  status: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(applicants)
    .set({
      status: status as any,
      updatedAt: new Date(),
    })
    .where(eq(applicants.id, id));
}

export async function getApplicantStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allApplicants = await db.select().from(applicants);

  const countByStatus = (status: string) =>
    allApplicants.filter((a) => a.status === (status as any)).length;

  return {
    total: allApplicants.length,
    new: countByStatus("new"),
    screened: countByStatus("screened"),
    interviewed: countByStatus("interviewed"),
    offered: countByStatus("offered"),
    hired: countByStatus("hired"),
    rejected: countByStatus("rejected"),
  };
}

/**
 * Delete all recruiting pipeline rows (communications → interviews → offers → applicants) and talent waitlist.
 * Caller must enforce super-admin only. Use to clear test data.
 */
export async function purgeAllRecruitingPipelineData(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(communicationLog).where(sql`1 = 1`);
  await db.delete(interviews).where(sql`1 = 1`);
  await db.delete(jobOffers).where(sql`1 = 1`);
  await db.delete(applicants).where(sql`1 = 1`);
  await db.delete(talentInterest).where(sql`1 = 1`);
}


// Calculate qualification score based on experience level and motivation
export function calculateQualificationScore(
  experienceLevel: "solar_sales" | "outside_sales" | "entry_level" | "aspiring_leader",
  motivation: string
): number {
  let score = 0;

  // Experience level scoring (0-40 points)
  const experienceLevelScores: Record<string, number> = {
    solar_sales: 40,
    outside_sales: 30,
    entry_level: 20,
    aspiring_leader: 35,
  };
  score += experienceLevelScores[experienceLevel] || 0;

  // Motivation scoring (0-60 points)
  // Check for key motivation indicators
  const motivationKeywords = {
    "financial freedom": 15,
    "build team": 15,
    "leadership": 15,
    "independence": 10,
    "earn": 5,
    "growth": 10,
  };

  const lowerMotivation = motivation.toLowerCase();
  for (const [keyword, points] of Object.entries(motivationKeywords)) {
    if (lowerMotivation.includes(keyword)) {
      score += points;
    }
  }

  // Cap score at 100
  return Math.min(score, 100);
}

// Update applicant with qualification score
export async function updateApplicantQualificationScore(
  id: number,
  score: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(applicants)
    .set({
      qualificationScore: score,
      updatedAt: new Date(),
    })
    .where(eq(applicants.id, id));
}
