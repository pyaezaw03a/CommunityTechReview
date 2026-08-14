import type { Metadata } from "next";

import { AdminAccessGate } from "@/components/auth/admin-access-gate";
import { AdminAccountsPanel } from "@/components/auth/admin-accounts-panel";
import { SectionHeader } from "@/components/section-header";

export const metadata: Metadata = {
  title: "Admin Accounts"
};

export default function AdminAccountsPage() {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-8">
      <SectionHeader
        kicker="Admin Workspace"
        title="Accounts"
        copy="Review the real user and administrator accounts created for this GadgetPulse workspace."
      />
      <AdminAccessGate>
        <AdminAccountsPanel />
      </AdminAccessGate>
    </div>
  );
}
