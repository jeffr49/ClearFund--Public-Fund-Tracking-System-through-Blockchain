"use client";

import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectsLedgerOverview from "@/components/projects-ledger/ProjectsLedgerOverview";

export default function ContractorDashboardPage() {
  return (
    <SidebarLayout role="contractor">
      <ProjectsLedgerOverview
        pageTitle="Projects ledger"
        subtitle="Contractor view — bidding and milestone tools will extend this shell next."
      />
    </SidebarLayout>
  );
}
