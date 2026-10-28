const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/product.js");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Log each request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Shopping cart stored in memory
let cart = [];

// Home route
app.get("/", (req, res) => {
  res.send("Online Shopping Cart API is running");
});

// GET all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET one product
app.get("/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD product
app.post("/products", async (req, res) => {
  try {
    const { name, price, category, description, image } = req.body;

    if (!name || price === undefined || price === "") {
      return res.status(400).json({
        message: "Product name and price are required"
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      category: category || "General",
      description: description || "",
      image: image || ""
    });

    res.status(201).json({
      message: "Product added successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product
app.put("/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.json({
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product
app.delete("/products/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    cart = cart.filter(
      item => item.productId !== product._id.toString()
    );

    res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD product to cart
app.post("/cart", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        message: "Quantity must be a positive integer"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found in MongoDB"
      });
    }

    const existingItem = cart.find(
      item => item.productId === product._id.toString()
    );

    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      cart.push({
        id: new mongoose.Types.ObjectId().toString(),
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        quantity: qty
      });
    }

    res.status(201).json({
      message: "Product added to cart",
      items: cart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET cart and total
app.get("/cart", (req, res) => {
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  res.json({ items: cart, total });
});

// REMOVE cart item
app.delete("/cart/:id", (req, res) => {
  const index = cart.findIndex(
    item => item.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Cart item not found"
    });
  }

  cart.splice(index, 1);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  res.json({
    message: "Item removed from cart",
    items: cart,
    total
  });
});

// Connect MongoDB and start server
mongoose.connect("mongodb://127.0.0.1:27017/OnlineShoppingCart")
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection error:", error.message);
  });