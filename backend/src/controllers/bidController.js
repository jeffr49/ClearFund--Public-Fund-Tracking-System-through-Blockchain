const { listenToProject } = require("../listeners/events");
const supabase = require("../db/supabaseClient");
const { deployProject } = require("../web3/factory");
const { generateBidId } = require("../utils/idGenerator");

function sortTemplate(rows) {
  return [...(rows || [])].sort(
    (a, b) => Number(a.milestone_index) - Number(b.milestone_index)
  );
}

/**
 * Aligns contractor amounts/deadlines to the government milestone template (same count & order).
 * Stored shape: { milestone_index, amount, deadline } (deadline ISO string).
 */
function buildBidMilestonePayload(incoming, templateSorted) {
  const n = templateSorted.length;
  if (!Array.isArray(incoming) || incoming.length !== n) {
    const err = new Error(`Bid must include exactly ${n} milestone row(s) for this tender.`);
    err.status = 400;
    throw err;
  }

  const out = [];
  let sum = 0;

  for (let i = 0; i < n; i++) {
    const row = incoming[i];
    const tpl = templateSorted[i];
    const idx =
      row.milestone_index !== undefined && row.milestone_index !== null
        ? Number(row.milestone_index)
        : Number(tpl.milestone_index);
    if (idx !== Number(tpl.milestone_index)) {
      const err = new Error(
        `Milestone row ${i + 1} must match template index ${tpl.milestone_index}.`
      );
      err.status = 400;
      throw err;
    }

    const amount = Number(row.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      const err = new Error(`Invalid amount for milestone ${idx + 1}.`);
      err.status = 400;
      throw err;
    }

    const rawDeadline = row.deadline;
    if (rawDeadline === undefined || rawDeadline === null || rawDeadline === "") {
      const err = new Error(`Deadline required for milestone ${idx + 1}.`);
      err.status = 400;
      throw err;
    }
    const d = new Date(rawDeadline);
    if (Number.isNaN(d.getTime())) {
      const err = new Error(`Invalid deadline for milestone ${idx + 1}.`);
      err.status = 400;
      throw err;
    }

    sum += amount;
    out.push({
      milestone_index: idx,
      amount,
      deadline: d.toISOString()
    });
  }

  return { lines: out, sum };
}


// =========================
// GET PROJECT BIDS
// =========================
exports.getProjectBids = async (req, res) => {
  try {
    const { projectId } = req.params;

    // We will fetch bids and then map contractor names
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select("*")
      .eq("project_id", projectId)
      .order("total_amount", { ascending: true });

    if (bidsError) throw bidsError;

    // Get unique contractor wallets
    const wallets = (bids || []).map((b) => b.contractor_wallet).filter(Boolean);

    let usersMap = {};
    if (wallets.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("wallet_address, name")
        .in("wallet_address", wallets)
        .eq("role", "contractor");

      if (!usersError && users) {
        users.forEach(u => { usersMap[u.wallet_address] = u.name; });
      }
    }

    const enriched = (bids || []).map(b => ({
      ...b,
      contractor_name: usersMap[b.contractor_wallet] || "Unknown Contractor"
    }));

    res.json(enriched);
  } catch (err) {
    console.error("Failed to fetch project bids", err);
    res.status(500).json({ error: "Failed to fetch project bids" });
  }
};

// =========================
// SUBMIT BID
// =========================
exports.submitBid = async (req, res) => {
  try {
    const { projectId, totalAmount, milestones, wallet } = req.body;
    if (
      !projectId ||
      !wallet ||
      typeof totalAmount !== "number" ||
      !Array.isArray(milestones) ||
      milestones.length === 0
    ) {
      return res.status(400).json({ error: "Invalid bid payload" });
    }

    // ── Duplicate-bid guard ──────────────────────────────────
    const { data: existingBid, error: dupError } = await supabase
      .from("bids")
      .select("id")
      .eq("project_id", projectId)
      .eq("contractor_wallet", wallet)
      .maybeSingle();

    if (dupError) throw dupError;
    if (existingBid) {
      return res.status(400).json({
        error: "You have already submitted a bid for this project."
      });
    }
    // ─────────────────────────────────────────────────────────

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("maximumBidAmount, status")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if ((project.status || "").toLowerCase() !== "bidding") {
      return res.status(400).json({ error: "This project is not open for bidding." });
    }

    const maxBid = Number(
      project.maximumBidAmount ?? project.maximum_bid_amount
    );
    if (!Number.isFinite(maxBid) || totalAmount > maxBid) {
      return res.status(400).json({ error: "Bid too high" });
    }

    const { data: templateRows, error: tplError } = await supabase
      .from("milestones")
      .select("milestone_index, title, description")
      .eq("project_id", projectId);

    if (tplError) throw tplError;
    const templateSorted = sortTemplate(templateRows);
    if (templateSorted.length === 0) {
      return res.status(400).json({
        error: "This project has no milestone template; the authority must define milestones first."
      });
    }

    let normalized;
    try {
      normalized = buildBidMilestonePayload(milestones, templateSorted);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    if (Math.abs(normalized.sum - totalAmount) > 0.02) {
      return res.status(400).json({
        error: "Milestone amounts must sum to your total bid (within 0.02 INR)."
      });
    }

    const refId = generateBidId(projectId);
    const { error: insertError } = await supabase.from("bids").insert([
      {
        id: refId,
        project_id: projectId,
        contractor_wallet: wallet,
        total_amount: totalAmount,
        milestone_data: normalized.lines
      }
    ]);
    if (insertError) throw insertError;

    res.json({ success: true, bidReference: refId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit bid" });
  }
};



// =========================
// SELECT BID + DEPLOY CONTRACT
// =========================
exports.selectBid = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // 1. Fetch bids sorted by lowest
    const { data: bids, error: bidsError } = await supabase
      .from("bids")
      .select("*")
      .eq("project_id", projectId)
      .order("total_amount", { ascending: true });
    if (bidsError) throw bidsError;

    if (!bids || bids.length === 0) {
      return res.status(400).json({ error: "No bids available" });
    }

    const selected = bids[0];

    // 2. Deploy contract (IMPORTANT: pass projectId)
    const { contractAddress, approvers } = await deployProject(
      selected,
      projectId
    );

    // 3. Update project
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        contract_address: contractAddress,
        contractor_wallet: selected.contractor_wallet,
        status: "active"
      })
      .eq("id", projectId);
    if (updateError) throw updateError;

    let bidLines = selected.milestone_data;
    if (typeof bidLines === "string") {
      try {
        bidLines = JSON.parse(bidLines || "[]");
      } catch (_e) {
        bidLines = [];
      }
    }
    if (!Array.isArray(bidLines)) bidLines = [];
    const sortedBid = [...bidLines].sort(
      (a, b) => Number(a.milestone_index) - Number(b.milestone_index)
    );
    for (const line of sortedBid) {
      const { error: msUpdErr } = await supabase
        .from("milestones")
        .update({
          amount: line.amount,
          deadline: line.deadline,
          status:
            Number(line.milestone_index) === 0 ? "working" : "yet_to_start"
        })
        .eq("project_id", projectId)
        .eq("milestone_index", line.milestone_index);
      if (msUpdErr) throw msUpdErr;
    }

    // 4. Start listening to events
    listenToProject(projectId, contractAddress);

    // 4. Return response
    res.json({
      contractAddress,
      approvers,
      selectedBid: selected
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to select bid" });
  }
};

// =========================
// GET MY BIDS
// =========================
exports.getMyBids = async (req, res) => {
  try {
    const wallet = req.query.wallet;
    if (!wallet) return res.status(400).json({ error: "Wallet is required" });

    const { data: bids, error } = await supabase
      .from("bids")
      .select(`
        id,
        total_amount,
        milestone_data,
        created_at,
        project_id,
        projects (
          title,
          location_address,
          status
        )
      `)
      .eq("contractor_wallet", wallet)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = (bids || []).map(b => ({
      bid_id: b.id,
      project_id: b.project_id,
      total_amount: b.total_amount,
      milestone_data: b.milestone_data,
      created_at: b.created_at,
      project_title: b.projects?.title || "Unknown Project",
      project_location: b.projects?.location_address || "Unknown Location",
      project_status: (b.projects?.status || "bidding").toLowerCase(),
      status: "Submitted"
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bids" });
  }
};


// =========================
// UPDATE BID
// =========================
exports.updateBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { totalAmount, milestones, wallet } = req.body;

    if (!bidId || !wallet || typeof totalAmount !== "number" || !Array.isArray(milestones)) {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    // 1. Fetch existing bid
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("id, project_id, contractor_wallet")
      .eq("id", bidId)
      .single();

    if (bidError || !bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // 2. Security: wallet must match
    if (bid.contractor_wallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "You are not authorised to edit this bid." });
    }

    // 3. Project must still be in bidding phase
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("maximumBidAmount, status")
      .eq("id", bid.project_id)
      .single();

    if (projError || !project) {
      return res.status(404).json({ error: "Associated project not found" });
    }
    if ((project.status || "").toLowerCase() !== "bidding") {
      return res.status(400).json({ error: "This project is no longer open for bidding. Bids cannot be edited." });
    }

    // 4. Validate against max budget
    const maxBid = Number(project.maximumBidAmount ?? project.maximum_bid_amount);
    if (!Number.isFinite(maxBid) || totalAmount > maxBid) {
      return res.status(400).json({ error: "Bid too high" });
    }

    // 5. Validate milestones against template
    const { data: templateRows, error: tplError } = await supabase
      .from("milestones")
      .select("milestone_index, title, description")
      .eq("project_id", bid.project_id);

    if (tplError) throw tplError;
    const templateSorted = sortTemplate(templateRows);

    let normalized;
    try {
      normalized = buildBidMilestonePayload(milestones, templateSorted);
    } catch (e) {
      return res.status(e.status || 400).json({ error: e.message });
    }

    if (Math.abs(normalized.sum - totalAmount) > 0.02) {
      return res.status(400).json({
        error: "Milestone amounts must sum to your total bid (within 0.02 INR)."
      });
    }

    // 6. Perform update
    const { error: updateError } = await supabase
      .from("bids")
      .update({
        total_amount: totalAmount,
        milestone_data: normalized.lines
      })
      .eq("id", bidId);

    if (updateError) throw updateError;

    res.json({ success: true, message: "Bid updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update bid" });
  }
};


// =========================
// DELETE / WITHDRAW BID
// =========================
exports.deleteBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { wallet } = req.body;

    if (!bidId || !wallet) {
      return res.status(400).json({ error: "bidId and wallet are required" });
    }

    // 1. Fetch existing bid
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("id, project_id, contractor_wallet")
      .eq("id", bidId)
      .single();

    if (bidError || !bid) {
      return res.status(404).json({ error: "Bid not found" });
    }

    // 2. Security: wallet must match
    if (bid.contractor_wallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ error: "You are not authorised to withdraw this bid." });
    }

    // 3. Project must still be in bidding phase
    const { data: project, error: projError } = await supabase
      .from("projects")
      .select("status")
      .eq("id", bid.project_id)
      .single();

    if (projError || !project) {
      return res.status(404).json({ error: "Associated project not found" });
    }
    if ((project.status || "").toLowerCase() !== "bidding") {
      return res.status(400).json({
        error: "This project is already active. Bids cannot be withdrawn after selection."
      });
    }

    // 4. Delete the bid
    const { error: deleteError } = await supabase
      .from("bids")
      .delete()
      .eq("id", bidId);

    if (deleteError) throw deleteError;

    res.json({ success: true, message: "Bid withdrawn successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to withdraw bid" });
  }
};
