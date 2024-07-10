const express = require("express");
const router = express.Router();

const groupControllers = require("../controllers/groups");

router.post("/groups", groupControllers.createGroup);

router.post("/groups/:groupId/messages", groupControllers.sendMessageToGroup);

router.get("/groups/:groupId/messages", groupControllers.getGroupMessages);

router.get("/groups/:groupId", groupControllers.getGroupDetails);

router.get("/groups", groupControllers.getUserGroups);

router.put("/groups/:groupId", groupControllers.updateGroupDetails);

router.put("/groups/:groupId/members", groupControllers.addMembers);

router.put("/groups/:groupId/members/:userId", groupControllers.removeMember);

router.put("/groups/:groupId/leave", groupControllers.leaveGroup);

router.put("/groups/:groupId/admin/:userId", groupControllers.appointAdmin);

router.delete("/groups/:groupId", groupControllers.deleteGroup);

module.exports = router;
