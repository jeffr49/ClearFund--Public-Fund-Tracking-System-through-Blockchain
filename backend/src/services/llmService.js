const axios = require("axios");
const { fetchProjectContext } = require("./dbService");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are ClearFund Assistant, an expert AI guide for the ClearFund platform - a blockchain-based project management and funding system. Your role is to help users understand public projects, funding status, milestones, and blockchain-backed progress tracking.

Guidelines:
- You have access to the latest project database information
- Provide clear, concise answers about projects, budgets, milestones, and phases
- Always cite the specific project or data you're referencing
- If asked about features, explain how blockchain ensures transparency and security
- Be helpful and encouraging about public funding and project participation
- If you don't have information about something, say so clearly
- Keep responses focused on ClearFund-related topics`;

/**
 * Query the RAG system using GROQ LLM
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages in format [{role: 'user'|'assistant', content: string}]
 * @param {string} context - Database context about projects
 * @returns {Promise<string>} - AI response
 */
exports.queryRAG = async (userMessage, conversationHistory = [], context) => {
  try {
    // Build messages array with context
    const messages = [
      {
        role: "user",
        content: `Here is the current ClearFund database context:\n\n${context}\n\n---\n\nUser message: ${userMessage}`
      }
    ];

    // Add conversation history (last 5 exchanges to avoid token limits)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-10); // Last 10 messages
      messages.unshift(...recentHistory);
    }

    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9
      },
      {
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error("API_BUSY: Rate limit exceeded");
    }
    if (error.response?.data?.error?.code === "quota_exceeded_error") {
      throw new Error("QuotaExceeded: API quota exceeded");
    }
    throw error;
  }
};

/**
 * Build context from database for RAG
 * @returns {Promise<string>} - Formatted context string
 */
exports.buildContext = async () => {
  try {
    const projects = await fetchProjectContext();
    
    if (!projects || projects.length === 0) {
      return "No projects currently available in the database.";
    }

    // Format projects into readable context
    const formattedProjects = projects.map(p => {
      const milestone = p.milestones && p.milestones.length > 0 
        ? `Milestones: ${p.milestones.map(m => m.title).join(", ")}`
        : "No milestones";
      
      return `
Project: ${p.title}
- Status: ${p.status || 'Unknown'}
- Budget: ₹${p.maximumBidAmount || 'Not specified'}
- Description: ${p.description || 'No description'}
- Location: ${p.location_address || 'Not specified'}
- ${milestone}
- Contractor Wallet: ${p.contractor_wallet || 'Not assigned'}`;
    }).join("\n");

    return `
CLEARFUND DATABASE CONTEXT:
Total Projects: ${projects.length}

${formattedProjects}

Current Timestamp: ${new Date().toISOString()}
    `;
  } catch (error) {
    console.error("Error building context:", error);
    return "Error retrieving project context. Please try again.";
  }
};
