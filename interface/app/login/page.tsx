import { Suspense } from "react";
import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1320px] items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <AuthIntro title="Access Your GadgetPulse Account" copy="Sign in as a community user to manage feedback, or as an admin to review platform activity." />
      <Suspense fallback={<div className="border border-ink bg-white p-6 text-sm font-black uppercase text-muted">Loading login...</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}

function AuthIntro({ title, copy }: { title: string; copy: string }) {
  return (
    <section className="border border-ink bg-ink p-6 text-white sm:p-8">
      <p className="text-xs font-black uppercase text-peach">User and Admin Access</p>
      <h1 className="mt-4 text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{title}</h1>
      <p className="mt-5 text-lg leading-8 text-white/75">{copy}</p>
    </section>
  );
}
