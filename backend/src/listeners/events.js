const { ethers } = require("ethers");
const supabase = require("../db/supabaseClient");

const escrowAbi = require("../../abi/ProjectEscrow.json");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const activeListeners = new Set();
const seenEventKeys = new Set();

const INSERT_RETRIES = 3;
const RETRY_DELAY_MS = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function buildEventKey(contractAddress, eventLog) {
  if (!eventLog || !eventLog.transactionHash || eventLog.index === undefined) {
    return null;
  }
  return `${contractAddress.toLowerCase()}:${eventLog.transactionHash}:${eventLog.index}`;
}

async function persistEvent(payload) {
  for (let attempt = 1; attempt <= INSERT_RETRIES; attempt++) {
    const { error } = await supabase.from("events").insert([payload]);

    if (!error) return;

    if (attempt === INSERT_RETRIES) {
      console.error("DB insert failed:", error);
      throw error;
    }

    await sleep(RETRY_DELAY_MS * attempt);
  }
}

exports.listenToProject = (projectId, contractAddress) => {
  if (activeListeners.has(contractAddress)) return;

  activeListeners.add(contractAddress);

  const contract = new ethers.Contract(
    contractAddress,
    escrowAbi,
    provider
  );

  console.log("Listening to:", contractAddress);

  // =========================
  // PROOF SUBMITTED
  // =========================
  contract.on("ProofSubmitted", async (milestoneId, ipfsHash, eventLog) => {
    try {
      const eventKey = buildEventKey(contractAddress, eventLog);
      if (eventKey && seenEventKeys.has(eventKey)) return;

      await persistEvent({
        project_id: projectId,
        contract_address: contractAddress,
        event_type: "PROOF_SUBMITTED",
        milestone_id: Number(milestoneId),
        actor: "contractor",
        metadata: {
          ipfsHash: ipfsHash,
          txHash: eventLog?.transactionHash || null,
          logIndex: eventLog?.index ?? null
        }
      });

      if (eventKey) seenEventKeys.add(eventKey);

    } catch (err) {
      console.error("ProofSubmitted error:", err);
    }
  });

  // =========================
  // APPROVED
  // =========================
  contract.on("MilestoneApproved", async (milestoneId, approver, eventLog) => {
    try {
      const eventKey = buildEventKey(contractAddress, eventLog);
      if (eventKey && seenEventKeys.has(eventKey)) return;

      await persistEvent({
        project_id: projectId,
        contract_address: contractAddress,
        event_type: "MILESTONE_APPROVED",
        milestone_id: Number(milestoneId),
        actor: approver,
        metadata: {
          txHash: eventLog?.transactionHash || null,
          logIndex: eventLog?.index ?? null
        }
      });

      if (eventKey) seenEventKeys.add(eventKey);

    } catch (err) {
      console.error("MilestoneApproved error:", err);
    }
  });

  // =========================
  // REJECTED
  // =========================
  contract.on("MilestoneRejected", async (milestoneId, approver, eventLog) => {
    try {
      const eventKey = buildEventKey(contractAddress, eventLog);
      if (eventKey && seenEventKeys.has(eventKey)) return;

      await persistEvent({
        project_id: projectId,
        contract_address: contractAddress,
        event_type: "MILESTONE_REJECTED",
        milestone_id: Number(milestoneId),
        actor: approver,
        metadata: {
          txHash: eventLog?.transactionHash || null,
          logIndex: eventLog?.index ?? null
        }
      });

      if (eventKey) seenEventKeys.add(eventKey);

    } catch (err) {
      console.error("MilestoneRejected error:", err);
    }
  });

  // =========================
  // FUNDS RELEASED
  // =========================
  contract.on("FundsReleased", async (milestoneId, amount, eventLog) => {
    try {
      const eventKey = buildEventKey(contractAddress, eventLog);
      if (eventKey && seenEventKeys.has(eventKey)) return;

      await persistEvent({
        project_id: projectId,
        contract_address: contractAddress,
        event_type: "FUNDS_RELEASED",
        milestone_id: Number(milestoneId),
        actor: "system",
        metadata: {
          amount: amount.toString(),
          txHash: eventLog?.transactionHash || null,
          logIndex: eventLog?.index ?? null
        }
      });

      if (eventKey) seenEventKeys.add(eventKey);

    } catch (err) {
      console.error("FundsReleased error:", err);
    }
  });

  // =========================
  // DEADLINE EXTENDED
  // =========================
  contract.on("DeadlineExtended", async (milestoneId, newDeadline, eventLog) => {
    try {
      const eventKey = buildEventKey(contractAddress, eventLog);
      if (eventKey && seenEventKeys.has(eventKey)) return;

      await persistEvent({
        project_id: projectId,
        contract_address: contractAddress,
        event_type: "DEADLINE_EXTENDED",
        milestone_id: Number(milestoneId),
        actor: "approver",
        metadata: {
          newDeadline: Number(newDeadline),
          txHash: eventLog?.transactionHash || null,
          logIndex: eventLog?.index ?? null
        }
      });

      if (eventKey) seenEventKeys.add(eventKey);

    } catch (err) {
      console.error("DeadlineExtended error:", err);
    }
  });
};