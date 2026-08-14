import type { CreateReviewInput, Review, ReviewStatus } from "@/data/domain";
import { getDatabase, getUploadsBucket } from "@/db/database";

type ReviewRow = {
  id: string;
  status: ReviewStatus;
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
  photo_key: string | null;
  photo_name: string | null;
  photo_type: string | null;
  photo_size: number | null;
};

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function rowToReview(row: ReviewRow): Review {
  const photoVersion = row.photo_key?.split("/").at(-1);
  return {
    id: row.id,
    status: row.status,
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
    category: row.category as Review["category"],
    ...(row.photo_key
      ? { photoUrl: `/api/reviews/${encodeURIComponent(row.id)}/photo?v=${encodeURIComponent(photoVersion ?? row.photo_key)}` }
      : {})
  };
}

export async function listReviews(filters: {
  status?: ReviewStatus;
  userId?: string;
  productSlug?: string;
  username?: string;
  category?: string;
  limit?: number;
} = {}): Promise<Review[]> {
  const database = await getDatabase();
  const clauses: string[] = [];
  const values: Array<string | number> = [];

  if (filters.status) {
    clauses.push("status = ?");
    values.push(filters.status);
  }
  if (filters.userId) {
    clauses.push("user_id = ?");
    values.push(filters.userId);
  }
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

export async function createReview(input: CreateReviewInput, photo?: File): Promise<Review> {
  const database = await getDatabase();
  const id = `review-${crypto.randomUUID()}`;
  const photoKey = photo ? `reviews/${id}/${crypto.randomUUID()}` : null;
  const review: Review = {
    ...input,
    id,
    status: "under_review",
    date: new Date().toISOString(),
    ...(photoKey ? { photoUrl: `/api/reviews/${encodeURIComponent(id)}/photo?v=${encodeURIComponent(photoKey.split("/").at(-1) ?? photoKey)}` } : {})
  };

  if (photo && photoKey) {
    await getUploadsBucket().put(photoKey, photo.stream(), {
      httpMetadata: { contentType: photo.type },
      customMetadata: {
        originalName: photo.name,
        reviewId: review.id
      }
    });
  }

  try {
    await database
      .prepare(`
        INSERT INTO reviews (
          id, status, user_id, product_slug, product_name, username, rating,
          category_ratings, title, body, pros, cons, date, ownership, category,
          photo_key, photo_name, photo_type, photo_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        review.id,
        review.status,
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
        review.category,
        photoKey,
        photo?.name ?? null,
        photo?.type ?? null,
        photo?.size ?? null
      )
      .run();
  } catch (error) {
    if (photoKey) await getUploadsBucket().delete(photoKey).catch(() => undefined);
    throw error;
  }

  return review;
}

export async function getReviewById(id: string): Promise<Review | null> {
  const database = await getDatabase();
  const row = await database.prepare("SELECT * FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
  return row ? rowToReview(row) : null;
}

export async function updateReview(id: string, input: CreateReviewInput, photo?: File): Promise<Review | null> {
  const database = await getDatabase();
  const existing = await database.prepare("SELECT * FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
  if (!existing) return null;

  const photoKey = photo ? `reviews/${id}/${crypto.randomUUID()}` : null;
  if (photo && photoKey) {
    await getUploadsBucket().put(photoKey, photo.stream(), {
      httpMetadata: { contentType: photo.type },
      customMetadata: {
        originalName: photo.name,
        reviewId: id
      }
    });
  }

  try {
    const statement = photoKey
      ? database.prepare(`
          UPDATE reviews
          SET
            status = ?,
            user_id = ?,
            product_slug = ?,
            product_name = ?,
            username = ?,
            rating = ?,
            category_ratings = ?,
            title = ?,
            body = ?,
            pros = ?,
            cons = ?,
            ownership = ?,
            category = ?,
            photo_key = ?,
            photo_name = ?,
            photo_type = ?,
            photo_size = ?
          WHERE id = ?
        `)
      : database.prepare(`
          UPDATE reviews
          SET
            status = ?,
            user_id = ?,
            product_slug = ?,
            product_name = ?,
            username = ?,
            rating = ?,
            category_ratings = ?,
            title = ?,
            body = ?,
            pros = ?,
            cons = ?,
            ownership = ?,
            category = ?
          WHERE id = ?
        `);

    const values: Array<number | string | null> = [
      "under_review",
      input.userId,
      input.productSlug,
      input.productName,
      input.username,
      input.rating,
      JSON.stringify(input.categoryRatings),
      input.title,
      input.body,
      JSON.stringify(input.pros),
      JSON.stringify(input.cons),
      input.ownership,
      input.category
    ];

    if (photoKey) {
      values.push(photoKey, photo?.name ?? null, photo?.type ?? null, photo?.size ?? null, id);
    } else {
      values.push(id);
    }

    const result = await statement.bind(...values).run();
    if (!result.meta.changes) return null;
  } catch (error) {
    if (photoKey) await getUploadsBucket().delete(photoKey).catch(() => undefined);
    throw error;
  }

  if (photoKey && existing.photo_key) {
    await getUploadsBucket().delete(existing.photo_key).catch(() => undefined);
  }

  const row = await database.prepare("SELECT * FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
  return row ? rowToReview(row) : null;
}

export async function getReviewPhoto(id: string) {
  const database = await getDatabase();
  return database
    .prepare(`
      SELECT id, status, user_id, photo_key, photo_name, photo_type, photo_size
      FROM reviews
      WHERE id = ?
    `)
    .bind(id)
    .first<{
      id: string;
      status: ReviewStatus;
      user_id: string;
      photo_key: string | null;
      photo_name: string | null;
      photo_type: string | null;
      photo_size: number | null;
    }>();
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<Review | null> {
  const database = await getDatabase();
  const result = await database
    .prepare("UPDATE reviews SET status = ? WHERE id = ?")
    .bind(status, id)
    .run();

  if (!result.meta.changes) return null;

  const row = await database.prepare("SELECT * FROM reviews WHERE id = ?").bind(id).first<ReviewRow>();
  return row ? rowToReview(row) : null;
}
