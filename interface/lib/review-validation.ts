import { categories, type Category, type CreateReviewInput } from "@/data/domain";

export class ReviewPayloadError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function cleanText(value: unknown, field: string, { min = 1, max = 500 } = {}) {
  if (typeof value !== "string") throw new ReviewPayloadError(422, `${field} must be text.`);
  const cleaned = value.trim();
  if (cleaned.length < min || cleaned.length > max) {
    throw new ReviewPayloadError(422, `${field} must be between ${min} and ${max} characters.`);
  }
  return cleaned;
}

function cleanReviewText(value: unknown, field: string) {
  if (typeof value !== "string") throw new ReviewPayloadError(422, `${field} must be text.`);
  const cleaned = value.trim();
  if (!cleaned) throw new ReviewPayloadError(422, `${field} is required.`);
  return cleaned;
}

function cleanRating(value: unknown, field: string, allowZero = false) {
  const number = Number(value);
  const minimum = allowZero ? 0 : 1;
  if (!Number.isFinite(number) || number < minimum || number > 5) {
    throw new ReviewPayloadError(422, `${field} must be between ${minimum} and 5.`);
  }
  return Math.round(number * 10) / 10;
}

function cleanTags(value: unknown, field: string) {
  if (!Array.isArray(value) || value.length < 1) {
    throw new ReviewPayloadError(422, `${field} must contain at least one item.`);
  }
  return value.map((item, index) => cleanReviewText(item, `${field}[${index}]`));
}

export function validateReviewPayload(input: unknown): CreateReviewInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ReviewPayloadError(422, "Review payload must be an object.");
  }

  const value = input as Record<string, unknown>;
  const category = cleanText(value.category, "category", { max: 40 }) as Category;
  if (!categories.includes(category)) throw new ReviewPayloadError(422, "category is not supported.");
  if (!value.categoryRatings || typeof value.categoryRatings !== "object") {
    throw new ReviewPayloadError(422, "categoryRatings is required.");
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
    title: cleanReviewText(value.title, "title"),
    body: cleanReviewText(value.body, "body"),
    pros: cleanTags(value.pros, "pros"),
    cons: cleanTags(value.cons, "cons"),
    ownership: cleanText(value.ownership, "ownership", { max: 80 }),
    category
  };
}

export async function readReviewRequest(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData().catch(() => {
      throw new ReviewPayloadError(400, "The review form could not be read.");
    });
    const payloadValue = form.get("payload");
    if (typeof payloadValue !== "string") throw new ReviewPayloadError(400, "Review details are required.");
    let payload: unknown;
    try {
      payload = JSON.parse(payloadValue) as unknown;
    } catch {
      throw new ReviewPayloadError(400, "Review details must contain valid JSON.");
    }

    const photoValue = form.get("photo");
    const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : undefined;
    if (photo) {
      const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
      if (!allowedTypes.has(photo.type)) {
        throw new ReviewPayloadError(422, "Product photos must be JPG, PNG, or WebP images.");
      }
      if (photo.size > 5_000_000) {
        throw new ReviewPayloadError(422, "Product photos must be smaller than 5MB.");
      }
    }
    return { payload, photo };
  }

  const payload = await request.json().catch(() => {
    throw new ReviewPayloadError(400, "Request body must contain valid JSON.");
  });
  return { payload, photo: undefined };
}
