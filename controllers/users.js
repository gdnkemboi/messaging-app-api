const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const authenticateJWT = require("../middleware/authenticateJWT");

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

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      let field = existingUser.username === username ? "username" : "email";
      let value = existingUser.username === username ? username : email;
      return res.status(400).json({
        error: {
          message: `The ${field} '${value}' is already taken.`,
          status: 400,
        },
      });
    }

    const newUser = new User({ username, email, password });

    try {
      await newUser.save();
      res.status(201).json({ message: "Signed up successfully" });
    } catch (error) {
      next(error);
    }
  }),
];

exports.signin = [
  signinValidationRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }

    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials", info });
      }
      const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
      });

      res.json({ message: "Signed In successfully", token });
    })(req, res, next);
  },
];

exports.getProfile = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    let user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Modify the user object to include the full URL for the profile picture
    user = {
      ...user.toObject(),
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
        : null,
    };

    res.json(user);
  }),
];

// Set storage engine
const storage = multer.diskStorage({
  destination: "./public/uploads/profile-pictures/",
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
  authenticateJWT,

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
        if (req.file)
          updates.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;

        try {
          let user = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
          }).select("-password");

          if (!user) {
            return res.status(404).json({ msg: "User not found" });
          }

          // Modify the user object to include the full URL for the profile picture
          user = {
            ...user.toObject(),
            profilePicture: user.profilePicture
              ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
              : null,
          };

          res.json(user);
        } catch (error) {
          next(error);
        }
      }
    });
  },
];

exports.getUser = [
  authenticateJWT,
  asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    let user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Modify the user object to include the full URL for the profile picture
    user = {
      ...user.toObject(),
      profilePicture: user.profilePicture
        ? `${req.protocol}://${req.get("host")}${user.profilePicture}`
        : null,
    };

    res.json(user);
  }),
];

exports.validateToken = (req, res, next) => {
  const token = req.body.token;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.status(200).json({ valid: true });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
};
