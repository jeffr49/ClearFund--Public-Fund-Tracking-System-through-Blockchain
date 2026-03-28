"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function MyBidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallet, setWallet] = useState(null);

  const formatInr = (n) => new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    maximumFractionDigits: 0 
  }).format(n);

  useEffect(() => {
    // 1. Identification
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

    // 2. Data Fetching
    async function fetchMyBids() {
      try {
        const res = await fetch(`${API_BASE}/bids/my?wallet=${encodeURIComponent(user.wallet_address)}`);
        if (!res.ok) throw new Error("Synchronization with bid registry failed.");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBids();
  }, [router]);

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
             <p>You haven't submitted any proposals to active tenders yet.</p>
             <button onClick={() => router.push("/contractor/available")} style={{ marginTop: "1.5rem", padding: "10px 20px", borderRadius: "8px", background: "var(--primary-color)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
                Explorer Available Tenders
             </button>
           </div>
        ) : (
          <div className="bid-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
             {bids.map(b => (
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
                         <span style={{ fontSize: "0.65rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Proposal ID: {b.bid_id.slice(0,8)}</span>
                         <h4 className="bid-proj-name" style={{ fontSize: "1.15rem", fontWeight: "700", marginTop: "4px" }}>{b.project_title}</h4>
                      </div>
                      <span className={`bid-status-pill ${b.status}`} style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: "800", 
                        padding: "4px 10px", 
                        borderRadius: "999px",
                        textTransform: "uppercase",
                        letterSpacing: "0.02em",
                        background: b.status === "PENDING" ? "#fff7ed" : (b.status === "APPROVED" ? "#f0fdf4" : "#fef2f2"),
                        color: b.status === "PENDING" ? "#c2410c" : (b.status === "APPROVED" ? "#166534" : "#991b1b"),
                        border: `1px solid ${b.status === "PENDING" ? "#ffedd5" : (b.status === "APPROVED" ? "#dcfce7" : "#fee2e2")}`
                      }}>
                        {b.status}
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

                   <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "auto" }}>
                        <i className="fa-solid fa-list-check" style={{ color: "var(--primary-color)" }}></i>
                        <span>{b.milestones?.length || 0} Milestones defined in proposal</span>
                   </div>
                   
                   <button style={{ 
                     width: "100%", 
                     padding: "10px", 
                     borderRadius: "8px", 
                     background: "var(--bg-secondary)", 
                     border: "1px solid var(--border-color)",
                     fontWeight: "700",
                     fontSize: "0.85rem",
                     cursor: "pointer",
                     transition: "background 0.2s"
                   }}>
                     View Full Proposal
                   </button>
                </div>
             ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

