export const ENV = {
  // JWT
  cookieSecret: process.env.JWT_SECRET ?? "",
  // Database — Railway provides DATABASE_URL or MYSQL_URL
  databaseUrl: process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || "",
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Admin — the Google email that gets dashboard access
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  // Storage (optional - resume uploads)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Runtime
  isProduction: process.env.NODE_ENV === "production",
  port: process.env.PORT ?? "3000",
};
