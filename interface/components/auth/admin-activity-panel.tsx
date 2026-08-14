"use client";

import { Activity, Star, UsersRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { ReviewStatusBadge } from "@/components/review-status-badge";
import { useReviews } from "@/components/reviews-provider";

export function AdminActivityPanel() {
  const { accounts, currentUser } = useAuth();
  const { reviews, products } = useReviews();

  return (
    <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
      <div className="grid content-start gap-5">
        {currentUser ? (
          <section className="border border-ink bg-ink p-5 text-white">
            <p className="text-xs font-black uppercase text-peach">Signed in as admin</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-none">{currentUser.name}</h2>
            <p className="mt-3 text-sm text-white/70">{currentUser.email}</p>
          </section>
        ) : null}

        <section className="border border-ink bg-white p-5">
          <h2 className="text-2xl font-black uppercase text-ink">Live Summary</h2>
          <div className="mt-4 grid gap-3">
            {accounts.length ? <ActivityRow label="Accounts" value={accounts.length.toString()} icon={UsersRound} /> : null}
            {products.length ? <ActivityRow label="Reviewed products" value={products.length.toString()} icon={Star} /> : null}
            {reviews.length ? (
              <>
                <ActivityRow label="Published reviews" value={reviews.length.toString()} icon={Activity} />
                <ActivityRow
                  label="Average rating"
                  value={(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
                  icon={Star}
                />
              </>
            ) : null}
          </div>
        </section>
      </div>

      {reviews.length ? (
        <section className="border border-ink bg-white">
          <div className="border-b border-ink p-5">
            <h2 className="text-2xl font-black uppercase text-ink">Recent Published Activity</h2>
            <p className="mt-1 text-sm text-muted">Latest approved community reviews.</p>
          </div>
          <div className="divide-y divide-line">
            {reviews.slice(0, 10).map((review) => (
              <article key={review.id} className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <ReviewStatusBadge status={review.status} />
                  <span className="text-xs font-black uppercase text-muted">@{review.username}</span>
                  <span className="text-xs font-black uppercase text-muted">
                    {new Date(review.date).toLocaleDateString("en", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <p className="mt-4 text-xs font-black uppercase text-signal">{review.productName}</p>
                <h3 className="mt-1 text-xl font-black uppercase text-ink">{review.title}</h3>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ActivityRow({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border border-line bg-paper px-3 py-3">
      <span className="flex items-center gap-2 text-xs font-black uppercase text-muted">
        <Icon className="h-4 w-4 text-signal" aria-hidden="true" />
        {label}
      </span>
      <span className="text-sm font-black text-ink">{value}</span>
    </div>
  );
}
