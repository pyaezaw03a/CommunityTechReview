import type { Metadata } from "next";

import { ReviewDetail } from "@/components/review-detail";

export const metadata: Metadata = {
  title: "Community Review",
  description: "A real community review on GadgetPulse."
};

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReviewDetail id={id} />;
}
