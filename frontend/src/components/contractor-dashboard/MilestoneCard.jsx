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

  return (
    <div className={styles.milestoneCard}>
      <div className={styles.milestoneRow}>
        <h4>Milestone {milestone.index}</h4>
        <span className={styles.status}>{milestone.status}</span>
      </div>
      <p>{milestone.description || "No milestone description."}</p>
      <p>Amount: {milestone.amount}</p>
      <p>Deadline: {new Date(milestone.deadline).toLocaleDateString()}</p>

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
