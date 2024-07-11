const express = require("express");
const router = express.Router();

const notificationControllers = require("../controllers/notifications.js");

router.get("/notifications", notificationControllers.getNotifications);

router.put(
  "/notifications/:notificationId/read",
  notificationControllers.markAsRead
);

router.put("/notifications/read", notificationControllers.markAllAsRead);

module.exports = router;
