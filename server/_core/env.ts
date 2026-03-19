const rawDatabaseUrl =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  "";

function buildDbUrlFromParts() {
  const host = process.env.MYSQLHOST || process.env.DB_HOST;
  const port = process.env.MYSQLPORT || process.env.DB_PORT || "3306";
  const user = process.env.MYSQLUSER || process.env.DB_USER;
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD;
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME || "railway";

  if (!host || !user || !password) return "";

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
}

function getDatabaseName(url: string) {
  if (!url) return process.env.MYSQLDATABASE || process.env.DB_NAME || "";
  try {
    const parsed = new URL(url);
    const fromPath = parsed.pathname.replace(/^\//, "");
    return fromPath || process.env.MYSQLDATABASE || process.env.DB_NAME || "";
  } catch {
    return process.env.MYSQLDATABASE || process.env.DB_NAME || "";
  }
}

const computedDatabaseUrl = rawDatabaseUrl || buildDbUrlFromParts();

export const ENV = {
  // JWT
  cookieSecret: process.env.JWT_SECRET ?? "",
  // Database — support Railway URL and host/user/password variable sets
  databaseUrl: computedDatabaseUrl,
  databaseName: getDatabaseName(computedDatabaseUrl),
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
