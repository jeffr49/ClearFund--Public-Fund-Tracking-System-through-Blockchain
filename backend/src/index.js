const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { listenToProject } = require("./listeners/events");
const supabase = require("./db/supabaseClient");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "backend" });
});

app.use("/auth", require("./routes/auth"));
app.use("/projects", require("./routes/projects"));
app.use("/signer", require("./routes/signer"));
app.use("/bids", require("./routes/bids"));
app.use("/upload", require("./routes/upload"));
app.use("/contractor", require("./routes/contractor"));
app.use("/api/chat", require("./routes/chat"));


// =========================
// INIT LISTENERS
// =========================
async function initListeners() {
  try {
    if (!process.env.RPC_URL && !process.env.ALCHEMY_URL) {
      console.warn("Skipping listener init: set RPC_URL or ALCHEMY_URL");
      return;
    }

    console.log(" Initializing blockchain listeners...");

    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .not("contract_address", "is", null);

    if (error) {
      console.error("Supabase error:", error);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log("No active projects found");
      return;
    }

    projects.forEach((p) => {
      console.log(` Attaching listener → ${p.contract_address}`);
      listenToProject(p.id, p.contract_address);
    });

  } catch (err) {
    console.error("Listener init failed:", err);
  }
}


// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(` Server running on port ${PORT}`);

  // Start listeners AFTER server starts
  await initListeners();
});