"use client";

import Link from "next/link";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import CreateProjectForm from "@/components/gov/CreateProjectForm";

const GOV_LEDGER = "/dashboard?role=government";

export default function GovCreateProjectPage() {
  return (
    <SidebarLayout role="government">
      <main className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          <Link href={GOV_LEDGER} style={{ color: "var(--accent-blue)" }}>
            ← Back to overview
          </Link>
        </p>
        <header className="page-header" style={{ textAlign: "left", marginBottom: 0 }}>
          <h1>Create project</h1>
          <p style={{ maxWidth: "42rem" }}>
            Submit a new public works listing. It is stored with status <strong>bidding</strong> until a
            contractor is selected and the escrow is deployed.
          </p>
        </header>

        <CreateProjectForm ledgerHref={GOV_LEDGER} />
      </main>
    </SidebarLayout>
  );
}
