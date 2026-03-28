const { ethers } = require("ethers");
const supabase = require("../db/supabaseClient");

const factoryAbi = require("../../abi/Factory.json");

const RPC_URL = process.env.RPC_URL || process.env.ALCHEMY_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !FACTORY_ADDRESS) {
  throw new Error("Missing RPC_URL (or ALCHEMY_URL), PRIVATE_KEY, or FACTORY_ADDRESS");
}

// Provider + Wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract instance
const factory = new ethers.Contract(
  FACTORY_ADDRESS,
  factoryAbi.abi,
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
    const { error: insertApproversError } = await supabase
      .from("project_approvers")
      .upsert(
        {
          project_id: projectId,
          wallet_address: selectedApprovers
        },
        { onConflict: "project_id" }
      );
    if (insertApproversError) throw insertApproversError;

    // =========================
    // 4. PREPARE MILESTONES
    // =========================
    const raw = bid.milestone_data;
    const milestones = Array.isArray(raw)
      ? [...raw]
          .map((m, i) => ({
            ...m,
            milestone_index:
              m.milestone_index !== undefined && m.milestone_index !== null
                ? Number(m.milestone_index)
                : i
          }))
          .sort(
            (a, b) => Number(a.milestone_index) - Number(b.milestone_index)
          )
      : [];
    if (milestones.length === 0) {
      throw new Error("Bid milestones are missing");
    }

    // On-chain amounts are whole INR (rupees), matching bid milestone quotes — no ETH is locked.
    const amounts = milestones.map((m) => {
      const n = Number(m.amount);
      if (!Number.isFinite(n) || n < 0) {
        throw new Error(`Invalid milestone amount (INR): ${m.amount}`);
      }
      return BigInt(Math.round(n));
    });

    const deadlines = milestones.map((m) => {
      const t = new Date(m.deadline).getTime();
      if (Number.isNaN(t)) {
        throw new Error(`Invalid milestone deadline: ${m.deadline}`);
      }
      return Math.floor(t / 1000);
    });

    // =========================
    // 5. DEPLOY CONTRACT (non-payable; INR-only bookkeeping on-chain)
    // =========================
    const tx = await factory.createProject(
      bid.contractor_wallet,
      selectedApprovers,
      amounts,
      deadlines,
      2 // approval threshold
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