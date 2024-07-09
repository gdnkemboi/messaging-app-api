const Group = require("../models/group");
const User = require("../models/user");
const Contact = require("../models/contact");
const Message = require("../models/message");
const passport = require("passport");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { mongoose } = require("mongoose");

exports.createGroup = [
  passport.authenticate("jwt", { session: false }),

  // Convert members to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.members)) {
      req.body.members =
        typeof req.body.members === "undefined" ? [] : [req.body.members];
    }
    next();
  },

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name cannot be empty")
    .escape(),
  body("description").trim().escape(),
  body("members.*")
    .trim()
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid member ID");
      }
      return true;
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let userId = req.user._id;
    let members = [...req.body.members];
    members.unshift(userId);

    let group = new Group({
      name: req.body.name,
      admin: req.user._id,
      members: members,
      description: req.body.description,
    });

    group = await group.save();

    res.json({ message: "Group created successfully", group });
  }),
];

exports.getGroupDetails = asyncHandler(async (req, res, next) => {
  const group = await Group.findById(req.params.groupId).populate(
    "members",
    "username"
  );

  if (!group) {
    let err = new Error("Group not found");
    err.status = 404;
    next(err);
  }

  res.json({ group });
});

exports.getUserGroups = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const userGroups = await Group.find({
      members: { $in: [userId] },
    })
      .populate("lastMessageId")
      .exec();

    res.json({ groups: userGroups });
  }),
];

exports.updateGroupDetails = [
  passport.authenticate("jwt", { session: false }),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name cannot be empty")
    .escape(),
  body("description").trim().escape(),

  asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      let group = await Group.findByIdAndUpdate(
        groupId,
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
          },
        },
        { new: true }
      );
      res.json({ message: "Group updated successfully", group });
    }
  }),
];

exports.addMembers = [
  passport.authenticate("jwt", { session: false }),
  // Convert members to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.members)) {
      req.body.members =
        typeof req.body.members === "undefined" ? [] : [req.body.members];
    }
    next();
  },
  body("members.*").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      let err = new Error("Group not found");
      err.status = 404;
      next(err);
    }

    if (!group.isAdmin(userId)) {
      let err = new Error("Only admins can add members");
      err.status = 403;
      next(err);
    }

    const updatedMembers = [...group.members];

    // Add members to the group members array
    req.body.members.forEach((memberId) => {
      if (!updatedMembers.includes(memberId)) {
        updatedMembers.push(memberId);
      }
    });

    // Update the group with $set to update members
    let updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $set: { members: updatedMembers } },
      { new: true }
    );

    res.json({ message: "Members added successfully", group: updatedGroup });
  }),
];

exports.removeMember = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const userToRemoveId = req.params.userId;
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      let err = new Error("Group not found");
      err.status = 404;
      next(err);
    }

    if (!group.isAdmin(userId)) {
      let err = new Error("Only admins can add members");
      err.status = 403;
      next(err);
    }

    const updatedMembers = group.members.filter(
      (member) => member.toString() !== userToRemoveId
    );

    // Update the group with $set to update members
    let updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $set: { members: updatedMembers } },
      { new: true }
    );

    res.json({
      message: `Member ${userToRemoveId} removed successfully`,
      group: updatedGroup,
    });
  }),
];

exports.leaveGroup = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { groupId } = req.params;

    // Find the group by ID
    let group = await Group.findById(groupId);

    if (!group) {
      let err = new Error("Group not found");
      err.status = 404;
      return next(err);
    }

    // Check if the user is an admin and if they are the last admin
    if (group.isAdmin(userId) && group.admin.length === 1) {
      let err = new Error("Appoint an admin before leaving");
      err.status = 400;
      return next(err);
    }

    const updatedMembers = group.members.filter(
      (member) => member.toString() !== userId.toString()
    );

    const updatedAdmins = group.admin.filter(
      (admin) => admin.toString() !== userId.toString()
    );

    // Update the group with $set to update members and admins
    group = await Group.findByIdAndUpdate(
      groupId,
      { $set: { members: updatedMembers, admin: updatedAdmins } },
      { new: true }
    );

    res.json({ message: "User left the group successfully", group });
  }),
];

exports.appointAdmin = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const userForAdminId = req.params.userId;
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      let err = new Error("Group not found");
      err.status = 404;
      next(err);
    }

    if (!group.isAdmin(userId)) {
      let err = new Error("Only admins can appoint admin");
      err.status = 403;
      next(err);
    }

    const admins = [...group.admin];

    admins.push(userForAdminId);

    // Update the group with $set to update members
    let updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $set: { admin: admins } },
      { new: true }
    );

    res.json({
      message: "New admin appointed successfully",
      group: updatedGroup,
    });
  }),
];

exports.deleteGroup = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      let err = new Error("Group not found");
      err.status = 404;
      next(err);
    }

    if (!group.isAdmin(userId)) {
      let err = new Error("Only admins can delete a group");
      err.status = 403;
      next(err);
    }

    await Promise.all([
      Message.deleteMany({ chat: groupId }),
      Group.findByIdAndDelete(groupId),
    ]);

    res.json({message: "Group deleted succesfully"})
  }),
];
