const express = require("express");
const router = express.Router();

/* Redirect to /api-docs. */
router.get("/", function (req, res, next) {
  res.redirect("/api-docs");
});

module.exports = router;
