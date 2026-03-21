import { describe, it, expect, vi, beforeEach } from "vitest";
import { applicantsRouter } from "./applicants";
import * as db from "../db";
import * as storage from "../storage";
import * as notification from "../_core/notification";
import * as sendgrid from "../services/sendgrid";
import type { TrpcContext } from "../_core/context";

// Mock the dependencies
vi.mock("../db");
vi.mock("../storage");
vi.mock("../_core/env", () => ({
  ENV: {
    cookieSecret: "",
    databaseUrl: "",
    databaseName: "",
    googleClientId: "",
    googleClientSecret: "",
    adminEmail: "",
    forgeApiUrl: "https://forge.test/",
    forgeApiKey: "test-key",
    isProduction: false,
    port: "3000",
  },
}));
vi.mock("../_core/notification");
vi.mock("../services/sendgrid", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-owner",
    email: "owner@fssa.com",
    name: "Test Owner",
    loginMethod: "manus",
    role: "admin",
    adminTier: "super_admin",
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

describe("applicantsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submit", () => {
    it("should submit an application without resume", async () => {
      const mockCreateApplicant = vi.spyOn(db, "createApplicant").mockResolvedValue({
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "FL - Tampa",
        experienceLevel: "outside_sales",
        motivation: "x",
        status: "new",
        qualificationScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const mockNotifyOwner = vi.spyOn(notification, "notifyOwner").mockResolvedValue(true);
      const mockSendEmail = vi.spyOn(sendgrid, "sendEmail");

      const caller = applicantsRouter.createCaller({} as any); // submit is public

      const result = await caller.submit({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "FL - Tampa",
        experienceLevel: "outside_sales",
        motivation: "I want to earn six figures and build my own team",
      });

      expect(result.success).toBe(true);
      expect(mockCreateApplicant).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "FL - Tampa",
        experienceLevel: "outside_sales",
        motivation: "I want to earn six figures and build my own team",
        resumeUrl: undefined,
        resumeKey: undefined,
        resumeInlineBase64: undefined,
        resumeStoredFileName: undefined,
      });
      expect(mockNotifyOwner).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalledWith(
        "john@example.com",
        expect.any(String),
        expect.stringContaining("John")
      );
    });

    it("should submit an application with resume", async () => {
      const mockCreateApplicant = vi.spyOn(db, "createApplicant").mockResolvedValue({
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "FL - Tampa",
        experienceLevel: "outside_sales",
        motivation: "x",
        status: "new",
        qualificationScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const mockStoragePut = vi.spyOn(storage, "storagePut").mockResolvedValue({
        key: "resumes/john@example.com-123-resume.pdf",
        url: "https://example.com/resumes/john@example.com-123-resume.pdf",
      });

      const mockNotifyOwner = vi.spyOn(notification, "notifyOwner").mockResolvedValue(true);
      vi.spyOn(sendgrid, "sendEmail").mockResolvedValue({ success: true });

      const caller = applicantsRouter.createCaller({} as any); // submit is public

      const result = await caller.submit({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "FL - Tampa",
        experienceLevel: "outside_sales",
        motivation: "I want to earn six figures and build my own team",
        resumeBase64: "JVBERi0xLjQK", // Base64 encoded PDF header
        resumeFileName: "resume.pdf",
      });

      expect(result.success).toBe(true);
      expect(mockStoragePut).toHaveBeenCalledWith(
        expect.stringMatching(/^resumes\/john@example\.com-\d+-resume\.pdf$/),
        expect.any(Buffer),
        "application/pdf"
      );
      expect(mockCreateApplicant).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeUrl: "https://example.com/resumes/john@example.com-123-resume.pdf",
          resumeKey: "resumes/john@example.com-123-resume.pdf",
          resumeInlineBase64: undefined,
          resumeStoredFileName: undefined,
        })
      );
    });

    it("should save resume in DB when Forge upload fails", async () => {
      vi.spyOn(storage, "storagePut").mockRejectedValue(new Error("upload failed"));

      const mockCreateApplicant = vi.spyOn(db, "createApplicant").mockResolvedValue({
        id: 2,
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "5559876543",
        city: "FL - Orlando",
        experienceLevel: "entry_level",
        motivation: "I want to grow in solar sales and help homeowners",
        status: "new",
        qualificationScore: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      vi.spyOn(notification, "notifyOwner").mockResolvedValue(true);
      vi.spyOn(sendgrid, "sendEmail").mockResolvedValue({ success: true });

      const caller = applicantsRouter.createCaller({} as any);

      const result = await caller.submit({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        phone: "5559876543",
        city: "FL - Orlando",
        experienceLevel: "entry_level",
        motivation: "I want to grow in solar sales and help homeowners",
        resumeBase64: "JVBERi0xLjQK",
        resumeFileName: "cv.pdf",
      });

      expect(result.success).toBe(true);
      expect(mockCreateApplicant).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeUrl: undefined,
          resumeKey: undefined,
          resumeInlineBase64: "JVBERi0xLjQK",
          resumeStoredFileName: "cv.pdf",
        })
      );
    });
  });

  describe("list", () => {
    it("should return all applicants", async () => {
      const mockApplicants = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "5551234567",
          city: "FL - Tampa",
          experienceLevel: "outside_sales",
          motivation: "Test motivation",
          status: "new",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockGetApplicants = vi.spyOn(db, "getApplicants").mockResolvedValue(mockApplicants as any);
      vi.spyOn(db, "getApplicantEmailStatsMap").mockResolvedValue(
        new Map([["john@example.com", { total: 1, firstId: 1 }]])
      );

      const caller = applicantsRouter.createCaller(createAuthContext());
      const result = await caller.list({});

      expect(result[0]).toMatchObject({
        emailApplicationTotal: 1,
        isReapplication: false,
        hasResumeBlob: false,
      });
      expect(mockGetApplicants).toHaveBeenCalledWith({});
    });

    it("should filter applicants by status", async () => {
      const mockApplicants = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          status: "screened",
        },
      ];

      const mockGetApplicants = vi.spyOn(db, "getApplicants").mockResolvedValue(mockApplicants as any);

      const caller = applicantsRouter.createCaller(createAuthContext());
      const result = await caller.list({ status: "screened" });

      expect(mockGetApplicants).toHaveBeenCalledWith({ status: "screened" });
    });
  });

  describe("updateStatus", () => {
    it("should update applicant status", async () => {
      const mockUpdateStatus = vi.spyOn(db, "updateApplicantStatus").mockResolvedValue(undefined);

      const caller = applicantsRouter.createCaller(createAuthContext());
      const result = await caller.updateStatus({
        id: 1,
        status: "interviewed",
      });

      expect(result.success).toBe(true);
      expect(mockUpdateStatus).toHaveBeenCalledWith(1, "interviewed");
    });
  });

  describe("stats", () => {
    it("should return applicant statistics", async () => {
      const mockStats = {
        total: 10,
        new: 3,
        screened: 2,
        interviewed: 2,
        offered: 2,
        hired: 1,
        rejected: 0,
      };

      const mockGetStats = vi.spyOn(db, "getApplicantStats").mockResolvedValue(mockStats);

      const caller = applicantsRouter.createCaller(createAuthContext());
      const result = await caller.stats();

      expect(result).toEqual(mockStats);
      expect(mockGetStats).toHaveBeenCalled();
    });
  });
});
