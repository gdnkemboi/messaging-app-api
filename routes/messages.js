const express = require("express");
const router = express.Router();

const messageControllers = require("../controllers/messages");

router.post("/messages", messageControllers.sendMessage);

router.get("/:conversationId/messages", messageControllers.getMessages);

router.put("/messages/:msgId", messageControllers.updateMessageStatus);

module.exports = router;
