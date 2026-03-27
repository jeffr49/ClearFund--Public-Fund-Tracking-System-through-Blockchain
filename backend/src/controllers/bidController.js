const { listenToProject } = require("../listeners/events");
const supabase = require("../db/supabaseClient");
const { deployProject } = require("../web3/factory");

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

    // Fetch project
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("maximum_bid_amount")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Validate max bid
    if (totalAmount > project.maximum_bid_amount) {
      return res.status(400).json({ error: "Bid too high" });
    }

    // Insert bid
    const { error: insertError } = await supabase.from("bids").insert([
      {
        project_id: projectId,
        contractor_wallet: wallet,
        total_amount: totalAmount,
        milestone_data: milestones
      }
    ]);
    if (insertError) throw insertError;

    res.json({ success: true });

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
        selected_bid_id: selected.id,
        status: "active"
      })
      .eq("id", projectId);
    if (updateError) throw updateError;

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