const supabase = require("../db/supabaseClient");
const { uploadToIPFS } = require("../services/ipfs");
const { ethers } = require("ethers");
const escrowAbi = require("../../abi/ProjectEscrow.json");

const FALLBACK_APPROVAL_THRESHOLD = 2;
const provider = process.env.RPC_URL
  ? new ethers.JsonRpcProvider(process.env.RPC_URL)
  : null;

async function getApprovalThreshold(contractAddress) {
  if (!provider || !contractAddress) {
    return FALLBACK_APPROVAL_THRESHOLD;
  }

  try {
    const contract = new ethers.Contract(contractAddress, escrowAbi, provider);
    const threshold = await contract.approvalThreshold();
    return Number(threshold);
  } catch (_err) {
    return FALLBACK_APPROVAL_THRESHOLD;
  }
}

function deriveMilestoneStatus(milestoneEvents, approvalThreshold) {
  const hasRejection = milestoneEvents.some(
    (event) => event.event_type === "MILESTONE_REJECTED"
  );
  if (hasRejection) return "REJECTED";

  const approvalCount = milestoneEvents.filter(
    (event) => event.event_type === "MILESTONE_APPROVED"
  ).length;
  if (approvalCount >= approvalThreshold) return "APPROVED";

  const hasProof = milestoneEvents.some(
    (event) => event.event_type === "PROOF_SUBMITTED"
  );
  if (hasProof) return "UNDER_REVIEW";

  return "NOT_SUBMITTED";
}

function normalizeMilestone(row, milestoneEvents, approvalThreshold) {
  const latestProofEvent = milestoneEvents
    .filter((event) => event.event_type === "PROOF_SUBMITTED")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  const ipfsHash = latestProofEvent?.metadata?.ipfsHash || null;

  return {
    id: row.id,
    index: row.milestone_index,
    description: row.description,
    amount: row.amount,
    deadline: row.deadline,
    status: deriveMilestoneStatus(milestoneEvents, approvalThreshold),
    ipfsHash,
    ipfsUrl: ipfsHash ? `https://gateway.pinata.cloud/ipfs/${ipfsHash}` : null
  };
}

exports.getContractorProjects = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) {
      return res.status(400).json({ error: "wallet query param is required" });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, location_address, contract_address, status")
      .eq("contractor_wallet", wallet)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const projects = (data || []).map((project) => ({
      project_id: project.id,
      title: project.title,
      description: project.description,
      location: project.location_address,
      contract_address: project.contract_address,
      status: project.status
    }));

    return res.json(projects);
  } catch (err) {
    console.error("getContractorProjects error:", err);
    return res.status(500).json({ error: "Failed to fetch contractor projects" });
  }
};

exports.getProjectDetails = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return res.status(400).json({ error: "project id is required" });
    }

    const [{ data: project, error: projectError }, { data: milestones, error: milestonesError }, { data: events, error: eventsError }] =
      await Promise.all([
        supabase
          .from("projects")
          .select("id, title, description, location_address, contract_address, status")
          .eq("id", projectId)
          .single(),
        supabase
          .from("milestones")
          .select("id, milestone_index, description, amount, deadline")
          .eq("project_id", projectId)
          .order("milestone_index", { ascending: true }),
        supabase
          .from("events")
          .select("event_type, milestone_id, metadata, actor, created_at")
          .eq("project_id", projectId)
          .order("created_at", { ascending: true })
      ]);

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (milestonesError) throw milestonesError;
    if (eventsError) throw eventsError;

    const eventsByMilestone = new Map();
    for (const event of events || []) {
      if (event.milestone_id === null || event.milestone_id === undefined) continue;
      const key = Number(event.milestone_id);
      if (!eventsByMilestone.has(key)) {
        eventsByMilestone.set(key, []);
      }
      eventsByMilestone.get(key).push(event);
    }

    const approvalThreshold = await getApprovalThreshold(project.contract_address);

    const normalizedMilestones = (milestones || []).map((row) =>
      normalizeMilestone(
        row,
        eventsByMilestone.get(row.milestone_index) || [],
        approvalThreshold
      )
    );

    const approvedCount = normalizedMilestones.filter(
      (milestone) => milestone.status === "APPROVED"
    ).length;
    const currentMilestone = normalizedMilestones.find(
      (milestone) => milestone.status !== "APPROVED"
    );

    const fundsReleasedWei = (events || [])
      .filter((event) => event.event_type === "FUNDS_RELEASED")
      .reduce((sum, event) => {
        const value = event?.metadata?.amount;
        if (!value) return sum;
        try {
          return sum + BigInt(value);
        } catch (_error) {
          return sum;
        }
      }, 0n);

    return res.json({
      project: {
        project_id: project.id,
        title: project.title,
        description: project.description,
        location: project.location_address,
        contract_address: project.contract_address,
        status: project.status
      },
      milestones: normalizedMilestones,
      progress: {
        approval_threshold: approvalThreshold,
        current_milestone_index: currentMilestone
          ? currentMilestone.index
          : normalizedMilestones.length,
        total_milestones: normalizedMilestones.length,
        approved_milestones: approvedCount,
        funds_released_wei: fundsReleasedWei.toString()
      }
    });
  } catch (err) {
    console.error("getProjectDetails error:", err);
    return res.status(500).json({ error: "Failed to fetch project details" });
  }
};

exports.uploadProof = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "file is required" });
    }

    const hash = await uploadToIPFS(file);
    return res.json({
      ipfsHash: hash,
      url: `https://gateway.pinata.cloud/ipfs/${hash}`
    });
  } catch (err) {
    console.error("contractor upload error:", err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

exports.submitProof = async (req, res) => {
  const { contractAddress, milestoneId, ipfsHash } = req.body;
  if (!contractAddress || milestoneId === undefined || !ipfsHash) {
    return res.status(400).json({
      error: "contractAddress, milestoneId and ipfsHash are required"
    });
  }

  return res.json({
    ok: true,
    message: "Submit proof transaction from frontend wallet signer.",
    payload: { contractAddress, milestoneId, ipfsHash }
  });
};

exports.getContractorTimeline = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    console.error("getContractorTimeline error:", err);
    return res.status(500).json({ error: "Failed to fetch project events" });
  }
};
