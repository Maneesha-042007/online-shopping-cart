const API = "http://localhost:5000";


// Get and display products
async function loadProducts() {

    const response = await fetch(`${API}/products`);

    const products = await response.json();

    const productsContainer = document.getElementById("products");

    productsContainer.innerHTML = "";

    products.forEach(product => {

        productsContainer.innerHTML += `
            <div class="product">
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price}</p>
                <p>Category: ${product.category}</p>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        `;
    });
}


// Add product to cart
async function addToCart(productId) {

    const response = await fetch(`${API}/cart`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            productId: productId,
            quantity: 1
        })
    });

    const data = await response.json();

    alert(data.message);

    loadCart();
}


// Get and display cart
async function loadCart() {

    const response = await fetch(`${API}/cart`);

    const data = await response.json();

    const cartContainer = document.getElementById("cart");

    const total = document.getElementById("total");

    cartContainer.innerHTML = "";

    data.items.forEach(item => {

        cartContainer.innerHTML += `
            <div class="cart-item">

                <h3>${item.name}</h3>

                <p>Price: ₹${item.price}</p>

                <p>Quantity: ${item.quantity}</p>

                <p>
                    Subtotal: ₹${item.price * item.quantity}
                </p>

                <button onclick="removeFromCart(${item.id})">
                    Remove
                </button>

            </div>
        `;
    });

    total.textContent = data.total;
}


// Remove item from cart
async function removeFromCart(id) {

    const response = await fetch(`${API}/cart/${id}`, {

        method: "DELETE"
    });

    const data = await response.json();

    alert(data.message);

    loadCart();
}


// Load data when page opens
loadProducts();
loadCart();