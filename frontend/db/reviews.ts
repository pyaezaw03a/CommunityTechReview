import { env } from "cloudflare:workers";

import type { CreateReviewInput, Review } from "@/data/domain";

type ReviewRow = {
  id: string;
  user_id: string;
  product_slug: string;
  product_name: string;
  username: string;
  rating: number;
  category_ratings: string;
  title: string;
  body: string;
  pros: string;
  cons: string;
  date: string;
  ownership: string;
  category: string;
};

let schemaReady = false;

async function getDatabase() {
  const database = env.DB;
  if (!database) throw new Error("The review database is unavailable.");

  if (!schemaReady) {
    await database.batch([
      database.prepare(`
        CREATE TABLE IF NOT EXISTS reviews (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          product_slug TEXT NOT NULL,
          product_name TEXT NOT NULL,
          username TEXT NOT NULL,
          rating REAL NOT NULL,
          category_ratings TEXT NOT NULL,
          title TEXT NOT NULL,
          body TEXT NOT NULL,
          pros TEXT NOT NULL,
          cons TEXT NOT NULL,
          date TEXT NOT NULL,
          ownership TEXT NOT NULL,
          category TEXT NOT NULL
        )
      `),
      database.prepare("CREATE INDEX IF NOT EXISTS reviews_product_slug_idx ON reviews (product_slug)"),
      database.prepare("CREATE INDEX IF NOT EXISTS reviews_username_idx ON reviews (username)"),
      database.prepare("CREATE INDEX IF NOT EXISTS reviews_category_idx ON reviews (category)"),
      database.prepare("CREATE INDEX IF NOT EXISTS reviews_date_idx ON reviews (date)")
    ]);
    schemaReady = true;
  }

  return database;
}

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    userId: row.user_id,
    productSlug: row.product_slug,
    productName: row.product_name,
    username: row.username,
    rating: row.rating,
    categoryRatings: parseJson<Review["categoryRatings"]>(row.category_ratings),
    title: row.title,
    body: row.body,
    pros: parseJson<string[]>(row.pros),
    cons: parseJson<string[]>(row.cons),
    date: row.date,
    ownership: row.ownership,
    category: row.category as Review["category"]
  };
}

export async function listReviews(filters: {
  productSlug?: string;
  username?: string;
  category?: string;
  limit?: number;
} = {}): Promise<Review[]> {
  const database = await getDatabase();
  const clauses: string[] = [];
  const values: Array<string | number> = [];

  if (filters.productSlug) {
    clauses.push("product_slug = ?");
    values.push(filters.productSlug);
  }
  if (filters.username) {
    clauses.push("username = ?");
    values.push(filters.username);
  }
  if (filters.category) {
    clauses.push("category = ?");
    values.push(filters.category);
  }

  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const limit = Math.min(100, Math.max(1, filters.limit ?? 100));
  const statement = database
    .prepare(`SELECT * FROM reviews${where} ORDER BY date DESC LIMIT ?`)
    .bind(...values, limit);
  const result = await statement.all<ReviewRow>();
  return result.results.map(rowToReview);
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const database = await getDatabase();
  const review: Review = {
    ...input,
    id: `review-${crypto.randomUUID()}`,
    date: new Date().toISOString()
  };

  await database
    .prepare(`
      INSERT INTO reviews (
        id, user_id, product_slug, product_name, username, rating,
        category_ratings, title, body, pros, cons, date, ownership, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      review.id,
      review.userId,
      review.productSlug,
      review.productName,
      review.username,
      review.rating,
      JSON.stringify(review.categoryRatings),
      review.title,
      review.body,
      JSON.stringify(review.pros),
      JSON.stringify(review.cons),
      review.date,
      review.ownership,
      review.category
    )
    .run();

  return review;
}
