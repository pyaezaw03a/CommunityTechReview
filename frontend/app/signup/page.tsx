import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign Up"
};

export default function SignupPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1320px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <section className="border border-ink bg-paper p-6 sm:p-8">
        <p className="text-xs font-black uppercase text-signal">Create User Or Admin</p>
        <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] text-ink sm:text-6xl">Create Your GadgetPulse Account</h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          User accounts can publish reviews and save products. Admin accounts get a local dashboard for account and
          activity oversight.
        </p>
      </section>
      <Suspense fallback={<div className="border border-ink bg-white p-6 text-sm font-black uppercase text-muted">Loading signup...</div>}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
