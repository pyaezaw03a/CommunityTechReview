import { SubmitReviewForm } from "@/components/submit-review-form";
import { SectionHeader } from "@/components/section-header";

export default async function SubmitReviewPage({ searchParams }: { searchParams?: Promise<{ product?: string }> }) {
  const params = searchParams ? await searchParams : {};

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader kicker="Write a Review" title="Share Real Ownership Feedback" copy="Rate the product, list practical pros and cons, and publish your review to the shared community feed." />
        </div>
      </section>
      <section className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 lg:px-8">
        <SubmitReviewForm initialProductSlug={params.product} />
      </section>
    </div>
  );
}
