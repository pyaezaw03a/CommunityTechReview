import type { Metadata } from "next";

import { AdminAccessGate } from "@/components/auth/admin-access-gate";
import { AdminDashboard } from "@/components/auth/admin-dashboard";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Admin"
};

export default function AdminPage() {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-8">
      <SectionHeader
        kicker="Admin Workspace"
        title="Dashboard Overview"
        copy="Monitor real community reviews, accounts, and platform activity without leaving the admin workspace."
      />
      <AdminAccessGate>
        <AdminDashboard />
      </AdminAccessGate>
    </div>
  );
}
