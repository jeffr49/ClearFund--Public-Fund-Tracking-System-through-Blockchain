"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import styles from "./contractorDashboard.module.css";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ContractorDashboard({ initialWallet = "" }) {
  const [wallet, setWallet] = useState(initialWallet);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasWallet = useMemo(() => wallet.trim().length > 0, [wallet]);

  useEffect(() => {
    if (!hasWallet) return;
    fetchProjects();
  }, [wallet, hasWallet]);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/contractor/projects?wallet=${encodeURIComponent(wallet)}`
      );
      if (!res.ok) {
        throw new Error("Failed to load contractor projects");
      }
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Contractor Dashboard</h1>
        <p>Track assigned projects, milestone submissions, and review progress.</p>
      </header>

      <section className={styles.walletBar}>
        <input
          value={wallet}
          onChange={(e) => setWallet(e.target.value)}
          className={styles.walletInput}
          placeholder="Contractor wallet address"
        />
        <button onClick={fetchProjects} className={styles.refreshBtn} disabled={!hasWallet}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </section>

      {!hasWallet ? (
        <div className={styles.emptyState}>Enter your wallet to load assigned projects.</div>
      ) : null}
      {loading ? <div className={styles.emptyState}>Loading projects...</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}
      {!loading && hasWallet && !error && projects.length === 0 ? (
        <div className={styles.emptyState}>No assigned projects found for this wallet.</div>
      ) : null}

      <section className={styles.list}>
        {projects.map((project) => (
          <ProjectCard key={project.project_id} project={project} apiBase={API_BASE} />
        ))}
      </section>
    </div>
  );
}
