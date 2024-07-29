const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: {
    type: String,
    default: "/images/blank-profile-picture.png",
  },
  about: { type: String, default: "Just chatting here!" },
  createdAt: { type: Date, default: Date.now() },
  status: { type: String, enum: ["Online", "Offline"], default: "Offline" },
});

// Hash the password on user save
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});
// Compare entered password with hashed version in the db
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
