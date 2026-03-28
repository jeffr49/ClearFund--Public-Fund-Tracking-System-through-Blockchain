const { queryRAG, buildContext } = require("../services/llmService");

exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Message is required and must be a string"
      });
    }

    // Build context from database
    const context = await buildContext();

    // Send to LLM service for RAG processing
    const response = await queryRAG(message, conversationHistory, context);

    res.json({ message: response });
  } catch (error) {
    console.error("Chat Error:", error);

    // Handle rate limiting
    if (error.message.includes("429")) {
      return res.status(429).json({
        error: "API_BUSY",
        message: "API rate limit exceeded. Please wait and try again.",
        details: error.message
      });
    }

    // Handle quota errors
    if (error.message.includes("QuotaExceeded")) {
      return res.status(429).json({
        error: "QUOTA_EXCEEDED",
        message: "API quota exceeded. Please try again later.",
        details: error.message
      });
    }

    res.status(500).json({
      error: "CHAT_ERROR",
      message: "Failed to process your message",
      details: error.message
    });
  }
};
