const express = require("express");
const router = express.Router();

const conversationControllers = require("../controllers/conversations");

router.post("/converstions", conversationControllers.createConversation);

router.get("/conversations", conversationControllers.getConversations);

router.get("/conversations", conversationControllers.getConversationDetail);

router.delete("/converstions", conversationControllers.deleteConversation);

module.exports = router;
