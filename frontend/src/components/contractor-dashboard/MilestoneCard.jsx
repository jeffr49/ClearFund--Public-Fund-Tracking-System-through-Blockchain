"use client";

import { useState } from "react";
import { ethers } from "ethers";
import styles from "./contractorDashboard.module.css";

const ESCROW_ABI = [
  "function submitProof(uint256 milestoneId, string calldata ipfsHash) external"
];

export default function MilestoneCard({
  milestone,
  contractAddress,
  onSubmitted,
  apiBase
}) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uploadAndSubmit = async () => {
    if (!file) {
      setError("Select a file first.");
      return;
    }
    if (!contractAddress) {
      setError("Project contract address is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${apiBase}/contractor/upload`, {
        method: "POST",
        body: formData
      });
      if (!uploadRes.ok) {
        throw new Error("IPFS upload failed");
      }
      const { ipfsHash } = await uploadRes.json();

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(contractAddress, ESCROW_ABI, signer);
      const tx = await contract.submitProof(milestone.index, ipfsHash);
      await tx.wait();

      onSubmitted();
    } catch (err) {
      setError(err.message || "Proof submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const label =
    milestone.title?.trim() ||
    milestone.description?.trim() ||
    `Milestone ${milestone.index}`;

  const getStatusInfo = (s) => {
    switch (s) {
      case "yet_to_start": return { label: "Yet to Start", bg: "#f1f5f9", color: "#64748b" };
      case "working": return { label: "In Progress", bg: "#e0f2fe", color: "#0284c7" };
      case "completed": return { label: "Completed", bg: "#dcfce7", color: "#16a34a" };
      case "deadline_extended": return { label: "Deadline Extended", bg: "#fef3c7", color: "#d97706" };
      default: return { label: s || "Pending", bg: "#f1f5f9", color: "#64748b" };
    }
  };
  const statusInfo = getStatusInfo(milestone.status);
  const deadlineLabel =
    milestone.deadline &&
      !Number.isNaN(new Date(milestone.deadline).getTime())
      ? new Date(milestone.deadline).toLocaleDateString("en-IN")
      : "—";

  return (
    <div className={styles.milestoneCard}>
      <div className={styles.milestoneRow}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h4>
            #{milestone.index + 1} · {label}
          </h4>
          <span
            style={{
              background: statusInfo.bg,
              color: statusInfo.color,
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: "800",
              textTransform: "uppercase",
              border: `1px solid ${statusInfo.color}30`
            }}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>
      {milestone.title && milestone.description ? (
        <p className={styles.meta}>{milestone.description}</p>
      ) : null}
      <p>
        Amount (INR):{" "}
        {milestone.amount != null && milestone.amount !== ""
          ? Number(milestone.amount).toLocaleString("en-IN")
          : "—"}
      </p>
      <p>Deadline: {deadlineLabel}</p>

      {milestone.ipfsUrl ? (
        <a href={milestone.ipfsUrl} target="_blank" rel="noreferrer" className={styles.proofLink}>
          View uploaded proof
        </a>
      ) : null}

      <div className={styles.actionRow}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={uploadAndSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : milestone.ipfsHash ? "Resubmit Proof" : "Submit Proof"}
        </button>
      </div>
      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
