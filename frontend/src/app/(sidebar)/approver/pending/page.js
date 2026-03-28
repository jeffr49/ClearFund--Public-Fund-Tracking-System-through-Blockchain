"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const escrowAbi = [
  "function approveMilestone(uint256 id) public",
  "function rejectMilestone(uint256 id) public"
];

export default function PendingReviewsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // track which task is currently being voted on
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("clearfund_user");
    if (!storedUser) {
      router.push("/gate?role=approver");
      return;
    }
    const user = JSON.parse(storedUser);
    if (!user.wallet_address) {
      router.push("/gate?role=approver");
      return;
    }
    setWallet(user.wallet_address);

    fetchPendingTasks(user.wallet_address);
  }, [router]);

  const fetchPendingTasks = async (walletAddress) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/signer/tasks?wallet=${encodeURIComponent(walletAddress)}`);
      if (!res.ok) throw new Error("Could not fetch pending reviews.");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (task, action) => {
    if (!window.ethereum) {
      alert("Please install MetaMask to cast a vote.");
      return;
    }

    setProcessingId(task.id);
    
    try {
      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const contract = new ethers.Contract(task.contract_address, escrowAbi, signer);

      let tx;
      if (action === "approve") {
        tx = await contract.approveMilestone(task.milestone_id);
      } else {
        tx = await contract.rejectMilestone(task.milestone_id);
      }

      // Wait for transaction to be mined
      await tx.wait();

      // Transaction successful, re-fetch tasks
      await fetchPendingTasks(wallet);

    } catch (err) {
      console.error("Voting error:", err);
      alert(err.reason || err.message || "Failed to process the transaction. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <SidebarLayout role="approver">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--text-primary)" }}>
            Pending Reviews
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>
            Review and vote on milestone proofs submitted by contractors.
          </p>
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "4rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem" }}>Fetching pending reviews...</h3>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ border: "1px solid #fee2e2", background: "#fef2f2", padding: "3rem", borderRadius: "16px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
            <h3 style={{ color: "#991b1b", marginTop: "1rem" }}>Failed to Fetch</h3>
            <p style={{ color: "#b91c1c" }}>{error}</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
            <i className="fa-solid fa-clipboard-check" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
            <h3 style={{ fontSize: "1.5rem", color: "var(--text-secondary)" }}>All Caught Up!</h3>
            <p>You have no pending milestones to review at this time.</p>
          </div>
        ) : (
          <div className="avail-list" style={{ display: "grid", gap: "2rem" }}>
            {tasks.map(task => (
              <div key={task.id} className="avail-card" style={{
                background: "var(--card-bg)",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                overflow: "hidden",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"
              }}>
                <div className="avail-card-header" style={{ padding: "2rem", borderBottom: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <span className="avail-bid-badge" style={{
                          background: '#fef3c7',
                          color: '#d97706',
                          padding: "4px 12px",
                          borderRadius: "999px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          <i className="fa-solid fa-clock"></i> NEEDS REVIEW
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Milestone ID: {task.milestone_id}</span>
                      </div>
                      <h3 className="avail-title" style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)" }}>
                        {task.project_title}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="avail-desc" style={{ color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                    <strong>Task Description:</strong> {task.description}
                  </p>

                  <div style={{ padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px dashed var(--border-color)", marginBottom: "1.5rem" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700", marginBottom: "0.5rem", color: "var(--text-primary)" }}>Submitted Proof (IPFS)</h4>
                    {task.ipfsHash ? (
                      <div>
                        {task.ipfsHash.split(',').map((hash, i) => (
                           <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                             <i className="fa-solid fa-file-pdf" style={{ color: "#ef4444" }}></i>
                             <a href={`https://gateway.pinata.cloud/ipfs/${hash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-color)", textDecoration: "underline", fontSize: "0.9rem", wordBreak: "break-all" }}>
                               {hash}
                             </a>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>No IPFS hash provided.</span>
                    )}
                  </div>
                  
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                      onClick={() => handleVote(task, "approve")}
                      disabled={processingId === task.id}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        fontWeight: "700",
                        cursor: processingId === task.id ? "not-allowed" : "pointer",
                        opacity: processingId === task.id ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      {processingId === task.id ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-check"></i> Approve</>}
                    </button>
                    <button
                      onClick={() => handleVote(task, "reject")}
                      disabled={processingId === task.id}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "10px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        fontWeight: "700",
                        cursor: processingId === task.id ? "not-allowed" : "pointer",
                        opacity: processingId === task.id ? 0.7 : 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      {processingId === task.id ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-xmark"></i> Reject</>}
                    </button>
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
