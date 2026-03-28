const { randomUUID } = require("crypto");
const supabase = require("../db/supabaseClient");

// =========================
// CREATE PROJECT
// =========================
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      biddingDeadline,
      maximumBidAmount,
      governmentWallet
    } = req.body;

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          id: randomUUID(),
          title,
          description,
          location_lat: location.lat,
          location_lng: location.lng,
          location_address: location.address,
          government_wallet: governmentWallet,
          bidding_deadline: biddingDeadline,
          maximumBidAmount: maximumBidAmount,
          status: "bidding"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
};



function maxBidAmount(row) {
  const v = row.maximumBidAmount ?? row.maximum_bid_amount;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function displayStatus(dbStatus) {
  const s = (dbStatus || "").toLowerCase();
  if (s === "active") return "ongoing";
  if (s === "completed") return "completed";
  return "bidding";
}

// =========================
// OVERVIEW (stats + projects for map / grid)
// =========================
exports.getProjectsOverview = async (req, res) => {
  try {
    const [
      { data: projects, error: projectsError },
      { data: fundEvents, error: fundError },
      { data: milestoneRows, error: msError }
    ] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("project_id, metadata")
        .eq("event_type", "FUNDS_RELEASED"),
      supabase.from("milestones").select("project_id")
    ]);

    if (projectsError) throw projectsError;
    if (fundError) throw fundError;
    if (msError) throw msError;

    // FUNDS_RELEASED metadata.amount = whole INR (on-chain milestone amount; bank payout is off-chain)
    const fundsInrByProject = new Map();
    let totalReleasedInr = 0n;

    for (const ev of fundEvents || []) {
      const raw = ev.metadata?.amount;
      if (raw === undefined || raw === null) continue;
      try {
        const w = BigInt(String(raw));
        totalReleasedInr += w;
        const pid = ev.project_id;
        if (!pid) continue;
        fundsInrByProject.set(pid, (fundsInrByProject.get(pid) || 0n) + w);
      } catch (_e) {
        /* skip bad amount */
      }
    }

    const releasedCountByProject = new Map();
    for (const ev of fundEvents || []) {
      if (!ev.project_id) continue;
      releasedCountByProject.set(
        ev.project_id,
        (releasedCountByProject.get(ev.project_id) || 0) + 1
      );
    }

    const milestoneCountByProject = new Map();
    for (const row of milestoneRows || []) {
      if (!row.project_id) continue;
      milestoneCountByProject.set(
        row.project_id,
        (milestoneCountByProject.get(row.project_id) || 0) + 1
      );
    }

    const list = projects || [];
    let bidding = 0;
    let ongoing = 0;
    let completed = 0;

    for (const p of list) {
      const s = (p.status || "").toLowerCase();
      if (s === "bidding") bidding += 1;
      else if (s === "active") ongoing += 1;
      else if (s === "completed") completed += 1;
      else ongoing += 1;
    }

    const totalBudget = list.reduce((sum, p) => sum + maxBidAmount(p), 0);

    const enriched = list.map((p) => {
      const pid = p.id;
      const disp = displayStatus(p.status);
      const totalMs = milestoneCountByProject.get(pid) || 0;
      const doneMs = releasedCountByProject.get(pid) || 0;
      const releasedInr = fundsInrByProject.get(pid) || 0n;
      const completedDisplay =
        totalMs > 0 ? Math.min(doneMs, totalMs) : doneMs;

      let currentPhase = "—";
      if (disp === "bidding") currentPhase = "Open for bids";
      else if (disp === "ongoing") currentPhase = "Milestone execution";
      else if (disp === "completed") currentPhase = "Closed";

      return {
        id: pid,
        title: p.title,
        description: p.description,
        location_address: p.location_address,
        location_lat: p.location_lat != null ? Number(p.location_lat) : null,
        location_lng: p.location_lng != null ? Number(p.location_lng) : null,
        status: p.status,
        display_status: disp,
        maximum_bid_amount: maxBidAmount(p),
        funds_released_inr: releasedInr.toString(),
        contract_address: p.contract_address,
        contractor_wallet: p.contractor_wallet,
        total_milestones: totalMs,
        completed_milestones: completedDisplay,
        current_phase: currentPhase
      };
    });

    return res.json({
      stats: {
        total_projects: list.length,
        total_budget: totalBudget,
        funds_released_inr: totalReleasedInr.toString(),
        ongoing,
        bidding,
        completed
      },
      projects: enriched
    });
  } catch (err) {
    console.error("getProjectsOverview error:", err);
    return res.status(500).json({ error: "Failed to load overview" });
  }
};

// =========================
// GET ALL PROJECTS
// =========================
exports.getProjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};



// =========================
// GET SINGLE PROJECT
// =========================
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json(data);

  } catch (err) {
    res.status(404).json({ error: "Project not found" });
  }
};