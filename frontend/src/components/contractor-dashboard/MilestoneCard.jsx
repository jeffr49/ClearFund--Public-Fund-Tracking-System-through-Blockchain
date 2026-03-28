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
  apiBase,
  isNext
}) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const uploadAndSubmit = async () => {
    if (!files || files.length === 0) {
      setError("Select at least one file first.");
      return;
    }
    if (!contractAddress) {
      setError("Project contract address is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const hashes = [];
      for (const f of files) {
        const formData = new FormData();
        formData.append("file", f);

        const uploadRes = await fetch(`${apiBase}/contractor/upload`, {
          method: "POST",
          body: formData
        });
        if (!uploadRes.ok) {
          throw new Error("IPFS upload failed");
        }
        const { ipfsHash } = await uploadRes.json();
        hashes.push(ipfsHash);
      }
      
      const ipfsHash = hashes.join(',');

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
      case "NOT_SUBMITTED": return { label: "Pending", bg: "#f1f5f9", color: "#64748b" };
      case "UNDER_REVIEW": return { label: "Under Review", bg: "#fef9c3", color: "#854d0e" };
      case "APPROVED": return { label: "Completed", bg: "#dcfce7", color: "#16a34a" };
      case "REJECTED": return { label: "Rejected", bg: "#fee2e2", color: "#991b1b" };
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

      {milestone.ipfsUrls && milestone.ipfsUrls.length > 0 ? (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {milestone.ipfsUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className={styles.proofLink}>
              View uploaded proof {i + 1}
            </a>
          ))}
        </div>
      ) : null}

      {(milestone.status === 'NOT_SUBMITTED' || milestone.status === 'REJECTED') && isNext && (
        <div className={styles.actionRow}>
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files) || [])} />
          <button onClick={uploadAndSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : milestone.ipfsHash ? "Resubmit Proof" : "Submit Proof"}
          </button>
        </div>
      )}
      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
