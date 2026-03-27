"use client";

import { useRouter } from "next/navigation";
import styles from "../placeholder.module.css";

export default function ApproverDashboard() {
  const router = useRouter();

  return (
    <div className={styles.placeholderPage}>
      <div className={styles.icon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <h1 className={styles.title}>Approver Dashboard</h1>
      <div className={styles.roleBadge}>
        <span className={styles.roleDot}></span>
        approver
      </div>
      <p className={styles.subtitle}>
        This is the approver dashboard placeholder. Milestone verification,
        fund release approvals, and audit trail features will appear here.
      </p>
      <button className={styles.walletBtn} onClick={() => alert("Hardware Wallet connection flow initiated...")}>
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
