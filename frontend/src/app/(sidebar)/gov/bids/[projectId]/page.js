"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function GovManageBidsDetailPage() {
    const router = useRouter();
    const { projectId } = useParams();

    const [project, setProject] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [endingBid, setEndingBid] = useState(false);
    const [endBidSuccess, setEndBidSuccess] = useState(null);

    const formatInr = (n) => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(n);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch project details
                const pRes = await fetch(`${API_BASE}/projects/${projectId}`);
                if (!pRes.ok) throw new Error("Failed to fetch project details.");
                const pData = await pRes.json();
                setProject(pData);

                // Fetch bids
                const bRes = await fetch(`${API_BASE}/bids/project/${projectId}`);
                if (!bRes.ok) throw new Error("Failed to fetch bids.");
                const bData = await bRes.json();
                setBids(bData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        if (projectId) {
            fetchData();
        }
    }, [projectId]);

    const endBidding = async () => {
        router.push(`/gov/assign/${projectId}`);
    };

    return (
        <SidebarLayout role="government">
            <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>

                <button className="back-link" onClick={() => router.push("/gov/bids")} style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "600" }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Bidding Projects
                </button>

                <header className="page-header" style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                            Manage Project Bids
                        </h1>
                        {project && <p style={{ color: "var(--primary-color)", fontWeight: "700", marginTop: "0.5rem" }}>Project: {project.title}</p>}
                    </div>
                    {project && project.status === "bidding" && bids.length > 0 && !endBidSuccess && (
                        <button
                            onClick={endBidding}
                            disabled={endingBid}
                            style={{
                                background: "#10b981", color: "white", padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", boxShadow: "0 4px 14px 0 rgba(16,185,129,0.39)", zIndex: 10
                            }}>
                            <i className="fa-solid fa-arrow-right"></i>
                            Next: Assign Approvers
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
                        <h3 style={{ fontSize: "1.5rem" }}>Loading...</h3>
                    </div>
                ) : error ? (
                    <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
                        <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Error</h3>
                        <p style={{ color: "#b91c1c" }}>{error}</p>
                    </div>
                ) : (
                    <>

                        {bids.length === 0 ? (
                            <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
                                <i className="fa-solid fa-box-open" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
                                <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Bids Received Yet</h3>
                                <p>Contractors have not submitted any bids for this project.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                                {bids.map((bid, index) => {
                                    const isLowest = index === 0;
                                    // Ensure milestones are parsed
                                    let msData = [];
                                    try {
                                        msData = typeof bid.milestone_data === 'string' ? JSON.parse(bid.milestone_data || '[]') : (bid.milestone_data || []);
                                    } catch (e) {
                                        msData = [];
                                    }

                                    return (
                                        <div key={bid.id} style={{
                                            background: "var(--card-bg)",
                                            borderRadius: "16px",
                                            border: isLowest ? "2.5px solid #10b981" : "1px solid var(--border-color)",
                                            padding: "2rem",
                                            position: "relative",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                        }}>
                                            {isLowest && (
                                                <div style={{
                                                    position: "absolute", top: "-15px", left: "2rem",
                                                    background: "#10b981", color: "white", padding: "4px 14px",
                                                    borderRadius: "4px", fontSize: "0.7rem", fontWeight: "900",
                                                    textTransform: "uppercase", letterSpacing: "0.1em"
                                                }}>
                                                    Lowest Bidder
                                                </div>
                                            )}

                                            {/* Header info in Grid to prevent overlap */}
                                            <div style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr auto",
                                                gap: "2rem",
                                                alignItems: "center",
                                                marginBottom: "1.5rem",
                                                borderBottom: "1px solid var(--border-color)",
                                                paddingBottom: "1.5rem"
                                            }}>
                                                <div>
                                                    <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "4px" }}>
                                                        {bid.contractor_name}
                                                    </h3>
                                                    <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <i className="fa-solid fa-wallet"></i>
                                                        <span style={{ fontFamily: "monospace" }}>{bid.contractor_wallet}</span>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.05em" }}>Total Contract Price</span>
                                                    <div style={{ fontSize: "2.25rem", fontWeight: "900", color: isLowest ? "#10b981" : "var(--primary-color)", whiteSpace: "nowrap" }}>
                                                        {formatInr(bid.total_amount)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bid-milestones-section">
                                                <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "1rem" }}>
                                                    Project Roadmap & Milestones
                                                </h4>
                                                <div style={{ display: "grid", gap: "0.75rem" }}>
                                                    {msData.map((m, i) => {
                                                        // Cross-reference with project milestone template for title/description
                                                        const template = (project?.milestones || []).find(tm => Number(tm.milestone_index) === Number(m.milestone_index ?? i));
                                                        const displayTitle = template?.title || m.title;
                                                        const displayDesc = template?.description || m.description;

                                                        return (
                                                            <div key={i} style={{
                                                                display: "grid",
                                                                gridTemplateColumns: "10px 180px 1fr 150px",
                                                                gap: "2.5rem",
                                                                alignItems: "center",
                                                                background: "rgba(255,255,255,0.7)",
                                                                padding: "1rem 1.5rem",
                                                                borderRadius: "8px",
                                                                borderBottom: i !== msData.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none"
                                                            }}>
                                                                <div style={{ fontWeight: "900", color: "var(--primary-color)", fontSize: "1rem" }}>{(m.milestone_index ?? i) + 1}</div>
                                                                <div style={{ fontSize: "1rem", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                    {displayTitle || `Milestone ${(m.milestone_index ?? i) + 1}`}
                                                                </div>
                                                                <div style={{ fontWeight: "800", fontSize: "1.1rem", color: "var(--text-primary)" }}>{formatInr(m.amount)}</div>
                                                                <div style={{ textAlign: "right", fontWeight: "700", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                                                                    <i className="fa-regular fa-calendar" style={{ marginRight: "6px", fontSize: "0.75rem", color: "var(--text-secondary)" }}></i>
                                                                    {new Date(m.deadline).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </SidebarLayout>
    );
}
