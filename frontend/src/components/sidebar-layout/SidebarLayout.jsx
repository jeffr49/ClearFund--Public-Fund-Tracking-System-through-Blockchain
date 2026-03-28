"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Link2 } from "lucide-react";
import { SIDEBAR_NAV } from "./sidebarNav";

const ROLE_LABEL = {
  government: "government",
  contractor: "contractor",
  approver: "approver",
  public: "public"
};

function isSidebarLinkActive(pathname, searchParams, href) {
  if (!href) return false;
  const [path, queryString] = href.split("?");
  if (path === "/gov/create") {
    return pathname === "/gov/create";
  }
  if (path === "/dashboard") {
    const q = new URLSearchParams(queryString || "");
    const role = q.get("role") || "public";
    return pathname === "/dashboard" && (searchParams.get("role") || "public") === role;
  }
  return pathname === path;
}

export default function SidebarLayout({ role, children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = SIDEBAR_NAV[role] || SIDEBAR_NAV.public;

  return (
    <div className="app-layout">
      <aside className="role-sidebar" aria-label="Role navigation">
        <div className="sidebar-header">
          <Link href="/" className="sidebar-brand">
            <Link2 size={24} style={{ color: "var(--accent-blue)" }} />
            ClearFund
          </Link>
          <div className="sidebar-role-badge">
            {(ROLE_LABEL[role] || role) + " panel"}
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {items.map((item) => {
              const active = item.href && isSidebarLinkActive(pathname, searchParams, item.href);
              if (item.soon || !item.href) {
                return (
                  <li
                    key={item.label}
                    className="sidebar-item soon"
                    title="Feature currently in development"
                  >
                    <span>{item.label}</span>
                    <small className="soon-tag">soon</small>
                  </li>
                );
              }
              return (
                <li key={item.label}>
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
          <Link href="/" className="sidebar-item" style={{ padding: "0.5rem 0", background: "none" }}>
            ← Sign out
          </Link>
        </div>
      </aside>

      <div className="main-content">{children}</div>
    </div>
  );
}
