import { AccountError, requireSessionAccount } from "@/db/accounts";
import { createReview, listReviews } from "@/db/reviews";
import { readReviewRequest, ReviewPayloadError, validateReviewPayload } from "@/lib/review-validation";

function errorResponse(error: unknown) {
  const status = error instanceof ReviewPayloadError || error instanceof AccountError ? error.status : 500;
  const message =
    error instanceof ReviewPayloadError || error instanceof AccountError
      ? error.message
      : "The review service encountered an unexpected error.";
  if (status === 500) console.error(error);
  return Response.json({ error: { message } }, { status });
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const scope = url.searchParams.get("scope");
    const isAdminScope = scope === "admin";
    const isUserScope = scope === "user";
    const scopedAccount = isAdminScope
      ? await requireSessionAccount(request, "admin")
      : isUserScope
        ? await requireSessionAccount(request)
        : null;
    const userId = isUserScope ? scopedAccount?.id : undefined;
    const limitValue = url.searchParams.get("limit");
    const reviews = await listReviews({
      status: isAdminScope || isUserScope ? undefined : "published",
      userId,
      productSlug: url.searchParams.get("productSlug") || undefined,
      username: url.searchParams.get("username") || undefined,
      category: url.searchParams.get("category") || undefined,
      limit: limitValue ? Number(limitValue) : undefined
    });
    return Response.json({
      data: reviews,
      meta: {
        count: reviews.length,
        scope: isAdminScope ? "admin" : isUserScope ? "user" : "public"
      }
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const account = await requireSessionAccount(request);
    const { payload, photo } = await readReviewRequest(request);
    const review = await createReview(
      {
        ...validateReviewPayload(payload),
        userId: account.id,
        username: account.username
      },
      photo
    );
    return Response.json({ data: review }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
