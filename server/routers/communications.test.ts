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

describe("communications router", () => {
  it("should get message templates", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const templates = await caller.communications.getTemplates();

    expect(templates).toBeDefined();
    expect(templates.applicationReceived).toBeDefined();
    expect(templates.interviewScheduled).toBeDefined();
    expect(templates.offerSent).toBeDefined();
  });

  it("should send SMS with custom message", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.communications.sendSMS({
      applicantId: 1,
      phoneNumber: "+1234567890",
      message: "Test SMS message",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("queued");
  });

  it("should send SMS with template", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.communications.sendSMS({
      applicantId: 1,
      phoneNumber: "+1234567890",
      message: "Fallback message",
      templateKey: "applicationReceived",
      templateVariables: { name: "John" },
    });

    expect(result.success).toBe(true);
  });

  it("should send email with custom message", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.communications.sendEmail({
      applicantId: 1,
      email: "test@example.com",
      subject: "Test Subject",
      body: "Test email body",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("queued");
  });

  it("should send email with template", async () => {
    const caller = appRouter.createCaller(createAuthContext());

    const result = await caller.communications.sendEmail({
      applicantId: 1,
      email: "test@example.com",
      subject: "Fallback",
      body: "Fallback",
      templateKey: "interviewScheduled",
      templateVariables: {
        name: "Jane",
        date: "2026-03-15",
        time: "2:00 PM",
      },
    });

    expect(result.success).toBe(true);
  });
});
