import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
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

// TODO: add feature queries here as your schema grows.

// Applicant queries
import { applicants } from "../drizzle/schema";
import { desc } from "drizzle-orm";

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
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(applicants).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    experienceLevel: data.experienceLevel,
    motivation: data.motivation,
    resumeUrl: data.resumeUrl || undefined,
    resumeKey: data.resumeKey || undefined,
    status: "new",
  });

  return result;
}

export async function getApplicants(filters?: {
  status?: string;
  city?: string;
  experienceLevel?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query: any = db.select().from(applicants);

  if (filters?.status) {
    query = query.where(eq(applicants.status, filters.status as any));
  }
  if (filters?.city) {
    query = query.where(eq(applicants.city, filters.city));
  }
  if (filters?.experienceLevel) {
    query = query.where(eq(applicants.experienceLevel, filters.experienceLevel as any));
  }

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
  };
}
