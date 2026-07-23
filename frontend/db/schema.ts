import { index, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { reviewStatuses } from "@/data/domain";

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    username: text("username").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
    avatarUrl: text("avatar_url"),
    createdAt: text("created_at").notNull()
  },
  (table) => [
    uniqueIndex("accounts_username_unique").on(table.username),
    uniqueIndex("accounts_email_unique").on(table.email),
    index("accounts_role_idx").on(table.role),
    index("accounts_created_at_idx").on(table.createdAt)
  ]
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull()
  },
  (table) => [
    index("sessions_account_id_idx").on(table.accountId),
    index("sessions_expires_at_idx").on(table.expiresAt)
  ]
);

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    status: text("status", { enum: reviewStatuses }).notNull().default("under_review"),
    userId: text("user_id").notNull(),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    username: text("username").notNull(),
    rating: real("rating").notNull(),
    categoryRatings: text("category_ratings").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    pros: text("pros").notNull(),
    cons: text("cons").notNull(),
    date: text("date").notNull(),
    ownership: text("ownership").notNull(),
    category: text("category").notNull(),
    photoKey: text("photo_key"),
    photoName: text("photo_name"),
    photoType: text("photo_type"),
    photoSize: real("photo_size")
  },
  (table) => [
    index("reviews_status_idx").on(table.status),
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_product_slug_idx").on(table.productSlug),
    index("reviews_username_idx").on(table.username),
    index("reviews_category_idx").on(table.category),
    index("reviews_date_idx").on(table.date)
  ]
);
