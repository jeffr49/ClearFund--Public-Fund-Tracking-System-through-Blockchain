"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectListCard from "@/components/project-cards/ProjectListCard";

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

  const getMilestoneStatusStyles = (status) => {
    if (status === "completed") {
      return { background: "#dcfce7", color: "#166534", label: "completed" };
    }
    if (status === "working") {
      return { background: "#e0e7ff", color: "#3730a3", label: "working" };
    }
    if (status === "extended") {
      return { background: "#fff7ed", color: "#c2410c", label: "extended" };
    }
    return { background: "#f3f4f6", color: "#4b5563", label: status || "yet_to_start" };
  };

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
              <ProjectListCard
                key={p.id}
                projectId={p.id}
                title={p.title}
                badge={{
                  label: p.status || "UNKNOWN",
                  icon: p.status === "completed" ? "fa-check-circle" : "fa-shield-halved",
                  background: p.status === "completed" ? "#ecfdf5" : "#eff6ff",
                  color: p.status === "completed" ? "#10b981" : "#3b82f6"
                }}
                meta={[
                  {
                    icon: "fa-location-dot",
                    label: p.location_address || p.location
                  }
                ]}
                description={p.description || "No description provided for this project."}
                budgetValue={formatInr(getMaxBudget(p))}
              >
                {p.milestones && p.milestones.length > 0 && (
                  <>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-secondary)" }}>Milestones</h4>
                    <div style={{ display: "grid", gap: "1rem" }}>
                      {[...p.milestones]
                        .sort((a, b) => Number(a.milestone_index ?? 0) - Number(b.milestone_index ?? 0))
                        .map((ms, idx) => {
                          const statusStyles = getMilestoneStatusStyles(ms.status);

                          return <div key={idx} style={{
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
                                background: statusStyles.background,
                                color: statusStyles.color,
                                textTransform: "uppercase"
                              }}>
                                {statusStyles.label}
                              </span>
                            </div>
                          </div>
                        )})}
                    </div>
                  </>
                )}
              </ProjectListCard>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
