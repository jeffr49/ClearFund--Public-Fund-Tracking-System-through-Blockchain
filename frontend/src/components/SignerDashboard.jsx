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
    await window.ethereum.request({ method: "eth_requestAccounts" });
    try {
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

          <img
            src={task.ipfsHash ? `https://gateway.pinata.cloud/ipfs/${task.ipfsHash}` : ""}
            width={300}
            alt="proof"
          />

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