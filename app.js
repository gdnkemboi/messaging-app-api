const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("./config/passport");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
const chatsRouter = require("./routes/chats");
const groupsRouter = require("./routes/groups");
const contactsRouter = require("./routes/contacts");
const notificationsRouter = require("./routes/notifications");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(passport.initialize());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", messagesRouter);
app.use("/api", chatsRouter);
app.use("/api", groupsRouter);
app.use("/api", contactsRouter);
app.use("/api", notificationsRouter);

// Swagger setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// Error handler
app.use(function (err, req, res, next) {
  // Set response status code
  res.status(err.status || 500);

  // Return JSON response
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
});

module.exports = app;
