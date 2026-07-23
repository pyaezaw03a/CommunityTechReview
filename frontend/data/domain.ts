export const categories = ["Smartphones", "Laptops", "Audio", "Wearables", "Gaming", "Accessories"] as const;

export type Category = (typeof categories)[number];
export type Accent = "signal" | "olive" | "peach" | "ink";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  category: Category;
  launchYear: number;
  summary: string;
  trend: string;
  tags: string[];
  accent: Accent;
};

export type Review = {
  id: string;
  userId: string;
  productSlug: string;
  productName: string;
  username: string;
  rating: number;
  categoryRatings: {
    performance: number;
    camera: number;
    battery: number;
    display: number;
    value: number;
  };
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  date: string;
  ownership: string;
  category: Category;
};

export type CreateReviewInput = Omit<Review, "id" | "date">;
