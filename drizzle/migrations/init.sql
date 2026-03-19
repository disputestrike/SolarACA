-- ============================================================
-- SolarACA — Complete Database Migration (MySQL)
-- Run this once against a fresh Railway MySQL database
-- ============================================================

CREATE DATABASE IF NOT EXISTS solaraca CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE solaraca;

-- ============================================================
-- users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `openId`        VARCHAR(64)  NOT NULL,
  `name`          TEXT,
  `email`         VARCHAR(320),
  `loginMethod`   VARCHAR(64),
  `role`          ENUM('user','admin') NOT NULL DEFAULT 'user',
  `createdAt`     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn`  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- applicants
-- ============================================================
CREATE TABLE IF NOT EXISTS `applicants` (
  `id`                    INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `firstName`             VARCHAR(100) NOT NULL,
  `lastName`              VARCHAR(100) NOT NULL,
  `email`                 VARCHAR(320) NOT NULL,
  `phone`                 VARCHAR(20)  NOT NULL,
  `city`                  VARCHAR(100) NOT NULL,
  `experienceLevel`       ENUM('solar_sales','outside_sales','entry_level','aspiring_leader') NOT NULL,
  `motivation`            TEXT,
  `resumeUrl`             VARCHAR(500),
  `resumeKey`             VARCHAR(500),
  `status`                ENUM('new','screened','interviewed','offered','hired','rejected') NOT NULL DEFAULT 'new',
  `qualificationScore`    INT          NOT NULL DEFAULT 0,
  `interviewScheduledAt`  TIMESTAMP    NULL,
  `interviewNotes`        TEXT,
  `offerSentAt`           TIMESTAMP    NULL,
  `offerSignedAt`         TIMESTAMP    NULL,
  `createdAt`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_applicants_status`   (`status`),
  INDEX `idx_applicants_city`     (`city`),
  INDEX `idx_applicants_score`    (`qualificationScore`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- interviews
-- ============================================================
CREATE TABLE IF NOT EXISTS `interviews` (
  `id`              INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `applicantId`     INT  NOT NULL,
  `scheduledAt`     TIMESTAMP NOT NULL,
  `status`          ENUM('scheduled','completed','no_show','cancelled') NOT NULL DEFAULT 'scheduled',
  `reminderSentAt`  TIMESTAMP NULL,
  `reminderType`    ENUM('sms','email','both'),
  `notes`           TEXT,
  `createdAt`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_interviews_applicant` FOREIGN KEY (`applicantId`) REFERENCES `applicants`(`id`) ON DELETE CASCADE,
  INDEX `idx_interviews_applicant` (`applicantId`),
  INDEX `idx_interviews_status`    (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- jobOffers
-- ============================================================
CREATE TABLE IF NOT EXISTS `jobOffers` (
  `id`            INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `applicantId`   INT  NOT NULL,
  `position`      VARCHAR(100) NOT NULL,
  `salary`        DECIMAL(10,2),
  `commission`    TEXT,
  `offerContent`  TEXT NOT NULL,
  `status`        ENUM('draft','sent','viewed','signed','accepted','rejected') NOT NULL DEFAULT 'draft',
  `sentAt`        TIMESTAMP NULL,
  `viewedAt`      TIMESTAMP NULL,
  `signedAt`      TIMESTAMP NULL,
  `signatureUrl`  VARCHAR(500),
  `createdAt`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_offers_applicant` FOREIGN KEY (`applicantId`) REFERENCES `applicants`(`id`) ON DELETE CASCADE,
  INDEX `idx_offers_applicant` (`applicantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- communicationLog
-- ============================================================
CREATE TABLE IF NOT EXISTS `communicationLog` (
  `id`            INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `applicantId`   INT  NOT NULL,
  `type`          ENUM('sms','email') NOT NULL,
  `subject`       VARCHAR(200),
  `message`       TEXT NOT NULL,
  `status`        ENUM('sent','delivered','failed','bounced') NOT NULL DEFAULT 'sent',
  `externalId`    VARCHAR(200),
  `createdAt`     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_comms_applicant` FOREIGN KEY (`applicantId`) REFERENCES `applicants`(`id`) ON DELETE CASCADE,
  INDEX `idx_comms_applicant` (`applicantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- testimonials
-- ============================================================
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id`         INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `title`      VARCHAR(100) NOT NULL,
  `city`       VARCHAR(100) NOT NULL,
  `content`    TEXT         NOT NULL,
  `imageUrl`   VARCHAR(500),
  `earnings`   VARCHAR(100),
  `featured`   BOOLEAN      NOT NULL DEFAULT FALSE,
  `createdAt`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- trainingModules
-- ============================================================
CREATE TABLE IF NOT EXISTS `trainingModules` (
  `id`          INT  NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title`       VARCHAR(200) NOT NULL,
  `description` TEXT,
  `category`    ENUM('sales_fundamentals','solar_product','leadership','management') NOT NULL,
  `videoUrl`    VARCHAR(500),
  `duration`    INT,
  `order`       INT          NOT NULL DEFAULT 0,
  `createdAt`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed: testimonials (landing page)
-- ============================================================
INSERT IGNORE INTO `testimonials` (`name`, `title`, `city`, `content`, `earnings`, `featured`) VALUES
  ('Marcus Johnson', 'Senior Solar Sales Rep', 'Tampa',
   'Started with no solar experience, now I''m leading a team of 5. The training and support here is unmatched.',
   '$180k+', TRUE),
  ('Sarah Chen', 'Sales Manager', 'Miami',
   'The commission structure is transparent and generous. I''ve built real wealth doing work I believe in.',
   '$220k+', TRUE),
  ('David Rodriguez', 'Installation Lead', 'Fort Lauderdale',
   'Transitioned from roofing to solar. Best decision I ever made. The team feels like family.',
   '$150k+', TRUE);

-- ============================================================
-- Seed: trainingModules
-- ============================================================
INSERT IGNORE INTO `trainingModules` (`title`, `description`, `category`, `duration`, `order`) VALUES
  ('Solar Sales Fundamentals',    'Core sales techniques for the solar industry',         'sales_fundamentals', 45, 1),
  ('Handling Objections',         'How to address common homeowner objections',           'sales_fundamentals', 30, 2),
  ('Solar Panel Technology 101',  'How photovoltaic systems work',                        'solar_product',      60, 1),
  ('ROI & Financing Options',     'Explaining payback periods, loans, and leases',        'solar_product',      45, 2),
  ('Building & Leading a Team',   'Recruiting, coaching, and retaining your sales team',  'leadership',         60, 1),
  ('Management Fundamentals',     'Territory management and performance tracking',        'management',         45, 1);

SELECT 'Migration complete.' AS status;
