import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-owner",
    email: "owner@fssa.com",
    name: "Test Owner",
    loginMethod: "manus",
    role: "admin",
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

describe("interviews router", () => {
  it("should get interview statistics", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const stats = await caller.interviews.getStats();

    expect(stats).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(0);
    expect(stats.scheduled).toBeGreaterThanOrEqual(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
    expect(stats.noShow).toBeGreaterThanOrEqual(0);
    expect(stats.cancelled).toBeGreaterThanOrEqual(0);
  });

  it("should get upcoming interviews", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const interviews = await caller.interviews.getUpcoming();

    expect(Array.isArray(interviews)).toBe(true);
  });

  it("should schedule an interview", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const result = await caller.interviews.schedule({
      applicantId: 1,
      scheduledAt: futureDate,
      notes: "Initial screening interview",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("successfully");
  });

  it("should send interview reminder", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.interviews.sendReminder({
      interviewId: 1,
      reminderType: "sms",
    });

    expect(result.success).toBe(true);
  });

  it("should update interview status", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.interviews.updateStatus({
      interviewId: 1,
      status: "completed",
      notes: "Great candidate, moving to offer stage",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("updated");
  });
});
