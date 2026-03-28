"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import ProjectListCard from "@/components/project-cards/ProjectListCard";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function GovManageBidsSelectionPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatInr = (n) => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(n);

    useEffect(() => {
        async function fetchBiddingProjects() {
            try {
                const res = await fetch(`${API_BASE}/projects/overview`);
                if (!res.ok) throw new Error("Could not fetch the project ledger.");
                const data = await res.json();

                // Filter for projects in bidding phase
                const available = data.projects?.filter(p => p.display_status === "bidding") || [];
                setProjects(available);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchBiddingProjects();
    }, [router]);

    return (
        <SidebarLayout role="government">
            <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
                <header className="page-header" style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
                        Manage Bids
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
                        Select a project in the bidding phase to view submitted bids, end the bidding, and assign approvers.
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
                        <i className="fa-solid fa-folder-open" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
                        <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Active Bidding Projects</h3>
                        <p>Create a new project to start receiving bids.</p>
                    </div>
                ) : (
                    <div className="avail-list" style={{ display: "grid", gap: "2rem" }}>
                        {projects.map(p => (
                            <ProjectListCard
                                key={p.id}
                                projectId={p.id}
                                title={p.title}
                                badge={{
                                    label: "ACTIVE RFP",
                                    icon: "fa-gavel",
                                    background: "#ecfdf5",
                                    color: "#10b981"
                                }}
                                meta={[
                                    {
                                        icon: "fa-location-dot",
                                        label: p.location_address || p.location
                                    }
                                ]}
                                budgetValue={formatInr(p.maximum_bid_amount || p.budget)}
                            >
                                <button
                                    className="avail-toggle-btn"
                                    onClick={() => router.push(`/gov/bids/${p.id}`)}
                                    style={{
                                        width: "100%",
                                        padding: "1rem",
                                        borderRadius: "12px",
                                        background: "var(--primary-color)",
                                        color: "white",
                                        border: "none",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                        transition: "all 0.2s ease"
                                    }}
                                >
                                    <i className="fa-solid fa-list"></i> View & Manage Bids
                                </button>
                            </ProjectListCard>
                        ))}
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
