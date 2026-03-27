"use client";

import { useRouter } from "next/navigation";
import styles from "../../placeholder.module.css";

export default function PublicDashboard() {
  const router = useRouter();

  return (
    <div className={styles.placeholderPage}>
      <div className={styles.icon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <h1 className={styles.title}>Public Dashboard</h1>
      <div className={styles.roleBadge}>
        <span className={styles.roleDot}></span>
        public
      </div>
      <p className={styles.subtitle}>
        This is the public dashboard placeholder. Project browsing, fund
        tracking, and transparency reports will appear here.
      </p>
      <button className={styles.backBtn} onClick={() => router.push("/")}>
        ← Back to Home
      </button>
    </div>
  );
}
