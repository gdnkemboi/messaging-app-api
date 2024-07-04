const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now() },
  updatedAt: { type: Date, default: Date.now() },
  description: { type: String },
});

// Pre-save hook to update the updatedAt field
GroupSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Group", GroupSchema);
