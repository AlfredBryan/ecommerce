const Cart = require("../models/cart");

module.exports = function(req, res, next) {
  if (req.user) {
    const total = 0;
    Cart.findOne({ owner: req.user._id }, function(err, cart) {
      if (cart) {
        for (let i = 0; i < cart.items.length; i++) {
          total += cart.items[i].quantity;
        }
        res.locals.cart = total;
      } else {
        res.locals.cart = 0;
      }
      next();
    });
  } else {
    next();
  }
};
