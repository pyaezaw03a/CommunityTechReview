import { env } from "cloudflare:workers";

import { adminAccessCode } from "@/lib/auth";

const adminHeader = "x-admin-access-code";

export function isAuthorizedReviewAdmin(request: Request) {
  const runtimeEnv = env as unknown as { ADMIN_REVIEW_CODE?: string };
  const expectedCode = runtimeEnv.ADMIN_REVIEW_CODE?.trim() || adminAccessCode;
  const providedCode = request.headers.get(adminHeader)?.trim();
  return Boolean(providedCode && providedCode === expectedCode);
}

export const adminReviewHeader = adminHeader;
