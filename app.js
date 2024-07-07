const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const passport = require("./config/passport");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
}

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
const conversationsRouter = require("./routes/conversations");
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
app.use("/", messagesRouter);
app.use("/", conversationsRouter);
app.use("/", groupsRouter);
app.use("/", contactsRouter);
app.use("/", notificationsRouter);

module.exports = app;
