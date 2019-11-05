const express = require("express");
//const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");

const router = express.Router();

router.get("/cart", (req, res, next) => {
  Cart.findOne({ owner: req.user._id })
    .populate("items.item")
    .exec((err, foundCart) => {
      if (err) return next(err);
      res.status(200).send({ success: true, foundCart: foundCart });
    });
});

router.post("/product/:product_id", (req, res, next) => {
  Cart.findOne({ owner: req.user._id }, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });
    cart.total = cart.total + parseFloat(req.body.priceValue).toFixed(2);
    cart.save(err => {
      if (err) return next(err);
      return res.status(200).send({ success: true });
    });
  });
});

router.post("/remove", (req, res, next) => {
  Cart.findOne({ owner: req.user._id }, (err, foundCart) => {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save((err, found) => {
      if (err) return next(err);
      res.status(200).send({ success: true, message: "Successfully removed" });
    });
  });
});

router.get("/search", (req, res, next) => {
  if (req.query.q) {
    Product.find(
      {
        query_string: { query: req.query.q }
      },
      (err, results) => {
        if (err) return next(err);
        const data = results.hits.hits.map(hit => {
          return hit;
        });

        res.status(200).send({ success: true, query: req.query.q, data: data });
      }
    );
  }
});

router.get("/products/:id", (req, res, next) => {
  Product.find({ category: req.params.id })
    .populate("category")
    .exec((err, products) => {
      if (err) return next(err);
      res.status(200).send({ success: true, products: products });
    });
});

router.get("/product/:id", (req, res, next) => {
  Product.findById({ _id: req.params.id }, (err, product) => {
    if (err) return next(err);
    res.status(200).send({ success: true, product: product });
  });
});

module.exports = router;
