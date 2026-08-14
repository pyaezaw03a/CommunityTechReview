import type { Metadata } from "next";

import { AdminAccessGate } from "@/components/auth/admin-access-gate";
import { AdminActivityPanel } from "@/components/auth/admin-activity-panel";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Admin Activity"
};

export default function AdminActivityPage() {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-8">
      <SectionHeader
        kicker="Admin Workspace"
        title="Activity"
        copy="Monitor live account totals and approved review activity without showing placeholder records."
      />
      <AdminAccessGate>
        <AdminActivityPanel />
      </AdminAccessGate>
    </div>
  );
}
