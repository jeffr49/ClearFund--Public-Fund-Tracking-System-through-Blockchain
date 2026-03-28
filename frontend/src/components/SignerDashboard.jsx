import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abi/ProjectEscrow.json";

export default function SignerDashboard({ walletAddress }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch(
      `http://localhost:5000/signer/tasks?wallet=${walletAddress}`
    );
    const data = await res.json();
    setTasks(data);
  };

  const handleAction = async (task, action) => {
    if (!window.ethereum) return;
    try {
      const SEPOLIA_CHAIN_ID = '0xaa36a7';
      const cId = await window.ethereum.request({ method: 'eth_chainId' });
      if (cId !== SEPOLIA_CHAIN_ID) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        await new Promise(res => setTimeout(res, 1000));
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        task.contract_address,
        abi,
        signer
      );

      let tx;

      if (action === "approve") {
        tx = await contract.approveMilestone(task.milestone_id);
      } else {
        tx = await contract.rejectMilestone(task.milestone_id);
      }

      await tx.wait();

      alert("Transaction successful");
      fetchTasks();

    } catch (err) {
      console.error(err);
      alert("Transaction failed");
    }
  };

  return (
    <div style={{ padding: "1.5rem", background: "var(--bg-color, #e0e5ec)", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "2rem", letterSpacing: "-0.5px", textShadow: "0 1px 0 #ffffff" }}>PROXIMAL CONSENSUS MODULE</h2>

      {tasks.length === 0 && (
        <div style={{ 
          padding: "3rem", 
          textAlign: "center", 
          background: "var(--bg-primary, #e0e5ec)", 
          border: "1px dashed var(--border-color, #babecc)", 
          borderRadius: "16px",
          color: "var(--text-secondary, #4a5568)",
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: "700",
          textTransform: "uppercase",
          boxShadow: "inset 6px 6px 12px #babecc, inset -6px -6px 12px #ffffff"
        }}>
          NO ACTIVE VERIFICATION TASKS / IDLE
        </div>
      )}

      {tasks.map(task => (
        <div key={task.id} style={{
          border: "1px solid rgba(255,255,255,0.4)",
          padding: "1.75rem",
          marginBottom: "2rem",
          borderRadius: "16px",
          background: "var(--bg-primary, #e0e5ec)",
          boxShadow: "var(--shadow-card, 8px 8px 16px #babecc, -8px -8px 16px #ffffff)",
          backgroundImage: "radial-gradient(circle at 12px 12px, rgba(0,0,0,0.12) 2px, transparent 3px), radial-gradient(circle at calc(100% - 12px) 12px, rgba(0,0,0,0.12) 2px, transparent 3px), radial-gradient(circle at 12px calc(100% - 12px), rgba(0,0,0,0.12) 2px, transparent 3px), radial-gradient(circle at calc(100% - 12px) calc(100% - 12px), rgba(0,0,0,0.12) 2px, transparent 3px)",
          position: "relative"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.5rem" }}>{task.project_title}</h3>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: "800", color: "#ff4757", textTransform: "uppercase", marginBottom: "1rem" }}>VERIFICATION TARGET: MILESTONE #{task.milestone_id}</p>
          <div style={{ 
            background: "var(--bg-secondary, #d1d9e6)", 
            padding: "1rem", 
            borderRadius: "8px", 
            marginBottom: "1.5rem",
            boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.85rem",
            color: "var(--text-primary, #2d3436)",
            lineHeight: "1.6"
          }}>
            {task.description}
          </div>

          {task.ipfsHash && (
            <div style={{ marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.75rem" }}>ATTACHED EVIDENCE / DATALINKS</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {task.ipfsHash.split(',').map((hash, idx) => {
                   const url = `https://gateway.pinata.cloud/ipfs/${hash.trim()}`;
                   return (
                     <div key={idx} style={{ marginBottom: 12 }}>
                       <a href={url} target="_blank" rel="noreferrer" style={{ 
                         color: "#2d3436", 
                         textDecoration: "none", 
                         fontFamily: "'JetBrains Mono', monospace", 
                         fontSize: "0.7rem", 
                         fontWeight: "800",
                         background: "white",
                         padding: "6px 12px",
                         borderRadius: "6px",
                         boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff",
                         display: "inline-block"
                       }}>
                         <i className="fa-solid fa-link" style={{ marginRight: 6 }}></i>
                         PINATA_GATEWAY_{idx + 1}
                       </a>
                       <br />
                       <img
                         src={url}
                         width={300}
                         alt={`proof-${idx}`}
                         style={{ marginTop: 10, borderRadius: 10, border: "4px solid #fff", boxShadow: "4px 4px 12px rgba(0,0,0,0.15)" }}
                         onError={(e) => { e.target.style.display = 'none'; }}
                       />
                     </div>
                   );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: "1rem", display: "flex", gap: "1.25rem" }}>
            <button 
              onClick={() => handleAction(task, "approve")}
              style={{
                flex: 1,
                padding: "0.9rem",
                border: "none",
                borderRadius: "10px",
                background: "#27ae60",
                color: "#ffffff",
                fontWeight: "800",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: "4px 4px 8px rgba(39,174,96,0.3), -4px -4px 8px rgba(255,255,255,0.4)",
                transition: "all 0.1s"
              }}
            >
              APPROVE_RELEASE
            </button>

            <button 
              onClick={() => handleAction(task, "reject")}
              style={{
                flex: 1,
                padding: "0.9rem",
                border: "none",
                borderRadius: "10px",
                background: "#ff4757",
                color: "#ffffff",
                fontWeight: "800",
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: "4px 4px 8px rgba(255,71,87,0.3), -4px -4px 8px rgba(255,255,255,0.4)",
                transition: "all 0.1s"
              }}
            >
              REJECT_TASK
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}