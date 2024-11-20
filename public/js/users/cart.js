 // Function to handle adding items to the cart (from productDetails.ejs)
 document.querySelector('.add-to-cart-btn').addEventListener('click', async (event) => {
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
async function updateQuantity(e) {
  const index = e.target.dataset.index;
  const quantityInput = e.target.closest('.quantity-container').querySelector('.quantity-amount');
  let quantity = parseInt(quantityInput.value);

  if (e.target.classList.contains('decrease') && quantity > 1) {
    quantity--;
  } else if (e.target.classList.contains('increase')) {
    quantity++;
  }

  try {
    const response = await fetch('/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index, quantity })
    });
    const result = await response.json();
    if (result.success) {
      loadCart();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

// Remove an item from the cart
async function removeItem(e) {
  const index = e.target.dataset.index;

  try {
    const response = await fetch('/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index })
    });
    const result = await response.json();
    if (result.success) {
      loadCart();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Error removing item:', error);
  }
}

// Update cart view after changes
function updateCart() {
  loadCart();
}