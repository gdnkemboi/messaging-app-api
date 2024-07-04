const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/users");

router.post("/signup", userControllers.signup);

router.post("/signin", userControllers.signin);

router.post("/signout", userControllers.signout);

router.get("/profile", userControllers.getProfile);

router.put("/profile", userControllers.updateProfile);

router.get("/:id/profile");

module.exports = router;
