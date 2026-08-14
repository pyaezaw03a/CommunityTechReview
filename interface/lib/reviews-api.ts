import type { CreateReviewInput, Review, ReviewStatus } from "@/data/domain";

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

export async function fetchUserReviews(signal?: AbortSignal) {
  const search = new URLSearchParams({ scope: "user" });
  const response = await fetch(`/api/reviews?${search.toString()}`, { signal, cache: "no-store" });
  return (await parseResponse<ReviewListResponse>(response)).data;
}

export async function postReview(input: CreateReviewInput, photo?: File) {
  const response = await fetch("/api/reviews", {
    method: "POST",
    body: createReviewFormData(input, photo)
  });
  return (await parseResponse<ReviewResponse>(response)).data;
}

export async function updateReview(id: string, input: CreateReviewInput, photo?: File) {
  const response = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: createReviewFormData(input, photo)
  });
  return (await parseResponse<ReviewResponse>(response)).data;
}

function createReviewFormData(input: CreateReviewInput, photo?: File) {
  const body = new FormData();
  body.set("payload", JSON.stringify(input));
  if (photo) body.set("photo", photo);
  return body;
}

export async function fetchAdminReviews(signal?: AbortSignal) {
  const response = await fetch("/api/reviews?scope=admin", {
    signal,
    cache: "no-store"
  });
  return (await parseResponse<ReviewListResponse>(response)).data;
}

export async function moderateReview(id: string, status: ReviewStatus) {
  const response = await fetch(`/api/reviews/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
  return (await parseResponse<ReviewResponse>(response)).data;
}
