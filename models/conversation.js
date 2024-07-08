const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  lastMessageId: { type: Schema.Types.ObjectId, ref: "Message" },
});

// Pre-save hook to update the updatedAt field
ConversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Conversation", ConversationSchema);
