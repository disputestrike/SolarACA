import { describe, expect, it, vi, beforeEach } from "vitest";
import { sendSMS, sendBulkSMS, isTwilioConfigured } from "./twilio";
import { sendEmail, sendBulkEmail, isSendGridConfigured } from "./sendgrid";
import { getSchedulingUrl, getAvailableSlots, createSchedulingLink, getScheduledEvents } from "./calendly";

// ============================================================
// TWILIO SERVICE TESTS
// ============================================================
describe("Twilio SMS Service", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("isTwilioConfigured returns false when env vars are missing", () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "");
    vi.stubEnv("TWILIO_PHONE_NUMBER", "");
    expect(isTwilioConfigured()).toBe(false);
  });

  it("sendSMS returns success with logged SID when not configured", async () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "");
    vi.stubEnv("TWILIO_PHONE_NUMBER", "");
    const result = await sendSMS("+15551234567", "Test message");
    expect(result.success).toBe(true);
    expect(result.sid).toContain("logged-");
  });

  it("sendSMS handles empty phone number gracefully", async () => {
    const result = await sendSMS("", "Test message");
    expect(result.success).toBe(true); // Logged mode
  });

  it("sendSMS handles empty message gracefully", async () => {
    const result = await sendSMS("+15551234567", "");
    expect(result.success).toBe(true); // Logged mode
  });

  it("sendSMS handles very long message", async () => {
    const longMessage = "A".repeat(10000);
    const result = await sendSMS("+15551234567", longMessage);
    expect(result.success).toBe(true);
  });

  it("sendSMS handles special characters in message", async () => {
    const result = await sendSMS("+15551234567", "Hello! 🌞 Solar energy is the future. $100k+");
    expect(result.success).toBe(true);
  });

  it("sendBulkSMS sends to multiple recipients", async () => {
    const recipients = [
      { to: "+15551111111", body: "Hello recipient 1" },
      { to: "+15552222222", body: "Hello recipient 2" },
      { to: "+15553333333", body: "Hello recipient 3" },
    ];
    const result = await sendBulkSMS(recipients);
    expect(result.results.length).toBe(3);
    for (const r of result.results) {
      expect(r.success).toBe(true);
    }
  });

  it("sendBulkSMS handles empty array", async () => {
    const result = await sendBulkSMS([]);
    expect(result.results.length).toBe(0);
  });
});

// ============================================================
// SENDGRID EMAIL SERVICE TESTS
// ============================================================
describe("SendGrid Email Service", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("isSendGridConfigured returns false when env vars are missing", () => {
    vi.stubEnv("SENDGRID_API_KEY", "");
    expect(isSendGridConfigured()).toBe(false);
  });

  it("sendEmail returns success when not configured", async () => {
    vi.stubEnv("SENDGRID_API_KEY", "");
    const result = await sendEmail("test@example.com", "Test Subject", "Test Body");
    expect(result.success).toBe(true);
  });

  it("sendEmail handles empty recipient gracefully", async () => {
    const result = await sendEmail("", "Test Subject", "Test Body");
    expect(result.success).toBe(true); // Logged mode
  });

  it("sendEmail handles empty subject gracefully", async () => {
    const result = await sendEmail("test@example.com", "", "Test Body");
    expect(result.success).toBe(true);
  });

  it("sendEmail handles empty body gracefully", async () => {
    const result = await sendEmail("test@example.com", "Test Subject", "");
    expect(result.success).toBe(true);
  });

  it("sendEmail handles HTML content", async () => {
    const result = await sendEmail(
      "test@example.com",
      "HTML Email",
      "Plain text fallback",
      "<h1>Hello</h1><p>This is HTML content</p>"
    );
    expect(result.success).toBe(true);
  });

  it("sendEmail handles very long body", async () => {
    const longBody = "Solar energy is the future. ".repeat(1000);
    const result = await sendEmail("test@example.com", "Long Email", longBody);
    expect(result.success).toBe(true);
  });

  it("sendEmail handles special characters in subject", async () => {
    const result = await sendEmail(
      "test@example.com",
      "🌞 Florida Solar Sales Academy - $100k+ Opportunity!",
      "Test body"
    );
    expect(result.success).toBe(true);
  });

  it("sendBulkEmail sends to multiple recipients", async () => {
    const recipients = [
      { to: "a@test.com", subject: "Subject 1", body: "Body 1" },
      { to: "b@test.com", subject: "Subject 2", body: "Body 2" },
      { to: "c@test.com", subject: "Subject 3", body: "Body 3" },
    ];
    const result = await sendBulkEmail(recipients);
    expect(result.results.length).toBe(3);
    for (const r of result.results) {
      expect(r.success).toBe(true);
    }
  });

  it("sendBulkEmail handles empty array", async () => {
    const result = await sendBulkEmail([]);
    expect(result.results.length).toBe(0);
  });
});

// ============================================================
// CALENDLY SERVICE TESTS
// ============================================================
describe("Calendly Scheduling Service", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("getSchedulingUrl returns empty string when not configured", () => {
    vi.stubEnv("CALENDLY_SCHEDULING_URL", "");
    const url = getSchedulingUrl();
    expect(url).toBe("");
  });

  it("getSchedulingUrl returns URL when configured", () => {
    vi.stubEnv("CALENDLY_SCHEDULING_URL", "https://calendly.com/test/interview");
    const url = getSchedulingUrl();
    expect(url).toBe("https://calendly.com/test/interview");
  });

  it("getAvailableSlots returns empty array when not configured", async () => {
    vi.stubEnv("CALENDLY_API_KEY", "");
    const slots = await getAvailableSlots("2026-03-01", "2026-03-07");
    expect(Array.isArray(slots)).toBe(true);
    expect(slots.length).toBe(0);
  });

  it("createSchedulingLink returns null when not configured and no scheduling URL", async () => {
    vi.stubEnv("CALENDLY_API_KEY", "");
    vi.stubEnv("CALENDLY_SCHEDULING_URL", "");
    const result = await createSchedulingLink("John Doe", "john@example.com");
    expect(result).toBeNull();
  });

  it("createSchedulingLink returns fallback URL when scheduling URL is set", async () => {
    vi.stubEnv("CALENDLY_API_KEY", "");
    vi.stubEnv("CALENDLY_SCHEDULING_URL", "https://calendly.com/test/interview");
    const result = await createSchedulingLink("John Doe", "john@example.com");
    expect(result).toBeDefined();
    expect(result?.bookingUrl).toContain("calendly.com");
    expect(result?.bookingUrl).toContain("John");
  });

  it("getScheduledEvents returns empty array when not configured", async () => {
    vi.stubEnv("CALENDLY_API_KEY", "");
    const events = await getScheduledEvents();
    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBe(0);
  });
});

// ============================================================
// INTEGRATION RESILIENCE TESTS
// ============================================================
describe("Integration Resilience", () => {
  it("all services gracefully handle missing env vars", async () => {
    vi.stubEnv("TWILIO_ACCOUNT_SID", "");
    vi.stubEnv("TWILIO_AUTH_TOKEN", "");
    vi.stubEnv("TWILIO_PHONE_NUMBER", "");
    vi.stubEnv("SENDGRID_API_KEY", "");
    vi.stubEnv("CALENDLY_API_KEY", "");
    vi.stubEnv("CALENDLY_SCHEDULING_URL", "");

    // All should succeed without throwing
    const smsResult = await sendSMS("+15551234567", "Test");
    expect(smsResult.success).toBe(true);

    const emailResult = await sendEmail("test@test.com", "Test", "Body");
    expect(emailResult.success).toBe(true);

    const slots = await getAvailableSlots("2026-03-01", "2026-03-07");
    expect(Array.isArray(slots)).toBe(true);

    const events = await getScheduledEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it("concurrent service calls don't interfere", async () => {
    const promises = [
      sendSMS("+15551111111", "SMS 1"),
      sendSMS("+15552222222", "SMS 2"),
      sendEmail("a@test.com", "Email 1", "Body 1"),
      sendEmail("b@test.com", "Email 2", "Body 2"),
      getAvailableSlots("2026-03-01", "2026-03-07"),
      getScheduledEvents(),
    ];

    const results = await Promise.all(promises);
    expect(results.length).toBe(6);
    // All should resolve without error
    for (const r of results) {
      expect(r).toBeDefined();
    }
  });

  it("rapid sequential SMS calls don't fail", async () => {
    for (let i = 0; i < 20; i++) {
      const result = await sendSMS(`+1555000${i.toString().padStart(4, "0")}`, `Message ${i}`);
      expect(result.success).toBe(true);
    }
  });

  it("rapid sequential email calls don't fail", async () => {
    for (let i = 0; i < 20; i++) {
      const result = await sendEmail(`user${i}@test.com`, `Subject ${i}`, `Body ${i}`);
      expect(result.success).toBe(true);
    }
  });
});
