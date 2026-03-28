"use client";

import Link from "next/link";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

export default function GovCreateProjectPage() {
  return (
    <SidebarLayout role="government">
      <main className="container" style={{ paddingTop: "2rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          <Link href="/gov" style={{ color: "var(--accent-blue)" }}>
            ← Back to overview
          </Link>
        </p>
        <header className="page-header" style={{ textAlign: "left" }}>
          <h1>Create project</h1>
          <p>
            This step will wire the government form to{" "}
            <code>POST /projects/create</code> next.
          </p>
        </header>
      </main>
    </SidebarLayout>
  );
}
