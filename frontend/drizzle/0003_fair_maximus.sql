CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`avatar_url` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_username_unique` ON `accounts` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_unique` ON `accounts` (`email`);--> statement-breakpoint
CREATE INDEX `accounts_role_idx` ON `accounts` (`role`);--> statement-breakpoint
CREATE INDEX `accounts_created_at_idx` ON `accounts` (`created_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_account_id_idx` ON `sessions` (`account_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
ALTER TABLE `reviews` ADD `photo_key` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `photo_name` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `photo_type` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `photo_size` real;--> statement-breakpoint
DELETE FROM `sessions`;--> statement-breakpoint
DELETE FROM `accounts`;
