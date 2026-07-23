import { index, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
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
    category: text("category").notNull()
  },
  (table) => [
    index("reviews_product_slug_idx").on(table.productSlug),
    index("reviews_username_idx").on(table.username),
    index("reviews_category_idx").on(table.category),
    index("reviews_date_idx").on(table.date)
  ]
);
