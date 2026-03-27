const pool = require("../db/client");

exports.getSignerTasks = async (req, res) => {
  try {
    const wallet = req.query.wallet;

    // FIXED: use ANY for ARRAY column
    const projRes = await pool.query(
      "SELECT project_id FROM project_approvers WHERE $1 = ANY(wallet_address)",
      [wallet]
    );

    const projectIds = projRes.rows.map(p => p.project_id);

    if (projectIds.length === 0) return res.json([]);

    const eventsRes = await pool.query(
      `
      SELECT 
        e.*,
        p.title,
        m.description
      FROM events e
      JOIN projects p ON p.id = e.project_id
      JOIN milestones m 
        ON m.project_id = e.project_id 
        AND m.milestone_index = e.milestone_id
      WHERE e.project_id = ANY($1)
      AND e.event_type = 'PROOF_SUBMITTED'
      `,
      [projectIds]
    );

    const votedRes = await pool.query(
      `
      SELECT project_id, milestone_id 
      FROM events 
      WHERE actor=$1 
      AND event_type IN ('MILESTONE_APPROVED','MILESTONE_REJECTED')
      `,
      [wallet]
    );

    const votedSet = new Set(
      votedRes.rows.map(r => `${r.project_id}-${r.milestone_id}`)
    );

    const tasks = eventsRes.rows
      .filter(e => !votedSet.has(`${e.project_id}-${e.milestone_id}`))
      .map(e => ({
        id: e.id,
        project_title: e.title,
        contract_address: e.contract_address,
        milestone_id: e.milestone_id,
        description: e.description,
        ipfsHash: e.metadata?.ipfsHash || null
      }));

    res.json(tasks);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
};