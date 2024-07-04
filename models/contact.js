const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contact: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "blocked"],
    default: "pending",
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});

// Pre-save hook to update the updatedAt field
ContactSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("ContactSchema", Contact);
