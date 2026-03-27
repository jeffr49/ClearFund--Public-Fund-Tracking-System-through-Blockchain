"use client";

import { useRouter } from "next/navigation";
import styles from "../placeholder.module.css";

export default function ContractorDashboard() {
  const router = useRouter();

  return (
    <div className={styles.placeholderPage}>
      <div className={styles.icon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      </div>
      <h1 className={styles.title}>Contractor Dashboard</h1>
      <div className={styles.roleBadge}>
        <span className={styles.roleDot}></span>
        contractor
      </div>
      <p className={styles.subtitle}>
        This is the contractor dashboard placeholder. Project bids, milestone
        submissions, and payment tracking features will appear here.
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
