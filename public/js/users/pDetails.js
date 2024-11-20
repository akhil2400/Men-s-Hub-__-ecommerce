
// Select the main image element
const mainImage = document.getElementById("mainImage");

// Select all thumbnail images
const thumbnails = document.querySelectorAll(".thumbnail");

// Loop through each thumbnail and add a click event
thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", function () {
    // Get the 'src' of the clicked thumbnail
    const newSrc = this.src;

    // Update the 'src' of the main image
    mainImage.src = newSrc;
  });
});


const mainImageContainer = document.getElementById("mainImageContainer");
const zoomCircle = document.getElementById("zoomCircle");

mainImageContainer.addEventListener("mousemove", function (event) {
  const mainImage = document.getElementById("mainImage");
  const rect = mainImage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate background position for zoom
  const bgX = (x / mainImage.offsetWidth) * 100;
  const bgY = (y / mainImage.offsetHeight) * 100;

  // Set the background image and position
  zoomCircle.style.backgroundImage = `url(${mainImage.src})`;
  zoomCircle.style.backgroundSize = `${mainImage.offsetWidth * 2}px ${mainImage.offsetHeight * 2}px`;
  zoomCircle.style.backgroundPosition = `${bgX}% ${bgY}%`;

  // Position the zoom circle
  zoomCircle.style.left = `${x - zoomCircle.offsetWidth / 2}px`;
  zoomCircle.style.top = `${y - zoomCircle.offsetHeight / 2}px`;
  zoomCircle.style.display = "block";
});

// Hide the zoom circle when not hovering
mainImageContainer.addEventListener("mouseleave", function () {
  zoomCircle.style.display = "none";
});


document.addEventListener("DOMContentLoaded", function () {
  // Handle color option selection
  const colorOptions = document.querySelectorAll(".color-option");
  colorOptions.forEach(option => {
    option.addEventListener("click", function () {
      colorOptions.forEach(opt => opt.classList.remove("selected")); // Remove selected from all
      this.classList.add("selected"); // Add selected to the clicked color
    });
  });

  // Handle size option selection
  const sizeOptions = document.querySelectorAll(".size-option input[type='radio']");
  sizeOptions.forEach(option => {
    option.addEventListener("change", function () {
      sizeOptions.forEach(opt => opt.parentNode.classList.remove("selected")); // Remove from all
      this.parentNode.classList.add("selected"); // Add to selected size
    });
  });
});

function increaseQuantity() {
  const quantityInput = document.getElementById("quantityInput");
  const maxStock = parseInt(quantityInput.getAttribute("data-stock"), 10);
  let currentQuantity = parseInt(quantityInput.value, 10);



  if (currentQuantity < maxStock) {
    quantityInput.value = currentQuantity + 1;
  }
}

function decreaseQuantity() {
  const quantityInput = document.getElementById("quantityInput");
  let currentQuantity = parseInt(quantityInput.value, 10);

  if (currentQuantity > 1) {
    quantityInput.value = currentQuantity - 1;
  }
}

function validateQuantity() {
  const quantityInput = document.getElementById("quantityInput");
  const maxStock = parseInt(quantityInput.getAttribute("data-stock"), 10);
  // let currentQuantity = parseInt(quantityInput.value, 10);
  // document.getElementById("QuantityError").innerHTML = ""

  if (currentQuantity > 1) {
    // quantityInput.value = maxStock;
    console.log("Limit reached")
    // document.getElementById("QuantityError").innerHTML = "Quantity limit reached";
  }
}

//Adding to cart

const sizes = document.querySelectorAll(".size-selection");
console.log(sizes)
let productSize = "S";
sizes.forEach(size => {
  console.log(size)
  size.addEventListener("change", () => {
    productSize = size.value
  })
}
)

console.log(productSize);

document.addEventListener("DOMContentLoaded", () => {
  const addToCartButtons = document.querySelector(".add-to-cart-btn");

  addToCartButtons.addEventListener("click", (e) => {
    const productId = e.target.getAttribute('data-id');
    const productName = e.target.getAttribute('data-name');
    const productPrice = e.target.getAttribute('data-price');
    const productImage = e.target.getAttribute('data-image');


    console.log(productId);
    console.log(productName);
    console.log(productPrice);

    const quantity = document.getElementById("quantityInput").value;

    fetch("/add-to-cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, productSize, quantity}) })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("Product added to cart");
          swal("Success", "Product added to cart", "success");
        } else {
      console.log("Error adding product to cart");
      swal("Error", data.message, "error");
    }})

  });
});

