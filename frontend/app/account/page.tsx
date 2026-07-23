import Link from "next/link";
import type { Metadata } from "next";
import { Bookmark, MessageSquare, PenLine, type LucideIcon } from "lucide-react";

import { SessionCard } from "@/components/auth/session-card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Account"
};

export default function AccountPage() {
  return (
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        kicker="Account"
        title="Manage Your GadgetPulse Access"
        copy="Manage your account, profile, and session settings."
      />
      <SessionCard />
      <section className="grid gap-4 md:grid-cols-3">
        <AccountAction href="/submit-review" icon={PenLine} title="Write a Review" copy="Publish practical feedback as the signed-in user." />
        <AccountAction href="/saved" icon={Bookmark} title="Saved Products" copy="Review the gadgets you saved in this browser." />
        <AccountAction href="/community" icon={MessageSquare} title="Community" copy="Browse reviews created by community members." />
      </section>
    </div>
  );
}

function AccountAction({
  href,
  icon: Icon,
  title,
  copy
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  copy: string;
}) {
  return (
    <article className="border border-ink bg-white p-5">
      <Icon className="h-5 w-5 text-signal" aria-hidden={true} />
      <h2 className="mt-5 text-2xl font-black uppercase leading-none text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-muted">{copy}</p>
      <Button asChild variant="outline" className="mt-5">
        <Link href={href}>Open</Link>
      </Button>
    </article>
  );
}
