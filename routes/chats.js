const express = require("express");
const router = express.Router();
const chatControllers = require("../controllers/chats");

router.get("/chats", chatControllers.getUserChats);

router.get(
  "/chats/:chatId/messages",
  chatControllers.getChatMessages
);

router.delete("/chats/:chatId", chatControllers.deleteChat);

module.exports = router;
