import type { Metadata } from "next";

import { AdminAccessGate } from "@/components/auth/admin-access-gate";
import { AdminModerationQueue } from "@/components/auth/admin-moderation-queue";

export const metadata: Metadata = {
  title: "Review Moderation"
};

export default function AdminModerationPage() {
  return (
    <div className="mx-auto grid max-w-[1180px] gap-8">
      <AdminAccessGate>
        <AdminModerationQueue />
      </AdminAccessGate>
    </div>
  );
}
