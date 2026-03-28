"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MetaMaskConnect from "@/components/wallet/MetaMaskConnect";

function GateInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role") || "public";
  const [isVerified, setIsVerified] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem("clearfund_user");
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);
      
      // AUTO-REDIRECT: Public role does not require wallet verification gate
      if (role === "public") {
        router.push(`/dashboard?role=public`);
      }
    } else if (role !== "public") {
      router.push("/");
    }
  }, [role, router]);

  const goToDashboard = () => {
    router.push(`/dashboard?role=${role}`);
  };

  return (
    <div
      className="gate-screen"
      style={{
        minHeight: "100vh",
        background: "#e0e5ec",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        className="gate-card"
        style={{
          background: "#e0e5ec",
          backgroundImage: "radial-gradient(circle at 16px 16px, rgba(0,0,0,0.12) 2.5px, transparent 3.5px), radial-gradient(circle at calc(100% - 16px) 16px, rgba(0,0,0,0.12) 2.5px, transparent 3.5px), radial-gradient(circle at 16px calc(100% - 16px), rgba(0,0,0,0.12) 2.5px, transparent 3.5px), radial-gradient(circle at calc(100% - 16px) calc(100% - 16px), rgba(0,0,0,0.12) 2.5px, transparent 3.5px)",
          padding: "3.5rem",
          borderRadius: "20px",
          boxShadow: "12px 12px 24px #babecc, -12px -12px 24px #ffffff, inset 1px 1px 0 rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.4)",
          maxWidth: "500px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <div
          className="logo"
          style={{
            fontSize: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
            color: "var(--accent-primary)",
            fontWeight: "800"
          }}
        >
          <i className="fa-solid fa-link" style={{ marginRight: "10px" }}></i>
          ClearFund
        </div>

        <div
          className="gate-icon"
          style={{
            width: "80px",
            height: "80px",
            background: "#e0e5ec",
            color: "#ff4757",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 2rem",
            boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff, 0 0 0 3px #ff4757, 0 0 14px rgba(255,71,87,0.4)"
          }}
        >
          <i
            className={`fa-solid ${
              role === "contractor"
                ? "fa-helmet-safety"
                : role === "government"
                  ? "fa-building-columns"
                  : "fa-user-shield"
            }`}
          ></i>
        </div>

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: "800",
            marginBottom: "1rem",
            color: "var(--text-primary)"
          }}
        >
          Wallet Verification
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: "2.5rem",
            lineHeight: "1.6"
          }}
        >
          Welcome back, {user?.name || "Official"}.
          <br />
          Please verify your MetaMask identity to access the{" "}
          <strong>{(role || "public").toUpperCase()}</strong> workspace.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            alignItems: "center",
            width: "100%"
          }}
        >
          <MetaMaskConnect onVerified={setIsVerified} />

          {isVerified && (
            <button
              type="button"
              className="primary-btn"
              style={{
                width: "100%",
                padding: "1rem",
                borderRadius: "10px",
                background: "#ff4757",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontWeight: "800",
                fontSize: "0.85rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
                cursor: "pointer",
                boxShadow: "4px 4px 8px rgba(166,50,60,0.5), -4px -4px 8px rgba(255,120,130,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                transition: "all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}
              onClick={goToDashboard}
            >
              Enter Workspace →
            </button>
          )}

          <button
            type="button"
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "#4a5568",
              fontSize: "0.8rem",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
              marginTop: "1rem"
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DedicatedGatePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b"
          }}
        >
          Loading…
        </div>
      }
    >
      <GateInner />
    </Suspense>
  );
}
