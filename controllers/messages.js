const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
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
    const senderId = req.user._id;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no converstion foun, create a new one
    if (!conversation) {
      const newConversation = new Conversation({
        participants: [senderId, receiverId],
      });

      conversation = await newConversation.save();
    }

    // Create a new message instance
    const newMessage = new Message({
      sender: req.user._id,
      conversation: conversation._id,
      converstionType: "conversation",
      content: req.body.content,
    });

    const message = await newMessage.save();

    // Add lastMessageId to converstion
    conversation.lastMessageId = message._id;
    await conversation.save();

    res.status(200).json({ msg: "Message received successfully", message });
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
