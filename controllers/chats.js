const Chat = require("../models/chat");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const authenticateJWT = require("../middleware/authenticateJWT");

exports.getUserChats = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    let chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants")
      .populate("lastMessageId");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Construct full URL for participants' profile pictures
    chats = chats.map((chat) => {
      chat.participants = chat.participants.map((participant) => {
        participant.profilePicture = participant.profilePicture
          ? `${baseUrl}${participant.profilePicture}`
          : null;
        return participant;
      });
      return chat;
    });

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
    const userId = req.user._id;

    // Delete the chat
    const chat = await Chat.findByIdAndDelete(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Delete all messages associated with the chat
    await Message.deleteMany({ chat: chatId });

    // Fetch remaining user chats
    let chats = await Chat.find({
      participants: { $in: [userId] },
    })
      .populate("participants")
      .populate("lastMessageId");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // Construct full URL for participants' profile pictures
    chats = chats.map((chat) => {
      chat.participants = chat.participants.map((participant) => {
        participant.profilePicture = participant.profilePicture
          ? `${baseUrl}${participant.profilePicture}`
          : null;
        return participant;
      });
      return chat;
    });

    res.json({ message: "Chat and its messages deleted", chats });
  }),
];
