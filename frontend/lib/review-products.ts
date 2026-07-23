import type { Accent, Category, Product, Review } from "@/data/domain";

const categoryAccents: Record<Category, Accent> = {
  Smartphones: "signal",
  Laptops: "olive",
  Audio: "ink",
  Wearables: "peach",
  Gaming: "signal",
  Accessories: "olive"
};

export function buildProductsFromReviews(reviews: Review[]): Product[] {
  const grouped = new Map<string, Review[]>();

  for (const review of reviews) {
    const productReviews = grouped.get(review.productSlug) ?? [];
    productReviews.push(review);
    grouped.set(review.productSlug, productReviews);
  }

  return Array.from(grouped.entries()).map(([slug, productReviews]) => {
    const latest = [...productReviews].sort((left, right) => Date.parse(right.date) - Date.parse(left.date))[0];
    const launchYear = new Date(latest.date).getFullYear();

    return {
      slug,
      name: latest.productName,
      brand: "",
      category: latest.category,
      launchYear: Number.isFinite(launchYear) ? launchYear : new Date().getFullYear(),
      summary: latest.body,
      trend: productReviews.length === 1 ? "1 User Review" : `${productReviews.length} User Reviews`,
      tags: [latest.productName, latest.category],
      accent: categoryAccents[latest.category]
    };
  });
}
