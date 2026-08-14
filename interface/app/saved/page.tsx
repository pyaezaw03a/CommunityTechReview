import { SavedProducts } from "@/components/saved-products";
import { SectionHeader } from "@/components/section-header";

export default function SavedPage() {
  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader kicker="Saved" title="Your Product Shortlist" copy="Products saved in this browser appear here so you can keep narrowing your buying list." />
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <SavedProducts />
      </section>
    </div>
  );
}
