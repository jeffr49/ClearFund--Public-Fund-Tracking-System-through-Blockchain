"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/backend";
import MetaMaskConnect from "@/components/wallet/MetaMaskConnect";
import ProfileMenu from "@/components/ProfileMenu/ProfileMenu";

const ProjectsMap = dynamic(() => import("./ProjectsMap"), {
  ssr: false,
  loading: () => (
    <div
      className="map-container"
      style={{
        height: 420,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)"
      }}
    >
      <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 10 }}></i> Loading map…
    </div>
  )
});

function formatInr(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(n) || 0);
}

/** Whole rupees from API (FUNDS_RELEASED sum; on-chain INR units). */
function formatInrWhole(amountStr) {
  try {
    const bi = BigInt(amountStr || "0");
    const max = BigInt(Number.MAX_SAFE_INTEGER);
    if (bi > max) {
      return `₹${bi.toLocaleString("en-IN")}`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(bi));
  } catch {
    return "—";
  }
}

export default function ProjectsLedgerOverview({
  pageTitle = "Public Projects Ledger",
  subtitle = "Real-time blockchain-verified tracking of public funds and project milestones.",
  showWalletConnect = false
}) {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/projects/overview`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load overview");
        if (!cancelled) setRaw(data);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    const list = raw?.projects || [];
    return list.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.location_address && p.location_address.toLowerCase().includes(q));
      const matchStatus =
        !statusFilter || p.display_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [raw, search, statusFilter]);

  const stats = raw?.stats;

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fa-solid fa-link"></i> ClearFund
          </div>
          <div className="nav-controls" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div className="search-bar center-search">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Search projects by name or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {showWalletConnect && <MetaMaskConnect />}
            <ProfileMenu />
          </div>
        </div>
        <div className="filters-bar">
          <div className="nav-container filter-container">
            <select
              id="filterStatus"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ongoing">Ongoing</option>
              <option value="bidding">Bidding</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </nav>

      <main className="container">
        <header className="page-header">
          <h1>{pageTitle}</h1>
          <p>{subtitle}</p>
        </header>

        {error && (
          <div className="empty-state" style={{ marginBottom: "1.5rem" }}>
            <h3>Could not load data</h3>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="stats-bar">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="stat-card" style={{ opacity: 0.6 }}>
                <div className="stat-icon grey">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
                <div className="stat-info">
                  <span>Loading</span>
                  <strong>—</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-icon grey">
                <i className="fa-solid fa-folder"></i>
              </div>
              <div className="stat-info">
                <span>Total Projects</span>
                <strong>{stats?.total_projects ?? 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">
                <i className="fa-solid fa-coins"></i>
              </div>
              <div className="stat-info">
                <span>Total Budget</span>
                <strong>{formatInr(stats?.total_budget ?? 0)}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <i className="fa-solid fa-right-from-bracket"></i>
              </div>
              <div className="stat-info">
                <span>Funds Released</span>
                <strong>{formatInrWhole(stats?.funds_released_inr)}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue">
                <i className="fa-solid fa-spinner fa-spin"></i>
              </div>
              <div className="stat-info">
                <span>Ongoing</span>
                <strong>{stats?.ongoing ?? 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">
                <i className="fa-solid fa-gavel"></i>
              </div>
              <div className="stat-info">
                <span>Bidding</span>
                <strong>{stats?.bidding ?? 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <i className="fa-solid fa-check"></i>
              </div>
              <div className="stat-info">
                <span>Completed</span>
                <strong>{stats?.completed ?? 0}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="map-wrapper">
          <ProjectsMap projects={filteredProjects} />
          <div className="map-legend">
            <div className="legend-item"><span className="legend-dot ongoing"></span> Ongoing</div>
            <div className="legend-item"><span className="legend-dot bidding"></span> Bidding</div>
            <div className="legend-item"><span className="legend-dot completed"></span> Completed</div>
          </div>
        </div>

        <div className="results-row">
          <p className="project-count">
            Showing <strong>{filteredProjects.length}</strong> of <strong>{raw?.projects?.length ?? 0}</strong> projects
          </p>
        </div>

        <div className="project-grid">
          {filteredProjects.length === 0 && !loading && (
            <div className="empty-state">
              <h3>No projects found</h3>
              <p style={{ color: "var(--text-secondary)" }}>
                {raw?.projects?.length === 0
                  ? "Create a project from the government console when you are ready."
                  : "Try adjusting search or status filter."}
              </p>
            </div>
          )}

          {filteredProjects.map((p) => {
            const total = p.total_milestones || 0;
            const done = p.completed_milestones || 0;
            const segments =
              total > 0
                ? Array.from({ length: total }, (_, i) => {
                    let cls = "progress-segment";
                    if (i < done) cls += " completed";
                    else if (i === done && p.display_status === "ongoing")
                      cls += " current";
                    return <div key={i} className={cls} />;
                  })
                : [<div key="na" className="progress-segment" style={{ flex: 1 }} />];

            return (
              <div key={p.id} className="card" style={{ cursor: "default" }}>
                <div className="card-header">
                  <div>
                    <h3 className="card-title">{p.title}</h3>
                    <div className="card-meta">
                      <i className="fa-solid fa-location-dot" style={{ marginRight: 6 }}></i>
                      {p.location_address || "No address"}
                    </div>
                  </div>
                  <span className={`badge ${p.display_status}`}>
                    {p.display_status}
                  </span>
                </div>
                <div className="card-budget">{formatInr(p.maximum_bid_amount)}</div>
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Milestone progress</span>
                    <span>
                      {total > 0
                        ? `${done} / ${total} released`
                        : done > 0
                          ? `${done} on-chain release(s)`
                          : "—"}
                    </span>
                  </div>
                  <div className="progress-track">{segments}</div>
                </div>
                <div className="status-snapshot">
                  <strong>Funds released (on-chain)</strong>
                  <i className="fa-brands fa-ethereum" style={{ marginRight: 8, color: "var(--accent-blue)" }}></i>
                  {formatInrWhole(p.funds_released_inr)}
                </div>
                <div className="status-snapshot" style={{ marginTop: "0.5rem" }}>
                  <strong>Current phase</strong>
                  {p.current_phase}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
