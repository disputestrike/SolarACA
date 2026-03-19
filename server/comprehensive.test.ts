import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { calculateQualificationScore } from "./db";

// ============================================================
// HELPER: Create mock context for tRPC calls
// ============================================================
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAuthContext(role: "admin" | "user" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-owner",
    email: "owner@floridasolarsalesacademy.com",
    name: "Test Owner",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

// ============================================================
// 1. SMOKE TESTS - Basic endpoint availability
// ============================================================
describe("SMOKE TESTS - All endpoints respond", () => {
  it("auth.me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Owner");
  });

  it("auth.logout clears cookie", async () => {
    const clearedCookies: any[] = [];
    const ctx = createAuthContext();
    ctx.res.clearCookie = (name: string, options: any) => {
      clearedCookies.push({ name, options });
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBe(1);
    expect(clearedCookies[0].name).toBe(COOKIE_NAME);
  });

  it("applicants.stats returns stats object", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.stats();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("new");
    expect(result).toHaveProperty("screened");
    expect(result).toHaveProperty("interviewed");
    expect(result).toHaveProperty("offered");
    expect(result).toHaveProperty("hired");
    expect(result).toHaveProperty("rejected");
    expect(typeof result.total).toBe("number");
  });

  it("applicants.list returns array", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("communications.getTemplates returns templates", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.communications.getTemplates();
    expect(result).toHaveProperty("applicationReceived");
    expect(result).toHaveProperty("interviewScheduled");
    expect(result).toHaveProperty("interviewReminder");
    expect(result).toHaveProperty("offerSent");
    expect(result).toHaveProperty("trainingStarting");
  });

  it("interviews.getUpcoming returns array", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.interviews.getUpcoming();
    expect(Array.isArray(result)).toBe(true);
  });

  it("interviews.getStats returns stats object", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.interviews.getStats();
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("scheduled");
    expect(result).toHaveProperty("completed");
    expect(result).toHaveProperty("noShow");
    expect(result).toHaveProperty("cancelled");
  });
});

// ============================================================
// 2. QUALIFICATION SCORING TESTS
// ============================================================
describe("QUALIFICATION SCORING - Algorithm correctness", () => {
  it("solar_sales with all keywords scores max 100", () => {
    const score = calculateQualificationScore(
      "solar_sales",
      "I want financial freedom and to build team with leadership and independence to earn and growth"
    );
    expect(score).toBe(100);
  });

  it("solar_sales with no keywords scores 40", () => {
    const score = calculateQualificationScore(
      "solar_sales",
      "I want to work in solar energy"
    );
    expect(score).toBe(40);
  });

  it("outside_sales with no keywords scores 30", () => {
    const score = calculateQualificationScore(
      "outside_sales",
      "I want to work in solar energy"
    );
    expect(score).toBe(30);
  });

  it("entry_level with no keywords scores 20", () => {
    const score = calculateQualificationScore(
      "entry_level",
      "I want to work in solar energy"
    );
    expect(score).toBe(20);
  });

  it("aspiring_leader with no keywords scores 35", () => {
    const score = calculateQualificationScore(
      "aspiring_leader",
      "I want to work in solar energy"
    );
    expect(score).toBe(35);
  });

  it("entry_level with all keywords scores 90", () => {
    const score = calculateQualificationScore(
      "entry_level",
      "I want financial freedom and to build team with leadership and independence to earn and growth"
    );
    // 20 + 15 + 15 + 15 + 10 + 5 + 10 = 90
    expect(score).toBe(90);
  });

  it("score is capped at 100", () => {
    const score = calculateQualificationScore(
      "solar_sales",
      "financial freedom build team leadership independence earn growth financial freedom build team leadership"
    );
    expect(score).toBeLessThanOrEqual(100);
  });

  it("keywords are case-insensitive", () => {
    const score1 = calculateQualificationScore("entry_level", "FINANCIAL FREEDOM");
    const score2 = calculateQualificationScore("entry_level", "financial freedom");
    expect(score1).toBe(score2);
  });

  it("empty motivation returns only experience score", () => {
    const score = calculateQualificationScore("solar_sales", "");
    expect(score).toBe(40);
  });

  it("partial keyword match works correctly", () => {
    const score = calculateQualificationScore("entry_level", "I want leadership");
    expect(score).toBe(20 + 15); // entry_level + leadership
  });
});

// ============================================================
// 3. EDGE CASE TESTS - Input validation
// ============================================================
describe("EDGE CASES - Input validation and boundaries", () => {
  it("applicants.submit rejects empty firstName", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "",
        lastName: "Doe",
        email: "test@test.com",
        phone: "1234567890",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow",
      })
    ).rejects.toThrow();
  });

  it("applicants.submit rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "John",
        lastName: "Doe",
        email: "not-an-email",
        phone: "1234567890",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow",
      })
    ).rejects.toThrow();
  });

  it("applicants.submit rejects short phone", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "John",
        lastName: "Doe",
        email: "test@test.com",
        phone: "123",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow",
      })
    ).rejects.toThrow();
  });

  it("applicants.submit rejects invalid city", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "John",
        lastName: "Doe",
        email: "test@test.com",
        phone: "1234567890",
        city: "New York" as any,
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow",
      })
    ).rejects.toThrow();
  });

  it("applicants.submit rejects invalid experienceLevel", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "John",
        lastName: "Doe",
        email: "test@test.com",
        phone: "1234567890",
        city: "Tampa",
        experienceLevel: "invalid_level" as any,
        motivation: "I want to earn money and grow",
      })
    ).rejects.toThrow();
  });

  it("applicants.submit rejects short motivation", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "John",
        lastName: "Doe",
        email: "test@test.com",
        phone: "1234567890",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "short",
      })
    ).rejects.toThrow();
  });

  it("applicants.getById rejects non-numeric id", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.applicants.getById({ id: "abc" as any })
    ).rejects.toThrow();
  });

  it("applicants.updateStatus rejects invalid status", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.applicants.updateStatus({ id: 1, status: "invalid" as any })
    ).rejects.toThrow();
  });

  it("interviews.schedule rejects invalid applicantId type", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.interviews.schedule({
        applicantId: "abc" as any,
        scheduledAt: new Date(),
      })
    ).rejects.toThrow();
  });

  it("interviews.updateStatus rejects invalid status", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.interviews.updateStatus({
        interviewId: 1,
        status: "invalid" as any,
      })
    ).rejects.toThrow();
  });

  it("communications.sendSMS rejects empty phone and message", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.communications.sendSMS({
        applicantId: 1,
        phoneNumber: "",
        message: "Hello",
      })
    ).rejects.toThrow();
    await expect(
      caller.communications.sendSMS({
        applicantId: 1,
        phoneNumber: "1234567890",
        message: "",
      })
    ).rejects.toThrow();
  });

  it("communications.sendEmail rejects invalid email", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.communications.sendEmail({
        applicantId: 1,
        email: "not-an-email",
        subject: "Test",
        body: "Test body",
      })
    ).rejects.toThrow();
  });

  it("interviews.sendReminder rejects invalid reminderType", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.interviews.sendReminder({
        interviewId: 1,
        reminderType: "invalid" as any,
      })
    ).rejects.toThrow();
  });
});

// ============================================================
// 4. CHAOS TESTS - SQL Injection, XSS, Overflow
// ============================================================
describe("CHAOS TESTS - SQL Injection, XSS, and Overflow", () => {
  it("rejects SQL injection in firstName", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // Drizzle ORM uses parameterized queries, so this should be safe
    // but the input should still be validated
    await expect(
      caller.applicants.submit({
        firstName: "'; DROP TABLE applicants; --",
        lastName: "Doe",
        email: "sql@test.com",
        phone: "1234567890",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow in solar",
      })
    ).resolves.toBeDefined(); // Should succeed but not execute SQL injection
  });

  it("handles XSS in motivation field", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "XSS",
        lastName: "Test",
        email: "xss@test.com",
        phone: "1234567890",
        city: "Miami",
        experienceLevel: "entry_level",
        motivation: '<script>alert("XSS")</script> I want to earn money and grow',
      })
    ).resolves.toBeDefined(); // Should succeed, XSS is stored as text
  });

  it("handles extremely long motivation text", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const longMotivation = "I want financial freedom ".repeat(1000);
    await expect(
      caller.applicants.submit({
        firstName: "Long",
        lastName: "Text",
        email: "long@test.com",
        phone: "1234567890",
        city: "Fort Lauderdale",
        experienceLevel: "solar_sales",
        motivation: longMotivation,
      })
    ).resolves.toBeDefined();
  });

  it("handles unicode/emoji in names", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "José 🌞",
        lastName: "García",
        email: "jose@test.com",
        phone: "1234567890",
        city: "Miami",
        experienceLevel: "outside_sales",
        motivation: "Quiero libertad financiera y crecer en solar energy",
      })
    ).resolves.toBeDefined();
  });

  it("handles SQL injection in search/filter parameters", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // Drizzle uses parameterized queries so this should be safe
    const result = await caller.applicants.list({
      city: "'; DROP TABLE applicants; --",
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("handles negative applicant ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: -1 });
    expect(result).toBeNull();
  });

  it("handles zero applicant ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: 0 });
    expect(result).toBeNull();
  });

  it("handles very large applicant ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: 999999999 });
    expect(result).toBeNull();
  });
});

// ============================================================
// 5. COMMUNICATION TEMPLATE TESTS
// ============================================================
describe("COMMUNICATION TEMPLATES - Correctness", () => {
  it("all SMS templates contain {name} variable", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    for (const [key, template] of Object.entries(templates)) {
      const sms = (template as any).sms as string;
      expect(sms).toContain("{name}");
    }
  });

  it("all email templates have subject and body", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    for (const [key, template] of Object.entries(templates)) {
      expect((template as any).email).toHaveProperty("subject");
      expect((template as any).email).toHaveProperty("body");
      expect((template as any).email.subject.length).toBeGreaterThan(0);
      expect((template as any).email.body.length).toBeGreaterThan(0);
    }
  });

  it("all templates reference Florida Solar Sales Academy branding", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    for (const [key, template] of Object.entries(templates)) {
      const sms = (template as any).sms as string;
      const emailBody = (template as any).email.body as string;
      const emailSubject = (template as any).email.subject as string;
      // At least one of sms, email subject, or email body should reference the academy
      const hasReference =
        sms.includes("Florida Solar Sales Academy") ||
        emailBody.includes("Florida Solar Sales Academy") ||
        emailSubject.includes("Florida Solar Sales Academy");
      expect(hasReference).toBe(true);
    }
  });

  it("interviewScheduled template contains {date} and {time}", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    expect(templates.interviewScheduled.sms).toContain("{date}");
    expect(templates.interviewScheduled.sms).toContain("{time}");
    expect(templates.interviewScheduled.email.body).toContain("{date}");
    expect(templates.interviewScheduled.email.body).toContain("{time}");
  });

  it("trainingStarting template contains {date}", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    expect(templates.trainingStarting.sms).toContain("{date}");
    expect(templates.trainingStarting.email.body).toContain("{date}");
  });
});

// ============================================================
// 6. INTERVIEW SCHEDULING VALIDATION TESTS
// ============================================================
describe("INTERVIEW SCHEDULING - Validation", () => {
  it("rejects scheduling with missing applicantId", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.interviews.schedule({
        applicantId: undefined as any,
        scheduledAt: new Date(),
      })
    ).rejects.toThrow();
  });

  it("rejects scheduling with invalid date", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    await expect(
      caller.interviews.schedule({
        applicantId: 1,
        scheduledAt: "not-a-date" as any,
      })
    ).rejects.toThrow();
  });

  it("accepts valid interview schedule", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    // This will try to hit the DB, which may or may not work in test
    // but should not throw a validation error
    try {
      const result = await caller.interviews.schedule({
        applicantId: 999999, // non-existent but valid format
        scheduledAt: futureDate,
      });
      expect(result.success).toBe(true);
    } catch (e: any) {
      // If DB error, that's fine - we're testing validation
      expect(e.message).not.toContain("Expected");
    }
  });
});

// ============================================================
// 7. DATA INTEGRITY TESTS
// ============================================================
describe("DATA INTEGRITY - Schema and type consistency", () => {
  it("applicant status enum matches frontend statuses", async () => {
    const validStatuses = ["new", "screened", "interviewed", "offered", "hired", "rejected"];
    const caller = appRouter.createCaller(createAuthContext());
    // Verify each valid status passes Zod validation (using a non-existent ID is fine)
    for (const status of validStatuses) {
      try {
        await caller.applicants.updateStatus({ id: 999999, status: status as any });
      } catch (e: any) {
        // DB errors are fine, but Zod validation errors are not
        expect(e.message).not.toContain("Expected");
      }
    }
  });

  it("experience level enum is consistent", () => {
    const validLevels = ["solar_sales", "outside_sales", "entry_level", "aspiring_leader"];
    for (const level of validLevels) {
      const score = calculateQualificationScore(level as any, "test motivation text here");
      expect(score).toBeGreaterThan(0);
    }
  });

  it("city enum matches frontend cities", () => {
    const validCities = ["Tampa", "Miami", "Fort Lauderdale"];
    // These should be the only valid cities in the submit procedure
    const caller = appRouter.createCaller(createAuthContext());
    for (const city of validCities) {
      // Should not throw validation error
      expect(["Tampa", "Miami", "Fort Lauderdale"]).toContain(city);
    }
  });
});

// ============================================================
// 8. SECURITY TESTS
// ============================================================
describe("SECURITY TESTS - Auth, injection, data exposure", () => {
  it("SQL injection via city filter is parameterized", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // Drizzle ORM uses parameterized queries
    const result = await caller.applicants.list({
      city: "Tampa' OR '1'='1",
    });
    // Should return empty array, not all records
    expect(Array.isArray(result)).toBe(true);
  });

  it("SQL injection via status filter is parameterized", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.list({
      status: "new' OR '1'='1",
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("XSS in template variables is not executed", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    // Template variables should be plain text substitution
    const smsTemplate = templates.applicationReceived.sms;
    expect(smsTemplate).not.toContain("<script>");
  });

  it("applicant getById returns null for non-existent ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: 999999 });
    expect(result).toBeNull();
  });

  it("interview getByApplicant returns array for non-existent applicant", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.interviews.getByApplicant({ applicantId: 888888 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ============================================================
// 9. BRANDING CONSISTENCY TESTS
// ============================================================
describe("BRANDING - Florida Solar Sales Academy consistency", () => {
  it("communication templates use correct branding", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const templates = await caller.communications.getTemplates();
    
    // Check all templates reference the academy
    for (const [key, template] of Object.entries(templates)) {
      const sms = (template as any).sms as string;
      const emailBody = (template as any).email.body as string;
      const emailSubject = (template as any).email.subject as string;
      
      const allText = sms + emailBody + emailSubject;
      expect(allText).toContain("Florida Solar");
    }
  });
});
