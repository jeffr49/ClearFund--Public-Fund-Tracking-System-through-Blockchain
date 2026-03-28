const supabase = require("../db/supabaseClient");

/**
 * Test-only login: compares submitted password to `password_hash` column as plaintext.
 * Expects the row's `role` to match the dashboard role the user selected.
 */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: "email, password, and role are required"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: rows, error } = await supabase
      .from("users")
      .select("id, email, password_hash, wallet_address, role, name")
      .eq("email", normalizedEmail)
      .eq("role", role);

    if (error) throw error;

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid email, password, or role" });
    }

    const user = rows.find((row) => row.password_hash === password);

    if (!user) {
      return res.status(401).json({ error: "Invalid email, password, or role" });
    }

    const { password_hash: _omit, ...safe } = user;
    return res.json({ user: safe });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};
