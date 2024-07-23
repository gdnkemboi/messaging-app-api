const express = require("express");
const router = express.Router();
const notificationControllers = require("../controllers/notifications");

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get("/notifications", notificationControllers.getNotifications);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the notification
 *     responses:
 *       200:
 *         description: Notification cleared
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete(
  "/notifications/:notificationId/read",
  notificationControllers.markAsRead
);

/**
 * @swagger
 * /api/notifications/read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared
 *       401:
 *         description: Unauthorized
 */
router.delete("/notifications/read", notificationControllers.markAllAsRead);

module.exports = router;
