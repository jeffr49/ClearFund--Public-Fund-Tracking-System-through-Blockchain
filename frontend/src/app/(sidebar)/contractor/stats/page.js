"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ContractorStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    // 2. Fetch Stats
    async function fetchStats() {
      try {
        const res = await fetch(`${API_BASE}/contractor/stats?wallet=${encodeURIComponent(user.wallet_address)}`);
        if (!res.ok) throw new Error("On-chain reputation audit failed.");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [router]);

  const getReputationLabel = (score) => {
    if (score >= 90) return "Excellent Reputation";
    if (score >= 75) return "Highly Reliable";
    if (score >= 50) return "Average Performance";
    return "Needs Improvement";
  };

  const scoreColor = stats?.score >= 80 ? "#10b981" : (stats?.score >= 50 ? "#f59e0b" : "#ef4444");

  return (
    <SidebarLayout role="contractor">
      <div className="container" style={{ padding: "2rem", maxWidth: "1200px" }}>
        <header className="page-header" style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800" }}>Performance Analytics</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Your real-time trust score and financial performance metrics anchored on the ledger.</p>
        </header>

        {loading ? (
          <div className="empty-state" style={{ padding: "5rem", textAlign: "center" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "3rem", color: "var(--primary-color)" }}></i>
          </div>
        ) : error ? (
          <div className="empty-state" style={{ padding: "3rem", textAlign: "center", border: "1px solid #fee2e2", background: "#fef2f2", borderRadius: "16px" }}>
            <i className="fa-solid fa-circle-exclamation" style={{ color: "#ef4444", fontSize: "2.5rem" }}></i>
            <h3 style={{ marginTop: "1rem" }}>Sync Failure</h3><p>{error}</p>
          </div>
        ) : (
          <div className="stats-dashboard" style={{ display: "grid", gap: "2rem" }}>
            <div className="stats-main-row" style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2rem" }}>
              <div className="stats-card-premium score-card" style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid var(--border-color)", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                <div className="score-circle" style={{ 
                    width: "180px", 
                    height: "180px", 
                    borderRadius: "50%", 
                    border: `12px solid ${scoreColor}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative"
                }}>
                  <div className="score-inner">
                    <span className="score-value" style={{ fontSize: "3rem", fontWeight: "900", color: "var(--text-primary)" }}>{stats.score}</span>
                    <span className="score-label" style={{ display: "block", fontSize: "0.85rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase" }}>Trust Score</span>
                  </div>
                </div>
                <div className="score-meta">
                  <p style={{ fontWeight: "700", fontSize: "1.25rem", color: scoreColor }}>{getReputationLabel(stats.score)}</p>
                  <small style={{ color: "var(--text-secondary)" }}>Calculated from on-chain delivery success rate and milestone punctuality.</small>
                </div>
              </div>

              <div className="stats-grid-mini" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div className="stat-mini-card" style={{ background: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--border-color)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="icon-wrap blue" style={{ width: "60px", height: "60px", background: "#eff6ff", color: "#3b82f6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}><i className="fa-solid fa-diagram-project"></i></div>
                  <div className="info-wrap">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Projects Completed</span>
                    <strong style={{ display: "block", fontSize: "1.5rem" }}>{stats.completed_projects} / {stats.total_projects}</strong>
                  </div>
                </div>
                <div className="stat-mini-card" style={{ background: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--border-color)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="icon-wrap indigo" style={{ width: "60px", height: "60px", background: "#eef2ff", color: "#4f46e5", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}><i className="fa-solid fa-person-digging"></i></div>
                  <div className="info-wrap">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Ongoing Projects</span>
                    <strong style={{ display: "block", fontSize: "1.5rem" }}>{stats.ongoing_projects || 0}</strong>
                  </div>
                </div>
                <div className="stat-mini-card" style={{ background: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--border-color)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="icon-wrap green" style={{ width: "60px", height: "60px", background: "#f0fdf4", color: "#10b981", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}><i className="fa-solid fa-sack-dollar"></i></div>
                  <div className="info-wrap">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Total Earnings</span>
                    <strong style={{ display: "block", fontSize: "1.5rem" }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(Number(stats.total_earnings_inr || 0))}</strong>
                  </div>
                </div>
                <div className="stat-mini-card" style={{ background: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--border-color)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="icon-wrap orange" style={{ width: "60px", height: "60px", background: "#fff7ed", color: "#f59e0b", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}><i className="fa-solid fa-clock"></i></div>
                  <div className="info-wrap">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Avg. Milestone Delay</span>
                    <strong style={{ display: "block", fontSize: "1.5rem" }}>{stats.average_delay_days} Days</strong>
                  </div>
                </div>
                <div className="stat-mini-card" style={{ background: "white", padding: "1.5rem", borderRadius: "20px", border: "1px solid var(--border-color)", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div className="icon-wrap purple" style={{ width: "60px", height: "60px", background: "#faf5ff", color: "#a855f7", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}><i className="fa-solid fa-check-double"></i></div>
                  <div className="info-wrap">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>Milestones On-Time</span>
                    <strong style={{ display: "block", fontSize: "1.5rem" }}>{stats.total_milestones > 0 ? Math.round((stats.on_time_milestones / stats.total_milestones) * 100) : 0}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-breakdown-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
              <div className="breakdown-card" style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem" }}><i className="fa-solid fa-bolt" style={{ color: "#f59e0b", marginRight: "10px" }}></i> Milestone Efficiency</h3>
                <div className="efficiency-bar-container" style={{ display: "grid", gap: "1rem" }}>
                  <div className="eff-row" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700" }}>
                        <span>On-Time Submissions:</span>
                        <span>{stats.on_time_milestones}</span>
                    </div>
                    <div className="bar-bg" style={{ height: "12px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                      <div 
                        className="bar-fill ontime" 
                        style={{ width: `${stats.total_milestones > 0 ? (stats.on_time_milestones / stats.total_milestones) * 100 : 0}%`, height: "100%", background: "#10b981" }}
                      ></div>
                    </div>
                  </div>
                  <div className="eff-row" style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem", fontWeight: "700" }}>
                        <span>Late Submissions:</span>
                        <span>{stats.delayed_milestones}</span>
                    </div>
                    <div className="bar-bg" style={{ height: "12px", background: "var(--bg-secondary)", borderRadius: "99px", overflow: "hidden" }}>
                      <div 
                        className="bar-fill delayed" 
                        style={{ width: `${stats.total_milestones > 0 ? (stats.delayed_milestones / stats.total_milestones) * 100 : 0}%`, height: "100%", background: "#ef4444" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="breakdown-card" style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid var(--border-color)" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "1.5rem" }}><i className="fa-solid fa-medal" style={{ color: "var(--primary-color)", marginRight: "10px" }}></i> Badges & Achievements</h3>
                <div className="badges-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                  <div className="badge-with-tooltip" data-tooltip="Pioneer: Complete your first project to unlock." style={{ textAlign: "center", padding: "1rem", borderRadius: "16px", background: stats.completed_projects >= 1 ? "#f0fdf4" : "var(--bg-secondary)", border: `1px solid ${stats.completed_projects >= 1 ? "#bbf7d0" : "var(--border-color)"}` }}>
                    <i className="fa-solid fa-trophy" style={{ fontSize: "1.5rem", color: stats.completed_projects >= 1 ? "#10b981" : "var(--text-secondary)", marginBottom: "8px" }}></i>
                    <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: stats.completed_projects >= 1 ? "#166534" : "var(--text-secondary)" }}>PIONEER</span>
                  </div>
                  <div className="badge-with-tooltip" data-tooltip="Elite: Maintain a 90+ Trust Score and complete at least 1 project." style={{ textAlign: "center", padding: "1rem", borderRadius: "16px", background: (stats.score >= 90 && stats.completed_projects >= 1) ? "#eff6ff" : "var(--bg-secondary)", border: `1px solid ${(stats.score >= 90 && stats.completed_projects >= 1) ? "#bfdbfe" : "var(--border-color)"}` }}>
                    <i className="fa-solid fa-shield-heart" style={{ fontSize: "1.5rem", color: (stats.score >= 90 && stats.completed_projects >= 1) ? "#3b82f6" : "var(--text-secondary)", marginBottom: "8px" }}></i>
                    <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: (stats.score >= 90 && stats.completed_projects >= 1) ? "#1e40af" : "var(--text-secondary)" }}>ELITE</span>
                  </div>
                  <div className="badge-with-tooltip" data-tooltip="Punctual: Maintain an average delay of 0 days for all approved milestones." style={{ textAlign: "center", padding: "1rem", borderRadius: "16px", background: (stats.average_delay_days === 0 && stats.on_time_milestones >= 1) ? "#fff7ed" : "var(--bg-secondary)", border: `1px solid ${(stats.average_delay_days === 0 && stats.on_time_milestones >= 1) ? "#fed7aa" : "var(--border-color)"}` }}>
                    <i className="fa-solid fa-bolt-lightning" style={{ fontSize: "1.5rem", color: (stats.average_delay_days === 0 && stats.on_time_milestones >= 1) ? "#f59e0b" : "var(--text-secondary)", marginBottom: "8px" }}></i>
                    <span style={{ display: "block", fontSize: "0.75rem", fontWeight: "800", color: (stats.average_delay_days === 0 && stats.on_time_milestones >= 1) ? "#9a3412" : "var(--text-secondary)" }}>PUNCTUAL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

