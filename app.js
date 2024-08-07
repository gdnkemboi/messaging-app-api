const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fs = require("fs");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("./config/passport");
const { swaggerUi, swaggerSpec } = require("./config/swagger");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
const chatsRouter = require("./routes/chats");
const groupsRouter = require("./routes/groups");
const contactsRouter = require("./routes/contacts");
const notificationsRouter = require("./routes/notifications");

const app = express();

app.use(compression());

// Add helmet to the middleware chain with custom CSP directives
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"], // Allow images from the same origin and data URLs
    },
  })
);

// Create a write stream (in append mode) for logging
const logDirectory = path.join(__dirname, "log");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);

// Setup morgan logger
if (process.env.NODE_ENV === "production") {
  app.use(logger("combined", { stream: accessLogStream }));
} else {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configure CORS
const allowedOrigins = ["https://chat-app-wjws.onrender.com", "http://localhost:5173"]; // Allowed origins

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

// Apply CORS middleware
if (process.env.NODE_ENV === "production") {
  app.use(cors(corsOptions));
} else {
  app.use(cors()); // Allow all origins in development
}

app.use(passport.initialize());

app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/users", usersRouter);
app.use("/api", messagesRouter);
app.use("/api", chatsRouter);
app.use("/api", groupsRouter);
app.use("/api", contactsRouter);
app.use("/api", notificationsRouter);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
});

module.exports = app;
