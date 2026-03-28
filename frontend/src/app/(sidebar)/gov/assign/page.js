"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function GovAssignApproversPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOngoingProjects() {
            try {
                const res = await fetch(`${API_BASE}/projects/overview`);
                if (!res.ok) throw new Error("Could not fetch the project ledger.");
                const data = await res.json();

                // Filter for projects in ongoing phase
                const ongoing = data.projects?.filter(p => p.display_status === "ongoing" || p.status === "active") || [];
                setProjects(ongoing);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchOngoingProjects();
    }, [router]);

    return (
        <SidebarLayout role="government">
            <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
                <header className="page-header" style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                        Assigned Approvers
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        View the random, decentralized approvers assigned to ongoing projects. Approvers are mapped automatically when bidding ends.
                    </p>
                </header>

                {loading ? (
                    <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
                        <h3 style={{ fontSize: "1.5rem" }}>Loading Projects...</h3>
                    </div>
                ) : error ? (
                    <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
                        <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Failed to Fetch Projects</h3>
                        <p style={{ color: "#b91c1c" }}>{error}</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
                        <i className="fa-solid fa-users" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
                        <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Active Projects</h3>
                        <p>End bidding on a project to deploy it and assign approvers.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "2rem" }}>
                        {projects.map(p => (
                            <div key={p.id} className="avail-card" style={{
                                background: "var(--card-bg)",
                                borderRadius: "20px",
                                border: "1px solid var(--border-color)",
                                overflow: "hidden",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    padding: "2rem",
                                    borderBottom: "1px solid var(--border-color)"
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                                            <span className="avail-bid-badge" style={{
                                                background: "#e0f2fe",
                                                color: "#0284c7",
                                                padding: "4px 12px",
                                                borderRadius: "999px",
                                                fontSize: "0.75rem",
                                                fontWeight: "700"
                                            }}>
                                                <i className="fa-solid fa-play"></i> ONGOING PROJECT
                                            </span>
                                            <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{p.id}</span>
                                        </div>
                                        <h3 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{p.title}</h3>
                                        <div style={{ display: "flex", gap: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                                            <span><i className="fa-solid fa-wallet" style={{ marginRight: "6px" }}></i> Contract: {p.contract_address || "Pending deployment..."}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: "1.5rem 2rem", background: "var(--bg-secondary)" }}>
                                    <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "1rem" }}><i className="fa-solid fa-users" style={{ marginRight: "6px" }}></i> Blockchain Approvers</h4>
                                    <p style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>3 independent approvers have been assigned via cryptographic randomness and added to the project's smart contract. They are responsible for reviewing milestones.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
