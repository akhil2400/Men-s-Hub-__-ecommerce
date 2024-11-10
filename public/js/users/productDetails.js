// Example for adding product to cart using Local Storage
document.querySelector('.btn-add-to-cart').addEventListener('click', () => {
  // Assuming that product information (like id, name, price) is embedded in the page or passed dynamically
  const productId = '<%= product._id %>';
  const productName = '<%= product.name %>';
  const productPrice = '<%= product.offerPrice || product.price %>';
  
  // Check if there's already a cart in localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if the product is already in the cart
  const existingProduct = cart.find(item => item.productId === productId);
  
  if (existingProduct) {
    // Increase quantity if the product is already in the cart
    existingProduct.quantity += 1;
  } else {
    // Add new product to the cart
    cart.push({
      productId,
      productName,
      productPrice,
      quantity: 1, // Initial quantity is 1
    });
  }

  // Save the updated cart back to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Alert the user
  alert(`${productName} has been added to your cart.`);
});


document.querySelector('.main-product-image').addEventListener('click', function() {
  const imageUrl = this.src; // Get the clicked image's URL
  const lightbox = document.createElement('div');
  lightbox.classList.add('lightbox');

  // Create a larger image inside the lightbox
  const lightboxImage = document.createElement('img');
  lightboxImage.src = imageUrl;
  lightbox.appendChild(lightboxImage);

  // Append the lightbox to the body
  document.body.appendChild(lightbox);

  // Close the lightbox when clicked
  lightbox.addEventListener('click', function() {
    lightbox.remove();
  });
});


// Update the selected color
const colorOptions = document.querySelectorAll('.color-swatch');

colorOptions.forEach(color => {
  color.addEventListener('click', function() {
    // Highlight the selected color
    colorOptions.forEach(option => option.classList.remove('selected'));
    this.classList.add('selected');

    // You can also update other elements or store the selected color in a variable
    const selectedColor = this.style.backgroundColor;
    console.log(`Selected Color: ${selectedColor}`);
  });
});


document.querySelector('.btn-toggle-warranty').addEventListener('click', function() {
  const warrantyInfo = document.querySelector('.warranty-info');
  warrantyInfo.style.display = warrantyInfo.style.display === 'none' ? 'block' : 'none';
});

document.querySelector('.btn-toggle-return-policy').addEventListener('click', function() {
  const returnPolicyInfo = document.querySelector('.return-policy-info');
  returnPolicyInfo.style.display = returnPolicyInfo.style.display === 'none' ? 'block' : 'none';
});

document.querySelector('.submit-review').addEventListener('click', async function() {
  const rating = document.querySelector('input[name="rating"]:checked').value;
  const comment = document.querySelector('#review-comment').value;
  
  const productId = '<%= product._id %>';

  const reviewData = {
    rating,
    comment,
    productId,
  };

  try {
    const response = await fetch('/submit-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });
    const data = await response.json();
    if (data.success) {
      alert('Review submitted successfully!');
      location.reload();  // Optionally, reload the page to show the new review
    } else {
      alert('Failed to submit review');
    }
  } catch (err) {
    console.error('Error submitting review:', err);
  }
});


document.querySelector('.submit-review').addEventListener('click', function(event) {
  const rating = document.querySelector('input[name="rating"]:checked');
  const comment = document.querySelector('#review-comment').value;

  if (!rating) {
    alert('Please select a rating.');
    event.preventDefault();
  } else if (comment.length < 5) {
    alert('Comment must be at least 5 characters long.');
    event.preventDefault();
  }
});


