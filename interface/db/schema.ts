import { double, index, mysqlTable, text, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

import { reviewStatuses } from "@/data/domain";

export const accounts = mysqlTable(
  "accounts",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    name: text("name").notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 16, enum: ["user", "admin"] }).notNull().default("user"),
    avatarUrl: text("avatar_url"),
    createdAt: varchar("created_at", { length: 64 }).notNull()
  },
  (table) => [
    uniqueIndex("accounts_username_unique").on(table.username),
    uniqueIndex("accounts_email_role_unique").on(table.email, table.role),
    index("accounts_role_idx").on(table.role),
    index("accounts_created_at_idx").on(table.createdAt)
  ]
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    accountId: varchar("account_id", { length: 128 })
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    createdAt: varchar("created_at", { length: 64 }).notNull(),
    expiresAt: varchar("expires_at", { length: 64 }).notNull()
  },
  (table) => [
    index("sessions_account_id_idx").on(table.accountId),
    index("sessions_expires_at_idx").on(table.expiresAt)
  ]
);

export const reviews = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 128 }).primaryKey(),
    status: varchar("status", { length: 32, enum: reviewStatuses }).notNull().default("under_review"),
    userId: varchar("user_id", { length: 128 }).notNull(),
    productSlug: varchar("product_slug", { length: 255 }).notNull(),
    productName: varchar("product_name", { length: 255 }).notNull(),
    username: varchar("username", { length: 64 }).notNull(),
    rating: double("rating").notNull(),
    categoryRatings: text("category_ratings").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    pros: text("pros").notNull(),
    cons: text("cons").notNull(),
    date: varchar("date", { length: 64 }).notNull(),
    ownership: varchar("ownership", { length: 64 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    photoKey: text("photo_key"),
    photoName: text("photo_name"),
    photoType: text("photo_type"),
    photoSize: double("photo_size")
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
