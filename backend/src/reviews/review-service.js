const { randomUUID } = require("node:crypto");
const { HttpError } = require("../http");

const CATEGORIES = new Set(["Smartphones", "Laptops", "Audio", "Wearables", "Gaming", "Accessories"]);
const RATING_FIELDS = ["performance", "camera", "battery", "display", "value"];
const REVIEW_STATUSES = new Set(["under_review", "published", "violated"]);

function cleanText(value, field, { min = 1, max = 500 } = {}) {
  if (typeof value !== "string") {
    throw new HttpError(422, `${field} must be text.`);
  }
  const cleaned = value.trim();
  if (cleaned.length < min || cleaned.length > max) {
    throw new HttpError(422, `${field} must be between ${min} and ${max} characters.`);
  }
  return cleaned;
}

function cleanReviewText(value, field) {
  if (typeof value !== "string") {
    throw new HttpError(422, `${field} must be text.`);
  }
  const cleaned = value.trim();
  if (!cleaned) {
    throw new HttpError(422, `${field} is required.`);
  }
  return cleaned;
}

function cleanRating(value, field, { allowZero = false } = {}) {
  const number = Number(value);
  const minimum = allowZero ? 0 : 1;
  if (!Number.isFinite(number) || number < minimum || number > 5) {
    throw new HttpError(422, `${field} must be between ${minimum} and 5.`);
  }
  return Math.round(number * 10) / 10;
}

function cleanTags(value, field) {
  if (!Array.isArray(value) || value.length < 1) {
    throw new HttpError(422, `${field} must contain at least one item.`);
  }
  return value.map((item, index) => cleanReviewText(item, `${field}[${index}]`));
}

class ReviewService {
  constructor(repository, { createId = randomUUID, now = () => new Date() } = {}) {
    this.repository = repository;
    this.createId = createId;
    this.now = now;
  }

  async list(filters = {}) {
    const reviews = (await this.repository.list()).map((review) => ({
      ...review,
      status: review.status || "published"
    }));
    const filtered = reviews.filter((review) => {
      if (filters.status && (review.status || "published") !== filters.status) return false;
      if (filters.userId && review.userId !== filters.userId) return false;
      if (filters.productSlug && review.productSlug !== filters.productSlug) return false;
      if (filters.username && review.username !== filters.username) return false;
      if (filters.category && review.category !== filters.category) return false;
      return true;
    });

    const limit = filters.limit ? Math.min(100, Math.max(1, Number(filters.limit) || 100)) : undefined;
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async get(id, filters = {}) {
    const storedReview = await this.repository.findById(id);
    const review = storedReview ? { ...storedReview, status: storedReview.status || "published" } : null;
    if (!review || (filters.status && (review.status || "published") !== filters.status)) {
      throw new HttpError(404, "Review not found.");
    }
    return review;
  }

  async create(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new HttpError(422, "Review payload must be an object.");
    }

    const category = cleanText(input.category, "category", { max: 40 });
    if (!CATEGORIES.has(category)) {
      throw new HttpError(422, "category is not supported.");
    }

    if (!input.categoryRatings || typeof input.categoryRatings !== "object") {
      throw new HttpError(422, "categoryRatings is required.");
    }

    const categoryRatings = Object.fromEntries(
      RATING_FIELDS.map((field) => [field, cleanRating(input.categoryRatings[field], `categoryRatings.${field}`, { allowZero: true })])
    );

    const review = {
      id: `review-${this.createId()}`,
      status: "under_review",
      userId: cleanText(input.userId, "userId", { max: 120 }),
      productSlug: cleanText(input.productSlug, "productSlug", { max: 140 }),
      productName: cleanText(input.productName, "productName", { max: 160 }),
      username: cleanText(input.username, "username", { max: 80 }),
      rating: cleanRating(input.rating, "rating"),
      categoryRatings,
      title: cleanReviewText(input.title, "title"),
      body: cleanReviewText(input.body, "body"),
      pros: cleanTags(input.pros, "pros"),
      cons: cleanTags(input.cons, "cons"),
      date: this.now().toISOString(),
      ownership: cleanText(input.ownership, "ownership", { max: 80 }),
      category
    };

    return this.repository.create(review);
  }

  async moderate(id, status) {
    if (!REVIEW_STATUSES.has(status)) {
      throw new HttpError(422, "status must be under_review, published, or violated.");
    }

    const review = await this.repository.updateStatus(id, status);
    if (!review) throw new HttpError(404, "Review not found.");
    return review;
  }
}

module.exports = { ReviewService };
