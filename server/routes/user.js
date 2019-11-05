const express = require("express");
const User = require("../models/user");
const Cart = require("../models/cart");
const passport = require("passport");
const passportConfig = require("../config/passport");

const router = express.Router();

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/profile", passportConfig.isAuthenticated, (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .populate("history.item")
    .exec((err, foundUser) => {
      if (err) return next(err);
      res.status(200).send({ success: true, user: foundUser });
    });
});

router.post("/signup", (req, res, next) => {
  async.waterfall([
    callback => {
      const user = new User();
      user.profile.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.profile.picture = user.gravatar();
      User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (existingUser) {
          res.send({
            message:
              "Account with that email address already exists or try to login with facebook"
          });
        } else {
          user.save(function(err, user) {
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },

    user => {
      const cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err) {
        if (err) return next(err);
        req.logIn(user, function(err) {
          if (err) return next(err);
        });
      });
    }
  ]);
});

router.get("/logout", function(req, res, next) {
  req.logout();
  res.redirect("/");
});


router.post("/edit-profile", (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) return next(err);
    if (req.body.name) user.profile.name = req.body.name;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) {
      if (err) return next(err);
      res.send({ message: "Successfully Edited your profile" });
    });
  });
});

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: "email" })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/profile",
    failureRedirect: "/login"
  })
);

module.exports = router;
