"use client";

import { useState, useEffect } from "react";
import SidebarLayout from "@/components/sidebar-layout/SidebarLayout";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const DEFAULT_WALLET = "0x12a9...bc4"; // Fallback for simulation

export default function ContractorStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        let wallet = DEFAULT_WALLET;
        const storedUser = sessionStorage.getItem("clearfund_user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.wallet_address) wallet = user.wallet_address;
        }

        const res = await fetch(`${API_BASE}/contractor/stats?wallet=${encodeURIComponent(wallet)}`);
        if (!res.ok) throw new Error("Failed to fetch contractor statistics.");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const getReputationLabel = (score) => {
    if (score >= 90) return "Excellent Reputation";
    if (score >= 75) return "Highly Reliable";
    if (score >= 50) return "Average Performance";
    return "Needs Improvement";
  };

  const scoreColor = stats?.score >= 80 ? "#10b981" : (stats?.score >= 50 ? "#f59e0b" : "#ef4444");

  return (
    <SidebarLayout role="contractor">
      <div className="container">
        <header className="page-header">
          <h1>Contractor Performance Analytics</h1>
          <p>Your real-time trust score, efficiency metrics, and financial performance overview.</p>
        </header>

        {loading ? (
          <div className="empty-state"><i className="fa-solid fa-spinner fa-spin"></i><h3>Calculating your stats...</h3></div>
        ) : error ? (
          <div className="empty-state"><i className="fa-solid fa-circle-exclamation"></i><h3>Error</h3><p>{error}</p></div>
        ) : (
          <div className="stats-dashboard">
            <div className="stats-main-row">
              <div className="stats-card-premium score-card">
                <div className="score-circle" style={{ "--score-color": scoreColor, "--score-percent": `${stats.score}%` }}>
                  <div className="score-inner">
                    <span className="score-value">{stats.score}</span>
                    <span className="score-label">Trust Score</span>
                  </div>
                </div>
                <div className="score-meta">
                  <p>{getReputationLabel(stats.score)}</p>
                  <small>Based on on-time completions and project success rate.</small>
                </div>
              </div>

              <div className="stats-grid-mini">
                <div className="stat-mini-card">
                  <div className="icon-wrap blue"><i className="fa-solid fa-diagram-project"></i></div>
                  <div className="info-wrap">
                    <span>Projects Completed</span>
                    <strong>{stats.completed_projects} / {stats.total_projects}</strong>
                  </div>
                </div>
                <div className="stat-mini-card">
                  <div className="icon-wrap green"><i className="fa-solid fa-sack-dollar"></i></div>
                  <div className="info-wrap">
                    <span>Total Earnings</span>
                    <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact' }).format(stats.total_earnings_wei / 1e18 || 0)}</strong>
                  </div>
                </div>
                <div className="stat-mini-card">
                  <div className="icon-wrap orange"><i className="fa-solid fa-clock"></i></div>
                  <div className="info-wrap">
                    <span>Avg. Milestone Delay</span>
                    <strong>{stats.average_delay_days} Days</strong>
                  </div>
                </div>
                <div className="stat-mini-card">
                  <div className="icon-wrap purple"><i className="fa-solid fa-check-double"></i></div>
                  <div className="info-wrap">
                    <span>Milestones On-Time</span>
                    <strong>{stats.total_milestones > 0 ? Math.round((stats.on_time_milestones / stats.total_milestones) * 100) : 0}%</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-breakdown-row">
              <div className="breakdown-card">
                <h3><i className="fa-solid fa-bolt"></i> Milestone Efficiency</h3>
                <div className="efficiency-bar-container">
                  <div className="eff-row">
                    <span>On-Time</span>
                    <div className="bar-bg">
                      <div 
                        className="bar-fill ontime" 
                        style={{ width: `${stats.total_milestones > 0 ? (stats.on_time_milestones / stats.total_milestones) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="val">{stats.on_time_milestones}</span>
                  </div>
                  <div className="eff-row">
                    <span>Delayed</span>
                    <div className="bar-bg">
                      <div 
                        className="bar-fill delayed" 
                        style={{ width: `${stats.total_milestones > 0 ? (stats.delayed_milestones / stats.total_milestones) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="val">{stats.delayed_milestones}</span>
                  </div>
                </div>
              </div>

              <div className="breakdown-card">
                <h3><i className="fa-solid fa-medal"></i> Badges & Achievements</h3>
                <div className="badges-grid">
                  {stats.completed_projects >= 1 ? (
                    <div className="badge-item active" title="Completed at least one project"><i className="fa-solid fa-trophy"></i><span>Pioneer</span></div>
                  ) : (
                    <div className="badge-item inactive"><i className="fa-solid fa-trophy"></i><span>Pioneer</span></div>
                  )}
                  {stats.score >= 90 ? (
                    <div className="badge-item active" title="Trust score above 90"><i className="fa-solid fa-shield-heart"></i><span>Elite</span></div>
                  ) : (
                    <div className="badge-item inactive"><i className="fa-solid fa-shield-heart"></i><span>Elite</span></div>
                  )}
                  {stats.average_delay_days === 0 && stats.total_milestones > 0 ? (
                    <div className="badge-item active" title="Zero delays on all milestones"><i className="fa-solid fa-bolt-lightning"></i><span>Punctual</span></div>
                  ) : (
                    <div className="badge-item inactive"><i className="fa-solid fa-bolt-lightning"></i><span>Punctual</span></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
