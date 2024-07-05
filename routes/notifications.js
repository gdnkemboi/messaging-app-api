const express = require("express");
const router = express.Router();

const notificationControllers = require("../controllers/notifications.js");

router.get("/notifications", notificationControllers.getNotifications);

router.put(
  "/notifications/:notificationId/read",
  notificationControllers.updateNotification
);

module.exports = router;
