"use client";

import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectsLedgerOverview from "@/components/projects-ledger/ProjectsLedgerOverview";
import { useSearchParams } from "next/navigation";

export default function GeneralDashboardPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "public";

  return (
    <SidebarLayout role={role}>
      <ProjectsLedgerOverview
        pageTitle="Public Projects Ledger"
        subtitle="Real-time blockchain-verified tracking of public funds and project milestones."
        showWalletConnect={role !== "public"}
      />
    </SidebarLayout>
  );
}
