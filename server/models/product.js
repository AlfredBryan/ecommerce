const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category"
  },
  name: String,
  description: String,
  price: Number,
  image: String
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
