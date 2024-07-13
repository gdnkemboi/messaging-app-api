const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const Message = require("../models/message");
const Chat = require("../models/chat");
const Contact = require("../models/contact");
const Notification = require("../models/notification");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

exports.sendMessage = [
  passport.authenticate("jwt", { session: false }),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content cannot be empty")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiverId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    // Check if user is part of the receiver's contact
    let receiverContact = await Contact.findOne({
      user: receiverId,
      contact: userId,
    });

    // If user is in receiver's contact and is blocked message can't get sent
    if (receiverContact && receiverContact.status === "blocked") {
      return res.json.status(403)({
        message: "Can't send message to this user because you're blocked",
      });
    } else if (!receiverContact) {
      // If user is not part of receiver's contact add them
      let contact = new Contact({
        user: receiverId,
        contact: userId,
        status: "pending",
      });

      await contact.save();
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, receiverId] },
    });

    // If no converstion foun, create a new one
    if (!chat) {
      let chat = new Chat({
        participants: [userId, receiverId],
      });

      chat = await chat.save();
    }

    // Create a new message instance
    let message = new Message({
      sender: req.user._id,
      chat: chat._id,
      chatType: "chat",
      content: req.body.content,
    });

    message = await message.save();

    // Add new message notification
    const notification = new Notification({
      user: receiverId,
      content: `You have a new message from ${user.username}`,
    });

    await notification.save();

    // Add lastMessageId to conversation
    chat.lastMessageId = message._id;
    await chat.save();

    res.status(200).json({ msg: "Message sent successfully", message });
  }),
];

exports.updateMessageStatus = asyncHandler(async (req, res, next) => {
  const { status, msgId } = req.params;
  let message = await Message.findById(msgId);

  if (!message) {
    const err = new Error("Message not found");
    err.status = 404;
    next(err);
  }

  if (!["delivered", "read"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  switch (status) {
    case "delivered":
      message.status = "delivered";
      break;
    case "read":
      message.status = "read";
      break;
  }

  message = await message.save();

  res.json({ msg: `Message status updated to ${status}`, message });
});
