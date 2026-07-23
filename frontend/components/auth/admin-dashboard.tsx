"use client";

import Link from "next/link";
import { ShieldAlert, ShieldCheck, Star, UsersRound, type LucideIcon } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useReviews } from "@/components/reviews-provider";

export function AdminDashboard() {
  const { reviews, products } = useReviews();
  const { accounts, currentUser, isAdmin } = useAuth();
  const adminAccounts = accounts.filter((account) => account.role === "admin");
  const userAccounts = accounts.filter((account) => account.role === "user");

  if (!currentUser) {
    return (
      <AdminNotice
        title="Admin Login Required"
        copy="Login with an admin account to view the GadgetPulse dashboard."
        actionHref="/login?redirect=/admin"
        actionLabel="Login As Admin"
      />
    );
  }

  if (!isAdmin) {
    return (
      <AdminNotice
        title="Admin Account Required"
        copy="Your current account is a user account. Use an admin login to access this dashboard."
        actionHref="/login?redirect=/admin"
        actionLabel="Switch Account"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetric label="Total Accounts" value={accounts.length.toString()} icon={UsersRound} />
        <AdminMetric label="Admins" value={adminAccounts.length.toString()} icon={ShieldCheck} />
        {products.length ? <AdminMetric label="Products" value={products.length.toString()} icon={Star} /> : null}
        {reviews.length ? <AdminMetric label="Reviews" value={reviews.length.toString()} icon={ShieldAlert} /> : null}
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-ink bg-white">
          <div className="border-b border-ink p-4">
            <h2 className="text-2xl font-black uppercase text-ink">Account Directory</h2>
            <p className="mt-1 text-sm text-muted">Accounts created in this browser.</p>
          </div>
          <div className="divide-y divide-line">
            {accounts.map((account) => (
              <div key={account.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black uppercase text-ink">{account.name}</h3>
                    <Badge variant={account.role === "admin" ? "signal" : "olive"}>{account.role}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">{account.email}</p>
                </div>
                <p className="text-xs font-black uppercase text-muted">
                  Joined {new Date(account.createdAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-start gap-5">
          <div className="border border-ink bg-ink p-5 text-white">
            <p className="text-xs font-black uppercase text-peach">Signed in as admin</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-none">{currentUser.name}</h2>
            <p className="mt-3 text-sm text-white/70">{currentUser.email}</p>
          </div>
          <div className="border border-ink bg-white p-5">
            <h2 className="text-2xl font-black uppercase text-ink">Platform Activity</h2>
            <div className="mt-4 grid gap-3">
              <ActivityRow label="User accounts" value={userAccounts.length.toString()} />
              {reviews.length ? (
                <ActivityRow label="Average review rating" value={(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} />
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminNotice({
  title,
  copy,
  actionHref,
  actionLabel
}: {
  title: string;
  copy: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="border border-ink bg-white p-8 text-center">
      <ShieldAlert className="mx-auto h-10 w-10 text-signal" aria-hidden="true" />
      <h2 className="mt-5 text-3xl font-black uppercase text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">{copy}</p>
      <Button asChild className="mt-6">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
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
      <Icon className="h-5 w-5 text-signal" aria-hidden={true} />
      <p className="mt-5 text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-2 text-4xl font-black uppercase text-ink">{value}</p>
    </div>
  );
}

function ActivityRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-line bg-paper px-3 py-2">
      <span className="text-xs font-black uppercase text-muted">{label}</span>
      <span className="text-sm font-black text-ink">{value}</span>
    </div>
  );
}
