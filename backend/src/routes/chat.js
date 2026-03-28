const express = require("express");
const router = express.Router();
const { sendMessage } = require("../controllers/chatController");

// POST /api/chat/message - Send a message and get AI response
router.post("/message", sendMessage);

module.exports = router;
