const supabase = require("../db/supabaseClient");

exports.getSignerTasks = async (req, res) => {
  try {
    const wallet = req.query.wallet;

    // 1. Fetch project IDs where wallet is in the wallet_address array
    const { data: projData, error: projError } = await supabase
      .from("project_approvers")
      .select("project_id")
      .contains("wallet_address", [wallet]);

    if (projError) throw projError;
    const projectIds = projData.map(p => p.project_id);

    if (projectIds.length === 0) return res.json([]);

    // 2. Fetch pending tasks (PROOF_SUBMITTED)
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        projects ( title ),
        milestones!events_milestone_id_fkey ( title, description )
      `)
      .in("project_id", projectIds)
      .eq("event_type", "PROOF_SUBMITTED");

    if (eventsError) throw eventsError;

    // 3. Check for already voted tasks
    const { data: votedData, error: votedError } = await supabase
      .from("events")
      .select("project_id, milestone_id")
      .eq("actor", wallet)
      .in("event_type", ["MILESTONE_APPROVED", "MILESTONE_REJECTED"]);

    if (votedError) throw votedError;

    const votedSet = new Set(
      votedData.map(r => `${r.project_id}-${r.milestone_id}`)
    );

    const tasks = eventsData
      .filter(e => !votedSet.has(`${e.project_id}-${e.milestone_id}`))
      .map(e => ({
        id: e.id,
        project_title: e.projects?.title || "Unknown",
        contract_address: e.contract_address,
        milestone_id: e.milestone_id,
        description:
          [e.milestones?.title, e.milestones?.description]
            .filter(Boolean)
            .join(" — ") || "No description",
        ipfsHash: e.metadata?.ipfsHash || null
      }));

    res.json(tasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};