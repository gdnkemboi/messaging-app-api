const express = require("express");
const router = express.Router();

const groupControllers = require("../controllers/groups");

router.post("/groups", groupControllers.createGroup);

router.get("/groups", groupControllers.getUserGroups);

router.get("/groups/:groupId", groupControllers.getGroupDetails);

router.put("/groups/:groupId", groupControllers.updateGroupDetails);

router.delete("/groups/:groupId", groupControllers.deleteGroup);

router.post("/groups/:groupId/members", groupControllers.addMember);

router.delete(
  "/groups/:groupId/members/:userId",
  groupControllers.removeMember
);

module.exports = router;
