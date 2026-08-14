"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const { currentUser, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="border border-ink bg-white p-8 text-center text-sm font-black uppercase text-muted">Checking admin access...</div>;
  }

  if (!currentUser) {
    return (
      <AdminNotice
        title="Admin Login Required"
        copy="Login with an admin account to open this GadgetPulse workspace."
        actionHref="/login?redirect=/admin"
        actionLabel="Login As Admin"
      />
    );
  }

  if (!isAdmin) {
    return (
      <AdminNotice
        title="Admin Account Required"
        copy="Your current account is a user account. Use an admin login to access this workspace."
        actionHref="/login?redirect=/admin"
        actionLabel="Switch Account"
      />
    );
  }

  return <>{children}</>;
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
