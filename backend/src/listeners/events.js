const { ethers } = require("ethers");
const supabase = require("../db/supabaseClient");

const escrowAbi = require("../../abi/ProjectEscrow.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Prevent duplicate listeners
const activeListeners = new Set();

exports.listenToProject = (projectId, contractAddress) => {
  if (activeListeners.has(contractAddress)) return;

  activeListeners.add(contractAddress);

  const contract = new ethers.Contract(
    contractAddress,
    escrowAbi,
    provider
  );

  console.log("👂 Listening to:", contractAddress);

  // =========================
  // PROOF SUBMITTED
  // =========================
  contract.on("ProofSubmitted", async (milestoneId, ipfsHash) => {
    try {
      console.log("ProofSubmitted:", milestoneId.toString());

      const { error } = await supabase.from("events").insert([
        {
          project_id: projectId,
          contract_address: contractAddress,
          event_type: "PROOF_SUBMITTED",
          milestone_id: Number(milestoneId),
          actor: "contractor",
          metadata: { ipfsHash }
        }
      ]);

      if (error) console.error(error);

    } catch (err) {
      console.error("Listener error (ProofSubmitted):", err);
    }
  });

  // =========================
  // APPROVED
  // =========================
  contract.on("MilestoneApproved", async (milestoneId, approver) => {
    try {
      const { error } = await supabase.from("events").insert([
        {
          project_id: projectId,
          contract_address: contractAddress,
          event_type: "MILESTONE_APPROVED",
          milestone_id: Number(milestoneId),
          actor: approver,
          metadata: {}
        }
      ]);

      if (error) console.error(error);

    } catch (err) {
      console.error("Listener error (Approved):", err);
    }
  });

  // =========================
  // REJECTED
  // =========================
  contract.on("MilestoneRejected", async (milestoneId, approver) => {
    try {
      const { error } = await supabase.from("events").insert([
        {
          project_id: projectId,
          contract_address: contractAddress,
          event_type: "MILESTONE_REJECTED",
          milestone_id: Number(milestoneId),
          actor: approver,
          metadata: {}
        }
      ]);

      if (error) console.error(error);

    } catch (err) {
      console.error("Listener error (Rejected):", err);
    }
  });

  // =========================
  // FUNDS RELEASED
  // =========================
  contract.on("FundsReleased", async (milestoneId, amount) => {
    try {
      const { error } = await supabase.from("events").insert([
        {
          project_id: projectId,
          contract_address: contractAddress,
          event_type: "FUNDS_RELEASED",
          milestone_id: Number(milestoneId),
          actor: "system",
          metadata: {
            amount: amount.toString()
          }
        }
      ]);

      if (error) console.error(error);

    } catch (err) {
      console.error("Listener error (FundsReleased):", err);
    }
  });

  // =========================
  // DEADLINE EXTENDED
  // =========================
  contract.on("DeadlineExtended", async (milestoneId, newDeadline) => {
    try {
      const { error } = await supabase.from("events").insert([
        {
          project_id: projectId,
          contract_address: contractAddress,
          event_type: "DEADLINE_EXTENDED",
          milestone_id: Number(milestoneId),
          actor: "approver",
          metadata: {
            newDeadline: Number(newDeadline)
          }
        }
      ]);

      if (error) console.error(error);

    } catch (err) {
      console.error("Listener error (DeadlineExtended):", err);
    }
  });
};