import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./pretty-dashboard.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

function SidebarLoadingFallback() {
  return (
    <div className="app-layout" style={{ minHeight: "100vh" }}>
      <aside
        className="role-sidebar"
        style={{ opacity: 0.85, pointerEvents: "none" }}
        aria-hidden
      />
      <div
        className="main-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#64748b"
        }}
      >
        Loading…
      </div>
    </div>
  );
}

export default function SidebarSegmentLayout({ children }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <div className={`${inter.className} clearfund-sidebar-root`}>
        <Suspense fallback={<SidebarLoadingFallback />}>{children}</Suspense>
      </div>
    </>
  );
}
