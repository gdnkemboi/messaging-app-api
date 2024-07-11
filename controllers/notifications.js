const Contact = require("../models/contact");
const asyncHandler = require("express-async-handler");
const passport = require("passport");

exports.getNotifications = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId });

    res.json({ notifications });
  }),
];

exports.markAsRead = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: "Notification cleared" });
  }),
];

exports.markAllAsRead = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const notifications = await Notification.deleteMany({ user: userId });

    res.json({ message: "All Notification cleared" });
  }),
];
