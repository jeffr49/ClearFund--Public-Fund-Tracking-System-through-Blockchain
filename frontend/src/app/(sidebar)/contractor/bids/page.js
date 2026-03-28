"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_WALLET = "0x12a9...bc4";

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatInr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  useEffect(() => {
    async function fetchMyBids() {
      try {
        let wallet = DEFAULT_WALLET;
        const storedUser = sessionStorage.getItem("clearfund_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.wallet_address) wallet = user.wallet_address;
        }

        const res = await fetch(`${API_BASE}/bids/my?wallet=${encodeURIComponent(wallet)}`);
        if (!res.ok) throw new Error("Failed to fetch my bids.");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyBids();
  }, []);

  return (
    <SidebarLayout role="contractor">
      <div className="container">
        <header className="page-header">
          <h1>My Submitted Bids</h1>
          <p>Track the status of your active proposals and project assignments.</p>
        </header>

        {loading ? (
          <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><h3>Looking up your bid history...</h3></div>
        ) : error ? (
           <div className="empty-state"><i className="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>{error}</p></div>
        ) : bids.length === 0 ? (
           <div className="empty-state"><i className="fa-solid fa-box-open"></i><h3>No Bids Found</h3><p>You haven't submitted any bids yet.</p></div>
        ) : (
          <div className="bid-grid">
             {bids.map(b => (
                <div key={b.bid_id} className="bid-card-simple">
                   <div className="bid-card-top">
                      <div className="bid-proj-info">
                         <h4 className="bid-proj-name">{b.project_title}</h4>
                         <p className="bid-proj-loc">{b.project_location}</p>
                      </div>
                      <span className={`bid-status-pill ${b.status}`}>{b.status}</span>
                   </div>
                   <div className="bid-card-body">
                      <div className="bid-stat">
                         <span>Bid Amount</span>
                         <strong>{formatInr(b.total_amount)}</strong>
                      </div>
                      <div className="bid-stat">
                         <span>Submitted</span>
                         <strong>{new Date(b.created_at).toLocaleDateString()}</strong>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
