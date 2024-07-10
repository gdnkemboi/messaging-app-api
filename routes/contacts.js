const express = require("express");
const router = express.Router();

const contactControllers = require("../controllers/contacts");

router.post("/contacts/:contactId", contactControllers.addContact);

router.get("/contacts/:status", contactControllers.getUserContacts);

router.put("/contacts/:contactId/block", contactControllers.blockContact);

router.delete("/contacts/:contactId", contactControllers.deleteContact);

module.exports = router;
