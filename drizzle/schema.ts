import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  customType,
} from "drizzle-orm/mysql-core";

/** MEDIUMTEXT — stores base64 resume when external storage (Forge) fails */
const mediumText = customType<{ data: string; driverData: string }>({
  dataType() {
    return "mediumtext";
  },
});

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** When role is admin: super_admin | manager | recruiter | viewer */
  adminTier: varchar("adminTier", { length: 32 }),
  /** Optional JSON overrides for fine-grained flags (see shared/permissions.ts) */
  adminPermissions: text("adminPermissions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Pending or consumed invite for Google OAuth email → admin on first login */
export const staffGrants = mysqlTable("staffGrants", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  adminTier: varchar("adminTier", { length: 32 }).notNull(),
  permissionsJson: text("permissionsJson"),
  createdByOpenId: varchar("createdByOpenId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  consumedAt: timestamp("consumedAt"),
});

export type StaffGrant = typeof staffGrants.$inferSelect;
export type InsertStaffGrant = typeof staffGrants.$inferInsert;

// Applicant table for tracking candidates
export const applicants = mysqlTable("applicants", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  experienceLevel: mysqlEnum("experienceLevel", ["solar_sales", "outside_sales", "entry_level", "aspiring_leader"]).notNull(),
  motivation: text("motivation"),
  resumeUrl: varchar("resumeUrl", { length: 500 }),
  resumeKey: varchar("resumeKey", { length: 500 }),
  /** PDF bytes as base64 when Forge upload fails; prefer resumeUrl when set */
  resumeInlineBase64: mediumText("resumeInlineBase64"),
  resumeStoredFileName: varchar("resumeStoredFileName", { length: 260 }),
  status: mysqlEnum("status", ["new", "screened", "interviewed", "offered", "hired", "rejected"]).default("new").notNull(),
  qualificationScore: int("qualificationScore").default(0).notNull(),
  interviewScheduledAt: timestamp("interviewScheduledAt"),
  interviewNotes: text("interviewNotes"),
  offerSentAt: timestamp("offerSentAt"),
  offerSignedAt: timestamp("offerSignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Applicant = typeof applicants.$inferSelect;
export type InsertApplicant = typeof applicants.$inferInsert;

// Interview table for scheduling and tracking
export const interviews = mysqlTable("interviews", {
  id: int("id").autoincrement().primaryKey(),
  applicantId: int("applicantId").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "no_show", "cancelled"]).default("scheduled").notNull(),
  reminderSentAt: timestamp("reminderSentAt"),
  reminderType: mysqlEnum("reminderType", ["sms", "email", "both"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = typeof interviews.$inferInsert;

// Job offer table
export const jobOffers = mysqlTable("jobOffers", {
  id: int("id").autoincrement().primaryKey(),
  applicantId: int("applicantId").notNull(),
  position: varchar("position", { length: 100 }).notNull(),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  commission: text("commission"),
  offerContent: text("offerContent").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "viewed", "signed", "accepted", "rejected"]).default("draft").notNull(),
  sentAt: timestamp("sentAt"),
  viewedAt: timestamp("viewedAt"),
  signedAt: timestamp("signedAt"),
  signatureUrl: varchar("signatureUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JobOffer = typeof jobOffers.$inferSelect;
export type InsertJobOffer = typeof jobOffers.$inferInsert;

// Communication log for tracking SMS and emails
export const communicationLog = mysqlTable("communicationLog", {
  id: int("id").autoincrement().primaryKey(),
  applicantId: int("applicantId").notNull(),
  type: mysqlEnum("type", ["sms", "email"]).notNull(),
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["sent", "delivered", "failed", "bounced"]).default("sent").notNull(),
  externalId: varchar("externalId", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommunicationLog = typeof communicationLog.$inferSelect;
export type InsertCommunicationLog = typeof communicationLog.$inferInsert;

// Testimonials for landing page
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  earnings: varchar("earnings", { length: 100 }),
  featured: boolean("featured").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// Training modules for onboarding
export const trainingModules = mysqlTable("trainingModules", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["sales_fundamentals", "solar_product", "leadership", "management"]).notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }),
  duration: int("duration"),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = typeof trainingModules.$inferInsert;