import mysql from "mysql2/promise";
import { ENV } from "./env";

const TABLES = [
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\`           INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`openId\`       VARCHAR(64) NOT NULL,
    \`name\`         TEXT,
    \`email\`        VARCHAR(320),
    \`loginMethod\`  VARCHAR(64),
    \`role\`         ENUM('user','admin') NOT NULL DEFAULT 'user',
    \`adminTier\`    VARCHAR(32) NULL,
    \`adminPermissions\` TEXT NULL,
    \`createdAt\`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    \`lastSignedIn\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY \`users_openId_unique\` (\`openId\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`staffGrants\` (
    \`id\`               INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`email\`            VARCHAR(320) NOT NULL,
    \`adminTier\`        VARCHAR(32) NOT NULL,
    \`permissionsJson\`  TEXT NULL,
    \`createdByOpenId\`  VARCHAR(64) NULL,
    \`createdAt\`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`consumedAt\`       TIMESTAMP NULL,
    INDEX \`idx_staffGrants_email_pending\` (\`email\`, \`consumedAt\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`applicants\` (
    \`id\`                   INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`firstName\`            VARCHAR(100) NOT NULL,
    \`lastName\`             VARCHAR(100) NOT NULL,
    \`email\`                VARCHAR(320) NOT NULL,
    \`phone\`                VARCHAR(20) NOT NULL,
    \`city\`                 VARCHAR(100) NOT NULL,
    \`experienceLevel\`      ENUM('solar_sales','outside_sales','entry_level','aspiring_leader') NOT NULL,
    \`motivation\`           TEXT,
    \`resumeUrl\`            VARCHAR(500),
    \`resumeKey\`            VARCHAR(500),
    \`resumeInlineBase64\`   MEDIUMTEXT NULL,
    \`resumeStoredFileName\` VARCHAR(260) NULL,
    \`status\`               ENUM('new','screened','interviewed','offered','hired','rejected') NOT NULL DEFAULT 'new',
    \`qualificationScore\`   INT NOT NULL DEFAULT 0,
    \`interviewScheduledAt\` TIMESTAMP NULL,
    \`interviewNotes\`       TEXT,
    \`offerSentAt\`          TIMESTAMP NULL,
    \`offerSignedAt\`        TIMESTAMP NULL,
    \`createdAt\`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`interviews\` (
    \`id\`             INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`applicantId\`    INT NOT NULL,
    \`scheduledAt\`    TIMESTAMP NOT NULL,
    \`status\`         ENUM('scheduled','completed','no_show','cancelled') NOT NULL DEFAULT 'scheduled',
    \`reminderSentAt\` TIMESTAMP NULL,
    \`reminderType\`   ENUM('sms','email','both'),
    \`notes\`          TEXT,
    \`createdAt\`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\`      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_interviews_applicant\` (\`applicantId\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`jobOffers\` (
    \`id\`           INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`applicantId\`  INT NOT NULL,
    \`position\`     VARCHAR(100) NOT NULL,
    \`salary\`       DECIMAL(10,2),
    \`commission\`   TEXT,
    \`offerContent\` TEXT NOT NULL,
    \`status\`       ENUM('draft','sent','viewed','signed','accepted','rejected') NOT NULL DEFAULT 'draft',
    \`sentAt\`       TIMESTAMP NULL,
    \`viewedAt\`     TIMESTAMP NULL,
    \`signedAt\`     TIMESTAMP NULL,
    \`signatureUrl\` VARCHAR(500),
    \`createdAt\`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_offers_applicant\` (\`applicantId\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`communicationLog\` (
    \`id\`          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`applicantId\` INT NOT NULL,
    \`type\`        ENUM('sms','email') NOT NULL,
    \`subject\`     VARCHAR(200),
    \`message\`     TEXT NOT NULL,
    \`status\`      ENUM('sent','delivered','failed','bounced') NOT NULL DEFAULT 'sent',
    \`externalId\`  VARCHAR(200),
    \`createdAt\`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_comms_applicant\` (\`applicantId\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`testimonials\` (
    \`id\`        INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`name\`      VARCHAR(100) NOT NULL,
    \`title\`     VARCHAR(100) NOT NULL,
    \`city\`      VARCHAR(100) NOT NULL,
    \`content\`   TEXT NOT NULL,
    \`imageUrl\`  VARCHAR(500),
    \`earnings\`  VARCHAR(100),
    \`featured\`  BOOLEAN NOT NULL DEFAULT FALSE,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`trainingModules\` (
    \`id\`          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`title\`       VARCHAR(200) NOT NULL,
    \`description\` TEXT,
    \`category\`    ENUM('sales_fundamentals','solar_product','leadership','management') NOT NULL,
    \`videoUrl\`    VARCHAR(500),
    \`duration\`    INT,
    \`order\`       INT NOT NULL DEFAULT 0,
    \`createdAt\`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  `CREATE TABLE IF NOT EXISTS \`talentInterest\` (
    \`id\`        INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`firstName\` VARCHAR(100) NOT NULL,
    \`email\`     VARCHAR(320) NOT NULL,
    \`city\`      VARCHAR(100) NOT NULL,
    \`createdAt\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_talent_interest_email\` (\`email\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
];

const SEEDS = [
  `INSERT IGNORE INTO \`testimonials\` (\`name\`,\`title\`,\`city\`,\`content\`,\`earnings\`,\`featured\`) VALUES
    ('Marcus Johnson','Senior Solar Sales Rep','Tampa','Started with no solar experience, now I am leading a team of 5. The training and support here is unmatched.','$180k+',TRUE),
    ('Sarah Chen','Sales Manager','Miami','The commission structure is transparent and generous. I have built real wealth doing work I believe in.','$220k+',TRUE),
    ('David Rodriguez','Installation Lead','Fort Lauderdale','Transitioned from roofing to solar. Best decision I ever made. The team feels like family.','$150k+',TRUE)`,

  `INSERT IGNORE INTO \`trainingModules\` (\`title\`,\`description\`,\`category\`,\`duration\`,\`order\`) VALUES
    ('Solar Sales Fundamentals','Core sales techniques for the solar industry','sales_fundamentals',45,1),
    ('Handling Objections','How to address common homeowner objections','sales_fundamentals',30,2),
    ('Solar Panel Technology 101','How photovoltaic systems work','solar_product',60,1),
    ('ROI & Financing Options','Explaining payback periods, loans, and leases','solar_product',45,2),
    ('Building & Leading a Team','Recruiting, coaching, and retaining your sales team','leadership',60,1),
    ('Management Fundamentals','Territory management and performance tracking','management',45,1)`,
];

function shouldEnableSsl(url: string) {
  try {
    const parsed = new URL(url);
    const ssl = (parsed.searchParams.get("ssl") || "").toLowerCase();
    const sslMode = (parsed.searchParams.get("sslmode") || "").toLowerCase();
    const sslAccept = (parsed.searchParams.get("sslaccept") || "").toLowerCase();
    return ssl === "true" || sslMode === "require" || sslAccept === "strict";
  } catch {
    return false;
  }
}

function getSafeDbTarget(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || "3306"}/${parsed.pathname.replace(/^\//, "") || "<none>"}`;
  } catch {
    return "<invalid DATABASE_URL>";
  }
}

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/** mysql2 `execute()` uses prepared statements — DDL like ALTER often must use `query()` instead. */
async function mysqlColumnExists(conn: mysql.Connection, table: string, column: string): Promise<boolean> {
  const [rows] = await conn.query(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  return Array.isArray(rows) && rows.length > 0;
}

async function ensureMysqlColumn(conn: mysql.Connection, table: string, column: string, alterSql: string): Promise<void> {
  if (await mysqlColumnExists(conn, table, column)) {
    return;
  }
  console.log(`[Migration] Adding column ${table}.${column} (existing table)`);
  await conn.query(alterSql);
  if (!(await mysqlColumnExists(conn, table, column))) {
    throw new Error(`[Migration] Column ${table}.${column} still missing after ALTER`);
  }
  console.log(`[Migration] Column ${table}.${column} OK`);
}

export async function runMigrations(maxAttempts = 5) {
  const url = ENV.databaseUrl;
  if (!url) {
    const hint = [
      `DATABASE_URL=${Boolean(process.env.DATABASE_URL)}`,
      `MYSQL_URL=${Boolean(process.env.MYSQL_URL)}`,
      `MYSQL_PUBLIC_URL=${Boolean(process.env.MYSQL_PUBLIC_URL)}`,
      `MYSQLHOST=${Boolean(process.env.MYSQLHOST)}`,
      `MYSQLUSER=${Boolean(process.env.MYSQLUSER)}`,
      `MYSQLPASSWORD=${Boolean(process.env.MYSQLPASSWORD)}`,
    ].join(" ");
    const message = `[Migration] No database connection variables found. ${hint}`;
    if (ENV.isProduction) {
      throw new Error(message);
    }
    console.warn(`${message} — skipping migrations`);
    return;
  }

  const target = getSafeDbTarget(url);
  const useSsl = shouldEnableSsl(url);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let conn: mysql.Connection | null = null;

    try {
      conn = await mysql.createConnection({
        uri: url,
        // Railway public endpoints often require TLS; internal endpoints typically don't.
        ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      });
      console.log(`[Migration] Connected to MySQL (${target}) [attempt ${attempt}/${maxAttempts}]`);

      const [rows] = await conn.query<any[]>("SELECT DATABASE() as currentDb");
      const currentDb = rows?.[0]?.currentDb as string | null | undefined;
      if (!currentDb && ENV.databaseName) {
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${ENV.databaseName}\``);
        await conn.query(`USE \`${ENV.databaseName}\``);
      }

      for (const sql of TABLES) {
        await conn.execute(sql);
      }
      console.log("[Migration] All tables created/verified");

      for (const sql of SEEDS) {
        await conn.execute(sql);
      }
      console.log("[Migration] Seed data inserted");

      // Idempotent columns for existing DBs (CREATE TABLE IF NOT EXISTS does not add new columns).
      // Use conn.query() — conn.execute() prepared-statement path is unreliable for ALTER TABLE on mysql2.
      await ensureMysqlColumn(
        conn,
        "applicants",
        "resumeInlineBase64",
        "ALTER TABLE `applicants` ADD COLUMN `resumeInlineBase64` MEDIUMTEXT NULL"
      );
      await ensureMysqlColumn(
        conn,
        "applicants",
        "resumeStoredFileName",
        "ALTER TABLE `applicants` ADD COLUMN `resumeStoredFileName` VARCHAR(260) NULL"
      );
      await ensureMysqlColumn(conn, "users", "adminTier", "ALTER TABLE `users` ADD COLUMN `adminTier` VARCHAR(32) NULL");
      await ensureMysqlColumn(
        conn,
        "users",
        "adminPermissions",
        "ALTER TABLE `users` ADD COLUMN `adminPermissions` TEXT NULL"
      );

      try {
        await conn.query(
          "UPDATE `users` SET `adminTier` = 'super_admin' WHERE `role` = 'admin' AND (`adminTier` IS NULL OR `adminTier` = '')"
        );
      } catch (e: any) {
        console.warn("[Migration] adminTier backfill note:", String(e?.sqlMessage || e?.message || e));
      }

      console.log("[Migration] Complete ✓");
      return;
    } catch (err: any) {
      const message = err?.message || String(err);
      console.error(`[Migration] Attempt ${attempt}/${maxAttempts} failed: ${message}`);
      if (attempt === maxAttempts) {
        throw new Error(`[Migration] Could not complete migrations after ${maxAttempts} attempts: ${message}`);
      }
      await sleep(2000 * attempt);
    } finally {
      if (conn) await conn.end();
    }
  }
}
