"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ethers } from "ethers";
import { API_BASE } from "@/lib/backend";
import MetaMaskConnect from "@/components/wallet/MetaMaskConnect";
import styles from "./CreateProjectForm.module.css";

const DEFAULT_LEDGER = "/dashboard?role=government";
const LocationPickerMap = dynamic(() => import("@/components/gov/LocationPickerMap"), {
  ssr: false
});

export default function CreateProjectForm({ ledgerHref = DEFAULT_LEDGER } = {}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLat, setLocationLat] = useState("");
  const [locationLng, setLocationLng] = useState("");
  const [biddingDeadlineLocal, setBiddingDeadlineLocal] = useState("");
  const [projectDeadlineLocal, setProjectDeadlineLocal] = useState("");
  const [maximumBidAmount, setMaximumBidAmount] = useState("");
  const [governmentWallet, setGovernmentWallet] = useState("");
  const emptyMilestone = () => ({ title: "", description: "" });
  const [milestones, setMilestones] = useState([emptyMilestone()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const handleLocationConfirm = useCallback((place) => {
    setLocationAddress(place.address);
    setLocationLat(String(place.lat));
    setLocationLng(String(place.lng));
    setFieldErrors((current) => ({
      ...current,
      locationAddress: undefined,
      locationLat: undefined,
      locationLng: undefined
    }));
  }, []);

  const handleLocationClear = useCallback(() => {
    setLocationAddress("");
    setLocationLat("");
    setLocationLng("");
    setFieldErrors((current) => ({
      ...current,
      locationAddress: undefined,
      locationLat: undefined,
      locationLng: undefined
    }));
  }, []);

  const syncWalletFromMetaMask = useCallback(async () => {
    setError("");
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Install MetaMask to load your government wallet address.");
      return;
    }
    try {
      // Ensure user is on Sepolia (0xaa36a7)
      const SEPOLIA_CHAIN_ID = '0xaa36a7';
      const cId = await window.ethereum.request({ method: 'eth_chainId' });
      if (cId !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        await new Promise(res => setTimeout(res, 1000));
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setGovernmentWallet(await signer.getAddress());
    } catch (e) {
      setError(e?.shortMessage || e?.message || "Could not read wallet");
    }
  }, []);

  function validate() {
    const fe = {};
    if (!title.trim()) fe.title = "Title is required.";
    if (!locationAddress.trim()) fe.locationAddress = "Address is required.";
    const lat = Number(locationLat);
    const lng = Number(locationLng);
    if (!Number.isFinite(lat)) fe.locationLat = "Valid latitude required.";
    else if (lat < -90 || lat > 90) fe.locationLat = "Latitude must be between -90 and 90.";
    if (!Number.isFinite(lng)) fe.locationLng = "Valid longitude required.";
    else if (lng < -180 || lng > 180) fe.locationLng = "Longitude must be between -180 and 180.";
    if (!biddingDeadlineLocal) fe.biddingDeadline = "Bidding deadline is required.";
    if (!projectDeadlineLocal) fe.projectDeadline = "Project implementation deadline is required.";
    else if (new Date(projectDeadlineLocal) <= new Date(biddingDeadlineLocal)) {
      fe.projectDeadline = "Project deadline must be after bidding deadline.";
    }
    const maxBid = Number(maximumBidAmount);
    if (!Number.isFinite(maxBid) || maxBid <= 0) {
      fe.maximumBidAmount = "Enter a positive maximum bid amount.";
    }
    if (!governmentWallet.trim()) {
      fe.governmentWallet = "Connect MetaMask or paste a valid government wallet address.";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(governmentWallet.trim())) {
      fe.governmentWallet = "Must be a 0x-prefixed 40-hex Ethereum address.";
    }
    if (!milestones.length) {
      fe.milestones = "Add at least one milestone.";
    } else {
      for (let i = 0; i < milestones.length; i++) {
        const m = milestones[i];
        const has =
          (m.title && m.title.trim()) || (m.description && m.description.trim());
        if (!has) {
          fe.milestones = `Milestone ${i + 1}: enter a title and/or description.`;
          break;
        }
      }
    }
    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const deadlineIso = new Date(biddingDeadlineLocal).toISOString();
      const res = await fetch(`${API_BASE}/projects/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: {
            address: locationAddress.trim(),
            lat: Number(locationLat),
            lng: Number(locationLng)
          },
          biddingDeadline: deadlineIso,
          projectDeadline: new Date(projectDeadlineLocal).toISOString(),
          maximumBidAmount: Number(maximumBidAmount),
          governmentWallet: governmentWallet.trim(),
          milestones: milestones.map((m) => ({
            title: (m.title || "").trim(),
            description: (m.description || "").trim()
          }))
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Request failed (${res.status})`);
        return;
      }

      setSuccess("Project created. Redirecting to the ledger…");
      setTimeout(() => router.push(ledgerHref), 1200);
    } catch (err) {
      setError(err.message || "Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {success ? <div className={styles.successBanner}>{success}</div> : null}

      <div className={styles.sectionTitle}>Project details</div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-title">
          Title
        </label>
        <input
          id="cf-title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. District road resurfacing — Phase 2"
          disabled={submitting}
        />
        {fieldErrors.title ? (
          <span className={styles.fieldError}>{fieldErrors.title}</span>
        ) : null}
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-desc">
          Description
        </label>
        <textarea
          id="cf-desc"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Scope, objectives, and any evaluation criteria for bidders."
          disabled={submitting}
        />
      </div>

      <div className={styles.sectionTitle}>Location</div>
      <p className={styles.hint}>
        Paste coordinates manually or pick a place from the OpenStreetMap panel below. Address is stored for display and search.
      </p>

      <LocationPickerMap
        disabled={submitting}
        onConfirm={handleLocationConfirm}
        onClear={handleLocationClear}
      />

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-address">
          Address / area label
        </label>
        <input
          id="cf-address"
          className={styles.input}
          value={locationAddress}
          onChange={(e) => setLocationAddress(e.target.value)}
          placeholder="e.g. Block 4, Indiranagar, Bengaluru"
          disabled={submitting}
        />
        {fieldErrors.locationAddress ? (
          <span className={styles.fieldError}>{fieldErrors.locationAddress}</span>
        ) : null}
      </div>

      <div className={styles.row2}>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="cf-lat">
            Latitude
          </label>
          <input
            id="cf-lat"
            className={styles.input}
            inputMode="decimal"
            value={locationLat}
            onChange={(e) => setLocationLat(e.target.value)}
            placeholder="12.9716"
            disabled={submitting}
          />
          {fieldErrors.locationLat ? (
            <span className={styles.fieldError}>{fieldErrors.locationLat}</span>
          ) : null}
        </div>
        <div className={styles.group}>
          <label className={styles.label} htmlFor="cf-lng">
            Longitude
          </label>
          <input
            id="cf-lng"
            className={styles.input}
            inputMode="decimal"
            value={locationLng}
            onChange={(e) => setLocationLng(e.target.value)}
            placeholder="77.5946"
            disabled={submitting}
          />
          {fieldErrors.locationLng ? (
            <span className={styles.fieldError}>{fieldErrors.locationLng}</span>
          ) : null}
        </div>
      </div>

      <div className={styles.sectionTitle}>Milestones (authority-defined)</div>
      <p className={styles.hint}>
        Number each phase 1…n in order. Contractors only allocate their total bid across these
        milestones; rupee amounts are stored after a bid is selected.
      </p>

      {milestones.map((m, i) => (
        <div key={i} className={styles.milestoneBlock}>
          <div className={styles.milestoneBlockHead}>
            <span className={styles.milestoneNum}>Milestone {i + 1}</span>
            {milestones.length > 1 ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={() =>
                  setMilestones(milestones.filter((_, j) => j !== i))
                }
                disabled={submitting}
              >
                Remove
              </button>
            ) : null}
          </div>
          <div className={styles.group}>
            <label className={styles.label} htmlFor={`cf-ms-title-${i}`}>
              Title
            </label>
            <input
              id={`cf-ms-title-${i}`}
              className={styles.input}
              value={m.title}
              onChange={(e) => {
                const next = [...milestones];
                next[i] = { ...next[i], title: e.target.value };
                setMilestones(next);
              }}
              placeholder="e.g. Site survey & approvals"
              disabled={submitting}
            />
          </div>
          <div className={styles.group}>
            <label className={styles.label} htmlFor={`cf-ms-desc-${i}`}>
              Description
            </label>
            <textarea
              id={`cf-ms-desc-${i}`}
              className={styles.textarea}
              value={m.description}
              onChange={(e) => {
                const next = [...milestones];
                next[i] = { ...next[i], description: e.target.value };
                setMilestones(next);
              }}
              placeholder="Deliverables and acceptance criteria for this phase."
              disabled={submitting}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className={styles.secondary}
        onClick={() => setMilestones([...milestones, emptyMilestone()])}
        disabled={submitting}
        style={{ marginBottom: "1.25rem" }}
      >
        Add milestone
      </button>
      {fieldErrors.milestones ? (
        <span className={styles.fieldError}>{fieldErrors.milestones}</span>
      ) : null}

      <div className={styles.sectionTitle}>Bidding & budget</div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-deadline">
          Bidding deadline
        </label>
        <input
          id="cf-deadline"
          type="datetime-local"
          className={styles.input}
          value={biddingDeadlineLocal}
          onChange={(e) => setBiddingDeadlineLocal(e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.biddingDeadline ? (
          <span className={styles.fieldError}>{fieldErrors.biddingDeadline}</span>
        ) : null}
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-proj-deadline">
          Project Implementation Deadline
        </label>
        <input
          id="cf-proj-deadline"
          type="datetime-local"
          className={styles.input}
          value={projectDeadlineLocal}
          onChange={(e) => setProjectDeadlineLocal(e.target.value)}
          disabled={submitting}
        />
        <p className={styles.hint}>
          This final date will be enforced heavily as the rigid deadline for the project&apos;s final milestone.
        </p>
        {fieldErrors.projectDeadline ? (
          <span className={styles.fieldError}>{fieldErrors.projectDeadline}</span>
        ) : null}
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-max">
          Maximum bid amount (INR)
        </label>
        <input
          id="cf-max"
          type="number"
          className={styles.input}
          min={0}
          step="0.01"
          value={maximumBidAmount}
          onChange={(e) => setMaximumBidAmount(e.target.value)}
          placeholder="e.g. 2500000"
          disabled={submitting}
        />
        <p className={styles.hint}>
          Upper bound contractors may bid under; stored as numeric on the project record.
        </p>
        {fieldErrors.maximumBidAmount ? (
          <span className={styles.fieldError}>{fieldErrors.maximumBidAmount}</span>
        ) : null}
      </div>

      <div className={styles.sectionTitle}>Government wallet</div>
      <p className={styles.hint}>
        Must match the wallet you use on-chain for this ministry. Pulled from MetaMask when you connect.
      </p>

      <div className={styles.walletRow}>
        <MetaMaskConnect onAccountChange={setGovernmentWallet} />
        <button
          type="button"
          className={styles.secondary}
          onClick={syncWalletFromMetaMask}
          disabled={submitting}
        >
          Refresh from MetaMask
        </button>
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="cf-wallet">
          Government wallet (0x…)
        </label>
        <input
          id="cf-wallet"
          className={styles.input}
          value={governmentWallet}
          onChange={(e) => setGovernmentWallet(e.target.value.trim())}
          placeholder="0x…"
          autoComplete="off"
          spellCheck={false}
          disabled={submitting}
        />
        {fieldErrors.governmentWallet ? (
          <span className={styles.fieldError}>{fieldErrors.governmentWallet}</span>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Creating…" : "Create project"}
        </button>
        <Link
          href={ledgerHref}
          className={styles.secondary}
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
