"use client";

import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectsLedgerOverview from "@/components/projects-ledger/ProjectsLedgerOverview";

export default function GovDashboardPage() {
  return (
    <SidebarLayout role="government">
      <ProjectsLedgerOverview
        pageTitle="Public Projects Ledger"
        subtitle="Government view — connect MetaMask for on-chain actions. Budget totals use project max-bid amounts (INR); releases are summed from on-chain events (ETH)."
        showWalletConnect
      />
    </SidebarLayout>
  );
}
