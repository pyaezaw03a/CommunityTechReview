import { DiscoverBrowser } from "@/components/discover-browser";
import { SectionHeader } from "@/components/section-header";

export default async function DiscoverPage({ searchParams }: { searchParams?: Promise<{ category?: string }> }) {
  const params = searchParams ? await searchParams : {};

  return (
    <div className="bg-paper text-ink">
      <section className="border-b border-ink">
        <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8">
          <SectionHeader kicker="Discover" title="Browse The Gadget Database" copy="Search, filter, and sort community-rated gadgets across phones, laptops, audio, wearables, gaming, and accessories." />
        </div>
      </section>
      <section className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 lg:px-8">
        <DiscoverBrowser initialCategory={params.category} />
      </section>
    </div>
  );
}
