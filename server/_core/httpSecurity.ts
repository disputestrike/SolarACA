import type { Express, RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { ENV } from "./env";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw == null || raw === "") return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Railway / reverse proxies: required so `req.ip` and rate limiting are per real client.
 */
export function applyTrustProxy(app: Express): void {
  app.set("trust proxy", 1);
}

/**
 * Security headers (CSP off in dev so Vite HMR keeps working).
 */
export function applyHelmet(app: Express): void {
  app.use(
    helmet({
      contentSecurityPolicy: ENV.isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", "data:", "blob:", "https:"],
              connectSrc: ["'self'", "https:", "wss:"],
              fontSrc: ["'self'", "https:", "data:"],
              frameSrc: ["'self'", "https://calendly.com", "https://*.calendly.com"],
            },
          }
        : false,
      crossOriginEmbedderPolicy: false,
    })
  );
}

/**
 * Stricter cap for `/api/oauth/*` (redirect / callback abuse).
 */
export function createOAuthRateLimiter(): RequestHandler {
  const limit = ENV.isProduction
    ? parsePositiveInt(process.env.RATE_LIMIT_OAUTH_MAX, 60)
    : parsePositiveInt(process.env.RATE_LIMIT_OAUTH_MAX, 500);

  return rateLimit({
    windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, FIFTEEN_MIN_MS),
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: "Too many sign-in attempts. Try again shortly." });
    },
  });
}

/**
 * General API: `/api/trpc`, `/api/applicants/*`, etc. Skips `/api/oauth` (handled above).
 */
export function createApiRateLimiter(): RequestHandler {
  const limit = ENV.isProduction
    ? parsePositiveInt(process.env.RATE_LIMIT_API_MAX, 600)
    : parsePositiveInt(process.env.RATE_LIMIT_API_MAX, 20_000);

  const limiter = rateLimit({
    windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, FIFTEEN_MIN_MS),
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: "Too many requests. Try again shortly." });
    },
  });

  return (req, res, next) => {
    const path = req.path || req.url?.split("?")[0] || "";
    if (path.startsWith("/api/oauth") || path.startsWith("/oauth")) {
      next();
      return;
    }
    return limiter(req, res, next);
  };
}
