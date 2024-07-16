const passport = require("passport");

const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      if (info && info.name === "TokenExpiredError") {
        return res.status(401).json({ msg: "Token expired" });
      } else {
        return res.status(401).json({ msg: "Unauthorized" });
      }
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authenticateJWT;
