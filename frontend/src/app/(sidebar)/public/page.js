"use client";

import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectsLedgerOverview from "@/components/projects-ledger/ProjectsLedgerOverview";

export default function PublicLedgerPage() {
  return (
    <SidebarLayout role="public">
      <ProjectsLedgerOverview
        pageTitle="Public Projects Ledger"
        subtitle="Real-time transparency — data from ClearFund database and on-chain release events."
      />
    </SidebarLayout>
  );
}
