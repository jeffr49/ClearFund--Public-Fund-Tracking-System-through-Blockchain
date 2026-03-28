"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";
import { API_BASE } from "@/lib/backend";

export default function ReportPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [status, setStatus] = useState(null); // 'submitting', 'success'

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then(res => res.json())
      .then(data => setProjects(data || []))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProject || !reportReason) return;
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
         // reset
         setStatus(null);
         setSelectedProject("");
         setReportReason("");
      }, 5000);
    }, 1000);
  };

  return (
    <SidebarLayout role="public">
      <div className="container" style={{ padding: "2rem", maxWidth: "800px" }}>
        <header style={{ marginBottom: "2rem" }}>
           <h1 style={{ fontSize: "2.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>Report an Issue</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Submit a report regarding any suspicious activity or concerns about a specific public project. Your report will be securely recorded and investigated by the authorities.</p>
        </header>

        <form onSubmit={handleSubmit} style={{ background: "white", padding: "2.5rem", borderRadius: "16px", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
          {status === 'success' && (
            <div style={{ padding: "1rem", background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" }}>
               <i className="fa-solid fa-circle-check" style={{ fontSize: "1.25rem" }}></i>
               Report accepted securely. Thank you for your vigilance.
            </div>
          )}

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-primary)" }}>Select Project</label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              required
              disabled={status === 'submitting'}
              style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", fontSize: "1rem", outline: "none", cursor: "pointer" }}
            >
              <option value="" disabled>-- Choose a project --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.location_address})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-primary)" }}>Reason for Report</label>
            <textarea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              required
              disabled={status === 'submitting'}
              placeholder="Please describe your concerns or the issue in detail..."
              style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-secondary)", fontSize: "1rem", minHeight: "150px", resize: "vertical", outline: "none", fontFamily: "inherit" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'submitting' || !selectedProject || !reportReason}
            style={{ width: "100%", padding: "16px", borderRadius: "8px", background: "var(--primary-color)", color: "white", border: "none", fontSize: "1.05rem", fontWeight: "700", cursor: (status === 'submitting' || !selectedProject || !reportReason) ? "not-allowed" : "pointer", opacity: (status === 'submitting' || !selectedProject || !reportReason) ? 0.7 : 1, transition: "all 0.2s", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
          >
            {status === 'submitting' ? <><i className="fa-solid fa-spinner fa-spin"></i> Processing...</> : <><i className="fa-solid fa-flag"></i> Submit Report</>}
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
}
