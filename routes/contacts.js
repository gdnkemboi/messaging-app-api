const express = require("express");
const router = express.Router();
const contactControllers = require("../controllers/contacts");

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: User contact management
 */

/**
 * @swagger
 * /api/contacts/{contactId}:
 *   post:
 *     summary: Add a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact to add
 *     responses:
 *       200:
 *         description: Contact added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact not found
 */
router.post("/contacts/:contactId", contactControllers.addContact);

/**
 * @swagger
 * /api/contacts/:
 *   get:
 *     summary: Get user contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contacts
 *       401:
 *         description: Unauthorized
 */
router.get("/contacts/", contactControllers.getUserContacts);

/**
 * @swagger
 * /api/contacts/{contactId}/block:
 *   put:
 *     summary: Block a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact to block
 *     responses:
 *       200:
 *         description: Contact blocked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact not found
 */
router.put("/contacts/:contactId/block", contactControllers.blockContact);

/**
 * @swagger
 * /api/contacts/{contactId}:
 *   delete:
 *     summary: Delete a contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the contact to delete
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Contact not found
 */
router.delete("/contacts/:contactId", contactControllers.deleteContact);

module.exports = router;
