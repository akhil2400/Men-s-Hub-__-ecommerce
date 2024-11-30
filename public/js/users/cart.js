// Function to handle adding items to the cart (from productDetails.ejs)
document.querySelector('.add-to-cart-btn')?.addEventListener('click', async (event) => {
  event.preventDefault();

  const productId = event.target.getAttribute('data-id');
  const quantity = document.getElementById('quantityInput').value;
  const size = document.querySelector('input[name="size"]:checked')?.value;
  const color = document.querySelector('.color-option.selected')?.style.backgroundColor;

  if (!size) {
    return alert('Please select a size.');
  }

  try {
    const response = await fetch('/add-to-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, size, color })
    });

    const result = await response.json();
    if (response.ok) {
      swal('Success', 'Product added to cart', 'success');
    } else {
      swal('Error', result.message, 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    swal('Error', 'Something went wrong', 'error');
  }
});

// Handle color selection
document.querySelectorAll('.color-option').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach((btn) => btn.classList.remove('selected'));
    button.classList.add('selected');
  });
});

// // Cart page functions


// document.addEventListener("DOMContentLoaded", function() {
//   loadCart();
// });

// // Fetch and render cart items
// async function loadCart() {
//   try {
//     const response = await fetch('/cart');
//     const cart = await response.json();

//     if (cart.length === 0) {
//       document.getElementById('cartItems').innerHTML = `<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>`;
//     } else {
//       let cartHTML = '';
//       let subtotal = 0;

//       cart.forEach((item, index) => {
//         const total = item.price * item.quantity;
//         subtotal += total;
//         cartHTML += `
//           <tr>
//             <td class="product-thumbnail"><img src="${item.image}" alt="${item.name}" class="img-fluid"></td>
//             <td class="product-name"><h2 class="h5 text-black">${item.name}</h2></td>
//             <td>$${item.price}</td>
//             <td>
//               <div class="input-group mb-3 d-flex align-items-center quantity-container" style="max-width: 120px;">
//                 <div class="input-group-prepend">
//                   <button class="btn btn-outline-black decrease" data-index="${index}">&minus;</button>
//                 </div>
//                 <input type="text" class="form-control text-center quantity-amount" value="${item.quantity}" readonly>
//                 <div class="input-group-append">
//                   <button class="btn btn-outline-black increase" data-index="${index}">&plus;</button>
//                 </div>
//               </div>
//             </td>
//             <td>$${total.toFixed(2)}</td>
//             <td><button class="btn btn-black btn-sm remove" data-index="${index}">X</button></td>
//           </tr>
//         `;
//       });

//       document.getElementById('cartItems').innerHTML = cartHTML;
//       document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
//       document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;

//       // Event listeners for quantity updates and removals
//       document.querySelectorAll('.decrease').forEach(button => button.addEventListener('click', updateQuantity));
//       document.querySelectorAll('.increase').forEach(button => button.addEventListener('click', updateQuantity));
//       document.querySelectorAll('.remove').forEach(button => button.addEventListener('click', removeItem));
//     }
//   } catch (error) {
//     console.error('Error loading cart:', error);
//   }
// }

// Update quantity of an item
// Update quantity of an item



// async function updateQuantity(e) {
//   const index = e.target.dataset.index;
//   const quantityInput = e.target.closest('.quantity-container').querySelector('.quantity-amount');
//   let quantity = parseInt(quantityInput.value);

//   if (e.target.classList.contains('decrease') && quantity > 1) {
//     quantity--;
//   } else if (e.target.classList.contains('increase')) {
//     quantity++;
//   }

//   try {
//     const response = await fetch('/cart/update', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ index, quantity })
//     });
//     const result = await response.json();
//     if (result.success) {
//       // After updating the quantity, reload the cart items
//       loadCart();
//     } else {
//       alert(result.message);
//     }
//   } catch (error) {
//     console.error('Error updating quantity:', error);
//   }
// }




// document.addEventListener("DOMContentLoaded", () => {
//   // Attach listeners to quantity inputs
//   document.querySelectorAll(".quantity-input").forEach(input => {
//     input.addEventListener("change", updateItemQuantity);
//   });

//   // Attach listeners to increase/decrease buttons
//   document.querySelectorAll(".decrease").forEach(button => {
//     button.addEventListener("click", modifyQuantity);
//   });
//   document.querySelectorAll(".increase").forEach(button => {
//     button.addEventListener("click", modifyQuantity);
//   });
// });

// async function modifyQuantity(event) {
//   const button = event.target;
//   const index = button.getAttribute("data-index");
//   const input = document.querySelector(`.quantity-input[data-index="${index}"]`);
//   let quantity = parseInt(input.value);

//   // Adjust quantity based on button type
//   if (button.classList.contains("increase")) {
//     quantity += 1;
//   } else if (button.classList.contains("decrease") && quantity > 1) {
//     quantity -= 1;
//   }

//   // Update input value and call update function
//   input.value = quantity;
//   updateItemQuantity({ target: input });
// }

async function updateItemQuantity(event) {
  console.log('Updating item quantity...');
  const index = event.target.getAttribute('data-index');
  const quantityInput = document.querySelector(`.quantity-input[data-index="${index}"]`);
  const quantity = parseInt(quantityInput.value);

  if (quantity < 1) {
    alert("Quantity must be at least 1.");
    quantityInput.value = 1;
    return;
  }

  const cart = globalCart; // Use the global cart variable here

  if (cart?.items && cart.items[index]) {
    const item = cart.items[index];

    // Calculate the item total and update in the cart object
    const priceToUse = item.offerPrice || item.price;
    const itemTotal = priceToUse * quantity;
    item.quantity = quantity;

    // Update the item total on the frontend
    document.getElementById(`item-total-${index}`).textContent = `₹${itemTotal.toFixed(2)}`;

    // Recalculate subtotal and total
    let newSubtotal = 0;
    cart.items.forEach((cartItem) => {
      const priceToUse = cartItem.offerPrice || cartItem.price;
      newSubtotal += priceToUse * cartItem.quantity;
    });

    // Update the subtotal and total on the frontend
    document.getElementById('subtotal').textContent = `₹${newSubtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${newSubtotal.toFixed(2)}`;
  }
}


// Remove an item from the cart
// async function removeItem(e) {
//   const index = e.target.dataset.index;

//   try {
//     const response = await fetch('/cart/remove', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ index })
//     });
//     const result = await response.json();
//     if (result.success) {
//       loadCart();
//     } else {
//       alert(result.message);
//     }
//   } catch (error) {
//     console.error('Error removing item:', error);
//   }
// }

// Update cart view after changes
// function updateCart() {
//   loadCart();
// }

async function confirmRemoveCartItem(e) {
  const itemId = e.target.getAttribute('data-id'); // Get the correct itemId

  const result = await swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to remove this item from your cart?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, remove it!',
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch('/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),  // Send the itemId instead of cartId
      });

      const data = await response.json();

      if (data.st) {
        await swal.fire({
          position: "center",
          icon: "success",
          title: "Item removed from cart",
          showConfirmButton: false,
          timer: 1500
        });
        reloadCart();  // Dynamically reload the cart without refreshing the page
      } else {
        await swal.fire('Error!', data.msg || data.message, 'error'); // Show the error message
      }
    } catch (err) {
      console.error('Fetch error:', err);
      await swal.fire('Error!', 'Something went wrong. Please try again.', 'error');
    }
  }
}


// Fetch and render cart items

async function reloadCart() {
  console.log('Reloading cart...');
  try {
    const response = await fetch('/fetch-cart');
    const data = await response.json();
    console.log('Cart fetched:', data.cart);
    const cart = data.cart;

    // Check if there are no items in the cart
    if (cart?.items?.length === 0) {
      document.getElementById('cartItems').innerHTML = `<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>`;
      document.getElementById('subtotal').textContent = '₹0.00'; // Update subtotal to 0 when cart is empty
      document.getElementById('total').textContent = '₹0.00'; // Ensure total is also 0
    } else {
      let cartHTML = '';
      let subtotal = 0;

      cart.items.forEach((item, index) => {
        // Use offerPrice if available; otherwise,  price
        const priceToUse = item.offerPrice || item.price;

        // Calculate the subtotal
        subtotal += priceToUse * item.quantity;

        // Append the cart item to the HTML
        cartHTML += `
          <tr>
      <td class="product-thumbnail">
        <img src="/${item.productId.images[0]}" alt="${item.productId.name}" class="img-fluid">
      </td>
      <td class="product-name">
        <h2 class="h5 text-black">${item.productId.name}</h2>
      </td>
      <td>${priceToUse.toFixed(2)}</td>
      <td>
        <div class="input-group">
          <button class="btn btn-outline-secondary decrease" data-index="${index}">-</button>
          <input type="number" class="form-control quantity-input" data-index="${index}" 
            value="${item.quantity}" min="1" style="width: 60px; text-align: center;">
          <button class="btn btn-outline-secondary increase" data-index="${index}">+</button>
        </div>
      </td>
      <td class="item-total" id="item-total-${index}">
        ₹${(priceToUse * item.quantity).toFixed(2)}
      </td>
      <td>
        <button class="btn btn-black btn-sm remove" onclick="confirmRemoveCartItem(event)">
          <i data-id="${item._id}" class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `;
      });

      // Update the cart table and total
      document.getElementById('cartItems').innerHTML = cartHTML;
      document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
      document.getElementById('total').textContent = `₹${subtotal.toFixed(2)}`;

      // Add event listeners for quantity updates and removals
      document.querySelectorAll('.decrease').forEach(button =>
        button.addEventListener('click', (event) => updateQuantity(event))
      );
      document.querySelectorAll('.increase').forEach(button =>
        button.addEventListener('click', (event) => updateQuantity(event))
      );

      document.querySelectorAll('.remove').forEach(button => button.addEventListener('click', confirmRemoveCartItem));
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}



async function updateQuantity(event) {
  const index = event.target.getAttribute('data-index');
  const action = event.target.classList.contains('increase') ? 'increase' : 'decrease';
  const quantityInput = document.querySelector(`.quantity-input-${index}`);
  console.log(quantityInput.value);
  let currentQuantity = parseInt(quantityInput.value);
  if (action === 'increase') {
    currentQuantity++;
  } else if (action === 'decrease' && currentQuantity > 1) {
    currentQuantity--;
  }
  console.log(currentQuantity)


  try {
    // Send the updated quantity to the backend
    const response = await fetch('/update-cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        index: index,        // Index of the item in the cart
        quantity: currentQuantity  // Updated quantity
      })
    });

    const data = await response.json();

    // If the response is successful, update the cart
    if (data.success) {
      // Update the item total
      const itemTotalElement = document.getElementById(`item-total-${index}`);
      itemTotalElement.textContent = `₹${data.itemTotal.toFixed(2)}`;
      quantityInput.value = currentQuantity;
      // Update the cart totals (Subtotal and Total)
      const subtotalElement = document.getElementById('subtotal');
      const totalElement = document.getElementById('total');
      subtotalElement.textContent = `₹${data.cartTotal.toFixed(2)}`;
      totalElement.textContent = `₹${data.cartTotal.toFixed(2)}`;
    } else {
    
      swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.msg+" than 3",
        showConfirmButton: false,
        timer: 2000
      });
    
      console.error('Failed to update the cart:', data.msg);
     
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

// Add event listeners to quantity buttons
document.querySelectorAll('.decrease').forEach(button =>
  button.addEventListener('click', updateQuantity)
);

document.querySelectorAll('.increase').forEach(button =>
  button.addEventListener('click', updateQuantity)
);





