"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ApproverDecisionsPage() {
  const router = useRouter();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("clearfund_user");
    if (!storedUser) {
      router.push("/gate?role=approver");
      return;
    }
    const user = JSON.parse(storedUser);
    if (!user.wallet_address) {
      router.push("/gate?role=approver");
      return;
    }

    async function fetchDecisions() {
      try {
        const res = await fetch(`${API_BASE}/signer/decisions?wallet=${encodeURIComponent(user.wallet_address)}`);
        if (!res.ok) throw new Error("Could not fetch decisions.");
        const data = await res.json();
        setDecisions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDecisions();
  }, [router]);

  return (
    <SidebarLayout role="approver">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
            Decisions (Active Projects)
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            A log of all milestone approvals and rejections you have made for currently active projects.
          </p>
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem" }}>Loading decisions...</h3>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
            <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Failed to Fetch</h3>
            <p style={{ color: "#b91c1c" }}>{error}</p>
          </div>
        ) : decisions.length === 0 ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
            <i className="fa-solid fa-gavel" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Decisions Found</h3>
            <p>You have not made any decisions on active projects yet.</p>
          </div>
        ) : (
          <div className="avail-list" style={{ display: "grid", gap: "1.5rem" }}>
            {decisions.map(d => {
              const isApproved = d.event_type === "MILESTONE_APPROVED";
              return (
                <div key={d.id} className="avail-card" style={{
                  background: "var(--card-bg)",
                  borderRadius: "16px",
                  border: "1px solid var(--border-color)",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.5rem"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                      <span style={{ 
                        padding: "4px 10px", 
                        borderRadius: "6px", 
                        fontSize: "0.75rem", 
                        fontWeight: "800",
                        background: isApproved ? "#dcfce7" : "#fee2e2",
                        color: isApproved ? "#16a34a" : "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <i className={`fa-solid ${isApproved ? "fa-check" : "fa-xmark"}`}></i>
                        {isApproved ? "APPROVED" : "REJECTED"}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {new Date(d.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                      {d.projects?.title || "Unknown Project"}
                    </h4>
                    
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>
                       <strong>Milestone:</strong> {d.milestones?.title || `Milestone #${d.milestone_id}`} 
                       {d.milestones?.description && ` — ${d.milestones.description}`}
                    </p>
                  </div>
                  
                  {d.metadata?.txHash && (
                    <div style={{ textAlign: "right" }}>
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${d.metadata.txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--primary-color)", fontWeight: "600", padding: "8px 12px", background: "var(--bg-secondary)", borderRadius: "8px" }}
                      >
                        Tx Hash <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
