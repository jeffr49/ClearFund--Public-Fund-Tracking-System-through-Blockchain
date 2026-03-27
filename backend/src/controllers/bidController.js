const { listenToProject } = require("../listeners/events");
const pool = require("../db/client");
const { deployProject } = require("../web3/factory");

// =========================
// SUBMIT BID
// =========================
exports.submitBid = async (req, res) => {
  try {
    const { projectId, totalAmount, milestones, wallet } = req.body;

    // Fetch project
    const project = await pool.query(
      "SELECT maximum_bid_amount FROM projects WHERE id=$1",
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Validate max bid
    if (totalAmount > project.rows[0].maximum_bid_amount) {
      return res.status(400).json({ error: "Bid too high" });
    }

    // Insert bid
    await pool.query(
      `INSERT INTO bids 
       (id, project_id, contractor_wallet, total_amount, milestone_data)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
      [projectId, wallet, totalAmount, milestones]
    );

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

    // 1. Fetch bids sorted by lowest
    const bids = await pool.query(
      "SELECT * FROM bids WHERE project_id=$1 ORDER BY total_amount ASC",
      [projectId]
    );

    if (bids.rows.length === 0) {
      return res.status(400).json({ error: "No bids available" });
    }

    const selected = bids.rows[0];

    // 2. Deploy contract (IMPORTANT: pass projectId)
    const { contractAddress, approvers } = await deployProject(
      selected,
      projectId
    );

    // 3. Update project
    await pool.query(
      "UPDATE projects SET contract_address=$1, status='active' WHERE id=$2",
      [contractAddress, projectId]
    );

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