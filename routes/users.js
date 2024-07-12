const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/users");

router.post("/signup", userControllers.signup);

router.post("/signin", userControllers.signin);

router.get("/profile", userControllers.getProfile);

router.put("/profile", userControllers.updateProfile);

router.get("/:userId/profile", userControllers.getUser);

module.exports = router;
