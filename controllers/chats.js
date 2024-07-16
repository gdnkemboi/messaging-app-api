const Chat = require("../models/chat");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const authenticateJWT = require("../middleware/authenticateJWT");

exports.getUserChats = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const chats = await Chat.find({
      participants: { $in: [userId] },
    }).populate("participants");

    res.json({ chats });
  }),
];

exports.getChatMessages = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      const err = new Error("Chat not found");
      err.status = 404;
      next(err);
    }

    const messages = await Message.find({
      chat: chat._id,
    })
      .populate("sender", "username")
      .sort({ timestamp: 1 });

    res.json({ messages });
  }),
];

exports.deleteChat = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const chatId = req.params.chatId;

    // Delete the chat
    const chat = await Chat.findByIdAndDelete(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Delete all messages associated with the chat
    await Message.deleteMany({ chat: chatId });

    res.json({ message: "Chat and its messages deleted" });
  }),
];
