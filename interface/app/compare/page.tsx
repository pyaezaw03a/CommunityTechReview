import { CompareLab } from "@/components/compare-lab";
import { SectionHeader } from "@/components/section-header";

export default function ComparePage() {
  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader kicker="Comparisons" title="Compare Products Side By Side" copy="Choose two products and scan the categories that matter most before committing to a purchase." />
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <CompareLab />
      </section>
    </div>
  );
}
