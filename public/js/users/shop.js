// Function to add product to cart
function addToCart(productId) {
  // Check if cart already exists in localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if product already exists in the cart
  const productIndex = cart.findIndex(product => product.id === productId);

  if (productIndex === -1) {
    // If product doesn't exist in the cart, add it
    cart.push({ id: productId, quantity: 1 });
  } else {
    // If product exists in the cart, increase the quantity
    cart[productIndex].quantity += 1;
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Optionally, update the cart icon or show a success message
  alert("Product added to cart!");
}

// Add event listeners for the "Add to Cart" buttons
document.querySelectorAll(".btn-add-to-cart").forEach((button) => {
  button.addEventListener("click", (event) => {
    const productId = event.target.closest(".product-card").querySelector("a").getAttribute("href").split("/").pop();
    addToCart(productId);
  });
});

// Optional: Update the cart icon based on the number of items in the cart
function updateCartIcon() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartIcon = document.getElementById("cart-icon");

  if (cart.length > 0) {
    const totalItems = cart.reduce((acc, product) => acc + product.quantity, 0);
    cartIcon.textContent = totalItems; // Set cart icon to show total number of items
  } else {
    cartIcon.textContent = 0;
  }
}

// Update cart icon when the page loads
window.onload = updateCartIcon;

// Optional: Filtering or Sorting Products (example: sort by price)
document.getElementById("sort-by-price").addEventListener("change", (event) => {
  const sortOption = event.target.value;
  const productsContainer = document.querySelector(".product-list");

  // Sort products by price (low to high or high to low)
  const sortedProducts = [...productsContainer.children].sort((a, b) => {
    const priceA = parseFloat(a.querySelector(".product-card p strong + p").textContent.replace('$', '').trim());
    const priceB = parseFloat(b.querySelector(".product-card p strong + p").textContent.replace('$', '').trim());

    return sortOption === "low-to-high" ? priceA - priceB : priceB - priceA;
  });

  // Append sorted products back to the container
  sortedProducts.forEach(product => productsContainer.appendChild(product));
});
