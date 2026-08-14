"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { CreateReviewInput, Product, Review } from "@/data/domain";
import { fetchReviews, postReview, updateReview as updateReviewRequest } from "@/lib/reviews-api";
import { buildProductsFromReviews } from "@/lib/review-products";

type ProductReviewStats = {
  count: number;
  rating: number | null;
  categoryRatings: Review["categoryRatings"] | null;
};

type ReviewsContextValue = {
  reviews: Review[];
  products: Product[];
  isLoading: boolean;
  error: string | null;
  createReview: (input: CreateReviewInput, photo?: File) => Promise<Review>;
  updateReview: (id: string, input: CreateReviewInput, photo?: File) => Promise<Review>;
  refresh: () => Promise<void>;
  getProductStats: (productSlug: string) => ProductReviewStats;
};

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

function average(values: number[]) {
  const usable = values.filter((value) => value > 0);
  if (!usable.length) return 0;
  return usable.reduce((sum, value) => sum + value, 0) / usable.length;
}

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const products = useMemo(() => buildProductsFromReviews(reviews), [reviews]);

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    try {
      setReviews(await fetchReviews(controller.signal));
      setError(null);
    } catch (requestError) {
      if ((requestError as Error).name !== "AbortError") {
        setError((requestError as Error).message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createReview = useCallback(async (input: CreateReviewInput, photo?: File) => {
    const review = await postReview(input, photo);
    setError(null);
    return review;
  }, []);

  const updateReview = useCallback(async (id: string, input: CreateReviewInput, photo?: File) => {
    const review = await updateReviewRequest(id, input, photo);
    setReviews((current) =>
      review.status === "published"
        ? current.some((item) => item.id === review.id)
          ? current.map((item) => (item.id === review.id ? review : item))
          : [review, ...current]
        : current.filter((item) => item.id !== review.id)
    );
    setError(null);
    return review;
  }, []);

  const getProductStats = useCallback(
    (productSlug: string): ProductReviewStats => {
      const productReviews = reviews.filter((review) => review.productSlug === productSlug);
      if (!productReviews.length) return { count: 0, rating: null, categoryRatings: null };
      return {
        count: productReviews.length,
        rating: average(productReviews.map((review) => review.rating)),
        categoryRatings: {
          performance: average(productReviews.map((review) => review.categoryRatings.performance)),
          camera: average(productReviews.map((review) => review.categoryRatings.camera)),
          battery: average(productReviews.map((review) => review.categoryRatings.battery)),
          display: average(productReviews.map((review) => review.categoryRatings.display)),
          value: average(productReviews.map((review) => review.categoryRatings.value))
        }
      };
    },
    [reviews]
  );

  const value = useMemo(
    () => ({ reviews, products, isLoading, error, createReview, updateReview, refresh, getProductStats }),
    [createReview, error, getProductStats, isLoading, products, refresh, reviews, updateReview]
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used inside ReviewsProvider.");
  return context;
}
