const express = require("express");
const router = express.Router();

const messageControllers = require("../controllers/messages");

router.post("/messages/:receiverId/send", messageControllers.sendMessage);

router.put("/messages/:msgId/update/:status", messageControllers.updateMessageStatus);

module.exports = router;
