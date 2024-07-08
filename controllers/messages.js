const asyncHandler = require("express-async-handler");
const Message = require("../models/message");
const Chat = require("../models/chat");
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

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no converstion foun, create a new one
    if (!chat) {
      const newChat = new Chat({
        participants: [senderId, receiverId],
      });

      chat = await newChat.save();
    }

    // Create a new message instance
    const newMessage = new Message({
      sender: req.user._id,
      chat: chat._id,
      chatType: "chat",
      content: req.body.content,
    });

    const message = await newMessage.save();

    // Add lastMessageId to converstion
    chat.lastMessageId = message._id;
    await chat.save();

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
