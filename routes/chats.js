const express = require("express");
const router = express.Router();
const chatControllers = require("../controllers/chats");

/**
 * @swagger
 * tags:
 *   name: Chats
 *   description: Chat management
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get user chats
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user chats
 *       401:
 *         description: Unauthorized
 */
router.get("/chats", chatControllers.getUserChats);

/**
 * @swagger
 * /api/chats/{chatId}/messages:
 *   get:
 *     summary: Get messages for a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat
 *     responses:
 *       200:
 *         description: List of chat messages
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */
router.get("/chats/:chatId/messages", chatControllers.getChatMessages);

/**
 * @swagger
 * /api/chats/{chatId}:
 *   delete:
 *     summary: Delete a chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the chat to delete
 *     responses:
 *       200:
 *         description: Chat and its messages deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 */
router.delete("/chats/:chatId", chatControllers.deleteChat);

module.exports = router;
