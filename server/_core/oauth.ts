import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { SignJWT } from "jose";

function getOAuthClient(redirectUri: string) {
  return new OAuth2Client(
    ENV.googleClientId,
    ENV.googleClientSecret,
    redirectUri
  );
}

function getRedirectUri(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}/api/oauth/callback`;
}

async function createSessionToken(openId: string, name: string): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  return new SignJWT({ openId, name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime("1y")
    .sign(secret);
}

export function registerOAuthRoutes(app: Express) {
  // Step 1: Redirect user to Google
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      res.status(500).json({ error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." });
      return;
    }
    const redirectUri = getRedirectUri(req);
    const client = getOAuthClient(redirectUri);
    const url = client.generateAuthUrl({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
    });
    res.redirect(302, url);
  });

  // Step 2: Google calls back here with code
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).json({ error: "Missing authorization code" });
      return;
    }

    try {
      const redirectUri = getRedirectUri(req);
      const client = getOAuthClient(redirectUri);

      const { tokens } = await client.getToken(code);
      client.setCredentials(tokens);

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token!,
        audience: ENV.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub) {
        res.status(400).json({ error: "Invalid Google token payload" });
        return;
      }

      const openId = `google_${payload.sub}`;
      const name = payload.name || payload.email || "User";
      const email = payload.email || null;
      const isAdmin = !!(email && ENV.adminEmail && email.toLowerCase() === ENV.adminEmail.toLowerCase());

      await db.upsertUser({
        openId,
        name,
        email,
        loginMethod: "google",
        lastSignedIn: new Date(),
        role: isAdmin ? "admin" : "user",
      });

      const sessionToken = await createSessionToken(openId, name);
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      const user = await db.getUserByOpenId(openId);
      res.redirect(302, user?.role === "admin" ? "/dashboard" : "/");
    } catch (error) {
      console.error("[OAuth] Google callback failed:", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });
}
