const { ethers } = require("ethers");
const supabase = require("../db/supabaseClient");

const escrowAbi = require("../../abi/ProjectEscrow.json");

const RPC_URL = process.env.RPC_URL || process.env.ALCHEMY_URL;
const provider = new ethers.JsonRpcProvider(RPC_URL);

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
    escrowAbi.abi,
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

      const numId = Number(milestoneId);
      const { error: updErr1 } = await supabase
        .from("milestones")
        .update({ status: 'completed' })
        .eq("project_id", projectId)
        .eq("milestone_index", numId);
      if (updErr1) console.error("Error updating milestone to completed:", updErr1);

      const { error: updErr2 } = await supabase
        .from("milestones")
        .update({ status: 'working' })
        .eq("project_id", projectId)
        .eq("milestone_index", numId + 1);
      if (updErr2) console.error("Error updating next milestone to working:", updErr2);

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

      const newD = new Date(Number(newDeadline) * 1000).toISOString();
      
      // Update milestone status to 'extended' and set the new deadline
      const { error: updErr3 } = await supabase
        .from("milestones")
        .update({ status: 'extended', deadline: newD })
        .eq("project_id", projectId)
        .eq("milestone_index", Number(milestoneId));
      if (updErr3) console.error("Error extending deadline on milestone:", updErr3);

      // Recalculate and update the overall project deadline
      const { data: mData, error: mErr } = await supabase
        .from("milestones")
        .select("deadline")
        .eq("project_id", projectId);
        
      if (!mErr && mData && mData.length > 0) {
          // Find the maximum deadline across all milestones
          const maxDeadline = mData.reduce((max, m) => {
              const d = new Date(m.deadline);
              return d > max ? d : max;
          }, new Date(0));
          
          const { error: pErr } = await supabase
            .from("projects")
            .update({ deadline: maxDeadline.toISOString() })
            .eq("id", projectId);
            
          if (pErr) console.error("Error updating project deadline:", pErr);
      }

    } catch (err) {
      console.error("DeadlineExtended error:", err);
    }
  });
};