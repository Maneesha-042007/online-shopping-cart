const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: "General"
  },
  description: {
    type: String,
    default: ""
  },
  image: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model("Product", productSchema);