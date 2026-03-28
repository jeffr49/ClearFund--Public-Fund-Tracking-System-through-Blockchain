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
        if (!confirm("Are you sure you want to end bidding? The lowest bid will be selected, contact will be deployed, and approvers will be randomly assigned.")) {
            return;
        }
        setEndingBid(true);
        try {
            const res = await fetch(`${API_BASE}/bids/select`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to end bidding");

            setEndBidSuccess(`Bidding ended! Contract deployed at ${data.contractAddress}. Assiged ${data.approvers.length} approvers.`);

            // Refresh bid status visually
            setProject(prev => ({ ...prev, status: "active" }));
            setTimeout(() => {
                router.push("/dashboard?role=government");
            }, 5000);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setEndingBid(false);
        }
    };

    return (
        <SidebarLayout role="government">
            <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>

                <button className="back-link" onClick={() => router.push("/gov/bids")} style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "600" }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Bidding Projects
                </button>

                <header className="page-header" style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Manage Project Bids</span>
                        {project && project.status === "bidding" && bids.length > 0 && !endBidSuccess && (
                            <button
                                onClick={endBidding}
                                disabled={endingBid}
                                style={{
                                    background: "var(--accent-green)", color: "white", padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem"
                                }}>
                                {endingBid ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-gavel"></i>}
                                {endingBid ? "Selecting Lowest Bid..." : "End Bidding & Select Winner"}
                            </button>
                        )}
                    </h1>
                    {project && <p style={{ color: "var(--primary-color)", fontWeight: "700", marginTop: "0.5rem" }}>Project: {project.title}</p>}
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
                        {endBidSuccess && (
                            <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "#dcfce7", color: "#16a34a", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid #bbf7d0" }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: "1.5rem" }}></i>
                                <div>
                                    <h4 style={{ fontWeight: "800", marginBottom: "0.25rem" }}>Success!</h4>
                                    <p>{endBidSuccess} Redirecting to dashboard...</p>
                                </div>
                            </div>
                        )}

                        {bids.length === 0 ? (
                            <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
                                <i className="fa-solid fa-box-open" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
                                <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Bids Received Yet</h3>
                                <p>Contractors have not submitted any bids for this project.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                {bids.map((bid, index) => {
                                    const isLowest = index === 0;
                                    const msData = typeof bid.milestone_data === 'string' ? JSON.parse(bid.milestone_data || '[]') : (bid.milestone_data || []);
                                    return (
                                        <div key={bid.id} style={{
                                            background: "var(--card-bg)",
                                            borderRadius: "16px",
                                            border: isLowest ? "2px solid var(--accent-green)" : "1px solid var(--border-color)",
                                            padding: "2rem",
                                            position: "relative",
                                            boxShadow: isLowest ? "0 10px 25px -5px rgba(16, 185, 129, 0.15)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                        }}>
                                            {isLowest && (
                                                <div style={{ position: "absolute", top: "-12px", right: "2rem", background: "var(--accent-green)", color: "white", padding: "4px 16px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "800", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.3)" }}>
                                                    <i className="fa-solid fa-trophy" style={{ marginRight: "4px" }}></i> LOWEST BID
                                                </div>
                                            )}
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                                                <div>
                                                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.25rem" }}>{bid.contractor_name}</h3>
                                                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "monospace" }}>Wallet: {bid.contractor_wallet}</p>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                    <p style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>Total Bid</p>
                                                    <p style={{ fontSize: "1.5rem", fontWeight: "800", color: isLowest ? "var(--accent-green)" : "var(--primary-color)" }}>{formatInr(bid.total_amount)}</p>
                                                </div>
                                            </div>

                                            <div style={{ background: "var(--bg-secondary)", borderRadius: "10px", padding: "1rem" }}>
                                                <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "1rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Milestone Breakdown</h4>
                                                <div style={{ display: "grid", gap: "0.75rem" }}>
                                                    {msData.map((m, i) => (
                                                        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "1rem", alignItems: "center", background: "var(--bg-color)", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                                            <div style={{ fontWeight: "800", color: "var(--primary-color)", width: "24px" }}>{(m.milestone_index ?? i) + 1}</div>
                                                            <div>
                                                                <div style={{ fontWeight: "700", fontSize: "0.9rem" }}>Amount: {formatInr(m.amount)}</div>
                                                            </div>
                                                            <div style={{ textAlign: "right", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                                                                <i className="fa-regular fa-calendar" style={{ marginRight: "4px" }}></i>
                                                                {new Date(m.deadline).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ))}
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
