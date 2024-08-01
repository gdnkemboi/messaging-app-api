const Group = require("../models/group");
const User = require("../models/user");
const Contact = require("../models/contact");
const Message = require("../models/message");
const Notification = require("../models/notification");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const { mongoose } = require("mongoose");
const authenticateJWT = require("../middleware/authenticateJWT");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

exports.createGroup = [
  authenticateJWT,

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

    const userId = req.user._id;
    const members = [...req.body.members];
    members.unshift(userId);

    // Create and save the group
    let group = new Group({
      name: req.body.name,
      description: req.body.description,
      admin: req.user._id,
      members: members,
    });

    group = await group.save();

    // Add notification to members added
    for (let member of req.body.members) {
      const notification = new Notification({
        user: member,
        content: `You have been added to ${req.body.name} group.`,
      });

      await notification.save();
    }

    // Fetch the group and populate the members
    group = await Group.findById(group._id)
      .populate("members", "-password")
      .lean();

    // Modify groupIcon and members' profile pictures to have full URLs
    group = {
      ...group,
      groupIcon: `${req.protocol}://${req.get("host")}${group.groupIcon}`,
      members: group.members.map((member) => ({
        ...member,
        profilePicture: `${req.protocol}://${req.get("host")}${
          member.profilePicture
        }`,
      })),
    };

    res.json({ message: "Group created successfully", group });
  }),
];

exports.sendMessageToGroup = [
  authenticateJWT,
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content cannot be empty")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const senderId = req.user._id;

    let group = await Group.findById(groupId);

    if (!group) {
      let err = new Error("Group not found");
      err.status = 404;
      next(err);
    }

    // Create a new message instance
    const newMessage = new Message({
      sender: req.user._id,
      chat: groupId,
      chatType: "group",
      content: req.body.content,
    });

    const message = await newMessage.save();

    // Add lastMessageId to converstion
    group.lastMessageId = message._id;
    group.lastMessageSenderId = senderId;
    await group.save();

    res
      .status(200)
      .json({ msg: "Message sent to group successfully", message, group });
  }),
];

exports.getGroupMessages = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      const err = new Error("Group not found");
      err.status = 404;
      next(err);
    }

    const messages = await Message.find({
      chat: groupId,
    })
      .populate("sender", "username")
      .sort({ timestamp: 1 });

    res.json({ messages });
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
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    // Fetch user groups and populate fields
    let userGroups = await Group.find({
      members: { $in: [userId] },
    })
      .populate("lastMessageId")
      .populate("lastMessageSenderId", "-password")
      .populate("members", "-password")
      .sort({ lastMessageId: -1 })
      .lean();

    // Map over user groups to modify groupIcon and members' profile pictures
    userGroups = userGroups.map((group) => {
      return {
        ...group,
        groupIcon: `${req.protocol}://${req.get("host")}${group.groupIcon}`,
        members: group.members.map((member) => ({
          ...member,
          profilePicture: `${req.protocol}://${req.get("host")}${
            member.profilePicture
          }`,
        })),
      };
    });

    res.json({ groups: userGroups });
  }),
];
// Set storage engine
const storage = multer.diskStorage({
  destination: "./public/uploads/group-icons/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("groupIcon");

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

exports.updateGroupDetails = [
  authenticateJWT,

  // Validation
  body("name").trim().optional().escape(),
  body("description").trim().optional().escape(),

  (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ msg: err });
      } else {
        const { groupId } = req.params;
        const { name, description } = req.body;

        // Create an object with the fields to update
        const updates = {};
        if (name) updates.name = name;
        if (description) updates.description = description;
        if (req.file)
          updates.groupIcon = `/uploads/group-icons/${req.file.filename}`;

        try {
          let group = await Group.findByIdAndUpdate(groupId, updates, {
            new: true,
            runValidators: true,
          });

          if (!group) {
            return res.status(404).json({ msg: "Group not found" });
          }

          // Modify the group object to include the full URL for the group icon
          group = {
            ...group.toObject(),
            groupIcon: group.groupIcon
              ? `${req.protocol}://${req.get("host")}${group.groupIcon}`
              : null,
          };

          res.json({ message: "Group updated successfully", group });
        } catch (error) {
          next(error);
        }
      }
    });
  },
];

exports.addMembers = [
  authenticateJWT,
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
    let group = await Group.findById(groupId).populate("members", "-password");

    if (!group) {
      const err = new Error("Group not found");
      err.status = 404;
      return next(err);
    }

    if (!group.isAdmin(userId)) {
      const err = new Error("Only admins can add members");
      err.status = 403;
      return next(err);
    }

    const members = req.body.members;

    // Filter out members that are already in the group
    const existingMemberIds = group.members.map((member) =>
      member._id.toString()
    );

    const newMembers = members.filter(
      (memberId) => !existingMemberIds.includes(memberId)
    );

    // If no new members to add, return a response indicating no members were added
    if (newMembers.length === 0) {
      group = group.toObject();

      // Modify groupIcon and members' profile pictures to have full URLs
      group = {
        ...group,
        groupIcon: `${req.protocol}://${req.get("host")}${group.groupIcon}`,
        members: group.members.map((member) => ({
          ...member,
          profilePicture: `${req.protocol}://${req.get("host")}${
            member.profilePicture
          }`,
        })),
      };

      return res.json({ message: "No new members to add", group });
    }

    // Add new members to the group members array
    const updatedMembers = [...group.members, ...newMembers];

    // Update the group with $set to update members
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $set: { members: updatedMembers } },
      { new: true }
    ).populate("members", "-password");

    // Add notification to new members added
    await Promise.all(
      newMembers.map(async (member) => {
        const notification = new Notification({
          user: member,
          content: `You have been added to ${group.name} group.`,
        });

        await notification.save();
      })
    );

    group = updatedGroup.toObject();

    // Modify groupIcon and members' profile pictures to have full URLs
    group = {
      ...group,
      groupIcon: `${req.protocol}://${req.get("host")}${group.groupIcon}`,
      members: group.members.map((member) => ({
        ...member,
        profilePicture: `${req.protocol}://${req.get("host")}${
          member.profilePicture
        }`,
      })),
    };

    res.json({ message: "Members added successfully", group });
  }),
];

exports.removeMember = [
  authenticateJWT,
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

    // Add notification to removed member
    const notification = new Notification({
      user: userToRemoveId,
      content: `You have been removed to ${group.name} group.`,
    });

    await notification.save();

    res.json({
      message: `Member ${userToRemoveId} removed successfully`,
      group: updatedGroup,
    });
  }),
];

exports.leaveGroup = [
  authenticateJWT,
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

    let userGroups = await Group.find({
      members: { $in: [userId] },
    })
      .populate("lastMessageId")
      .populate("lastMessageSenderId")
      .populate("members", "-password")
      .exec();

    userGroups = userGroups.map((group) => {
      group.groupIcon = `${req.protocol}://${req.get("host")}${
        group.groupIcon
      }`;
      return group;
    });

    res.json({
      message: "User left the group successfully",
      group,
      groups: userGroups,
    });
  }),
];

exports.appointAdmin = [
  authenticateJWT,
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

    // Add notification to members added

    const notification = new Notification({
      user: userForAdminId,
      content: `You are now an admin of ${group.name} group.`,
    });

    await notification.save();

    res.json({
      message: "New admin appointed successfully",
      group: updatedGroup,
    });
  }),
];

exports.deleteGroup = [
  authenticateJWT,
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

    res.json({ message: "Group deleted succesfully" });
  }),
];
