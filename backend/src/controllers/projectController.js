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
      governmentWallet,
      projectDeadline,
      milestones: milestoneDefs
    } = req.body;

    if (!Array.isArray(milestoneDefs) || milestoneDefs.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one milestone is required (title and description from the authority)." });
    }

    for (let i = 0; i < milestoneDefs.length; i++) {
      const m = milestoneDefs[i];
      const t = (m?.title || "").trim();
      const d = (m?.description || "").trim();
      if (!t && !d) {
        return res.status(400).json({
          error: `Milestone ${i + 1}: provide a title and/or description.`
        });
      }
    }

    const projectId = randomUUID();

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          id: projectId,
          title,
          description,
          location_lat: location.lat,
          location_lng: location.lng,
          location_address: location.address,
          government_wallet: governmentWallet,
          bidding_deadline: biddingDeadline,
          deadline: projectDeadline,
          maximumBidAmount: maximumBidAmount,
          status: "bidding"
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const milestoneRows = milestoneDefs.map((m, idx) => ({
      project_id: projectId,
      milestone_index: idx,
      title: (m.title || "").trim() || null,
      description: (m.description || "").trim() || null,
      amount: null,
      deadline: idx === milestoneDefs.length - 1 ? projectDeadline : null,
      status: "yet_to_start"
    }));

    const { error: msError } = await supabase.from("milestones").insert(milestoneRows);
    if (msError) throw msError;

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

function uniqueFundsReleaseEvents(events) {
  const seenMilestones = new Set();
  const uniqueEvents = [];

  for (const event of events || []) {
    const key = `${event.project_id || ""}-${Number(event.milestone_id)}`;
    if (seenMilestones.has(key)) continue;

    seenMilestones.add(key);
    uniqueEvents.push(event);
  }

  return uniqueEvents;
}

// =========================
// OVERVIEW (stats + projects for map / grid)
// =========================
exports.getProjectsOverview = async (req, res) => {
  try {
    const [
      { data: projects, error: projectsError },
      { data: allEvents, error: eventsError },
      { data: milestoneRows, error: msError }
    ] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("project_id, milestone_id, event_type, metadata, created_at")
        .in("event_type", ["FUNDS_RELEASED", "PROOF_SUBMITTED", "MILESTONE_APPROVED", "MILESTONE_REJECTED", "DEADLINE_EXTENDED"])
        .order("created_at", { ascending: true }),
      supabase
        .from("milestones")
        .select("project_id, milestone_index, title, description, deadline")
    ]);

    if (projectsError) throw projectsError;
    if (eventsError) throw eventsError;
    if (msError) throw msError;

    const fundEvents = (allEvents || []).filter(e => e.event_type === "FUNDS_RELEASED");

    const uniqueFundEvents = uniqueFundsReleaseEvents(fundEvents);

    // Group events and parse proof statuses
    const proofsByProject = new Map();
    const pidGroups = new Map();
    for (const e of allEvents || []) {
       if (e.project_id === null || e.milestone_id === null) continue;
       const pid = e.project_id;
       const mIdx = Number(e.milestone_id);
       if (!pidGroups.has(pid)) pidGroups.set(pid, new Map());
       if (!pidGroups.get(pid).has(mIdx)) pidGroups.get(pid).set(mIdx, []);
       pidGroups.get(pid).get(mIdx).push(e);
    }

    for (const [pid, projMap] of pidGroups.entries()) {
       const pProofs = new Map();
       proofsByProject.set(pid, pProofs);
       for (const [mIdx, evs] of projMap.entries()) {
          const categorizedHashes = [];
          for (let i = 0; i < evs.length; i++) {
             const ev = evs[i];
             if (ev.event_type !== "PROOF_SUBMITTED" || !ev.metadata?.ipfsHash) continue;
             
             let status = "Pending";
             for (let j = i + 1; j < evs.length; j++) {
                const nextEv = evs[j];
                if (nextEv.event_type === "MILESTONE_REJECTED" || nextEv.event_type === "DEADLINE_EXTENDED") {
                   status = "Rejected"; break;
                }
                if (nextEv.event_type === "MILESTONE_APPROVED" || nextEv.event_type === "FUNDS_RELEASED") {
                   status = "Accepted"; break;
                }
             }

             const hashes = ev.metadata.ipfsHash.split(",").map(h => h.trim()).filter(Boolean);
             for (const hash of hashes) {
               // Prevent duplicates by checking array
               if (!categorizedHashes.some(ch => ch.hash === hash)) {
                  categorizedHashes.push({ hash, status });
               }
             }
          }
          pProofs.set(mIdx, categorizedHashes);
       }
    }

    // FUNDS_RELEASED metadata.amount = whole INR (on-chain milestone amount; bank payout is off-chain)
    const fundsInrByProject = new Map();
    let totalReleasedInr = 0n;

    for (const ev of uniqueFundEvents) {
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
    for (const ev of uniqueFundEvents) {
      if (!ev.project_id) continue;
      releasedCountByProject.set(
        ev.project_id,
        (releasedCountByProject.get(ev.project_id) || 0) + 1
      );
    }

    const milestoneCountByProject = new Map();
    const milestonesByProject = new Map();
    for (const row of milestoneRows || []) {
      if (!row.project_id) continue;
      milestoneCountByProject.set(
        row.project_id,
        (milestoneCountByProject.get(row.project_id) || 0) + 1
      );
      if (!milestonesByProject.has(row.project_id)) {
        milestonesByProject.set(row.project_id, []);
      }

      const mIdx = row.milestone_index;
      let proofs = [];
      if (proofsByProject.has(row.project_id)) {
          const mProofs = proofsByProject.get(row.project_id);
          if (mProofs.has(mIdx)) {
              proofs = [...new Set(mProofs.get(mIdx))];
          }
      }

      milestonesByProject.get(row.project_id).push({
        milestone_index: mIdx,
        title: row.title,
        description: row.description,
        deadline: row.deadline,
        proofs
      });
    }
    for (const arr of milestonesByProject.values()) {
      arr.sort((a, b) => Number(a.milestone_index) - Number(b.milestone_index));
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
        deadline: p.deadline,
        total_milestones: totalMs,
        completed_milestones: completedDisplay,
        current_phase: currentPhase,
        project_deadline: p.deadline,
        milestones: milestonesByProject.get(pid) || []
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
      .select(`
        *,
        milestones (*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    
    // Ensure milestones are sorted by index
    if (data && data.milestones) {
      data.milestones.sort((a, b) => Number(a.milestone_index) - Number(b.milestone_index));
    }

    res.json(data);

  } catch (err) {
    res.status(404).json({ error: "Project not found" });
  }
};
