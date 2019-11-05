const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const secret = require("../config/secret");
const User = require("../models/user");

//const async = require("async")
const Cart = require("../models/cart");

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

//Middleware
passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) return done(err);

        if (!user) {
          return done(
            null,
            false,
            req.flash("loginMessage", "No user has been found")
          );
        }
        if (!user.comparePassword(password)) {
          return done(
            null,
            false,
            req.flash(
              "loginMessage",
              "Oops! Wrong Password, please try again! "
            )
          );
        }
        return done(null, user);
      });
    }
  )
);

passport.use(
  new FacebookStrategy(
    secret.facebook,
    (token, refreshToken, profile, done) => {
      User.findOne({ facebook: profile.id }, (err, user) => {
        if (err) return done(err);

        if (user) {
          return done(null, user);
        } else {
          async.waterfall([
            callback => {
              const newUser = new User();
              newUser.email = profile._json.email;
              newUser.facebook = profile.id;
              newUser.tokens.push({ kind: "facebook", token: token });
              newUser.profile.name = profile.displayName;
              newUser.profile.picture =
                "https://graph.facebook.com/" +
                profile.id +
                "/picture?type=large";

              newUser.save(err => {
                if (err) throw err;
                callback(err, newUser);
              });
            },
            newUser => {
              const cart = new Cart();
              cart.owner = newUser._id;
              cart.save(err => {
                if (err) return done(err);
                return done(err, newUser);
              });
            }
          ]);
        }
      });
    }
  )
);

//custom validation function
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next;
  }
  res.redirect("/login");
};
