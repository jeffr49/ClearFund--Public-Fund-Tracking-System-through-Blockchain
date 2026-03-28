"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AssignedProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatInr = (n) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n || 0);

  const getMaxBudget = (project) =>
    project?.maximumBidAmount ??
    project?.maximum_bid_amount ??
    project?.budget ??
    0;

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

    async function fetchAssigned() {
      try {
        const res = await fetch(`${API_BASE}/signer/assigned?wallet=${encodeURIComponent(user.wallet_address)}`);
        if (!res.ok) throw new Error("Could not fetch assigned projects.");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAssigned();
  }, [router]);

  return (
    <SidebarLayout role="approver">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
            Assigned Projects
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Overview of all projects where you are assigned as an approver.
          </p>
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem" }}>Loading assigned projects...</h3>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
            <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Failed to Fetch</h3>
            <p style={{ color: "#b91c1c" }}>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Assigned Projects</h3>
            <p>You have not been assigned to any projects yet.</p>
          </div>
        ) : (
          <div className="avail-list" style={{ display: "grid", gap: "2rem" }}>
            {projects.map(p => (
              <div key={p.id} className="avail-card" style={{
                background: "var(--card-bg)",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease"
              }}>
                <div className="avail-card-header" style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "2rem"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span className="avail-bid-badge" style={{
                        background: p.status === "completed" ? "#ecfdf5" : "#eff6ff",
                        color: p.status === "completed" ? "#10b981" : "#3b82f6",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        textTransform: "uppercase"
                      }}>
                        <i className={`fa-solid ${p.status === "completed" ? "fa-check-circle" : "fa-shield-halved"}`}></i>
                        {p.status || "UNKNOWN"}
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{p.id}</span>
                    </div>
                    <h3 className="avail-title" style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{p.title}</h3>
                    <div className="avail-meta" style={{ display: "flex", gap: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      <span><i className="fa-solid fa-location-dot" style={{ marginRight: "6px" }}></i> {p.location_address || p.location}</span>
                    </div>
                    <p className="avail-desc" style={{ marginTop: "1.25rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                      {p.description || "No description provided for this project."}
                    </p>
                  </div>
                  <div className="avail-budget-box" style={{
                    textAlign: "right",
                    background: "var(--bg-secondary)",
                    padding: "1.25rem",
                    borderRadius: "16px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "4px" }}>Max Budget</span>
                    <strong style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}>{formatInr(getMaxBudget(p))}</strong>
                  </div>
                </div>

                {p.milestones && p.milestones.length > 0 && (
                  <div style={{ padding: "0 2rem 2rem" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-secondary)" }}>Milestones</h4>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {[...p.milestones]
                        .sort((a, b) => Number(a.milestone_index ?? 0) - Number(b.milestone_index ?? 0))
                        .map((ms, idx) => (
                        <div key={idx} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "1rem",
                          background: "var(--bg-secondary)",
                          borderRadius: "12px",
                          border: "1px solid var(--border-color)"
                        }}>
                          <div>
                            <strong style={{ display: "block", color: "var(--text-primary)", marginBottom: "4px" }}>
                              {ms.title || `Milestone ${(ms.milestone_index ?? idx) + 1}`}
                            </strong>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                              {ms.description || "No details provided."}
                            </span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ 
                              display: "inline-block", 
                              padding: "4px 8px", 
                              borderRadius: "6px", 
                              fontSize: "0.8rem", 
                              fontWeight: "700",
                              background: ms.status === "completed" ? "#dcfce7" : ms.status === "working" ? "#e0e7ff" : "#f3f4f6",
                              color: ms.status === "completed" ? "#166534" : ms.status === "working" ? "#3730a3" : "#4b5563",
                              textTransform: "uppercase"
                            }}>
                              {ms.status || "PENDING"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
