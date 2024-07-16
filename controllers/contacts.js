const Contact = require("../models/contact");
const asyncHandler = require("express-async-handler");
const authenticateJWT = require("../middleware/authenticateJWT");

exports.addContact = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { contactId } = req.params;

    let contact = new Contact({
      user: userId,
      contact: contactId,
      status: "accepted",
    });

    contact = await contact.save();

    res.json({ message: "Contact added successfully", contact });
  }),
];

exports.getUserContacts = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { status } = req.params;

    const contacts = await Contact.find({
      user: userId,
      status: status,
    }).populate("contact", "username");

    res.json({ contacts });
  }),
];

exports.blockContact = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const contactUserId = req.params.contactId;

    let contact = await Contact.findOne({ contact: contactUserId });

    if (!contact) {
      contact = new Contact({
        user: userId,
        contact: contactUserId,
        status: "blocked",
      });

      contact = await contact.save();
    } else {
      contact.status = "blocked";
      await contact.save();
    }

    res.json({ message: "Contact blocked successfully", contact });
  }),
];

exports.deleteContact = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    await Contact.deleteOne({ contact: req.params.contactId });

    res.json({ message: "Contact deleted successfully" });
  }),
];
