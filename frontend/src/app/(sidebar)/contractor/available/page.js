"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_WALLET = "0x12a9...bc4";

export default function AvailableProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeBidForm, setActiveBidForm] = useState(null);
  const [bidPayload, setBidPayload] = useState({ wallet: DEFAULT_WALLET, total: "", milestones: [] });
  const [submissionStatus, setSubmissionStatus] = useState({});

  const formatInr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    async function fetchAvailable() {
      try {
        const res = await fetch(`${API_BASE}/projects/overview`);
        const data = await res.json();
        if (!res.ok) throw new Error("Failed to fetch projects.");
        setProjects(data.projects?.filter(p => p.display_status === "bidding") || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailable();
  }, []);

  const toggleBidForm = (p) => {
    if (activeBidForm === p.id) {
       setActiveBidForm(null);
       return;
    }
    setActiveBidForm(p.id);
    
    // Auto-populate milestone placeholders
    const mData = (p.milestones || []).map(m => ({ description: m.description || m.title, amount: "", deadline: "" }));
    setBidPayload({ ...bidPayload, milestones: mData, total: "" });
    setSubmissionStatus({});
  };

  const handleMilestoneChange = (idx, field, value) => {
    const newMs = [...bidPayload.milestones];
    newMs[idx][field] = value;
    setBidPayload({ ...bidPayload, milestones: newMs });
  };

  const submitBid = async (projectId, maxBudget) => {
    setSubmissionStatus({ loading: true });
    
    const { wallet, total, milestones } = bidPayload;

    if (!wallet.startsWith("0x")) {
       setSubmissionStatus({ error: "Invalid wallet address." });
       return;
    }
    if (!total || Number(total) > maxBudget) {
       setSubmissionStatus({ error: `Bid must be between 1 and ${formatInr(maxBudget)}.` });
       return;
    }

    if (milestones.some(m => !m.amount || !m.deadline)) {
        setSubmissionStatus({ error: "Please complete all milestone amounts and deadlines." });
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
      if (!res.ok) throw new Error(await res.text());
      setSubmissionStatus({ success: "Bid submitted successfully!" });
      setTimeout(() => setActiveBidForm(null), 2000);
    } catch (err) {
      setSubmissionStatus({ error: err.message });
    }
  };

  return (
    <SidebarLayout role="contractor">
      <div className="container">
        <header className="page-header">
          <h1>Available Projects</h1>
          <p>Scan for open bidding opportunities and submit your proposals directly on-chain.</p>
        </header>

        {loading ? (
          <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><h3>Scanning ledger for open bids...</h3></div>
        ) : error ? (
           <div className="empty-state"><i className="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>{error}</p></div>
        ) : projects.length === 0 ? (
           <div className="empty-state"><i className="fa-solid fa-folder-open"></i><h3>No Open Tenders</h3><p>There are no projects currently in the bidding phase.</p></div>
        ) : (
          <div className="avail-list">
             {projects.map(p => (
                <div key={p.id} className="avail-card">
                   <div className="avail-card-header">
                      <div>
                         <span className="avail-bid-badge"><i className="fa-solid fa-gavel"></i> Bidding Open</span>
                         <h3 className="avail-title">{p.title}</h3>
                         <div className="avail-meta">
                            <span><i className="fa-solid fa-location-dot"></i> {p.location_address}</span>
                            <span><i className="fa-solid fa-shapes"></i> {p.category || "General"}</span>
                         </div>
                         <p className="avail-desc">{p.description}</p>
                      </div>
                      <div className="avail-budget-box">
                         <span>Max Budget</span>
                         <strong>{formatInr(p.maximum_bid_amount)}</strong>
                      </div>
                   </div>

                   <button className="avail-toggle-btn" onClick={() => toggleBidForm(p)}>
                      <i className="fa-solid fa-file-pen"></i> {activeBidForm === p.id ? "Close Bid Form" : "Place a Bid"}
                   </button>

                   {activeBidForm === p.id && (
                      <div className="bid-form-wrap">
                        <h4 className="bid-form-title">Submit Your Proposal</h4>
                        <div className="bid-field-group">
                           <label>Total Bid Amount (INR) <span className="required">*</span></label>
                           <input type="number" className="bid-input" placeholder="e.g. 4500000" value={bidPayload.total} onChange={(e) => setBidPayload({...bidPayload, total: e.target.value})} />
                           <small className="bid-hint">Maximum allowed: {formatInr(p.maximum_bid_amount)}</small>
                        </div>

                        <div className="bid-milestones-section">
                           <label>Milestone Breakdown</label>
                           <div className="milestone-col-headers">
                              <span>Description</span><span>Amount (INR)</span><span>Deadline</span>
                           </div>
                           <div className="milestone-rows">
                              {(bidPayload.milestones || []).map((ms, idx) => (
                                 <div key={idx} className="milestone-input-row" style={{ display: "grid", gridTemplateColumns: "1fr 150px 150px", gap: "10px", marginBottom: "8px" }}>
                                    <input type="text" className="bid-input" value={ms.description} readOnly style={{ background: "#f8fafc" }} />
                                    <input type="number" className="bid-input" placeholder="Amount" value={ms.amount} onChange={(e) => handleMilestoneChange(idx, "amount", e.target.value)} />
                                    <input type="date" className="bid-input" value={ms.deadline} onChange={(e) => handleMilestoneChange(idx, "deadline", e.target.value)} />
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="bid-form-actions">
                           <button className="bid-submit-btn" onClick={() => submitBid(p.id, p.maximum_bid_amount)} disabled={submissionStatus.loading}>
                              {submissionStatus.loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <><i className="fa-solid fa-paper-plane"></i> Submit Bid</>}
                           </button>
                        </div>
                        {submissionStatus.error && <div className="bid-status-msg error" style={{ color: "#ef4444", marginTop: "10px", fontWeight: "600" }}>{submissionStatus.error}</div>}
                        {submissionStatus.success && <div className="bid-status-msg success" style={{ color: "#16a34a", marginTop: "10px", fontWeight: "600" }}>{submissionStatus.success}</div>}
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
