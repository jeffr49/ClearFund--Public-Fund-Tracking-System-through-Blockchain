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
      setUser(JSON.parse(userStr));
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
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--font-family)"
      }}
    >
      <div
        className="gate-card"
        style={{
          background: "var(--bg-card)",
          padding: "3.5rem",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
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
            background: "var(--accent-light)",
            color: "var(--accent-primary)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto 2rem"
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
                borderRadius: "var(--radius-md)",
                background: "var(--accent-primary)",
                color: "#FFFFFF",
                border: "none",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                transition: "all 0.2s"
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
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
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
