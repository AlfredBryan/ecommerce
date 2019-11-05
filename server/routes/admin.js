const express = require("express");
const Category = require("../models/category");

const router = express.Router();

router.post("/add-category", (req, res, next) => {
  const category = new Category();
  category.name = req.body.name;

  category.save(err => {
    if (err) return next(err);
    res.status(200).send("successful", "Successfully added a category");
  });
});

module.exports = router;
