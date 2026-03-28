"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_WALLET = "0x12a9...bc4";

export default function SubmitProofsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [uploading, setUploading] = useState({});

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  useEffect(() => {
    async function fetchProjects() {
      try {
        let wallet = DEFAULT_WALLET;
        const storedUser = sessionStorage.getItem("clearfund_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.wallet_address) wallet = user.wallet_address;
        }

        const res = await fetch(`${API_BASE}/contractor/projects?wallet=${encodeURIComponent(wallet)}`);
        if (!res.ok) throw new Error("Failed to fetch assigned projects.");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const openWorkspace = async (p) => {
    setSelectedProject(p);
    setWorkspaceLoading(true);
    try {
      const res = await fetch(`${API_BASE}/contractor/project/${p.project_id}`);
      if (!res.ok) throw new Error("Failed to fetch project details.");
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
       setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Please select a file first." } }));
       return;
    }

    setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Uploading to IPFS..." } }));

    try {
      // 1. IPFS Upload
      const formData = new FormData();
      formData.append("file", uploadData.file);
      const uploadRes = await fetch(`${API_BASE}/contractor/upload`, {
        method: "POST",
        body: formData
      });
      if (!uploadRes.ok) throw new Error("IPFS upload failed.");
      const { ipfsHash } = await uploadRes.json();

      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Recording submission..." } }));

      // 2. Submit to DB
      const submitRes = await fetch(`${API_BASE}/contractor/submit-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject.project_id,
          contractAddress: selectedProject.contract_address,
          milestoneId,
          ipfsHash,
          actor: DEFAULT_WALLET
        })
      });

      if (!submitRes.ok) throw new Error("Failed to record submission.");
      
      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Success! Proof submitted." } }));
      
      // Refresh milestones
      setTimeout(() => openWorkspace(selectedProject), 2000);
    } catch (err) {
      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Error: " + err.message } }));
    }
  };

  return (
    <SidebarLayout role="contractor">
      <div className="container">
        <header className="page-header">
          <h1>Submit Milestone Proofs</h1>
          <p>Provide verifiable documentation for your completed milestones to initiate the escrow release process.</p>
        </header>

        {loading ? (
          <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><h3>Loading project inventory...</h3></div>
        ) : error ? (
          <div className="empty-state"><i className="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>{error}</p></div>
        ) : !selectedProject ? (
          <div className="proof-project-list">
             {projects.length === 0 ? (
                <div className="empty-state">
                  <i className="fa-solid fa-folder-open"></i>
                  <h3>No Active Projects</h3>
                  <p>You haven't been assigned to any projects yet.</p>
                </div>
             ) : (
                <div className="proof-proj-grid">
                  {projects.map(p => (
                    <div key={p.project_id} className="proof-proj-card" onClick={() => openWorkspace(p)}>
                      <div className="proj-icon"><i className="fa-solid fa-diagram-project"></i></div>
                      <div className="proj-info">
                        <h4>{p.title}</h4>
                        <p>{p.location}</p>
                      </div>
                      <div className={`proj-status-badge ${p.status}`}>{p.status}</div>
                    </div>
                  ))}
                </div>
             )}
          </div>
        ) : (
          <div className="proof-workspace">
             <div className="workspace-header">
                <button className="back-link" onClick={() => setSelectedProject(null)}><i className="fa-solid fa-arrow-left"></i> Back to Projects</button>
                <h2>{selectedProject.title}</h2>
                <div className="workspace-meta">
                    <span><i className="fa-solid fa-location-dot"></i> {selectedProject.location}</span>
                    <span><i className="fa-solid fa-file-contract"></i> {selectedProject.contract_address?.slice(0,10)}...</span>
                </div>
             </div>

             {workspaceLoading ? (
                <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><h3>Fetching milestones...</h3></div>
             ) : (
                <div className="milestone-proof-list">
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
                            <div key={m.index} className={`milestone-proof-card ${m.status.toLowerCase()} ${isNext ? 'active-milestone' : ''}`}>
                                <div className="ms-header">
                                    <div className="ms-title-wrap">
                                        <span className="ms-index">#{m.index + 1}</span>
                                        <h4 className="ms-title">{msLabel}</h4>
                                        {isNext && <span className="current-badge"><i className="fa-solid fa-star"></i> CURRENT</span>}
                                    </div>
                                    <span className={`ms-status-tag ${m.status}`}>{m.status.replace('_', ' ')}</span>
                                </div>
                                {m.description?.trim() && m.title?.trim() ? (
                                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{m.description}</p>
                                ) : null}
                                <div className="ms-details">
                                    <span><i className="fa-solid fa-money-bill-wave"></i> {formatCurrency(Number(m.amount) || 0)}</span>
                                    <span><i className="fa-solid fa-calendar-day"></i> Deadline: {deadlineOk ? new Date(m.deadline).toLocaleDateString("en-IN") : "—"}</span>
                                </div>

                                {(m.status === 'NOT_SUBMITTED' || m.status === 'REJECTED') && (
                                    <div className="proof-upload-zone">
                                        <input 
                                          type="file" 
                                          id={`file-${m.index}`} 
                                          className="proof-file-input" 
                                          onChange={(e) => handleFileSelect(m.index, e)} 
                                        />
                                        <label htmlFor={`file-${m.index}`} className="file-label">
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                            <span>{uploadInfo.name || "Choose Proof Image/DOC"}</span>
                                        </label>
                                        <button className="submit-proof-btn" onClick={() => submitProof(m.index, m.index)}>
                                            Submit for Review
                                        </button>
                                        {uploadInfo.status && (
                                            <div className="upload-status">
                                                <span className={uploadInfo.status.includes("Success") ? "success" : "error"}>
                                                   {uploadInfo.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {m.status === 'UNDER_REVIEW' && (
                                    <div className="proof-status-msg pending">
                                      <i className="fa-solid fa-clock"></i> Under Review by Independent Approvers
                                    </div>
                                )}

                                {m.status === 'APPROVED' && (
                                    <div className="proof-status-msg success">
                                      <i className="fa-solid fa-circle-check"></i> Milestone Approved & Funds Released on Blockchain
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
