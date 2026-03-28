"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/backend";
import MetaMaskConnect from "@/components/wallet/MetaMaskConnect";
import ProfileMenu from "@/components/ProfileMenu/ProfileMenu";
import ChatButton from "@/components/chat/ChatButton";

const ProjectsMap = dynamic(() => import("./ProjectsMap"), {
  ssr: false,
  loading: () => (
    <div
      className="map-container"
      style={{
        height: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#ff4757",
        background: "#d1d9e6",
        borderRadius: "16px",
        boxShadow: "inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.85rem",
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: "0.08em"
      }}
    >
      <i className="fa-solid fa-spinner fa-spin" style={{ marginBottom: 12, fontSize: "1.5rem" }}></i>
      Syncing Blockchain Map Data...
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

function formatInrWhole(amountStr) {
  try {
    const bi = BigInt(amountStr || "0");
    const max = BigInt(Number.MAX_SAFE_INTEGER);
    if (bi > max) return `₹${bi.toLocaleString("en-IN")}`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(Number(bi));
  } catch {
    return "—";
  }
}

const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "budget_desc", label: "Budget: High → Low" },
  { value: "budget_asc", label: "Budget: Low → High" },
  { value: "name_asc", label: "Name: A → Z" },
  { value: "name_desc", label: "Name: Z → A" },
  { value: "deadline_asc", label: "Deadline: Nearest" }
];

// All Indian States & UTs
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

/** Detect which Indian state appears in a location_address string */
function extractState(address) {
  if (!address) return null;
  const lower = address.toLowerCase();
  return INDIAN_STATES.find((s) => lower.includes(s.toLowerCase())) || null;
}

/**
 * Best-effort state resolver:
 * 1. Try extracting from the address string.
 * 2. Fall back to a previously reverse-geocoded result stored in resolvedStates map.
 */
function getProjectState(project, resolvedStates) {
  return extractState(project.location_address) || resolvedStates[project.id] || null;
}

/** Reverse-geocode a single project via BigDataCloud (free, no key required). */
async function reverseGeocodeState(lat, lng) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    // principalSubdivision = state name in English
    const subdivision = data?.principalSubdivision;
    if (!subdivision) return null;
    // Match to our known states to keep naming consistent
    const lower = subdivision.toLowerCase();
    return INDIAN_STATES.find((s) => s.toLowerCase() === lower || lower.includes(s.toLowerCase())) || subdivision;
  } catch {
    return null;
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

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [budgetMax, setBudgetMax] = useState(null);
  const [budgetFilter, setBudgetFilter] = useState(null);
  // project.id → resolved Indian state (from reverse geocoding)
  const [resolvedStates, setResolvedStates] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/projects/overview`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load overview");
        if (!cancelled) {
          setRaw(data);
          const projects = data?.projects || [];
          const max = Math.max(...projects.map((p) => Number(p.maximum_bid_amount) || 0), 0);
          setBudgetMax(max || null);
          setBudgetFilter(max || null);

          // Background: geocode projects whose address has no recognisable state
          const needsGeocode = projects.filter(
            (p) => !extractState(p.location_address) &&
                   p.location_lat != null && p.location_lng != null
          );
          if (needsGeocode.length > 0) {
            (async () => {
              const resolved = {};
              for (const p of needsGeocode) {
                if (cancelled) break;
                const state = await reverseGeocodeState(p.location_lat, p.location_lng);
                if (state) resolved[p.id] = state;
                // be polite to the free API
                await new Promise((r) => setTimeout(r, 120));
              }
              if (!cancelled && Object.keys(resolved).length > 0) {
                setResolvedStates((prev) => ({ ...prev, ...resolved }));
              }
            })();
          }
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredProjects = useMemo(() => {
    const list = raw?.projects || [];
    let result = list.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.location_address && p.location_address.toLowerCase().includes(q));
      const matchStatus = !statusFilter || p.display_status === statusFilter;
      const matchState = !stateFilter || getProjectState(p, resolvedStates) === stateFilter;
      const matchBudget =
        budgetFilter === null ||
        budgetMax === null ||
        Number(p.maximum_bid_amount) <= budgetFilter;
      return matchSearch && matchStatus && matchState && matchBudget;
    });

    if (sortBy === "budget_desc") {
      result = [...result].sort((a, b) => Number(b.maximum_bid_amount) - Number(a.maximum_bid_amount));
    } else if (sortBy === "budget_asc") {
      result = [...result].sort((a, b) => Number(a.maximum_bid_amount) - Number(b.maximum_bid_amount));
    } else if (sortBy === "name_asc") {
      result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sortBy === "name_desc") {
      result = [...result].sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sortBy === "deadline_asc") {
      result = [...result].sort((a, b) => {
        const da = a.project_deadline ? new Date(a.project_deadline).getTime() : Infinity;
        const db = b.project_deadline ? new Date(b.project_deadline).getTime() : Infinity;
        return da - db;
      });
    }
    return result;
  }, [raw, search, statusFilter, stateFilter, budgetFilter, budgetMax, sortBy, resolvedStates]);

  const stats = raw?.stats;
  const budgetChipActive = budgetFilter !== null && budgetMax !== null && budgetFilter < budgetMax;
  const activeFilterCount = [statusFilter, stateFilter, sortBy, budgetChipActive ? "budget" : ""].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter("");
    setStateFilter("");
    setSortBy("");
    setBudgetFilter(budgetMax);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <i className="fa-solid fa-link"></i> ClearFund
          </div>
          <div className="nav-controls" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div className="search-bar center-search">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="PROBE SYSTEM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ChatButton />
            {showWalletConnect && <MetaMaskConnect />}
            <ProfileMenu />
          </div>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className="filters-bar">
          <div className="filter-container">

            {/* Status Filter */}
            <div className="filter-pill-group">
              <i className="fa-solid fa-layer-group filter-pill-icon"></i>
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

            {/* State Filter */}
            <div className="filter-pill-group">
              <i className="fa-solid fa-map-location-dot filter-pill-icon"></i>
              <select
                id="filterState"
                className="filter-select"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="filter-pill-group">
              <i className="fa-solid fa-arrow-up-wide-short filter-pill-icon"></i>
              <select
                id="filterSort"
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Budget Range Slider */}
            {budgetMax !== null && budgetMax > 0 && (
              <div className="filter-slider-group">
                <i className="fa-solid fa-indian-rupee-sign" style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}></i>
                <span className="filter-slider-label">Budget ≤</span>
                <input
                  id="filterBudget"
                  type="range"
                  className="filter-slider"
                  min={0}
                  max={budgetMax}
                  step={Math.max(1, Math.round(budgetMax / 100))}
                  value={budgetFilter ?? budgetMax}
                  onChange={(e) => setBudgetFilter(Number(e.target.value))}
                />
                <span className="filter-slider-value">{formatInr(budgetFilter ?? budgetMax)}</span>
              </div>
            )}

            {/* Spacer */}
            <div className="filter-spacer" />

            {/* Active chips + clear */}
            <div className="filter-chips-row">
              {statusFilter && (
                <span className="filter-chip">
                  <i className={`fa-solid fa-circle filter-chip-dot status-dot-${statusFilter}`}></i>
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  <button className="filter-chip-remove" onClick={() => setStatusFilter("")}>×</button>
                </span>
              )}
              {stateFilter && (
                <span className="filter-chip">
                  <i className="fa-solid fa-map-location-dot"></i>
                  &nbsp;{stateFilter}
                  <button className="filter-chip-remove" onClick={() => setStateFilter("")}>×</button>
                </span>
              )}
              {sortBy && (
                <span className="filter-chip">
                  <i className="fa-solid fa-sort"></i>
                  &nbsp;{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                  <button className="filter-chip-remove" onClick={() => setSortBy("")}>×</button>
                </span>
              )}
              {budgetChipActive && (
                <span className="filter-chip">
                  <i className="fa-solid fa-coins"></i>
                  &nbsp;≤ {formatInr(budgetFilter)}
                  <button className="filter-chip-remove" onClick={() => setBudgetFilter(budgetMax)}>×</button>
                </span>
              )}
              {activeFilterCount > 0 && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                  <i className="fa-solid fa-xmark"></i> Clear all
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      <main className="container">
        <header className="page-header">
          <h1>{pageTitle}</h1>
          <p>{subtitle}</p>
        </header>

        {error && (
          <div className="empty-state" style={{ marginBottom: "2rem", border: "1px solid rgba(255, 71, 87, 0.3)", background: "rgba(255, 71, 87, 0.05)" }}>
            <h3 style={{ color: "#ff4757", fontFamily: "'JetBrains Mono', monospace", fontWeight: "800" }}>BUS ERROR / SYSTEM DISCONNECT</h3>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", fontWeight: "600" }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="stats-bar">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="stat-card" style={{ opacity: 0.5, boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }}>
                <div className="stat-icon grey">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                </div>
                <div className="stat-info">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>SYNCING</span>
                  <strong>—</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="stats-bar">
            <div className="stat-card">
              <div className="stat-icon grey"><i className="fa-solid fa-folder"></i></div>
              <div className="stat-info">
                <span>Total Projects</span>
                <strong>{stats?.total_projects ?? 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><i className="fa-solid fa-coins"></i></div>
              <div className="stat-info">
                <span>Total Budget</span>
                <strong>{formatInr(stats?.total_budget ?? 0)}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><i className="fa-solid fa-right-from-bracket"></i></div>
              <div className="stat-info">
                <span>Funds Released</span>
                <strong>{formatInrWhole(stats?.funds_released_inr)}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><i className="fa-solid fa-spinner fa-spin"></i></div>
              <div className="stat-info">
                <span>Ongoing</span>
                <strong>{stats?.ongoing ?? 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><i className="fa-solid fa-gavel"></i></div>
              <div className="stat-info">
                <span>Bidding</span>
                <strong>{stats?.bidding ?? 0}</strong>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><i className="fa-solid fa-check"></i></div>
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
                  : "Try adjusting search or filters."}
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
                    else if (i === done && p.display_status === "ongoing") cls += " current";
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
                  <span className={`badge ${p.display_status}`}>{p.display_status}</span>
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
                  <i className="fa-brands fa-ethereum" style={{ marginRight: 8, color: "var(--accent-blue, #ff4757)" }}></i>
                  {formatInrWhole(p.funds_released_inr)}
                </div>
                <div className="status-snapshot" style={{ marginTop: "0.5rem" }}>
                  <strong>Current phase</strong>
                  {p.current_phase}
                </div>
                {p.project_deadline && (
                  <div className="status-snapshot" style={{ marginTop: "0.5rem" }}>
                    <strong>Implementation Deadline</strong>
                    <i className="fa-regular fa-calendar-check" style={{ marginRight: 8, color: "var(--accent-green)" }}></i>
                    {new Date(p.project_deadline).toLocaleDateString()}
                  </div>
                )}

                {/* Milestone Proofs */}
                {p.milestones && p.milestones.some(m => m.proofs?.length > 0) && (
                    <div className="proofs-section" style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "2px solid #babecc", boxShadow: "0 1px 0 #ffffff" }}>
                        <strong style={{ fontSize: "0.7rem", color: "var(--text-secondary)", display: "block", marginBottom: "0.75rem", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: "800" }}>Evidence Logs / On-Chain Datalinks</strong>
                        {p.milestones.filter(m => m.proofs?.length > 0).map(m => (
                            <div key={m.milestone_index} style={{ marginBottom: "0.75rem", fontSize: "0.75rem" }}>
                                <span style={{ fontWeight: "800", color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>MODULE {m.milestone_index + 1}:</span>
                                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "6px" }}>
                                    {m.proofs.map((proofObj, i) => {
                                        const { hash, status } = proofObj;
                                        let bg = "#e0e5ec", text = "#4a5568", shadow = "4px 4px 8px #babecc, -4px -4px 8px #ffffff", icon = "fa-file-code", label = "DATA";
                                        if (status === "Accepted") { text = "#27ae60"; icon = "fa-check-double"; label = "VERIFIED"; }
                                        else if (status === "Rejected") { text = "#ff4757"; icon = "fa-triangle-exclamation"; label = "INVALID"; }
                                        
                                        return (
                                          <a key={i} href={`https://gateway.pinata.cloud/ipfs/${hash}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", background: bg, color: text, borderRadius: "6px", textDecoration: "none", fontSize: "0.65rem", fontWeight: "800", fontFamily: "'JetBrains Mono', monospace", boxShadow: shadow, transition: "all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)" }} onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "5px 5px 10px #babecc, -5px -5px 10px #ffffff" }} onMouseOut={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = shadow }} title={`${label} PINATA LINK`}>
                                              <i className={`fa-solid ${icon}`}></i> {label}
                                          </a>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
