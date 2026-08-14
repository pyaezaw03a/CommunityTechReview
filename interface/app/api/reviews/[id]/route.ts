import { reviewStatuses, type ReviewStatus } from "@/data/domain";
import { AccountError, requireSessionAccount } from "@/db/accounts";
import { getReviewById, updateReview, updateReviewStatus } from "@/db/reviews";
import { readReviewRequest, ReviewPayloadError, validateReviewPayload } from "@/lib/review-validation";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function errorResponse(error: unknown) {
  const status = error instanceof ApiError || error instanceof AccountError || error instanceof ReviewPayloadError ? error.status : 500;
  const message =
    error instanceof ApiError || error instanceof AccountError || error instanceof ReviewPayloadError
      ? error.message
      : "The review service encountered an unexpected error.";
  if (status === 500) console.error(error);
  return Response.json({ error: { message } }, { status });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireSessionAccount(request, "admin");

    const payload = (await request.json().catch(() => null)) as { status?: unknown } | null;
    if (!payload || typeof payload.status !== "string" || !reviewStatuses.includes(payload.status as ReviewStatus)) {
      throw new ApiError(422, "status must be under_review, published, or violated.");
    }

    const { id } = await context.params;
    const review = await updateReviewStatus(id, payload.status as ReviewStatus);
    if (!review) throw new ApiError(404, "Review not found.");

    return Response.json({ data: review });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const account = await requireSessionAccount(request);
    const { id } = await context.params;
    const existingReview = await getReviewById(id);
    if (!existingReview) throw new ApiError(404, "Review not found.");
    if (existingReview.userId !== account.id) {
      throw new ApiError(403, "You can edit only your own reviews.");
    }

    const { payload, photo } = await readReviewRequest(request);
    const review = await updateReview(
      id,
      {
        ...validateReviewPayload(payload),
        userId: account.id,
        username: account.username
      },
      photo
    );
    if (!review) throw new ApiError(404, "Review not found.");

    return Response.json({ data: review });
  } catch (error) {
    return errorResponse(error);
  }
}
