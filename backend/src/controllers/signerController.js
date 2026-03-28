const supabase = require("../db/supabaseClient");

async function getMilestoneMap(projectIds) {
  if (!projectIds.length) return new Map();

  const { data, error } = await supabase
    .from("milestones")
    .select("project_id, milestone_index, title, description, deadline")
    .in("project_id", projectIds);

  if (error) throw error;

  return new Map(
    (data || []).map(milestone => [
      `${milestone.project_id}-${milestone.milestone_index}`,
      milestone
    ])
  );
}

exports.getSignerTasks = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) return res.status(400).json({ error: "Wallet is required" });

    // 1. Fetch project IDs where wallet is in the wallet_address array
    const { data: projData, error: projError } = await supabase
      .from("project_approvers")
      .select("project_id")
      .contains("wallet_address", [wallet]);

    if (projError) throw projError;
    const projectIds = (projData || []).map(p => p.project_id);

    if (projectIds.length === 0) return res.json([]);

    // 2. Fetch ALL events for these projects related to proofs and votes
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        projects ( title, status, contract_address )
      `)
      .in("project_id", projectIds)
      .in("event_type", [
        "PROOF_SUBMITTED",
        "MILESTONE_APPROVED",
        "MILESTONE_REJECTED",
        "FUNDS_RELEASED",
        "DEADLINE_EXTENDED"
      ]);

    if (eventsError) throw eventsError;

    const milestoneMap = await getMilestoneMap(projectIds);
    const normalizedWallet = wallet.toLowerCase();

    // We only care about proofs that are pending *for this approver*.
    // A proof is pending if:
    // It's the most recent PROOF_SUBMITTED for the milestone
    // AND the approver has NOT cast a vote AFTER this PROOF_SUBMITTED.

    // Group events by project_id + milestone_id
    const milestoneStates = {};
    
    (eventsData || []).forEach(e => {
        const key = `${e.project_id}-${e.milestone_id}`;
        if (!milestoneStates[key]) {
            milestoneStates[key] = {
                latestProof: null,
                latestVoteByApprover: null,
                latestTerminalEvent: null
            };
        }
        
        const timestamp = new Date(e.created_at).getTime();
        
        if (e.event_type === "PROOF_SUBMITTED") {
            if (!milestoneStates[key].latestProof || timestamp > milestoneStates[key].latestProof.timestamp) {
                milestoneStates[key].latestProof = { ...e, timestamp };
            }
        } else if (e.event_type === "FUNDS_RELEASED" || e.event_type === "DEADLINE_EXTENDED") {
            if (!milestoneStates[key].latestTerminalEvent || timestamp > milestoneStates[key].latestTerminalEvent.timestamp) {
                milestoneStates[key].latestTerminalEvent = { ...e, timestamp };
            }
        } else if ((e.event_type === "MILESTONE_APPROVED" || e.event_type === "MILESTONE_REJECTED") && e.actor && e.actor.toLowerCase() === normalizedWallet) {
            if (!milestoneStates[key].latestVoteByApprover || timestamp > milestoneStates[key].latestVoteByApprover.timestamp) {
                milestoneStates[key].latestVoteByApprover = { ...e, timestamp };
            }
        }
    });

    const tasks = [];
    for (const key in milestoneStates) {
        const state = milestoneStates[key];
        // If there's a proof, and (no vote OR proof is newer than vote)
        if (state.latestProof) {
            // Also ignore if the project itself is completed
            if (state.latestProof.projects && state.latestProof.projects.status === 'completed') {
                continue;
            }

            const proofStillPending =
              !state.latestTerminalEvent ||
              state.latestProof.timestamp > state.latestTerminalEvent.timestamp;

            if (
              proofStillPending &&
              (!state.latestVoteByApprover || state.latestProof.timestamp > state.latestVoteByApprover.timestamp)
            ) {
                const e = state.latestProof;
                const milestone = milestoneMap.get(`${e.project_id}-${e.milestone_id}`);
                tasks.push({
                    id: e.id, // using event id
                    project_id: e.project_id,
                    project_title: e.projects?.title || "Unknown",
                    contract_address: e.contract_address || e.projects?.contract_address || null,
                    milestone_id: e.milestone_id,
                    description:
                      [milestone?.title, milestone?.description]
                        .filter(Boolean)
                        .join(" — ") || "No description",
                    ipfsHash: e.metadata?.ipfsHash || null,
                    deadline: milestone?.deadline || null
                });
            }
        }
    }

    res.json(tasks);

  } catch (err) {
    console.error("getSignerTasks error:", err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.getAssignedProjects = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) return res.status(400).json({ error: "Wallet is required" });

    // 1. Fetch project IDs
    const { data: projData, error: projError } = await supabase
      .from("project_approvers")
      .select("project_id")
      .contains("wallet_address", [wallet]);

    if (projError) throw projError;
    const projectIds = (projData || []).map(p => p.project_id);

    if (projectIds.length === 0) return res.json([]);

    // 2. Fetch projects and their milestones
    const { data: projectsData, error: pError } = await supabase
      .from("projects")
      .select(`
        *,
        milestones (*)
      `)
      .in("id", projectIds)
      .order('created_at', { ascending: false });

    if (pError) throw pError;

    res.json(projectsData);
  } catch (err) {
    console.error("getAssignedProjects error:", err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.getApproverDecisions = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) return res.status(400).json({ error: "Wallet is required" });

    // 1. Fetch ALL voting events for this wallet
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        projects ( id, title, status, contract_address )
      `)
      .ilike("actor", wallet) // case-insensitive match just in case
      .in("event_type", ["MILESTONE_APPROVED", "MILESTONE_REJECTED"])
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    const milestoneMap = await getMilestoneMap(
      [...new Set((eventsData || []).map(event => event.project_id).filter(Boolean))]
    );

    // Filter for active projects
    const activeDecisions = (eventsData || [])
      .filter(e => e.projects && e.projects.status !== 'completed')
      .map(e => ({
        ...e,
        milestones: milestoneMap.get(`${e.project_id}-${e.milestone_id}`) || null
      }));

    res.json(activeDecisions);
  } catch (err) {
    console.error("getApproverDecisions error:", err);
    res.status(500).json({ error: "Failed" });
  }
};

exports.getApproverHistory = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) return res.status(400).json({ error: "Wallet is required" });

    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        projects ( id, title, status, contract_address )
      `)
      .ilike("actor", wallet)
      .in("event_type", ["MILESTONE_APPROVED", "MILESTONE_REJECTED"])
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    const milestoneMap = await getMilestoneMap(
      [...new Set((eventsData || []).map(event => event.project_id).filter(Boolean))]
    );

    const historyDecisions = (eventsData || [])
      .filter(e => e.projects && e.projects.status === 'completed')
      .map(e => ({
        ...e,
        milestones: milestoneMap.get(`${e.project_id}-${e.milestone_id}`) || null
      }));

    res.json(historyDecisions);
  } catch (err) {
    console.error("getApproverHistory error:", err);
    res.status(500).json({ error: "Failed" });
  }
};
