const express = require("express");
const router = express.Router();
const messageControllers = require("../controllers/messages");

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Message management
 */

/**
 * @swagger
 * /api/messages/{receiverId}/send:
 *   post:
 *     summary: Send a message to a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the receiver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the message
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (if blocked)
 */
router.post("/messages/:receiverId/send", messageControllers.sendMessage);

/**
 * @swagger
 * /api/messages/{msgId}/update/{status}:
 *   put:
 *     summary: Update the status of a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: msgId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the message
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [delivered, read]
 *         description: The new status of the message
 *     responses:
 *       200:
 *         description: Message status updated
 *       404:
 *         description: Message not found
 */
router.put(
  "/messages/:msgId/update/:status",
  messageControllers.updateMessageStatus
);

module.exports = router;
