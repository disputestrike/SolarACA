import type { Express, Request, Response } from "express";
import { HttpError } from "@shared/_core/errors";
import { sdk } from "./sdk";
import * as db from "../db";

/**
 * Admin-only resume download. Serves PDF from DB fallback or redirects to Forge URL.
 */
export function registerApplicantResumeDownload(app: Express) {
  app.get("/api/applicants/:id/resume", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (user.role !== "admin") {
        res.status(403).send("Admin access required");
        return;
      }

      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id) || id < 1) {
        res.status(400).send("Invalid applicant id");
        return;
      }

      const applicant = await db.getApplicantById(id);
      if (!applicant) {
        res.status(404).send("Applicant not found");
        return;
      }

      const inline = applicant.resumeInlineBase64;
      if (inline && String(inline).length > 0) {
        let buf: Buffer;
        try {
          buf = Buffer.from(String(inline), "base64");
        } catch {
          res.status(500).send("Invalid stored resume data");
          return;
        }
        const fname = applicant.resumeStoredFileName || "resume.pdf";
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${fname.replace(/"/g, "")}"`
        );
        res.send(buf);
        return;
      }

      if (applicant.resumeUrl) {
        if (applicant.resumeUrl.startsWith("http")) {
          res.redirect(302, applicant.resumeUrl);
          return;
        }
        res.redirect(302, applicant.resumeUrl);
        return;
      }

      res.status(404).send("No resume on file");
    } catch (err) {
      const status = err instanceof HttpError ? err.statusCode : 403;
      res.status(status).send("Unauthorized");
    }
  });
}
