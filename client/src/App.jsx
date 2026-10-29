import { useEffect, useState } from "react";
import "./App.css";

const API = "https://online-shopping-cart-eeoc.onrender.com";

const emptyForm = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: ""
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load products
  async function loadProducts() {
    const response = await fetch(`${API}/products`);

    if (!response.ok) {
      throw new Error("Could not load products");
    }

    const data = await response.json();
    setProducts(data);
  }

  // Load shopping cart
  async function loadCart() {
    const response = await fetch(`${API}/cart`);

    if (!response.ok) {
      throw new Error("Could not load cart");
    }

    const data = await response.json();
    setCart(data.items || []);
  }

  // Load products and cart together
  async function loadData() {
    setLoading(true);

    try {
      await Promise.all([loadProducts(), loadCart()]);
    } catch (error) {
      setMessage(
        "Cannot connect to the server. Check MongoDB and server.js."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update form
  function handleChange(event) {
    const { name, value } = event.target;

    setForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  // Add a new product
  async function addProduct(event) {
    event.preventDefault();
    setMessage("");

    if (
      !form.name.trim() ||
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      setMessage("Enter a product name and valid price.");
      return;
    }

    try {
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          price: Number(form.price)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add product");
      }

      setForm(emptyForm);
      setMessage("Product added successfully!");

      await loadProducts();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Add product to cart
  async function addToCart(productId) {
    setMessage("");

    try {
      const response = await fetch(`${API}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      setCart(data.items || []);
      setMessage("Product added to cart successfully!");
    } catch (error) {
      setMessage(error.message);
      console.error("Add to cart error:", error);
    }
  }

  // Delete product from store
  async function deleteProduct(productId) {
    if (!window.confirm("Delete this product?")) return;

    try {
      const response = await fetch(
        `${API}/products/${productId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete product");
      }

      setMessage("Product deleted successfully!");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // Remove item from cart
  async function removeFromCart(cartItemId) {
    try {
      const response = await fetch(
        `${API}/cart/${cartItemId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not remove item");
      }

      setCart(data.items || []);
      setMessage("Item removed from cart.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="app">
      <header className="hero">
        <h1>Online Shopping Cart</h1>
        <p>Welcome to our online store</p>
      </header>

      <main className="container">
        <section className="form-section">
          <h2>Add New Product</h2>

          <form onSubmit={addProduct} className="product-form">
            <input
              name="name"
              placeholder="Product name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              required
            />

            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
            />

            <input
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />

            <input
              name="image"
              type="url"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={handleChange}
            />

            <button type="submit" className="primary-button">
              Add Product
            </button>
          </form>
        </section>

        {message && <p className="message">{message}</p>}

        <section className="products-section">
          <h2>Products</h2>

          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found. Add your first product.</p>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <article
                  className="product-card"
                  key={product._id}
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                    />
                  )}

                  <h3>{product.name}</h3>

                  <p>
                    Price: ₹
                    {Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <p>Category: {product.category || "General"}</p>

                  {product.description && (
                    <p>{product.description}</p>
                  )}

                  <button
                    onClick={() => addToCart(product._id)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteProduct(product._id)}
                  >
                    Delete Product
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="cart-section">
          <h2>Shopping Cart</h2>

          {cart.length === 0 ? (
            <p>Your shopping cart is empty.</p>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    ₹{item.price} × {item.quantity} = ₹
                    {item.price * item.quantity}
                  </p>
                </div>

                <button
                  className="delete-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}

          <h3 className="total">
            Total: ₹{total.toLocaleString("en-IN")}
          </h3>
        </section>
      </main>
    </div>
  );
}

export default App;