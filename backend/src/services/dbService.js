const supabase = require("../db/supabaseClient");

/**
 * Fetch project context for RAG
 * @returns {Promise<Array>} - Array of projects with relevant data
 */
exports.fetchProjectContext = async () => {
  try {
    // Fetch projects with related data
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        id,
        title,
        description,
        status,
        maximumBidAmount,
        contractor_wallet,
        created_at,
        contract_address,
        location_address,
        bidding_deadline,
        deadline
      `)
      .limit(50); // Limit to prevent context overflow

    if (error) {
      console.error("Supabase error fetching projects:", error);
      return [];
    }

    if (!projects || projects.length === 0) {
      return [];
    }

    // Enrich projects with milestone data
    const enrichedProjects = await Promise.all(
      projects.map(async (project) => {
        try {
          const { data: milestones } = await supabase
            .from("milestones")
            .select("id, title, description, status")
            .eq("project_id", project.id);

          return {
            ...project,
            milestones: milestones || []
          };
        } catch (err) {
          console.error(`Error fetching milestones for project ${project.id}:`, err);
          return { ...project, milestones: [] };
        }
      })
    );

    return enrichedProjects;
  } catch (error) {
    console.error("Error fetching project context:", error);
    return [];
  }
};

/**
 * Search for specific project information
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Search results
 */
exports.searchProjects = async (query) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, status, maximumBidAmount")
      .filter("title", "ilike", `%${query}%`)
      .limit(10);

    if (error) {
      console.error("Supabase search error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error searching projects:", error);
    return [];
  }
};

/**
 * Get project statistics for context
 * @returns {Promise<Object>} - Project statistics
 */
exports.getProjectStats = async () => {
  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("status, maximumBidAmount");

    if (error || !projects) {
      return {};
    }

    const stats = {
      total: projects.length,
      byStatus: {},
      totalBudget: 0
    };

    projects.forEach(p => {
      stats.byStatus[p.status] = (stats.byStatus[p.status] || 0) + 1;
      if (p.maximumBidAmount) stats.totalBudget += p.maximumBidAmount;
    });

    return stats;
  } catch (error) {
    console.error("Error getting project stats:", error);
    return {};
  }
};
