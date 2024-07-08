const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");

// Validation rules
const signupValidationRules = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .escape(),
];

const signinValidationRules = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Username or Email is required")
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .escape(),
];

exports.signup = [
  signupValidationRules,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "Signed up successfully" });
  }),
];

exports.signin = [
  signinValidationRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials", info });
      }
      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
      });

      res.json({ message: "Signed In successfully", token });
    })(req, res, next);
  },
];

exports.getProfile = (req, res, next) => {
  res.json({ msg: "NOT IMPLEMENTED: Profile" });
};

exports.updateProfile = (req, res, next) => {
  res.json({ msg: "NOT IMPLEMENTED: Update Profile" });
};

exports.getUser = (req, res, next) => {
  res.json({ msg: "NOT IMPLEMENTED: Get User" });
};
