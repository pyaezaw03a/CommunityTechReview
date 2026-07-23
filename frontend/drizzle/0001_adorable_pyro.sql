ALTER TABLE `reviews` ADD `status` text DEFAULT 'under_review' NOT NULL;--> statement-breakpoint
UPDATE `reviews` SET `status` = 'published';--> statement-breakpoint
CREATE INDEX `reviews_status_idx` ON `reviews` (`status`);
