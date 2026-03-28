"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function GovAssignApproversDetailPage() {
    const router = useRouter();
    const { projectId } = useParams();

    const [project, setProject] = useState(null);
    const [lowestBid, setLowestBid] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [publishing, setPublishing] = useState(false);

    const [publishSuccess, setPublishSuccess] = useState(null);

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

                // Fetch bids (they return sorted by lowest first)
                const bRes = await fetch(`${API_BASE}/bids/project/${projectId}`);
                if (!bRes.ok) throw new Error("Failed to fetch bids.");
                const bData = await bRes.json();

                if (bData && bData.length > 0) {
                    setLowestBid(bData[0]);
                } else {
                    throw new Error("No bids found for this project.");
                }
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

    const publishProject = async () => {
        if (!confirm("Deploy this project to the blockchain? 3 random decentralized approvers will be locked into the smart contract and the lowest bidder will be selected.")) {
            return;
        }
        setPublishing(true);
        try {
            const res = await fetch(`${API_BASE}/bids/select`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to publish project");

            setPublishSuccess({
                contractAddress: data.contractAddress,
                approvers: data.approvers
            });

            // Prevent re-publishing
            setProject(prev => ({ ...prev, status: "active" }));
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <SidebarLayout role="government">
            <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>

                <button className="back-link" onClick={() => router.push(`/gov/bids/${projectId}`)} style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "8px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "600" }}>
                    <i className="fa-solid fa-arrow-left"></i> Back to Bids
                </button>

                <header className="page-header" style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)", margin: 0 }}>
                            Assign Approvers & Publish
                        </h1>
                        {project && <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginTop: "0.5rem" }}>Publishing locks in the lowest bid and maps 3 randomized, decentralized evaluators.</p>}
                    </div>
                    {project && project.status === "bidding" && lowestBid && !publishSuccess && (
                        <button
                            onClick={publishProject}
                            disabled={publishing}
                            style={{
                                background: "#0ea5e9", color: "white", padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "1rem", boxShadow: "0 4px 14px 0 rgba(14,165,233,0.39)", zIndex: 10
                            }}>
                            {publishing ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-link"></i>}
                            {publishing ? "Deploying & Assigning..." : "Assign Random Approvers & Publish"}
                        </button>
                    )}
                </header>

                {loading ? (
                    <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
                        <h3 style={{ fontSize: "1.5rem" }}>Preparing Payload...</h3>
                    </div>
                ) : error ? (
                    <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
                        <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Error</h3>
                        <p style={{ color: "#b91c1c" }}>{error}</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: publishSuccess ? "1fr" : "1fr 1fr" }}>

                        {/* Selected Lowest Bid Snapshot */}
                        <div style={{
                            background: "var(--card-bg)",
                            borderRadius: "16px",
                            border: "1px solid var(--border-color)",
                            padding: "2rem",
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
                                <i className="fa-solid fa-trophy" style={{ color: "#10b981", fontSize: "1.5rem" }}></i>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Lowest Bid Detected</h3>
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.25rem" }}>Contractor</p>
                                <p style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary-color)" }}>{lowestBid.contractor_name}</p>
                                <p style={{ fontSize: "0.8rem", fontFamily: "monospace", color: "var(--text-secondary)" }}>{lowestBid.contractor_wallet}</p>
                            </div>

                            <div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.25rem" }}>Total Implementation Budget</p>
                                <p style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981" }}>{formatInr(lowestBid.total_amount)}</p>
                            </div>
                        </div>

                        {/* Status / Approvers Output */}
                        {publishSuccess ? (
                            <div style={{
                                background: "#f0fdf4",
                                borderRadius: "16px",
                                border: "1px solid #bbf7d0",
                                padding: "2rem",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem", color: "#16a34a" }}>
                                    <i className="fa-solid fa-satellite-dish" style={{ fontSize: "1.5rem" }}></i>
                                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800" }}>Live on Blockchain</h3>
                                </div>
                                <div style={{ marginBottom: "1.5rem" }}>
                                    <p style={{ color: "#16a34a", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.25rem" }}>Smart Contract Address</p>
                                    <p style={{ fontSize: "1.1rem", fontFamily: "monospace", color: "#15803d", background: "#dcfce7", padding: "8px 12px", borderRadius: "8px", display: "inline-block" }}>{publishSuccess.contractAddress}</p>
                                </div>
                                <div>
                                    <p style={{ color: "#16a34a", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "700", marginBottom: "0.75rem" }}>Randomized Project Approvers ({publishSuccess.approvers.length})</p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {publishSuccess.approvers.map((appWallet, idx) => (
                                            <div key={idx} style={{ background: "white", padding: "10px 14px", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.9rem", color: "var(--text-primary)", border: "1px solid #e2e8f0" }}>
                                                <i className="fa-solid fa-user-shield" style={{ marginRight: "8px", color: "var(--accent-blue)" }}></i>
                                                {appWallet}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ marginTop: "2rem" }}>
                                    <button onClick={() => router.push("/dashboard?role=government")} style={{ background: "transparent", border: "1px solid #16a34a", color: "#16a34a", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>Return to Ledger</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                background: "var(--bg-secondary)",
                                borderRadius: "16px",
                                border: "1px dashed var(--border-color)",
                                padding: "2rem",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center"
                            }}>
                                <i className="fa-solid fa-circle-nodes" style={{ fontSize: "3rem", color: "var(--text-secondary)", marginBottom: "1rem" }}></i>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Pending Decentralization Layout</h3>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "80%" }}>
                                    Publish the project to auto-determine 3 neutral evaluators using the verifiable blockchain rng pipeline. Their unique wallet addresses will permanently encode into the smart contract here!
                                </p>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
