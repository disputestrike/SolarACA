import { describe, it, expect, vi, beforeEach } from "vitest";
import { applicantsRouter } from "./applicants";
import * as db from "../db";
import * as storage from "../storage";
import * as notification from "../_core/notification";

// Mock the dependencies
vi.mock("../db");
vi.mock("../storage");
vi.mock("../_core/notification");

describe("applicantsRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submit", () => {
    it("should submit an application without resume", async () => {
      const mockCreateApplicant = vi.spyOn(db, "createApplicant").mockResolvedValue({
        fieldCount: 0,
        affectedRows: 1,
        insertId: 1,
        info: "",
        serverStatus: 0,
        warningStatus: 0,
      } as any);

      const mockNotifyOwner = vi.spyOn(notification, "notifyOwner").mockResolvedValue(true);

      const caller = applicantsRouter.createCaller({} as any);

      const result = await caller.submit({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "Tampa",
        experienceLevel: "outside_sales",
        motivation: "I want to earn six figures and build my own team",
      });

      expect(result.success).toBe(true);
      expect(mockCreateApplicant).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "Tampa",
        experienceLevel: "outside_sales",
        motivation: "I want to earn six figures and build my own team",
        resumeUrl: undefined,
        resumeKey: undefined,
      });
      expect(mockNotifyOwner).toHaveBeenCalled();
    });

    it("should submit an application with resume", async () => {
      const mockCreateApplicant = vi.spyOn(db, "createApplicant").mockResolvedValue({
        fieldCount: 0,
        affectedRows: 1,
        insertId: 1,
        info: "",
        serverStatus: 0,
        warningStatus: 0,
      } as any);

      const mockStoragePut = vi.spyOn(storage, "storagePut").mockResolvedValue({
        key: "resumes/john@example.com-123-resume.pdf",
        url: "https://example.com/resumes/john@example.com-123-resume.pdf",
      });

      const mockNotifyOwner = vi.spyOn(notification, "notifyOwner").mockResolvedValue(true);

      const caller = applicantsRouter.createCaller({} as any);

      const result = await caller.submit({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234567",
        city: "Tampa",
        experienceLevel: "outside_sales",
        motivation: "I want to earn six figures and build my own team",
        resumeBase64: "JVBERi0xLjQK", // Base64 encoded PDF header
        resumeFileName: "resume.pdf",
      });

      expect(result.success).toBe(true);
      expect(mockStoragePut).toHaveBeenCalled();
      expect(mockCreateApplicant).toHaveBeenCalledWith(
        expect.objectContaining({
          resumeUrl: "https://example.com/resumes/john@example.com-123-resume.pdf",
          resumeKey: "resumes/john@example.com-123-resume.pdf",
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
          city: "Tampa",
          experienceLevel: "outside_sales",
          motivation: "Test motivation",
          status: "new",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockGetApplicants = vi.spyOn(db, "getApplicants").mockResolvedValue(mockApplicants as any);

      const caller = applicantsRouter.createCaller({} as any);
      const result = await caller.list({});

      expect(result).toEqual(mockApplicants);
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

      const caller = applicantsRouter.createCaller({} as any);
      const result = await caller.list({ status: "screened" });

      expect(mockGetApplicants).toHaveBeenCalledWith({ status: "screened" });
    });
  });

  describe("updateStatus", () => {
    it("should update applicant status", async () => {
      const mockUpdateStatus = vi.spyOn(db, "updateApplicantStatus").mockResolvedValue(undefined);

      const caller = applicantsRouter.createCaller({} as any);
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
      };

      const mockGetStats = vi.spyOn(db, "getApplicantStats").mockResolvedValue(mockStats);

      const caller = applicantsRouter.createCaller({} as any);
      const result = await caller.stats();

      expect(result).toEqual(mockStats);
      expect(mockGetStats).toHaveBeenCalled();
    });
  });
});
