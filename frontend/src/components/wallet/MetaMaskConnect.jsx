"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import styles from "./MetaMaskConnect.module.css";

export default function MetaMaskConnect({ onVerified }) {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (onVerified) onVerified(isVerified);
  }, [isVerified, onVerified]);

  const checkVerification = useCallback((connectedAddr) => {
    if (typeof window === "undefined" || !connectedAddr) return false;
    
    const userStr = sessionStorage.getItem("clearfund_user");
    if (!userStr) return false;

    try {
      const user = JSON.parse(userStr);
      const registeredAddr = user.wallet_address;

      if (registeredAddr && connectedAddr.toLowerCase() === registeredAddr.toLowerCase()) {
        return true;
      }
    } catch (e) {
      console.error("Session parse error", e);
    }
    return false;
  }, []);

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const addr = await accounts[0].getAddress();
        setAccount(addr);
        setIsVerified(checkVerification(addr));
      } else {
        setAccount("");
        setIsVerified(false);
      }
    } catch {
      setAccount("");
      setIsVerified(false);
    }
  }, [checkVerification]);

  useEffect(() => {
    refresh();
    if (!window.ethereum?.on) return;
    const handler = () => refresh();
    window.ethereum.on("accountsChanged", handler);
    return () => {
      window.ethereum.removeListener("accountsChanged", handler);
    };
  }, [refresh]);

  async function connect() {
    setError("");
    if (typeof window === "undefined" || !window.ethereum) {
      setError("Install MetaMask to connect a wallet.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
      
      const verified = checkVerification(addr);
      setIsVerified(verified);
      
      if (!verified) {
        setError("This wallet does not match your registered account.");
      }
    } catch (e) {
      setError(e?.shortMessage || e?.message || "Connection failed");
    }
  }

  if (account) {
    return (
      <div className={styles.wrap}>
        <div className={`${styles.statusBadge} ${isVerified ? styles.verified : styles.unverified}`}>
          <i className={`fa-solid ${isVerified ? "fa-circle-check" : "fa-circle-xmark"}`}></i>
          {isVerified ? "Verified Wallet" : "Unverified Wallet"}
        </div>
        <span className={styles.addr} title={account}>
          {account.slice(0, 6)}…{account.slice(-4)}
        </span>
        {error ? <span className={styles.err} style={{ display: 'block', marginTop: 4 }}>{error}</span> : null}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={connect}>
        <i className="fa-brands fa-ethereum" style={{ marginRight: 8 }}></i>
        Connect MetaMask
      </button>
      {error ? <span className={styles.err}>{error}</span> : null}
    </div>
  );
}
