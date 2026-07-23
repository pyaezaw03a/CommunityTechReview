import type { CreateReviewInput, Review } from "@/data/domain";

type ReviewListResponse = { data: Review[]; meta: { count: number } };
type ReviewResponse = { data: Review };

async function parseResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorPayload = payload as { error?: { message?: string } } | null;
    const message = errorPayload?.error?.message || "The review service could not complete this request.";
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchReviews(signal?: AbortSignal) {
  const response = await fetch("/api/reviews", { signal, cache: "no-store" });
  return (await parseResponse<ReviewListResponse>(response)).data;
}

export async function postReview(input: CreateReviewInput) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return (await parseResponse<ReviewResponse>(response)).data;
}
