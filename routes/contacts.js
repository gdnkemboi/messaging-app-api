const express = require("express");
const router = express.Router();

const contactControllers = require("../controllers/contacts");

router.post("/contacts", contactControllers.addContact);

router.get("/contacts", contactControllers.getUserContacts);

router.post("/contacts/:userId/block", contactControllers.blockContact);

router.delete("/contacts/:userId", contactControllers.deleteContact);

module.exports = router;
