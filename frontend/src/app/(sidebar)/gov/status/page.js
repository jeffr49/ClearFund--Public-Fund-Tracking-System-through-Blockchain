"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "@/lib/backend";
import styles from "./status.module.css";

const formatCurrency = (value) => {
  const n = Number(value || 0);
  if (Number.isNaN(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
};

const formatNumber = (value) => {
  const n = Number(value || 0);
  if (!isFinite(n)) return "0";
  return new Intl.NumberFormat("en-IN").format(n);
};

const csvEscape = (value) => {
  if (value === null || value === undefined) return "";
  const safe = String(value).replace(/"/g, '""');
  if (safe.includes(",") || safe.includes("\n") || safe.includes("\r")) {
    return `"${safe}"`;
  }
  return safe;
};

const GovStatusAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch(`${API_BASE}/projects/overview`);
        if (!resp.ok) {
          const body = await resp.json().catch(() => ({}));
          throw new Error(body.error || "Failed to load project overview");
        }

        const data = await resp.json();

        if (!cancelled) {
          setOverview(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const csv = useMemo(() => {
    if (!overview?.projects?.length) return "";

    const headers = [
      "id",
      "title",
      "status",
      "display_status",
      "maximum_bid_amount",
      "funds_released_inr",
      "total_milestones",
      "completed_milestones",
      "current_phase",
      "project_deadline",
      "bidding_deadline",
      "contractor_wallet",
      "contract_address",
      "location_address",
      "created_at"
    ];

    const rows = overview.projects.map((p) => [
      p.id,
      p.title,
      p.status,
      p.display_status,
      p.maximum_bid_amount,
      p.funds_released_inr,
      p.total_milestones,
      p.completed_milestones,
      p.current_phase,
      p.project_deadline,
      p.bidding_deadline,
      p.contractor_wallet,
      p.contract_address,
      p.location_address,
      p.created_at
    ]);

    const csvLines = [headers.join(",")].concat(rows.map((row) => row.map(csvEscape).join(",")));
    return csvLines.join("\n");
  }, [overview]);

  const copyCsvToClipboard = async () => {
    if (!csv) return;
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  const downloadCsv = () => {
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `clearfund-project-status-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Project Status Dashboard</h1>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1>Project Status Dashboard</h1>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  const stats = overview?.stats || {};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Government Project Status Dashboard</h1>
        <p>A data-first analytics view of public projects (from Supabase + on-chain events)</p>
      </header>

      <section className={styles.cards}>
        <article className={styles.card}>
          <h3>Total Projects</h3>
          <span>{formatNumber(stats.total_projects)}</span>
        </article>
        <article className={styles.card}>
          <h3>Bidding</h3>
          <span>{formatNumber(stats.bidding)}</span>
        </article>
        <article className={styles.card}>
          <h3>Ongoing</h3>
          <span>{formatNumber(stats.ongoing)}</span>
        </article>
        <article className={styles.card}>
          <h3>Completed</h3>
          <span>{formatNumber(stats.completed)}</span>
        </article>
        <article className={styles.card}>
          <h3>Total Budget</h3>
          <span>{formatCurrency(stats.total_budget)}</span>
        </article>
        <article className={styles.card}>
          <h3>Funds Released</h3>
          <span>{formatCurrency(stats.funds_released_inr)}</span>
        </article>
      </section>

      <section className={styles.actions}>
        <button className={styles.button} onClick={copyCsvToClipboard} disabled={!csv}>
          {copied ? "CSV Copied" : "Copy CSV"}
        </button>
        <button className={styles.button} onClick={downloadCsv} disabled={!csv}>
          Download CSV
        </button>
      </section>

      <section className={styles.tableWrapper}>
        <h2>Project Records</h2>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Phase</th>
                <th>Max Budget</th>
                <th>Funds Released</th>
                <th>Milestones</th>
                <th>Completed</th>
                <th>Gov Wallet</th>
                <th>Contractor</th>
                <th>Deadline</th>
                <th>Bidding Deadline</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {overview.projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.display_status}</td>
                  <td>{p.current_phase}</td>
                  <td>{formatCurrency(p.maximum_bid_amount)}</td>
                  <td>{formatCurrency(p.funds_released_inr)}</td>
                  <td>{formatNumber(p.total_milestones)}</td>
                  <td>{formatNumber(p.completed_milestones)}</td>
                  <td>{p.government_wallet || "-"}</td>
                  <td>{p.contractor_wallet || "-"}</td>
                  <td>{p.project_deadline ? new Date(p.project_deadline).toLocaleDateString() : "-"}</td>
                  <td>{p.bidding_deadline ? new Date(p.bidding_deadline).toLocaleDateString() : "-"}</td>
                  <td>{p.location_address || "-"}</td>
                </tr>
              ))}
              {!overview.projects.length && (
                <tr>
                  <td colSpan={12} style={{ textAlign: "center" }}>
                    No projects available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default GovStatusAnalytics;
