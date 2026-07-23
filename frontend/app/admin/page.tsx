import type { Metadata } from "next";

import { AdminDashboard } from "@/components/auth/admin-dashboard";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Admin"
};

export default function AdminPage() {
  return (
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <SectionHeader
        kicker="Admin"
        title="GadgetPulse Admin Dashboard"
        copy="A role-aware admin surface for account and platform activity."
      />
      <AdminDashboard />
    </div>
  );
}
