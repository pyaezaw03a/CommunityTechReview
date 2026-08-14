"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  MessageSquareText,
  ShieldAlert,
  ShieldCheck,
  Star,
  UsersRound,
  type LucideIcon
} from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { useReviews } from "@/components/reviews-provider";

const workspaceLinks: Array<{
  href: string;
  title: string;
  copy: string;
  icon: LucideIcon;
}> = [
  {
    href: "/admin/accounts",
    title: "Accounts",
    copy: "Review user and administrator accounts.",
    icon: UsersRound
  },
  {
    href: "/admin/activity",
    title: "Activity",
    copy: "Monitor published review and account activity.",
    icon: Activity
  },
  {
    href: "/admin/moderation",
    title: "Moderation",
    copy: "Approve submitted reviews or mark violations.",
    icon: MessageSquareText
  }
];

export function AdminDashboard() {
  const { reviews, products } = useReviews();
  const { accounts } = useAuth();
  const adminAccounts = accounts.filter((account) => account.role === "admin");

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Admin overview metrics">
        {accounts.length ? <AdminMetric label="Total Accounts" value={accounts.length.toString()} icon={UsersRound} /> : null}
        {adminAccounts.length ? <AdminMetric label="Admins" value={adminAccounts.length.toString()} icon={ShieldCheck} /> : null}
        {products.length ? <AdminMetric label="Products" value={products.length.toString()} icon={Star} /> : null}
        {reviews.length ? <AdminMetric label="Published Reviews" value={reviews.length.toString()} icon={ShieldAlert} /> : null}
      </div>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Admin workspace sections">
        {workspaceLinks.map(({ href, title, copy, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="focus-ring group grid min-h-48 content-between border border-ink bg-white p-5 transition-transform hover:-translate-y-1 hover:shadow-hard-sm"
          >
            <Icon className="h-6 w-6 text-signal" aria-hidden="true" />
            <div className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black uppercase text-ink">{title}</h2>
                <ArrowRight className="h-5 w-5 text-signal transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function AdminMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="border border-ink bg-white p-5">
      <Icon className="h-5 w-5 text-signal" aria-hidden="true" />
      <p className="mt-5 text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-2 text-4xl font-black uppercase text-ink">{value}</p>
    </div>
  );
}
