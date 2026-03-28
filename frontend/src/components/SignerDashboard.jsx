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
    <div style={{ padding: 20 }}>
      <h2>Signer Dashboard</h2>

      {tasks.map(task => (
        <div key={task.id} style={{
          border: "1px solid #ccc",
          padding: 20,
          marginBottom: 20
        }}>
          <h3>{task.project_title}</h3>
          <p>Milestone #{task.milestone_id}</p>
          <p>{task.description}</p>

          {task.ipfsHash && task.ipfsHash.split(',').map((hash, idx) => {
             const url = `https://gateway.pinata.cloud/ipfs/${hash.trim()}`;
             return (
               <div key={idx} style={{ marginBottom: 10 }}>
                 <a href={url} target="_blank" rel="noreferrer" style={{ color: "#0066cc", textDecoration: "underline" }}>
                   View Proof {idx + 1}
                 </a>
                 <br />
                 <img
                   src={url}
                   width={300}
                   alt={`proof-${idx}`}
                   style={{ marginTop: 5, borderRadius: 8, border: "1px solid #eee" }}
                   onError={(e) => { e.target.style.display = 'none'; }}
                 />
               </div>
             );
          })}

          <div style={{ marginTop: 10 }}>
            <button onClick={() => handleAction(task, "approve")}>
              Approve
            </button>

            <button onClick={() => handleAction(task, "reject")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}