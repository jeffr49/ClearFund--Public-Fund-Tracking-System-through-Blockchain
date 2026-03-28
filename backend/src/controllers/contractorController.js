const supabase = require("../db/supabaseClient");
const { uploadToIPFS } = require("../services/ipfs");
const { ethers } = require("ethers");
const escrowAbi = require("../../abi/ProjectEscrow.json");

const FALLBACK_APPROVAL_THRESHOLD = 2;
const rpcUrl = process.env.RPC_URL || process.env.ALCHEMY_URL;
const provider = rpcUrl ? new ethers.JsonRpcProvider(rpcUrl) : null;

async function getApprovalThreshold(contractAddress) {
  if (!provider || !contractAddress) {
    return FALLBACK_APPROVAL_THRESHOLD;
  }

  try {
    const contract = new ethers.Contract(contractAddress, escrowAbi.abi, provider);
    const threshold = await contract.approvalThreshold();
    return Number(threshold);
  } catch (_err) {
    return FALLBACK_APPROVAL_THRESHOLD;
  }
}

function calculateScore(stats) {
    const { total_milestones, on_time_milestones, completed_projects } = stats;
    if (total_milestones === 0) return 100; // Perfect score for new contractors

    let score = (on_time_milestones / total_milestones) * 80; // 80% weight on timing
    score += (completed_projects > 0 ? 20 : 0); // 20% bonus for having completed at least one project
    
    return Math.min(100, Math.round(score));
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
    title: row.title,
    description: row.description,
    amount: row.amount,
    deadline: row.deadline,
    status: deriveMilestoneStatus(milestoneEvents, approvalThreshold),
    ipfsHash,
    ipfsUrls: ipfsHash ? ipfsHash.split(',').map(hash => `https://gateway.pinata.cloud/ipfs/${hash.trim()}`) : []
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
          .select("id, milestone_index, title, description, amount, deadline")
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

    const fundsReleasedInr = (events || [])
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
        funds_released_inr: fundsReleasedInr.toString()
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
  try {
    const { projectId, contractAddress, milestoneId, ipfsHash, actor } = req.body;
    if (!contractAddress || milestoneId === undefined || !ipfsHash || !projectId) {
      return res.status(400).json({
        error: "projectId, contractAddress, milestoneId and ipfsHash are required"
      });
    }

    // Insert event into Supabase
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert([
        {
          project_id: projectId,
          contract_address: contractAddress,
          event_type: "PROOF_SUBMITTED",
          milestone_id: milestoneId,
          actor: actor || "CONTRACTOR",
          metadata: { ipfsHash }
        }
      ])
      .select()
      .single();

    if (eventError) throw eventError;

    return res.json({
      ok: true,
      message: "Proof submission recorded in database.",
      event: eventData
    });
  } catch (err) {
    console.error("submitProof error:", err);
    return res.status(500).json({ error: "Failed to submit proof to database" });
  }
};

exports.getContractorStats = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) {
      return res.status(400).json({ error: "wallet is required" });
    }

    // 1. Fetch all projects for this contractor
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, status, title")
      .eq("contractor_wallet", wallet);

    if (projectsError) throw projectsError;

    if (!projects || projects.length === 0) {
      return res.json({
        total_projects: 0,
        completed_projects: 0,
        total_milestones: 0,
        on_time_milestones: 0,
        delayed_milestones: 0,
        total_earnings_inr: "0",
        score: 100,
        average_delay_days: 0
      });
    }

    const projectIds = projects.map(p => p.id);

    // 2. Fetch all milestones for these projects
    const { data: milestones, error: milestonesError } = await supabase
      .from("milestones")
      .select("id, project_id, deadline, amount, milestone_index")
      .in("project_id", projectIds);

    if (milestonesError) throw milestonesError;

    // 3. Fetch all approval events for these projects
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("project_id, milestone_id, created_at, event_type, metadata")
      .in("project_id", projectIds)
      .in("event_type", ["MILESTONE_APPROVED", "FUNDS_RELEASED"]);

    if (eventsError) throw eventsError;

    // 4. Fetch ongoing projects from project_approvers
    const { data: ongoingApprovals, error: ongoingError } = await supabase
      .from("project_approvers")
      .select("project_id")
      .in("project_id", projectIds);

    if (ongoingError) throw ongoingError;

    // Calculate stats
    const ongoing_project_ids = new Set((ongoingApprovals || []).map(a => a.project_id));
    const completed_projects = projects.filter(p => p.status === 'completed').length;
    
    // Ongoing is any project that exists in project_approvers but is NOT status 'completed'
    const ongoing_projects = projects.filter(p => 
      ongoing_project_ids.has(p.id) && p.status !== 'completed'
    ).length;

    const total_milestones = milestones.length;
    
    let on_time_count = 0;
    let delayed_count = 0;
    let total_delay_ms = 0;
    let total_earnings_inr = 0n;

    milestones.forEach(ms => {
        // Find if this milestone was approved
        const approvalEvent = events.find(e => 
            e.project_id === ms.project_id && 
            Number(e.milestone_id) === ms.milestone_index && 
            e.event_type === "MILESTONE_APPROVED"
        );

        if (approvalEvent) {
            const deadline = new Date(ms.deadline);
            const approvalDate = new Date(approvalEvent.created_at);
            
            if (approvalDate <= deadline) {
                on_time_count++;
            } else {
                delayed_count++;
                total_delay_ms += (approvalDate - deadline);
            }

            try {
                total_earnings_inr += BigInt(ms.amount || 0);
            } catch (e) {}
        }
    });

    const average_delay_days = delayed_count > 0 
        ? Math.round(total_delay_ms / (delayed_count * 1000 * 60 * 60 * 24)) 
        : 0;

    const stats = {
        total_projects: projects.length,
        completed_projects,
        ongoing_projects,
        total_milestones,
        on_time_milestones: on_time_count,
        delayed_milestones: delayed_count,
        total_earnings_inr: total_earnings_inr.toString(),
        average_delay_days
    };

    stats.score = calculateScore(stats);

    return res.json(stats);

  } catch (err) {
    console.error("getContractorStats error:", err);
    return res.status(500).json({ error: "Failed to fetch contractor stats" });
  }
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
