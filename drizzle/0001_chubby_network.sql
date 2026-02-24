CREATE TABLE `applicants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`city` varchar(100) NOT NULL,
	`experienceLevel` enum('solar_sales','outside_sales','entry_level','aspiring_leader') NOT NULL,
	`motivation` text,
	`resumeUrl` varchar(500),
	`resumeKey` varchar(500),
	`status` enum('new','screened','interviewed','offered','hired','rejected') NOT NULL DEFAULT 'new',
	`interviewScheduledAt` timestamp,
	`interviewNotes` text,
	`offerSentAt` timestamp,
	`offerSignedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applicants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communicationLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantId` int NOT NULL,
	`type` enum('sms','email') NOT NULL,
	`subject` varchar(200),
	`message` text NOT NULL,
	`status` enum('sent','delivered','failed','bounced') NOT NULL DEFAULT 'sent',
	`externalId` varchar(200),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `communicationLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('scheduled','completed','no_show','cancelled') NOT NULL DEFAULT 'scheduled',
	`reminderSentAt` timestamp,
	`reminderType` enum('sms','email','both'),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobOffers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantId` int NOT NULL,
	`position` varchar(100) NOT NULL,
	`salary` decimal(10,2),
	`commission` text,
	`offerContent` text NOT NULL,
	`status` enum('draft','sent','viewed','signed','accepted','rejected') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`viewedAt` timestamp,
	`signedAt` timestamp,
	`signatureUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobOffers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`title` varchar(100) NOT NULL,
	`city` varchar(100) NOT NULL,
	`content` text NOT NULL,
	`imageUrl` varchar(500),
	`earnings` varchar(100),
	`featured` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trainingModules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text,
	`category` enum('sales_fundamentals','solar_product','leadership','management') NOT NULL,
	`videoUrl` varchar(500),
	`duration` int,
	`order` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trainingModules_id` PRIMARY KEY(`id`)
);
