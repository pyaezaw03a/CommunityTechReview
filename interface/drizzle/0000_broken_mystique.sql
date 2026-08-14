CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_slug` text NOT NULL,
	`product_name` text NOT NULL,
	`username` text NOT NULL,
	`rating` real NOT NULL,
	`category_ratings` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`pros` text NOT NULL,
	`cons` text NOT NULL,
	`date` text NOT NULL,
	`ownership` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reviews_product_slug_idx` ON `reviews` (`product_slug`);--> statement-breakpoint
CREATE INDEX `reviews_username_idx` ON `reviews` (`username`);--> statement-breakpoint
CREATE INDEX `reviews_category_idx` ON `reviews` (`category`);--> statement-breakpoint
CREATE INDEX `reviews_date_idx` ON `reviews` (`date`);