"use client";

import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import styles from "./MetaMaskConnect.module.css";

export default function MetaMaskConnect() {
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setAccount(await accounts[0].getAddress());
      } else {
        setAccount("");
      }
    } catch {
      setAccount("");
    }
  }, []);

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
      setAccount(await signer.getAddress());
    } catch (e) {
      setError(e?.shortMessage || e?.message || "Connection failed");
    }
  }

  if (account) {
    return (
      <div className={styles.wrap}>
        <span className={styles.addr} title={account}>
          {account.slice(0, 6)}…{account.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.btn} onClick={connect}>
        Connect MetaMask
      </button>
      {error ? <span className={styles.err}>{error}</span> : null}
    </div>
  );
}
