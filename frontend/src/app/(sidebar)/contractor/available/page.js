"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function AvailableProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBidForm, setActiveBidForm] = useState(null);
  const [wallet, setWallet] = useState(null);

  // Bid State
  const [bidPayload, setBidPayload] = useState({ total: "", milestones: [] });
  const [submissionStatus, setSubmissionStatus] = useState({});

  const formatInr = (n) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n || 0);

  useEffect(() => {
    // 1. Get Wallet from Session
    const storedUser = sessionStorage.getItem("clearfund_user");
    if (!storedUser) {
      router.push("/gate?role=contractor");
      return;
    }
    const user = JSON.parse(storedUser);
    if (!user.wallet_address) {
      router.push("/gate?role=contractor");
      return;
    }
    setWallet(user.wallet_address);

    // 2. Fetch Projects
    async function fetchAvailable() {
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
    fetchAvailable();
  }, [router]);

  const toggleBidForm = (p) => {
    if (activeBidForm === p.id) {
      setActiveBidForm(null);
      return;
    }
    setActiveBidForm(p.id);

    // Fix: Format project deadline for Date input
    const projDeadline = p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "";

    const mData = (p.milestones || []).map((m, idx, arr) => {
      // Use teammate's provided deadline if exists, or our project-level lock for the last row
      let d = m.deadline ? m.deadline.split('T')[0] : "";
      if (idx === arr.length - 1 && projDeadline) {
        d = projDeadline;
      }

      return {
        milestone_index: m.milestone_index,
        title: m.title,
        description: m.description,
        amount: "",
        deadline: d,
        isFixedDeadline: idx === arr.length - 1 && !!projDeadline
      };
    });
    setBidPayload({ ...bidPayload, milestones: mData, total: "" });
    setSubmissionStatus({});
  };

  const handleMilestoneChange = (idx, field, value) => {
    // Prevent manual edits to fixed deadlines
    if (field === "deadline" && bidPayload.milestones[idx].isFixedDeadline) return;

    const newMs = [...bidPayload.milestones];
    newMs[idx][field] = value;
    setBidPayload({ ...bidPayload, milestones: newMs });
  };

  const submitBid = async (projectId, maxBudget) => {
    setSubmissionStatus({ loading: true });

    const { total, milestones } = bidPayload;

    if (!wallet) {
      setSubmissionStatus({ error: "No wallet identified. Please re-login." });
      return;
    }

    if (!total || Number(total) <= 0 || Number(total) > maxBudget) {
      setSubmissionStatus({ error: `Total bid must be between 1 and ${formatInr(maxBudget)}.` });
      return;
    }

    if (
      milestones.length === 0 ||
      milestones.some((m) => !m.amount || !m.deadline)
    ) {
      setSubmissionStatus({
        error:
          milestones.length === 0
            ? "This tender has no milestones defined yet."
            : "Please complete all milestone amounts and deadlines."
      });
      return;
    }

    const msSum = milestones.reduce((s, m) => s + Number(m.amount), 0);
    if (Math.abs(msSum - Number(total)) > 0.01) {
      setSubmissionStatus({ error: `Milestone sum (${formatInr(msSum)}) must match total bid (${formatInr(total)}).` });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/bids/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId,
          wallet: wallet,
          totalAmount: Number(total),
          milestones: milestones
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Bid submission crashed on server.");
      }

      setSubmissionStatus({ success: "Bid successfully broadcasted to escrow!" });
      setTimeout(() => setActiveBidForm(null), 2500);

    } catch (err) {
      setSubmissionStatus({ error: err.message });
    }
  };

  return (
    <SidebarLayout role="contractor">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
            Available Tenders
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Identify high-impact projects and submit your cryptographic bid for review.
          </p>
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem" }}>Syncing with Government Ledger...</h3>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
            <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Failed to Fetch Projects</h3>
            <p style={{ color: "#b91c1c" }}>{error}</p>
            <button onClick={() => window.location.reload()} className="avail-toggle-btn" style={{ marginTop: "1rem" }}>Try Again</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
            <i className="fa-solid fa-folder-open" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Projects Currently Bidding</h3>
            <p>Check back later for new development opportunities.</p>
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
                  padding: "2rem",
                  borderBottom: activeBidForm === p.id ? "1px solid var(--border-color)" : "none"
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span className="avail-bid-badge" style={{
                        background: "#ecfdf5",
                        color: "#10b981",
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <i className="fa-solid fa-gavel"></i> ACTIVE RFP
                      </span>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{p.id}</span>
                    </div>
                    <h3 className="avail-title" style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>{p.title}</h3>
                    <div className="avail-meta" style={{ display: "flex", gap: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      <span><i className="fa-solid fa-location-dot" style={{ marginRight: "6px" }}></i> {p.location_address || p.location}</span>
                      <span><i className="fa-solid fa-building-columns" style={{ marginRight: "6px" }}></i> {p.department || "Ministry of Works"}</span>
                    </div>
                    <p className="avail-desc" style={{ marginTop: "1.25rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>{p.description}</p>
                  </div>
                  <div className="avail-budget-box" style={{
                    textAlign: "right",
                    background: "var(--bg-secondary)",
                    padding: "1.25rem",
                    borderRadius: "16px",
                    border: "1px solid var(--border-color)"
                  }}>
                    <span style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "800", color: "var(--text-secondary)", marginBottom: "4px" }}>Max Budget</span>
                    <strong style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}>{formatInr(p.maximum_bid_amount || p.budget)}</strong>
                  </div>
                </div>

                <div style={{ padding: "0 2rem 2rem" }}>
                  <button
                    className="avail-toggle-btn"
                    onClick={() => toggleBidForm(p)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: activeBidForm === p.id ? "var(--bg-secondary)" : "var(--primary-color)",
                      color: activeBidForm === p.id ? "var(--text-primary)" : "white",
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
                    <i className={`fa-solid ${activeBidForm === p.id ? "fa-xmark" : "fa-file-pen"}`}></i>
                    {activeBidForm === p.id ? "Cancel Bidding" : "Formulate Proposal"}
                  </button>

                  {activeBidForm === p.id && (
                    <div className="bid-form-wrap" style={{ marginTop: "2rem", padding: "2rem", background: "var(--bg-secondary)", borderRadius: "16px" }}>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
                        <i className="fa-solid fa-file-invoice-dollar" style={{ color: "var(--primary-color)" }}></i> Precise Proposal Details
                      </h4>

                      <div className="bid-field-group" style={{ marginBottom: "2rem" }}>
                        <label style={{ display: "block", fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Total Bid Amount (INR) <span style={{ color: "#ef4444" }}>*</span></label>
                        <div style={{ position: "relative" }}>
                          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontWeight: "700" }}>₹</span>
                          <input
                            type="number"
                            className="bid-input"
                            placeholder="Enter your total contract price"
                            value={bidPayload.total}
                            onChange={(e) => setBidPayload({ ...bidPayload, total: e.target.value })}
                            style={{
                              width: "100%",
                              padding: "12px 12px 12px 35px",
                              borderRadius: "10px",
                              border: "1px solid var(--border-color)",
                              fontSize: "1rem",
                              fontWeight: "600"
                            }}
                          />
                        </div>
                        <small style={{ display: "block", marginTop: "6px", color: "var(--text-secondary)" }}>Upper Bound: {formatInr(p.maximum_bid_amount || p.budget)}</small>
                      </div>

                      <div className="bid-milestones-section">
                        <label style={{ display: "block", fontWeight: "700", marginBottom: "1rem", fontSize: "0.9rem" }}>Milestone Breakdown (Auto-Filled Labels)</label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px", gap: "1rem", marginBottom: "0.75rem", padding: "0 10px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                          <span>Phase / Description</span><span>Amount (INR)</span><span>Target Date</span>
                        </div>
                        <div className="milestone-rows" style={{ display: "grid", gap: "0.75rem" }}>
                          {(bidPayload.milestones || []).map((ms, idx) => (
                            <div key={ms.milestone_index ?? idx} className="milestone-input-row" style={{ display: "grid", gridTemplateColumns: "1fr 180px 180px", gap: "1rem" }}>
                              <div style={{ padding: "0.35rem 0", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                                <strong style={{ color: "var(--text-primary)", display: "block" }}>
                                  {ms.title?.trim() || `Milestone ${(ms.milestone_index ?? idx) + 1}`}
                                </strong>
                                {ms.description?.trim() ? (
                                  <span style={{ display: "block", marginTop: "0.25rem", fontSize: "0.82rem" }}>{ms.description}</span>
                                ) : null}
                              </div>
                              <input
                                type="number"
                                className="bid-input"
                                placeholder="Milestone Part"
                                value={ms.amount}
                                onChange={(e) => handleMilestoneChange(idx, "amount", e.target.value)}
                                style={{ border: "1px solid var(--border-color)", padding: "10px", borderRadius: "8px", fontSize: "0.9rem", height: "fit-content" }}
                              />
                              <input
                                type="date"
                                className="bid-input"
                                value={ms.deadline}
                                onChange={(e) => handleMilestoneChange(idx, "deadline", e.target.value)}
                                readOnly={ms.isFixedDeadline}
                                style={{ 
                                  border: "1px solid var(--border-color)", 
                                  padding: "10px", 
                                  borderRadius: "8px", 
                                  fontSize: "0.9rem", 
                                  height: "fit-content",
                                  background: ms.isFixedDeadline ? "var(--bg-secondary)" : "white",
                                  cursor: ms.isFixedDeadline ? "not-allowed" : "text",
                                  opacity: ms.isFixedDeadline ? 0.8 : 1
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bid-form-actions" style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                        <button
                          className="bid-submit-btn"
                          onClick={() => submitBid(p.id, p.maximum_bid_amount || p.budget)}
                          disabled={submissionStatus.loading}
                          style={{
                            padding: "12px 30px",
                            borderRadius: "10px",
                            background: "var(--primary-color)",
                            color: "white",
                            border: "none",
                            fontWeight: "700",
                            cursor: "pointer",
                            opacity: submissionStatus.loading ? 0.7 : 1
                          }}
                        >
                          {submissionStatus.loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-paper-plane"></i> Finalize & Submit Bid</>}
                        </button>
                      </div>
                      {submissionStatus.error && <div style={{ color: "#ef4444", marginTop: "1rem", fontWeight: "600", padding: "10px", background: "#fee2e2", borderRadius: "8px" }}><i className="fa-solid fa-circle-exclamation"></i> {submissionStatus.error}</div>}
                      {submissionStatus.success && <div style={{ color: "#16a34a", marginTop: "1rem", fontWeight: "600", padding: "10px", background: "#dcfce7", borderRadius: "8px" }}><i className="fa-solid fa-circle-check"></i> {submissionStatus.success}</div>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
