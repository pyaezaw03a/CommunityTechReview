export const categories = ["Smartphones", "Laptops", "Audio", "Wearables", "Gaming", "Accessories"] as const;

export type Category = (typeof categories)[number];
export type Accent = "signal" | "olive" | "peach" | "ink";
export const reviewStatuses = ["under_review", "published", "violated"] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

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
  photoUrl?: string;
};

export type Review = {
  id: string;
  status: ReviewStatus;
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
  photoUrl?: string;
};

export type CreateReviewInput = Omit<Review, "id" | "date" | "status" | "photoUrl">;
