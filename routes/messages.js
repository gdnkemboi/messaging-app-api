const express = require("express");
const router = express.Router;

const messageControllers = require("../controllers/messages");

router.post("/messages", messageControllers.sendMessage);

router.get("/:conversationId/messages");

module.exports = router;
