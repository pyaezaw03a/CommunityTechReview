"use client";

import { ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";

export function AdminAccountsPanel() {
  const { accounts } = useAuth();
  if (!accounts.length) return null;

  const adminCount = accounts.filter((account) => account.role === "admin").length;
  const userCount = accounts.filter((account) => account.role === "user").length;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {adminCount ? <AccountMetric label="Admin accounts" value={adminCount} icon={ShieldCheck} /> : null}
        {userCount ? <AccountMetric label="User accounts" value={userCount} icon={UserRound} /> : null}
      </div>

      <section className="border border-ink bg-white">
        <div className="border-b border-ink p-5">
          <h2 className="text-2xl font-black uppercase text-ink">Account Directory</h2>
          <p className="mt-1 text-sm text-muted">Accounts stored securely in the shared application database.</p>
        </div>
        <div className="divide-y divide-line">
          {accounts.map((account) => (
            <article key={account.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-black uppercase text-ink">{account.name}</h3>
                  <Badge variant={account.role === "admin" ? "signal" : "olive"}>{account.role}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{account.email}</p>
                <p className="mt-1 text-xs font-semibold text-muted">@{account.username}</p>
              </div>
              <p className="text-xs font-black uppercase text-muted">
                Joined{" "}
                {new Date(account.createdAt).toLocaleDateString("en", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AccountMetric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number;
  icon: typeof ShieldCheck;
}) {
  return (
    <div className="border border-ink bg-white p-5">
      <Icon className="h-5 w-5 text-signal" aria-hidden="true" />
      <p className="mt-5 text-xs font-black uppercase text-muted">{label}</p>
      <p className="mt-2 text-4xl font-black text-ink">{value}</p>
    </div>
  );
}
