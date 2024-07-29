const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chat: { type: Schema.Types.ObjectId, required: true },
  chatType: {
    type: String,
    required: true,
    enum: ["chat", "group"],
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

module.exports = mongoose.model("Message", MessageSchema);
