"use client";

import { useRouter } from "next/navigation";
import styles from "../../placeholder.module.css";

export default function GovDashboard() {
  const router = useRouter();

  return (
    <div className={styles.placeholderPage}>
      <div className={styles.icon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="20" width="20" height="2"></rect>
          <rect x="4" y="10" width="16" height="10"></rect>
          <path d="M12 2L2 8v2h20V8L12 2z"></path>
          <path d="M12 10v10"></path>
          <path d="M8 10v10"></path>
          <path d="M16 10v10"></path>
        </svg>
      </div>
      <h1 className={styles.title}>Government Dashboard</h1>
      <div className={styles.roleBadge}>
        <span className={styles.roleDot}></span>
        government
      </div>
      <p className={styles.subtitle}>
        This is the government dashboard placeholder. Fund allocation, project
        oversight, and budget management features will appear here.
      </p>
      <button className={styles.walletBtn} onClick={() => window.location.href = "/dashboard/index.html?role=government"}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path>
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
        </svg>
        Connect Hardware Wallet
      </button>
      <button className={styles.backBtn} onClick={() => router.push("/")} style={{ marginTop: "16px" }}>
        ← Back to Home
      </button>
    </div>
  );
}
