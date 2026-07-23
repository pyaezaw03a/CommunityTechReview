import { categories, type Category, type CreateReviewInput } from "@/data/domain";
import { createReview, listReviews } from "@/db/reviews";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function cleanText(value: unknown, field: string, { min = 1, max = 500 } = {}) {
  if (typeof value !== "string") throw new ApiError(422, `${field} must be text.`);
  const cleaned = value.trim();
  if (cleaned.length < min || cleaned.length > max) {
    throw new ApiError(422, `${field} must be between ${min} and ${max} characters.`);
  }
  return cleaned;
}

function cleanRating(value: unknown, field: string, allowZero = false) {
  const number = Number(value);
  const minimum = allowZero ? 0 : 1;
  if (!Number.isFinite(number) || number < minimum || number > 5) {
    throw new ApiError(422, `${field} must be between ${minimum} and 5.`);
  }
  return Math.round(number * 10) / 10;
}

function cleanTags(value: unknown, field: string) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 5) {
    throw new ApiError(422, `${field} must contain between 1 and 5 items.`);
  }
  return value.map((item, index) => cleanText(item, `${field}[${index}]`, { max: 80 }));
}

function validateReview(input: unknown): CreateReviewInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError(422, "Review payload must be an object.");
  }

  const value = input as Record<string, unknown>;
  const category = cleanText(value.category, "category", { max: 40 }) as Category;
  if (!categories.includes(category)) throw new ApiError(422, "category is not supported.");
  if (!value.categoryRatings || typeof value.categoryRatings !== "object") {
    throw new ApiError(422, "categoryRatings is required.");
  }

  const ratings = value.categoryRatings as Record<string, unknown>;
  return {
    userId: cleanText(value.userId, "userId", { max: 120 }),
    productSlug: cleanText(value.productSlug, "productSlug", { max: 140 }),
    productName: cleanText(value.productName, "productName", { max: 160 }),
    username: cleanText(value.username, "username", { max: 80 }),
    rating: cleanRating(value.rating, "rating"),
    categoryRatings: {
      performance: cleanRating(ratings.performance, "categoryRatings.performance", true),
      camera: cleanRating(ratings.camera, "categoryRatings.camera", true),
      battery: cleanRating(ratings.battery, "categoryRatings.battery", true),
      display: cleanRating(ratings.display, "categoryRatings.display", true),
      value: cleanRating(ratings.value, "categoryRatings.value", true)
    },
    title: cleanText(value.title, "title", { min: 8, max: 180 }),
    body: cleanText(value.body, "body", { min: 40, max: 5000 }),
    pros: cleanTags(value.pros, "pros"),
    cons: cleanTags(value.cons, "cons"),
    ownership: cleanText(value.ownership, "ownership", { max: 80 }),
    category
  };
}

function errorResponse(error: unknown) {
  const status = error instanceof ApiError ? error.status : 500;
  const message = error instanceof ApiError ? error.message : "The review service encountered an unexpected error.";
  if (status === 500) console.error(error);
  return Response.json({ error: { message } }, { status });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitValue = url.searchParams.get("limit");
    const reviews = await listReviews({
      productSlug: url.searchParams.get("productSlug") || undefined,
      username: url.searchParams.get("username") || undefined,
      category: url.searchParams.get("category") || undefined,
      limit: limitValue ? Number(limitValue) : undefined
    });
    return Response.json({ data: reviews, meta: { count: reviews.length } });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => {
      throw new ApiError(400, "Request body must contain valid JSON.");
    });
    const review = await createReview(validateReview(payload));
    return Response.json({ data: review }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
