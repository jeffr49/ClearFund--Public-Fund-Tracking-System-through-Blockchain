"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link2 } from "lucide-react";
import { SIDEBAR_NAV } from "./sidebarNav";
import styles from "./SidebarLayout.module.css";

const ROLE_LABEL = {
  government: "government",
  contractor: "contractor",
  approver: "approver",
  public: "public"
};

export default function SidebarLayout({ role, children }) {
  const pathname = usePathname();
  const items = SIDEBAR_NAV[role] || SIDEBAR_NAV.public;

  return (
    <div className="app-layout">
      <aside className="role-sidebar" aria-label="Role navigation">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand">
            <Link2 size={22} className={styles.brandIcon} />
            ClearFund
          </Link>
          <div className="sidebar-role-badge">
            {(ROLE_LABEL[role] || role) + " panel"}
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {items.map((item) => {
              const active = item.href && pathname === item.href;
              if (item.soon || !item.href) {
                return (
                  <li
                    key={item.label}
                    className={`sidebar-item ${styles.soon}`}
                    title="Coming in a later integration step"
                  >
                    <span>{item.label}</span>
                    <small className={styles.soonTag}>soon</small>
                  </li>
                );
              }
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-item ${active ? "active" : ""}`}
                  >
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <Link href="/" className={styles.signOut}>
            ← Sign out
          </Link>
        </div>
      </aside>

      <div className="main-content">{children}</div>
    </div>
  );
}
