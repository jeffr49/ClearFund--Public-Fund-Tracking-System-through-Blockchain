"use client";

import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectsLedgerOverview from "@/components/projects-ledger/ProjectsLedgerOverview";

export default function ApproverDashboardPage() {
  return (
    <SidebarLayout role="approver">
      <ProjectsLedgerOverview
        pageTitle="Projects ledger"
        subtitle="Approver view — same live data as other roles. Signer tasks will link here in a follow-up."
      />
    </SidebarLayout>
  );
}
