const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  lastMessageId: { type: Schema.Types.ObjectId, ref: "Message" },
});

modules.exports = mongoose.model("Conversation", ConversationSchema);
