"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function MyBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);

  // Edit modal state
  const [editingBid, setEditingBid] = useState(null); // the bid object being edited
  const [editPayload, setEditPayload] = useState({ total: "", milestones: [] });
  const [editStatus, setEditStatus] = useState({});

  // Withdraw state
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawConfirm, setWithdrawConfirm] = useState(null); // bid_id awaiting confirmation

  const formatInr = (n) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(n);

  const fetchMyBids = useCallback(async (walletAddr) => {
    try {
      const res = await fetch(`${API_BASE}/bids/my?wallet=${encodeURIComponent(walletAddr)}`);
      if (!res.ok) throw new Error("Synchronization with bid registry failed.");
      const data = await res.json();
      setBids(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("clearfund_user");
    if (!storedUser) { router.push("/gate?role=contractor"); return; }
    const user = JSON.parse(storedUser);
    if (!user.wallet_address) { router.push("/gate?role=contractor"); return; }
    setWallet(user.wallet_address);
    fetchMyBids(user.wallet_address);
  }, [router, fetchMyBids]);

  // ── Edit flow ─────────────────────────────────────────────
  const openEditModal = (bid) => {
    setEditingBid(bid);
    setEditStatus({});

    // Pre-fill from existing milestone_data
    let ms = bid.milestone_data;
    if (typeof ms === "string") {
      try { ms = JSON.parse(ms); } catch { ms = []; }
    }
    if (!Array.isArray(ms)) ms = [];

    const milestones = ms.map((m, idx, arr) => ({
      milestone_index: m.milestone_index,
      amount: m.amount ?? "",
      deadline: m.deadline ? m.deadline.split("T")[0] : "",
      isFixedDeadline: idx === arr.length - 1  // last milestone deadline is locked
    }));

    setEditPayload({
      total: bid.total_amount ?? "",
      milestones
    });
  };

  const handleEditMilestoneChange = (idx, field, value) => {
    // Block deadline edits on the locked (last) milestone
    if (field === "deadline" && editPayload.milestones[idx].isFixedDeadline) return;
    const updated = [...editPayload.milestones];
    updated[idx][field] = value;
    setEditPayload({ ...editPayload, milestones: updated });
  };

  const submitEdit = async () => {
    setEditStatus({ loading: true });
    const { total, milestones } = editPayload;

    if (!total || Number(total) <= 0) {
      setEditStatus({ error: "Total bid amount must be greater than zero." });
      return;
    }
    if (milestones.some(m => !m.amount || !m.deadline)) {
      setEditStatus({ error: "Please complete all milestone amounts and deadlines." });
      return;
    }

    const msSum = milestones.reduce((s, m) => s + Number(m.amount), 0);
    if (Math.abs(msSum - Number(total)) > 0.01) {
      setEditStatus({ error: `Milestone sum (${formatInr(msSum)}) must match total bid (${formatInr(Number(total))}).` });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/bids/${editingBid.bid_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          totalAmount: Number(total),
          milestones
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update bid");
      }

      setEditStatus({ success: "Bid updated successfully!" });
      setTimeout(() => {
        setEditingBid(null);
        fetchMyBids(wallet);
      }, 1500);
    } catch (err) {
      setEditStatus({ error: err.message });
    }
  };

  // ── Withdraw flow ─────────────────────────────────────────
  const handleWithdraw = async (bidId) => {
    setWithdrawingId(bidId);
    try {
      const res = await fetch(`${API_BASE}/bids/${bidId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to withdraw bid");
      }

      // Remove from local state
      setBids(prev => prev.filter(b => b.bid_id !== bidId));
      setWithdrawConfirm(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setWithdrawingId(null);
    }
  };

  // ── Status helpers ────────────────────────────────────────
  const getStatusStyle = (projStatus) => {
    if (projStatus === "active") return { bg: "#f0fdf4", color: "#166534", border: "#dcfce7", label: "Selected" };
    if (projStatus === "completed") return { bg: "#f5f3ff", color: "#5b21b6", border: "#ede9fe", label: "Completed" };
    return { bg: "#fff7ed", color: "#c2410c", border: "#ffedd5", label: "Bidding" };
  };

  const canModify = (b) => b.project_status === "bidding";

  return (
    <SidebarLayout role="contractor">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>My Proposal Portfolio</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Monitor the real-time status of your submitted bids across the platform.</p>
          </div>
          {wallet && (
            <div style={{ padding: "8px 16px", background: "var(--bg-secondary)", borderRadius: "10px", border: "1px solid var(--border-color)", fontSize: "0.85rem", fontWeight: "600" }}>
                <i className="fa-solid fa-wallet" style={{ color: "var(--primary-color)", marginRight: "8px" }}></i>
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </div>
          )}
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem" }}>Retrieving your on-chain signatures...</h3>
          </div>
        ) : error ? (
           <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px", textAlign: "center" }}>
             <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
             <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Communication Error</h3>
             <p style={{ color: "#b91c1c" }}>{error}</p>
           </div>
        ) : bids.length === 0 ? (
           <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
             <i className="fa-solid fa-file-invoice" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
             <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>No Bids Identified</h3>
             <p>You haven&apos;t submitted any proposals to active tenders yet.</p>
             <button onClick={() => router.push("/contractor/available")} style={{ marginTop: "1.5rem", padding: "10px 20px", borderRadius: "8px", background: "var(--primary-color)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
                Explorer Available Tenders
             </button>
           </div>
        ) : (
          <div className="bid-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5rem" }}>
             {bids.map(b => {
               const st = getStatusStyle(b.project_status);
               const modifiable = canModify(b);

               return (
                <div key={b.bid_id} className="bid-card-simple" style={{ 
                  background: "var(--card-bg)", 
                  borderRadius: "16px", 
                  border: "1px solid var(--border-color)",
                  padding: "1.5rem",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem"
                }}>
                   <div className="bid-card-top" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="bid-proj-info">
                         <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Proposal ID: {b.bid_id.slice(0, 8)}</span>
                         <h4 className="bid-proj-name" style={{ fontSize: "1.15rem", fontWeight: "700", marginTop: "4px" }}>{b.project_title}</h4>
                      </div>
                      <span style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: "800", 
                        padding: "4px 10px", 
                        borderRadius: "999px",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        background: st.bg,
                        color: st.color,
                        border: `1px solid ${st.border}`
                      }}>
                        {st.label}
                      </span>
                   </div>
                   
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                       <div className="bid-stat" style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px" }}>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "4px" }}>BID AMOUNT</span>
                          <strong style={{ fontSize: "1.1rem", color: "var(--primary-color)" }}>{formatInr(b.total_amount)}</strong>
                       </div>
                       <div className="bid-stat" style={{ padding: "12px", background: "var(--bg-secondary)", borderRadius: "10px" }}>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "4px" }}>SUBMITTED ON</span>
                          <strong style={{ fontSize: "1rem" }}>{new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong>
                       </div>
                   </div>

                   {/* ── Action Buttons ───────────────────────── */}
                   <div style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}>
                     {modifiable ? (
                       <>
                         <button
                           onClick={() => openEditModal(b)}
                           style={{
                             flex: 1,
                             padding: "10px",
                             borderRadius: "8px",
                             background: "var(--primary-color)",
                             color: "white",
                             border: "none",
                             fontWeight: "700",
                             fontSize: "0.85rem",
                             cursor: "pointer",
                             display: "flex",
                             alignItems: "center",
                             justifyContent: "center",
                             gap: "6px",
                             transition: "opacity 0.2s"
                           }}
                         >
                           <i className="fa-solid fa-pen-to-square"></i> Edit Bid
                         </button>

                         {withdrawConfirm === b.bid_id ? (
                           <div style={{ display: "flex", gap: "6px", flex: 1 }}>
                             <button
                               onClick={() => handleWithdraw(b.bid_id)}
                               disabled={withdrawingId === b.bid_id}
                               style={{
                                 flex: 1,
                                 padding: "10px",
                                 borderRadius: "8px",
                                 background: "#dc2626",
                                 color: "white",
                                 border: "none",
                                 fontWeight: "700",
                                 fontSize: "0.8rem",
                                 cursor: "pointer",
                                 opacity: withdrawingId === b.bid_id ? 0.6 : 1
                               }}
                             >
                               {withdrawingId === b.bid_id ? <i className="fa-solid fa-spinner fa-spin"></i> : "Confirm"}
                             </button>
                             <button
                               onClick={() => setWithdrawConfirm(null)}
                               style={{
                                 padding: "10px 14px",
                                 borderRadius: "8px",
                                 background: "var(--bg-secondary)",
                                 border: "1px solid var(--border-color)",
                                 fontWeight: "700",
                                 fontSize: "0.8rem",
                                 cursor: "pointer"
                               }}
                             >
                               Cancel
                             </button>
                           </div>
                         ) : (
                           <button
                             onClick={() => setWithdrawConfirm(b.bid_id)}
                             style={{
                               flex: 1,
                               padding: "10px",
                               borderRadius: "8px",
                               background: "transparent",
                               color: "#dc2626",
                               border: "1.5px solid #fca5a5",
                               fontWeight: "700",
                               fontSize: "0.85rem",
                               cursor: "pointer",
                               display: "flex",
                               alignItems: "center",
                               justifyContent: "center",
                               gap: "6px",
                               transition: "all 0.2s"
                             }}
                           >
                             <i className="fa-solid fa-trash-can"></i> Withdraw
                           </button>
                         )}
                       </>
                     ) : (
                       <div style={{
                         width: "100%",
                         padding: "10px",
                         borderRadius: "8px",
                         background: st.bg,
                         border: `1px solid ${st.border}`,
                         textAlign: "center",
                         fontSize: "0.85rem",
                         fontWeight: "700",
                         color: st.color
                       }}>
                         <i className="fa-solid fa-lock" style={{ marginRight: "6px" }}></i>
                         Project {b.project_status === "active" ? "Active" : "Closed"} — Bid Locked
                       </div>
                     )}
                   </div>
                </div>
               );
             })}
          </div>
        )}
      </div>

      {/* ── Edit Modal Overlay ──────────────────────────────── */}
      {editingBid && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "2rem"
        }} onClick={() => { setEditingBid(null); setEditStatus({}); }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card-bg, #fff)",
              borderRadius: "20px",
              padding: "2.5rem",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              border: "1px solid var(--border-color)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
                <i className="fa-solid fa-pen-ruler" style={{ color: "var(--primary-color)" }}></i>
                Edit Proposal
              </h3>
              <button onClick={() => { setEditingBid(null); setEditStatus({}); }} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-secondary)" }}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              <strong style={{ color: "var(--text-primary)" }}>{editingBid.project_title}</strong>
              <br />Proposal ID: {editingBid.bid_id.slice(0, 12)}
            </p>

            {/* Total Amount */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                Total Bid Amount (INR) <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontWeight: "700" }}>₹</span>
                <input
                  type="number"
                  value={editPayload.total}
                  onChange={(e) => setEditPayload({ ...editPayload, total: e.target.value })}
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
            </div>

            {/* Milestones */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "1rem", fontSize: "0.9rem" }}>
                Milestone Breakdown
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "0.75rem", marginBottom: "0.5rem", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", color: "var(--text-secondary)", padding: "0 4px" }}>
                <span>#</span><span>Amount (INR)</span><span>Deadline</span>
              </div>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {editPayload.milestones.map((ms, idx) => (
                  <div key={ms.milestone_index ?? idx} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", color: "var(--text-secondary)", fontSize: "0.9rem" }}>M{(ms.milestone_index ?? idx) + 1}</span>
                    <input
                      type="number"
                      value={ms.amount}
                      onChange={(e) => handleEditMilestoneChange(idx, "amount", e.target.value)}
                      style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.9rem" }}
                    />
                    <input
                      type="date"
                      value={ms.deadline}
                      readOnly={ms.isFixedDeadline}
                      onChange={(e) => handleEditMilestoneChange(idx, "deadline", e.target.value)}
                      style={{
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        fontSize: "0.9rem",
                        background: ms.isFixedDeadline ? "var(--bg-secondary)" : "white",
                        cursor: ms.isFixedDeadline ? "not-allowed" : "text",
                        opacity: ms.isFixedDeadline ? 0.7 : 1
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
              <button
                onClick={submitEdit}
                disabled={editStatus.loading}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "var(--primary-color)",
                  color: "white",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  opacity: editStatus.loading ? 0.7 : 1
                }}
              >
                {editStatus.loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving...</> : <><i className="fa-solid fa-floppy-disk"></i> Save Changes</>}
              </button>
              <button
                onClick={() => { setEditingBid(null); setEditStatus({}); }}
                style={{
                  padding: "12px 24px",
                  borderRadius: "10px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  fontWeight: "700",
                  cursor: "pointer",
                  fontSize: "0.95rem"
                }}
              >
                Cancel
              </button>
            </div>

            {editStatus.error && (
              <div style={{ color: "#ef4444", marginTop: "1rem", fontWeight: "600", padding: "10px", background: "#fee2e2", borderRadius: "8px" }}>
                <i className="fa-solid fa-circle-exclamation"></i> {editStatus.error}
              </div>
            )}
            {editStatus.success && (
              <div style={{ color: "#16a34a", marginTop: "1rem", fontWeight: "600", padding: "10px", background: "#dcfce7", borderRadius: "8px" }}>
                <i className="fa-solid fa-circle-check"></i> {editStatus.success}
              </div>
            )}
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
