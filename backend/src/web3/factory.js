const { ethers } = require("ethers");
const supabase = require("../db/supabaseClient");

const factoryAbi = require("../../abi/Factory.json");

if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.FACTORY_ADDRESS) {
  throw new Error("Missing RPC_URL, PRIVATE_KEY, or FACTORY_ADDRESS");
}

// Provider + Wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract instance
const factory = new ethers.Contract(
  process.env.FACTORY_ADDRESS,
  factoryAbi,
  wallet
);

// 🔥 MAIN FUNCTION
exports.deployProject = async (bid, projectId) => {
  try {
    // =========================
    // 1. FETCH APPROVERS POOL
    // =========================
    const { data: approvers, error: approversError } = await supabase
      .from("approvers")
      .select("wallet_address");
    if (approversError) throw approversError;

    const allApprovers = (approvers || []).map((r) => r.wallet_address);

    if (allApprovers.length < 3) {
      throw new Error("Not enough approvers in pool");
    }

    // =========================
    // 2. RANDOMLY PICK 3
    // =========================
    const shuffled = allApprovers.sort(() => 0.5 - Math.random());
    const selectedApprovers = shuffled.slice(0, 3);

    // =========================
    // 3. STORE IN DB
    // =========================
    const rows = selectedApprovers.map((addr) => ({
      project_id: projectId,
      wallet_address: addr
    }));
    const { error: insertApproversError } = await supabase
      .from("project_approvers")
      .upsert(rows, { onConflict: "project_id,wallet_address" });
    if (insertApproversError) throw insertApproversError;

    // =========================
    // 4. PREPARE MILESTONES
    // =========================
    const milestones = bid.milestone_data;
    if (!Array.isArray(milestones) || milestones.length === 0) {
      throw new Error("Bid milestones are missing");
    }

    const amounts = milestones.map(m =>
      ethers.parseEther(m.amount.toString())
    );

    const deadlines = milestones.map((_, i) =>
      Math.floor(Date.now() / 1000) + (i + 1) * 86400 // stagger deadlines
    );

    // =========================
    // 5. DEPLOY CONTRACT
    // =========================
    const totalValue = amounts.reduce((a, b) => a + b, 0n);

    const tx = await factory.createProject(
      bid.contractor_wallet,
      selectedApprovers,
      amounts,
      deadlines,
      2, // approval threshold
      {
        value: totalValue,
      }
    );

    const receipt = await tx.wait();

    // =========================
    // 6. EXTRACT CONTRACT ADDRESS
    // =========================
    let contractAddress = null;

    for (const log of receipt.logs) {
      try {
        const parsed = factory.interface.parseLog(log);

        if (parsed.name === "ProjectCreated") {
          contractAddress = parsed.args.projectAddress;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!contractAddress) {
      throw new Error("Failed to get contract address from event");
    }

    // =========================
    // 7. RETURN RESULT
    // =========================
    return {
      contractAddress,
      approvers: selectedApprovers
    };

  } catch (err) {
    console.error("Factory deploy error:", err);
    throw err;
  }
};