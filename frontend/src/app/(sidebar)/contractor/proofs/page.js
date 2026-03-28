"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const ESCROW_ABI = [
  "function submitProof(uint256 milestoneId, string calldata ipfsHash) external"
];

export default function ExecutionPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState({ milestones: [], progress: {}, events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [wallet, setWallet] = useState(null);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  useEffect(() => {
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

    async function fetchProjects() {
      try {
        const res = await fetch(`${API_BASE}/contractor/projects?wallet=${encodeURIComponent(user.wallet_address)}`);
        if (!res.ok) throw new Error("Could not fetch execution projects.");
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
      if (!res.ok) throw new Error("Could not load execution workspace details.");
      const data = await res.json();
      setProjectDetails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const handleFileSelect = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setUploading(prev => {
        const currentFiles = prev[index]?.files || [];
        const combined = [...currentFiles, ...files];
        return { 
          ...prev, 
          [index]: { 
            files: combined, 
            status: null, 
            name: combined.length === 1 ? combined[0].name : `${combined.length} files selected` 
          } 
        };
      });
    }
  };

  const submitProof = async (milestoneId, index) => {
    const uploadData = uploading[index];
    if (!uploadData || !uploadData.files || uploadData.files.length === 0) {
       setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Please upload a proof file." } }));
       return;
    }

    setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Encrypting & Uploading to IPFS..." } }));

    try {
      const hashes = [];
      for (const file of uploadData.files) {
         const formData = new FormData();
         formData.append("file", file);
         const uploadRes = await fetch(`${API_BASE}/contractor/upload`, { method: "POST", body: formData });
         if (!uploadRes.ok) throw new Error("Handshake with IPFS Node failed.");
         const { ipfsHash } = await uploadRes.json();
         hashes.push(ipfsHash);
      }
      
      const ipfsHash = hashes.join(',');

      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Anchoring to Blockchain Registry..." } }));

      if (!window.ethereum) {
        throw new Error("MetaMask is required to submit proof.");
      }
      if (!selectedProject?.contract_address) {
        throw new Error("Project contract address is missing.");
      }

      // Ensure user is on Sepolia (0xaa36a7) before proceeding to anchor on blockchain
      const SEPOLIA_CHAIN_ID = '0xaa36a7';
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Switching to Sepolia Testnet..." } }));
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          // Wait a moment for network switch to settle
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (switchError) {
          throw new Error("Wrong Network: Please switch to Sepolia Testnet to anchor proofs.");
        }
      }

      setUploading(prev => ({ ...prev, [index]: { ...prev[index], status: "Anchoring to Blockchain Registry..." } }));
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        selectedProject.contract_address,
        ESCROW_ABI,
        signer
      );

      const tx = await contract.submitProof(milestoneId, ipfsHash);
      await tx.wait();
      
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
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800" }}>Contractor Execution</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Execute projects, deploy milestones proofs, and track payments across all assignments.</p>
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
                  <p>You are not currently assigned to any projects requiring milestone execution.</p>
                </div>
             ) : (
                <div className="proof-proj-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
                  {projects.map(p => {
                    const progress = p.progress || {};
                    const percent = progress.total_milestones > 0 ? (progress.approved_milestones / progress.total_milestones) * 100 : 0;
                    const isCompleted = p.status === 'completed';
                    const cm = progress.current_milestone;
                    
                    let statusBg = "var(--bg-secondary)"; let statusColor = "var(--text-secondary)";
                    if (isCompleted) { statusBg = "#dcfce7"; statusColor = "#166534"; }
                    else if (p.status === 'active' || p.status === 'ongoing') { statusBg = "#eff6ff"; statusColor = "#1e40af"; }

                    let alertColor = "#f1f5f9"; let alertText = "#475569"; let alertIcon = "fa-chart-pie"; let alertLabel = "On Track";
                    if (cm) {
                       if (cm.status === 'UNDER_REVIEW') { alertColor = "#fef9c3"; alertText = "#854d0e"; alertIcon = "fa-clock"; alertLabel = `Pending Approval (${cm.approvals_obtained}/${cm.approval_threshold})`; }
                       else if (cm.status === 'REJECTED') { alertColor = "#fef2f2"; alertText = "#dc2626"; alertIcon = "fa-triangle-exclamation"; alertLabel = "Needs Resubmission"; }
                       else {
                          const daysLeft = cm.deadline ? (new Date(cm.deadline) - new Date()) / 86400000 : null;
                          if (daysLeft !== null && daysLeft < 3 && daysLeft >= 0) { alertColor = "#fff7ed"; alertText = "#ea580c"; alertIcon = "fa-fire"; alertLabel = "Deadline Approaching"; }
                          else if (daysLeft !== null && daysLeft < 0) { alertColor = "#fef2f2"; alertText = "#dc2626"; alertIcon = "fa-skull"; alertLabel = "Delayed!"; }
                          else { alertColor = "#eff6ff"; alertText = "#1d4ed8"; alertIcon = "fa-pen-to-square"; alertLabel = "Action Required"; }
                       }
                    } else if (!isCompleted) {
                       alertColor = "#f0fdf4"; alertText = "#16a34a"; alertIcon = "fa-check-double"; alertLabel = "Awaiting Action";
                    }

                    return (
                        <div key={p.project_id} onClick={() => openWorkspace(p)} style={{ background: "white", borderRadius: "16px", border: "1px solid var(--border-color)", padding: "1.5rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: "1.5rem", transition: "all 0.2s", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.15rem", fontWeight: "800", marginBottom: "4px" }}>{p.title}</h3>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "600" }}><i className="fa-solid fa-location-dot"></i> {p.location}</span>
                                </div>
                                <span style={{ background: statusBg, color: statusColor, padding: "4px 10px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase" }}>{isCompleted ? "Completed" : "Active"}</span>
                            </div>

                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase" }}>
                                    <span>Milestones Complete</span>
                                    <span>{progress.approved_milestones || 0} / {progress.total_milestones || 0}</span>
                                </div>
                                <div style={{ height: "8px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${percent}%`, background: isCompleted ? "#10b981" : "var(--primary-color)", borderRadius: "99px", transition: "width 0.5s" }}></div>
                                </div>
                            </div>

                            {!isCompleted && cm && (
                                <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                    <span style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "4px" }}>Current Task</span>
                                    <h4 style={{ fontSize: "0.95rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "10px", wordBreak: "break-all" }}>{cm.title}</h4>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 8px", background: alertColor, color: alertText, fontSize: "0.7rem", fontWeight: "800", borderRadius: "6px" }}><i className={`fa-solid ${alertIcon}`}></i> {alertLabel}</span>
                                </div>
                            )}

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", marginTop: "auto" }}>
                                <div>
                                    <span style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Amount Released</span>
                                    <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{formatCurrency(Number(progress.funds_released_inr) || 0)}</strong>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ display: "block", fontSize: "0.7rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Value</span>
                                    <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{formatCurrency(Number(progress.total_budget_inr) || 0)}</strong>
                                </div>
                            </div>
                        </div>
                    );
                  })}
                </div>
             )}
          </div>
        ) : (
          <div className="execution-workspace">
             <div className="workspace-header" style={{ marginBottom: "2rem", padding: "1.5rem", background: "white", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                <button onClick={() => setSelectedProject(null)} style={{ border: "none", background: "none", color: "var(--primary-color)", fontWeight: "700", cursor: "pointer", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px", padding: 0 }}><i className="fa-solid fa-arrow-left"></i> Back to Projects Grid</button>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800" }}>{selectedProject.title}</h2>
                <div className="workspace-meta" style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: "600" }}>
                    <span><i className="fa-solid fa-location-dot"></i> {selectedProject.location}</span>
                </div>
             </div>

             {workspaceLoading ? (
                <div style={{ textAlign: "center", padding: "4rem" }}><i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: "var(--primary-color)"}}></i></div>
             ) : (
                <div className="execution-grid" style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
                    <div className="milestone-timeline">
                       <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px", color: "var(--text-primary)" }}><i className="fa-solid fa-list-check" style={{ color: "var(--primary-color)" }}></i> Mission Planner</h3>
                       <div className="milestone-proof-list" style={{ display: "grid", gap: "1.5rem" }}>
                           {(projectDetails.milestones || []).map((m, idx) => {
                               const isNext = (projectDetails.milestones || []).findIndex(ms => ms.status !== 'APPROVED') === idx;
                               const uploadInfo = uploading[m.index] || {};
                               const msLabel = m.title?.trim() || m.description?.trim() || `Milestone ${m.index + 1}`;
                               const deadlineOk = m.deadline && !Number.isNaN(new Date(m.deadline).getTime());

                               return (
                                   <div key={m.index} className={`milestone-proof-card ${m.status.toLowerCase()} ${isNext ? 'active-milestone' : ''}`} style={{ 
                                     background: isNext ? "white" : "var(--card-bg)", 
                                     padding: "2rem", 
                                     borderRadius: "16px", 
                                     border: isNext ? "2px solid var(--primary-color)" : "1px solid var(--border-color)",
                                     boxShadow: isNext ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none",
                                     transition: "all 0.3s ease",
                                     borderLeft: `4px solid ${m.status === 'APPROVED' ? '#16a34a' : isNext ? 'var(--primary-color)' : 'var(--border-color)'}`
                                   }}>
                                       <div className="ms-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                           <div className="ms-title-wrap" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                               <span className="ms-index" style={{ fontWeight: "800", color: "var(--text-secondary)", fontSize: "1.1rem" }}>#{m.index + 1}</span>
                                               <h4 className="ms-title" style={{ fontSize: "1.2rem", fontWeight: "700" }}>{msLabel}</h4>
                                               {isNext && <span style={{ background: "var(--primary-color)", color: "white", padding: "2px 8px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}><i className="fa-solid fa-star"></i> CURRENT</span>}
                                           </div>
                                           <span style={{ 
                                             padding: "4px 12px", 
                                             borderRadius: "99px", 
                                             fontSize: "0.75rem", 
                                             fontWeight: "800",
                                             background: m.status === "APPROVED" ? "#dcfce7" : (m.status === "UNDER_REVIEW" ? "#fef9c3" : (m.status === "REJECTED" ? "#fef2f2" : "#f1f5f9")),
                                             color: m.status === "APPROVED" ? "#166534" : (m.status === "UNDER_REVIEW" ? "#854d0e" : (m.status === "REJECTED" ? "#dc2626" : "#475569"))
                                           }}>{m.status.replace('_', ' ')}</span>
                                       </div>
                                       {m.description?.trim() && m.title?.trim() ? (
                                           <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{m.description}</p>
                                       ) : null}
                                       <div className="ms-details" style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                                           <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}><i className="fa-solid fa-coins" style={{ color: "#f59e0b" }}></i> {formatCurrency(Number(m.amount) || 0)}</span>
                                           <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)" }}><i className="fa-regular fa-calendar-check" style={{ color: "var(--text-secondary)" }}></i> Deadline: {deadlineOk ? new Date(m.deadline).toLocaleDateString("en-IN") : "—"}</span>
                                       </div>

                                       {(m.status === 'NOT_SUBMITTED' || m.status === 'REJECTED') && isNext && (
                                           <div className="proof-upload-module" style={{ padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px dashed var(--border-color)", textAlign: "center" }}>
                                               <input type="file" multiple id={`file-${m.index}`} onChange={(e) => handleFileSelect(m.index, e)} style={{ display: "none" }} />
                                               
                                               {!uploadInfo.files || uploadInfo.files.length === 0 ? (
                                                  <div style={{ padding: "1.5rem 0" }}>
                                                    <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "3rem", color: "var(--primary-color)", marginBottom: "1rem" }}></i>
                                                    <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1rem", fontWeight: "800" }}>Upload Evidence Files</h4>
                                                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem", fontWeight: "500" }}>Select the file(s) that proves completion of this milestone</p>
                                                    <button onClick={() => document.getElementById(`file-${m.index}`).click()} style={{ padding: "10px 24px", borderRadius: "8px", background: "white", color: "var(--primary-color)", border: "2px solid var(--primary-color)", fontWeight: "800", cursor: "pointer", transition: "all 0.2s" }}>
                                                      Browse Files
                                                    </button>
                                                  </div>
                                               ) : (
                                                  <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                                                      <i className="fa-solid fa-file-circle-check" style={{ fontSize: "2.5rem", color: "var(--primary-color)" }}></i>
                                                      <div style={{ flex: 1, textAlign: "left" }}>
                                                        <h5 style={{ margin: "0 0 4px 0", fontSize: "1rem", wordBreak: "break-all" }}>{uploadInfo.name}</h5>
                                                        <button onClick={() => setUploading(prev => { const updated = {...prev}; delete updated[m.index]; return updated; })} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Remove All</button>
                                                        <span style={{ margin: "0 10px", color: "#ccc" }}>|</span>
                                                        <button onClick={() => document.getElementById(`file-${m.index}`).click()} style={{ background: "none", border: "none", color: "var(--primary-color)", fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", padding: 0 }}>Add More</button>
                                                      </div>
                                                    </div>
                                                    <button onClick={() => submitProof(m.index, m.index)} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "var(--primary-color)", color: "white", border: "none", fontWeight: "800", cursor: "pointer", fontSize: "1rem", transition: "all 0.2s" }}>
                                                      Distribute into Blockchain Layer
                                                    </button>
                                                  </div>
                                               )}

                                               {uploadInfo.status && (
                                                   <div style={{ marginTop: "1rem", fontSize: "0.9rem", fontWeight: "700", color: uploadInfo.status.includes("Successfully") ? "#16a34a" : (uploadInfo.status.includes("Please") || uploadInfo.status.includes("Failure") ? "#dc2626" : "#475569") }}>
                                                       <i className={`fa-solid ${uploadInfo.status.includes("Successfully") ? "fa-circle-check" : (uploadInfo.status.includes("Please") || uploadInfo.status.includes("Failure") ? "fa-circle-exclamation" : "fa-spinner fa-spin")}`} style={{ marginRight: "6px" }}></i>
                                                       {uploadInfo.status}
                                                   </div>
                                               )}
                                           </div>
                                       )}
                                   </div>
                               );
                           })}
                       </div>
                    </div>

                    <div className="execution-sidebar" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                       
                       <div className="finance-panel" style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                           <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem" }}><i className="fa-solid fa-sack-dollar" style={{ color: "#16a34a", marginRight: "8px" }}></i> Financial Escrow</h4>
                           <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                 <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Released</span>
                                 <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{formatCurrency(Number(projectDetails?.progress?.funds_released_inr) || 0)}</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                 <span style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Total Budget</span>
                                 <strong style={{ fontSize: "1.1rem", color: "var(--text-primary)" }}>{formatCurrency(Number(projectDetails?.progress?.total_budget_inr) || 0)}</strong>
                              </div>
                              <div style={{ height: "6px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden", marginTop: "5px" }}>
                                 <div style={{ height: "100%", width: `${(Number(projectDetails?.progress?.funds_released_inr)/Number(projectDetails?.progress?.total_budget_inr))*100 || 0}%`, background: "#16a34a", transition: "width 0.5s" }}></div>
                              </div>
                           </div>
                       </div>

                       <div className="approval-tracker" style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                           <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem" }}><i className="fa-solid fa-user-check" style={{ color: "var(--primary-color)", marginRight: "8px" }}></i> Approval Tracker</h4>
                           {projectDetails?.progress?.current_milestone ? (
                              <div style={{ background: "var(--bg-secondary)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                 <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-secondary)", textTransform: "uppercase" }}>Current Stage Tracker</span>
                                 <strong style={{ display: "block", fontSize: "0.95rem", margin: "4px 0 12px 0", color: "var(--text-primary)", wordBreak: "break-all" }}>{projectDetails.progress.current_milestone.title}</strong>
                                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "0.8rem", fontWeight: "800" }}>
                                     <span>Authorizations</span>
                                     <span style={{ color: projectDetails.progress.current_milestone.status === 'UNDER_REVIEW' ? '#ea580c' : 'inherit' }}>{projectDetails.progress.current_milestone.approvals_obtained || 0} / {projectDetails.progress.current_milestone.approval_threshold}</span>
                                 </div>
                                 <div style={{ height: "8px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${((projectDetails.progress.current_milestone.approvals_obtained||0) / projectDetails.progress.current_milestone.approval_threshold)*100}%`, background: "var(--primary-color)", transition: "width 0.5s" }}></div>
                                 </div>
                              </div>
                           ) : (
                              <div style={{ padding: "1.5rem", background: "var(--bg-secondary)", borderRadius: "12px", border: "1px dashed var(--border-color)", textAlign: "center" }}>
                                 <i className="fa-solid fa-flag-checkered" style={{ fontSize: "1.5rem", color: "#16a34a", marginBottom: "10px" }}></i>
                                 <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600", margin: 0 }}>Project fully tracked!</p>
                              </div>
                           )}
                       </div>

                       <div className="activity-feed" style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
                           <h4 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "1.5rem" }}><i className="fa-solid fa-clock-rotate-left" style={{ color: "#8b5cf6", marginRight: "8px" }}></i> Live Activity Feed</h4>
                           <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem" }}>
                              {projectDetails?.events && projectDetails.events.length > 0 ? projectDetails.events.slice().reverse().map((ev, i) => (
                                <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: i < projectDetails.events.length - 1 ? "12px" : "0", borderBottom: i < projectDetails.events.length - 1 ? "1px solid var(--border-color)" : "none" }}>
                                   <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                      {ev.event_type.includes('APPROVED') ? <i className="fa-solid fa-check" style={{ color: "#16a34a" }}></i> : ev.event_type.includes('SUBMITTED') ? <i className="fa-solid fa-upload" style={{ color: "var(--primary-color)" }}></i> : <i className="fa-solid fa-bolt"></i>}
                                   </div>
                                   <div>
                                      <p style={{ margin: "0", fontSize: "0.85rem", fontWeight: "700", color: "var(--text-primary)" }}>{ev.event_type.replace(/_/g, " ")}</p>
                                      <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: "700", textTransform: "uppercase" }}>{new Date(ev.created_at).toLocaleString('en-IN', { hour: '2-digit', minute:'2-digit', day: '2-digit', month: 'short' })}</span>
                                   </div>
                                </div>
                              )) : (
                                <div style={{ padding: "1.5rem", textAlign: "center", fontStyle: "italic", color: "var(--text-secondary)", fontSize: "0.85rem", background: "var(--bg-secondary)", borderRadius: "12px" }}>No activity recorded yet.</div>
                              )}
                           </div>
                       </div>
                    </div>
                </div>
             )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
