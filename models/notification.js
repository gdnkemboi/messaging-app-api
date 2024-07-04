const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  message: { type: String },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("Notification", NotificationSchema);
