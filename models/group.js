const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  groupIcon: {
    type: String,
    default: "/images/group-icon.webp",
  },
  admin: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  lastMessageId: { type: Schema.Types.ObjectId, ref: "Message" },
  lastMessageSenderId: { type: Schema.Types.ObjectId, ref: "User" },
});

// Pre-save hook to update the updatedAt field
GroupSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if a userId is an admin
GroupSchema.methods.isAdmin = function (userId) {
  return this.admin.some((adminId) => adminId.equals(userId));
};

module.exports = mongoose.model("Group", GroupSchema);
