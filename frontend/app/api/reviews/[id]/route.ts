import { reviewStatuses, type ReviewStatus } from "@/data/domain";
import { AccountError, requireSessionAccount } from "@/db/accounts";
import { updateReviewStatus } from "@/db/reviews";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

function errorResponse(error: unknown) {
  const status = error instanceof ApiError || error instanceof AccountError ? error.status : 500;
  const message =
    error instanceof ApiError || error instanceof AccountError
      ? error.message
      : "The moderation service encountered an unexpected error.";
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
