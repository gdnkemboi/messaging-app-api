const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  conversation: { type: Schema.Types.ObjectId, required: true },
  converstionType: {
    type: String,
    required: true,
    enum: ["conversation", "group"],
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now() },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});

module.exports = mongoose.model("Message", MessageSchema);
