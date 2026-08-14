DROP INDEX `accounts_email_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_email_role_unique` ON `accounts` (`email`,`role`);