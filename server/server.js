const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("dotenv").config();

const Category = require("./models/category");

const cartLength = require("./middlewares/middleware");

const app = express();

mongoose.set("useCreateIndex", true);
mongoose.connect(
  process.env.DB,
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("connected to database");
    }
  }
);

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(cartLength);
app.use((req, res, next) => {
  Category.find({}, (err, categories) => {
    if (err) return err;
    res.locals.categories = categories;
    next();
  });
});

const mainRoutes = require("./routes/main");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");

app.use("/api/v1", mainRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", adminRoutes);

const port = process.env.PORT || 4000;

app.listen(port, err => {
  if (err) throw err;
  console.log("Server is Running on " + port);
});
