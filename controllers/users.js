const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

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

exports.getProfile = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  }),
];

// Set storage engine
const storage = multer.diskStorage({
  destination: "./uploads/profile-pictures/",
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
}).single("profilePicture");

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

exports.updateProfile = [
  passport.authenticate("jwt", { session: false }),

  // Validation
  body("username")
    .trim()
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .escape(),
  body("email")
    .trim()
    .optional()
    .isEmail()
    .withMessage("Please include a valid email")
    .escape(),

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
        const userId = req.user._id;
        const { username, email } = req.body;

        // Create an object with the fields to update
        const updates = {};
        if (username) updates.username = username;
        if (email) updates.email = email;
        if (req.file) updates.profilePicture = req.file.path;

        try {
          const user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
          }).select("-password");

          if (!user) {
            return res.status(404).json({ msg: "User not found" });
          }

          res.json(user);
        } catch (error) {
          next(error);
        }
      }
    });
  },
];

exports.getUser = [
  passport.authenticate("jwt", { session: false }),
  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  }),
];
