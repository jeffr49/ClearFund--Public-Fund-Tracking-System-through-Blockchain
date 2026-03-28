"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function SubmitProofsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [wallet, setWallet] = useState(null);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  useEffect(() => {
    // 1. Authentication Check
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

    // 2. Load Projects
    async function fetchProjects() {
      try {
        const res = await fetch(`${API_BASE}/contractor/projects?wallet=${encodeURIComponent(user.wallet_address)}`);
        if (!res.ok) throw new Error("Verification with project registry failed.");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [router]);

  const openWorkspace = async (p) => {
    setSelectedProject(p);
    setWorkspaceLoading(true);
    try {
      const res = await fetch(`${API_BASE}/contractor/project/${p.project_id}`);
      if (!res.ok) throw new Error("Secure handshake with milestone service failed.");
      const data = await res.json();
      setMilestones(data.milestones || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleFileSelect = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(prev => ({ ...prev, [index]: { file, status: null, name: file.name } }));
    }
  };

  const submitProof = async (milestoneId, index) => {
    const uploadData = uploading[index];
    if (!uploadData || !uploadData.file) {
       setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Capture or select a proof file." } }));
       return;
    }

    setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Encrypting & Uploading to IPFS..." } }));

    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      const uploadRes = await fetch(`${API_BASE}/contractor/upload`, { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Handshake with IPFS Node failed.");
      const { ipfsHash } = await uploadRes.json();

      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Anchoring to Blockchain Registry..." } }));

      const submitRes = await fetch(`${API_BASE}/contractor/submit-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.project_id,
          contractAddress: selectedProject.contract_address,
          milestoneId,
          ipfsHash,
          actor: wallet
        })
      });

      if (!submitRes.ok) throw new Error("Transaction failed to commit.");
      
      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Proof Anchored Successfully!" } }));
      setTimeout(() => openWorkspace(selectedProject), 2000);
    } catch (err) {
      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Failure: " + err.message } }));
    }
  };

  return (
    <SidebarLayout role="contractor">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800" }}>Escrow Unlock Portal</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Submit verifiable proof of work to trigger secure fund release from smart contract escrows.</p>
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)" }}></i>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ padding: "3rem", textAlign: "center", border: "1px solid #fee2e2", background: "#fef2f2", borderRadius: "16px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
            <h3 style={{ marginTop: "1rem" }}>System Error</h3><p>{error}</p>
          </div>
        ) : !selectedProject ? (
          <div className="proof-project-list">
             {projects.length === 0 ? (
                <div className="empty-state" style={{ textAlign: "center", padding: "5rem", background: "var(--card-bg)", borderRadius: "20px", border: "1px dashed var(--border-color)" }}>
                  <i className="fa-solid fa-diagram-project" style={{ fontSize: "4rem", color: "var(--border-color)", marginBottom: "1.5rem" }}></i>
                  <h3>No Active Assignments</h3>
                  <p>You are not currently assigned to any projects requiring milestone proof submissions.</p>
                </div>
             ) : (
                <div className="proof-proj-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                  {projects.map(p => (
                    <div key={p.project_id} className="proof-proj-card" onClick={() => openWorkspace(p)} style={{ 
                      background: "var(--card-bg)", 
                      padding: "1.5rem", 
                      borderRadius: "16px", 
                      border: "1px solid var(--border-color)",
                      cursor: "pointer",
                      transition: "all 0.3s ease"
                    }}>
                      <div className="proj-icon" style={{ fontSize: "2rem", color: "var(--primary-color)", marginBottom: "1rem" }}><i className="fa-solid fa-briefcase"></i></div>
                      <div className="proj-info">
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "4px" }}>{p.title}</h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{p.location}</p>
                      </div>
                      <div className={`proj-status-badge ${p.status}`} style={{ 
                        marginTop: "1.25rem", 
                        fontSize: "0.7rem", 
                        fontWeight: "800", 
                        background: "var(--bg-secondary)", 
                        display: "inline-block", 
                        padding: "4px 10px", 
                        borderRadius: "99px",
                        textTransform: "uppercase"
                      }}>{p.status}</div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        ) : (
          <div className="proof-workspace">
             <div className="workspace-header" style={{ marginBottom: "2rem", padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                <button className="back-link" onClick={() => setSelectedProject(null)} style={{ border: "none", background: "none", color: "var(--primary-color)", fontWeight: "700", cursor: "pointer", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}><i className="fa-solid fa-arrow-left"></i> Back to Catalog</button>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800" }}>{selectedProject.title}</h2>
                <div className="workspace-meta" style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    <span><i className="fa-solid fa-location-dot"></i> {selectedProject.location}</span>
                    <span><i className="fa-solid fa-microchip"></i> {selectedProject.contract_address?.slice(0,12)}...</span>
                </div>
             </div>

             {workspaceLoading ? (
                <div style={{ textAlign: "center", padding: "4rem" }}><i className="fa-solid fa-spinner fa-spin fa-2x"></i></div>
             ) : (
                <div className="milestone-proof-list" style={{ display: "grid", gap: "1.25rem" }}>
                    {milestones.map((m, idx) => {
                        const isNext = milestones.findIndex(ms => ms.status !== 'APPROVED') === idx;
                        const uploadInfo = uploading[m.index] || {};
                        const msLabel =
                          m.title?.trim() ||
                          m.description?.trim() ||
                          `Milestone ${m.index + 1}`;
                        const deadlineOk =
                          m.deadline &&
                          !Number.isNaN(new Date(m.deadline).getTime());

                        return (
                            <div key={m.index} className={`milestone-proof-card ${m.status.toLowerCase()} ${isNext ? 'active-milestone' : ''}`} style={{ 
                              background: isNext ? "white" : "var(--card-bg)", 
                              padding: "2rem", 
                              borderRadius: "16px", 
                              border: isNext ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                              boxShadow: isNext ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none"
                            }}>
                                <div className="ms-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <div className="ms-title-wrap" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <span className="ms-index" style={{ fontWeight: "800", color: "var(--text-secondary)", fontSize: "1.1rem" }}>#{m.index + 1}</span>
                                        <h4 className="ms-title" style={{ fontSize: "1.2rem", fontWeight: "700" }}>{msLabel}</h4>
                                        {isNext && <span className="current-badge" style={{ background: "var(--primary-color)", color: "white", padding: "2px 8px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: "800" }}><i className="fa-solid fa-star"></i> CURRENT</span>}
                                    </div>
                                    <span style={{ 
                                      padding: "4px 12px", 
                                      borderRadius: "99px", 
                                      fontSize: "0.75rem", 
                                      fontWeight: "800",
                                      background: m.status === "APPROVED" ? "#dcfce7" : (m.status === "UNDER_REVIEW" ? "#fef9c3" : "#f1f5f9"),
                                      color: m.status === "APPROVED" ? "#166534" : (m.status === "UNDER_REVIEW" ? "#854d0e" : "#475569")
                                    }}>{m.status.replace('_', ' ')}</span>
                                </div>
                                {m.description?.trim() && m.title?.trim() ? (
                                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{m.description}</p>
                                ) : null}
                                <div className="ms-details" style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><i className="fa-solid fa-coins" style={{ color: "#f59e0b" }}></i> <strong>{formatCurrency(Number(m.amount) || 0)}</strong></span>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><i className="fa-regular fa-calendar-check"></i> Exp: {deadlineOk ? new Date(m.deadline).toLocaleDateString("en-IN") : "—"}</span>
                                </div>

                                {(m.status === 'NOT_SUBMITTED' || m.status === 'REJECTED') && (
                                    <div className="proof-upload-zone" style={{ padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
                                        <input type="file" id={`file-${m.index}`} className="proof-file-input" onChange={(e) => handleFileSelect(m.index, e)} style={{ display: "none" }} />
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <label htmlFor={`file-${m.index}`} className="file-label" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" }}>
                                              <i className="fa-solid fa-file-arrow-up" style={{ fontSize: "1.5rem", color: "var(--primary-color)" }}></i>
                                              <span>{uploadInfo.name || "Upload Proof Image (PDF/JPG)"}</span>
                                          </label>
                                          <button className="submit-proof-btn" onClick={() => submitProof(m.index, m.index)} style={{ padding: "8px 20px", borderRadius: "8px", background: "var(--primary-color)", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}>
                                              Anchor Submission
                                          </button>
                                        </div>
                                        {uploadInfo.status && (
                                            <div style={{ marginTop: "1rem", fontSize: "0.85rem", fontWeight: "700", color: uploadInfo.status.includes("Anchored") ? "#16a34a" : "#475569" }}>
                                                <i className={`fa-solid ${uploadInfo.status.includes("Anchored") ? "fa-circle-check" : "fa-spinner fa-spin"}`} style={{ marginRight: "6px" }}></i>
                                                {uploadInfo.status}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
             )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

