const Contact = require("../models/contact");
const asyncHandler = require("express-async-handler");
const authenticateJWT = require("../middleware/authenticateJWT");


exports.getNotifications = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId });

    res.json({ notifications });
  }),
];

exports.markAsRead = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({ message: "Notification cleared" });
  }),
];

exports.markAllAsRead = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const notifications = await Notification.deleteMany({ user: userId });

    res.json({ message: "All Notification cleared" });
  }),
];
