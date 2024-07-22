const express = require("express");
const router = express.Router();
const groupControllers = require("../controllers/groups");

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management
 */

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Group created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/groups", groupControllers.createGroup);

/**
 * @swagger
 * /api/groups/{groupId}/messages:
 *   post:
 *     summary: Send a message to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent to group successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.post("/groups/:groupId/messages", groupControllers.sendMessageToGroup);

/**
 * @swagger
 * /api/groups/{groupId}/messages:
 *   get:
 *     summary: Get messages for a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: List of group messages
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.get("/groups/:groupId/messages", groupControllers.getGroupMessages);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   get:
 *     summary: Get details of a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 */
router.get("/groups/:groupId", groupControllers.getGroupDetails);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get user's groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user groups
 *       401:
 *         description: Unauthorized
 */
router.get("/groups", groupControllers.getUserGroups);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   put:
 *     summary: Update group details
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the group
 *               description:
 *                 type: string
 *                 description: The description of the group
 *               groupIcon:
 *                 type: string
 *                 format: binary
 *                 description: The icon of the group
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.put("/groups/:groupId", groupControllers.updateGroupDetails);

/**
 * @swagger
 * /api/groups/{groupId}/members:
 *   put:
 *     summary: Add members to a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Members added successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can add members
 *       404:
 *         description: Group not found
 */
router.put("/groups/:groupId/members", groupControllers.addMembers);

/**
 * @swagger
 * /api/groups/{groupId}/members/{userId}:
 *   put:
 *     summary: Remove a member from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to remove
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can remove members
 *       404:
 *         description: Group not found
 */
router.put("/groups/:groupId/members/:userId", groupControllers.removeMember);

/**
 * @swagger
 * /api/groups/{groupId}/leave:
 *   put:
 *     summary: Leave a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: User left the group successfully
 *       400:
 *         description: Appoint an admin before leaving
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Group not found
 */
router.put("/groups/:groupId/leave", groupControllers.leaveGroup);

/**
 * @swagger
 * /api/groups/{groupId}/admin/{userId}:
 *   put:
 *     summary: Appoint a user as an admin
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to appoint as admin
 *     responses:
 *       200:
 *         description: New admin appointed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can appoint admin
 *       404:
 *         description: Group not found
 */
router.put("/groups/:groupId/admin/:userId", groupControllers.appointAdmin);

/**
 * @swagger
 * /api/groups/{groupId}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: Group deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admins can delete a group
 *       404:
 *         description: Group not found
 */
router.delete("/groups/:groupId", groupControllers.deleteGroup);

module.exports = router;
