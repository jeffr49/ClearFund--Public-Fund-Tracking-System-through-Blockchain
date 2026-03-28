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