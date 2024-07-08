const express = require("express");
const router = express.Router();

const conversationControllers = require("../controllers/conversations");

router.get("/conversations", conversationControllers.getConversations);

router.get(
  "/conversations/:conversationId/messages",
  conversationControllers.getConversationMessages
);

router.get("/conversations", conversationControllers.getConversationDetail);

router.delete("/converstions", conversationControllers.deleteConversation);

module.exports = router;
