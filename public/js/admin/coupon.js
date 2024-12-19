/* Add Coupon validation
<========================>
*/

  document.getElementById('saveCoupon').addEventListener('click', async function (e) {
    e.preventDefault(); // Prevent default form submission

    // Clear all previous error messages
    const errorFields = document.querySelectorAll('.error-message');
    errorFields.forEach(field => (field.innerText = ''));

    // Collect field values
    const couponCode = document.getElementById('couponCode').value.trim();
    const discountType = document.getElementById('discountType').value;
    const discountValue = document.getElementById('discountValue').value;
    const minimumPurchase = document.getElementById('minimumPurchase').value;
    const maximumPurchase = document.getElementById('maximumPurchase').value;
    const startDate = document.getElementById('startDate').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const usageLimit = document.getElementById('usageLimit').value;
    const isActive = document.getElementById('isActive').checked;

    let isValid = true;

    // Validate Coupon Code
    if (!couponCode) {
      document.getElementById('couponCodeError').innerText = 'Coupon code is required.';
      isValid = false;
    }

    // Validate Discount Type
    if (!discountType) {
      document.getElementById('discountTypeError').innerText = 'Discount type is required.';
      isValid = false;
    }

    // Validate Discount Value
    if (!discountValue || discountValue <= 0) {
      document.getElementById('discountValueError').innerText = 'Discount value must be greater than 0.';
      isValid = false;
    }

    // Validate Minimum Purchase
    if (!minimumPurchase || minimumPurchase <= 0) {
      document.getElementById('minimumPurchaseError').innerText = 'Minimum purchase must be greater than 0.';
      isValid = false;
    }

    // Validate Maximum Purchase
    if (maximumPurchase && Number(maximumPurchase) < Number(minimumPurchase)) {
      document.getElementById('maximumPurchaseError').innerText =
        'Maximum purchase must be greater than or equal to minimum purchase.';
      isValid = false;
    }

    // Validate Start and Expiry Dates
    if (!startDate) {
      document.getElementById('startDateError').innerText = 'Start date is required.';
      isValid = false;
    }

    if (!expiryDate) {
      document.getElementById('expiryDateError').innerText = 'Expiry date is required.';
      isValid = false;
    }

    if (startDate && expiryDate && new Date(startDate) > new Date(expiryDate)) {
      document.getElementById('startDateError').innerText = 'Start date cannot be after expiry date.';
      document.getElementById('expiryDateError').innerText = 'Expiry date cannot be before start date.';
      isValid = false;
    }

    // Validate Usage Limit
    if (!usageLimit || usageLimit <= 0) {
      document.getElementById('usageLimitError').innerText = 'Usage limit must be greater than 0.';
      isValid = false;
    }

    // If form is invalid, stop further execution
    if (!isValid) {
      return;
    }

    // Prepare coupon data for submission
    const couponData = {
      couponCode,
      discountType,
      discountValue: parseFloat(discountValue),
      minimumPurchase: parseFloat(minimumPurchase),
      maximumPurchase: maximumPurchase ? parseFloat(maximumPurchase) : null,
      startDate,
      expiryDate,
      usageLimit: parseInt(usageLimit),
      isActive,
    };

    try {
      // Send coupon data to the server
      const response = await fetch('/admin/coupon/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });

      const result = await response.json();

      if (response.ok) {
        // Success: Display a success message and add coupon to the list
        Swal.fire({
          title: 'Success',
          text: 'Coupon added successfully!',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });
        setTimeout(() => {
          window.location.reload(),
            2000
        });
      } else {
        // Handle server-side validation errors
        Swal.fire({
          title: 'Error',
          text: result.error || 'Failed to add coupon.',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error submitting coupon data:', error);
      Swal.fire({
        title: 'Error',
        text: 'An unexpected error occurred.',
        icon: 'error',
      });
    }
  });

  

  /* update coupon validation
  <========================>
  */

    document.addEventListener('DOMContentLoaded', function () {
      let currentUpdateCouponId = null;
  
      // Handle Update Button Click
      document.querySelectorAll('.update-coupon-btn').forEach(button => {
        button.addEventListener('click', function (e) {
          e.preventDefault(); // Prevent navigation
  
          const clickedElement = e.target;
  
          // Extract data safely with fallback in case of missing attributes
          const couponId = clickedElement.dataset.id || '';
          const couponCode = clickedElement.dataset.code || '';
          const discountType = clickedElement.dataset.type || '';
          const discountValue = clickedElement.dataset.value || '';
          const minimumPurchase = clickedElement.dataset.minpurchase || '';
          const maximumPurchase = clickedElement.dataset.maxpurchase || '';
          const startDate = clickedElement.dataset.startdate || '';
          const expiryDate = clickedElement.dataset.expirydate || '';
          const usageLimit = clickedElement.dataset.usagelimit || '';
          const isActive = clickedElement.dataset.isactive === 'true'; // Convert string to boolean
  
          // Populate modal fields with extracted data safely
          document.getElementById('updateCouponCode').value = couponCode;
          document.getElementById('updateDiscountType').value = discountType;
          document.getElementById('updateDiscountValue').value = discountValue;
          document.getElementById('updateMinimumPurchase').value = minimumPurchase;
          document.getElementById('updateMaximumPurchase').value = maximumPurchase;
          document.getElementById('updateStartDate').value = startDate;
          document.getElementById('updateExpiryDate').value = expiryDate;
          document.getElementById('updateUsageLimit').value = usageLimit;
          document.getElementById('updateIsActive').checked = isActive;
  
          // Save current coupon ID for backend use
          currentUpdateCouponId = couponId;
  
          // Show the modal
          const modal = new bootstrap.Modal(document.getElementById('updateCouponModal'));
          modal.show();
        });
      });
  
      // Handle Save Changes in the modal
      document.getElementById('saveUpdatedCoupon').addEventListener('click', async function (e) {
        e.preventDefault(); // Prevent default form submission
  
        // Clear all previous error messages
        const errorFields = document.querySelectorAll('.update-error-message');
        errorFields.forEach(field => (field.innerText = ''));
  
        // Collect field values
        const couponCode = document.getElementById('updateCouponCode').value.trim();
        const discountType = document.getElementById('updateDiscountType').value;
        const discountValue = document.getElementById('updateDiscountValue').value;
        const minimumPurchase = document.getElementById('updateMinimumPurchase').value;
        const maximumPurchase = document.getElementById('updateMaximumPurchase').value;
        const startDate = document.getElementById('updateStartDate').value;
        const expiryDate = document.getElementById('updateExpiryDate').value;
        const usageLimit = document.getElementById('updateUsageLimit').value;
        const isActive = document.getElementById('updateIsActive').checked;
  
        let isValid = true;
  
        // Validate Coupon Code
        if (!couponCode) {
          document.getElementById('updateCouponCodeError').innerText = 'Coupon code is required.';
          isValid = false;
        }
  
        // Validate Discount Type
        if (!discountType) {
          document.getElementById('updateDiscountTypeError').innerText = 'Discount type is required.';
          isValid = false;
        }
  
        // Validate Discount Value
        if (!discountValue || discountValue <= 0) {
          document.getElementById('updateDiscountValueError').innerText = 'Discount value must be greater than 0.';
          isValid = false;
        }
  
        // Validate Minimum Purchase
        if (!minimumPurchase || minimumPurchase <= 0) {
          document.getElementById('updateMinimumPurchaseError').innerText = 'Minimum purchase must be greater than 0.';
          isValid = false;
        }
  
        // Validate Maximum Purchase
        if (maximumPurchase && Number(maximumPurchase) < Number(minimumPurchase)) {
          document.getElementById('updateMaximumPurchaseError').innerText =
            'Maximum purchase must be greater than or equal to minimum purchase.';
          isValid = false;
        }
  
        // Validate Start and Expiry Dates
        if (!startDate) {
          document.getElementById('updateStartDateError').innerText = 'Start date is required.';
          isValid = false;
        }
  
        if (!expiryDate) {
          document.getElementById('updateExpiryDateError').innerText = 'Expiry date is required.';
          isValid = false;
        }
  
        if (startDate && expiryDate && new Date(startDate) > new Date(expiryDate)) {
          document.getElementById('updateStartDateError').innerText = 'Start date cannot be after expiry date.';
          document.getElementById('updateExpiryDateError').innerText = 'Expiry date cannot be before start date.';
          isValid = false;
        }
  
        // Validate Usage Limit
        if (!usageLimit || usageLimit <= 0) {
          document.getElementById('updateUsageLimitError').innerText = 'Usage limit must be greater than 0.';
          isValid = false;
        }
  
        // If form is invalid, stop further execution
        if (!isValid) {
          return;
        }
  
        // Prepare coupon data for submission
        const couponData = {
          couponCode,
          discountType,
          discountValue: parseFloat(discountValue),
          minimumPurchase: parseFloat(minimumPurchase),
          maximumPurchase: maximumPurchase ? parseFloat(maximumPurchase) : null,
          startDate,
          expiryDate,
          usageLimit: parseInt(usageLimit),
          isActive,
        };
  
        try {
          // Send updated coupon data to the server
          const response = await fetch(`/admin/coupon/update/${currentUpdateCouponId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(couponData),
          });
  
          const result = await response.json();
  
          if (response.ok) {
            // Success: Display a success message and refresh the page
            Swal.fire({
              title: 'Success',
              text: 'Coupon updated successfully!',
              icon: 'success',
              showConfirmButton: false,
              timer: 2000,
            });
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            // Handle server-side validation errors
            Swal.fire({
              title: 'Error',
              text: result.message || 'Failed to update coupon.',
              icon: 'error',
            });
          }
        } catch (error) {
          console.error('Error updating coupon:', error);
          Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred.',
            icon: 'error',
          });
        }
      });
    });


/*  CouponActie or Deactive button
<=================================>
  */

  document.addEventListener('DOMContentLoaded', function () {
    // Event listener for the button click
    document.querySelectorAll('.btnActiveAndInactive').forEach(button => {
      button.addEventListener('click', async function (event) {
        const buttonElement = event.currentTarget; // Use event.currentTarget instead of `this`
        const id = buttonElement.dataset.id;
        const currentState = buttonElement.classList.contains('badge-outline-success'); // Determine current state

        const result = await Swal.fire({
          title: currentState ? 'Deactivate coupon?' : 'Activate coupon?',
          text: currentState
            ? 'Are you sure you want to deactivate this coupon?'
            : 'Are you sure you want to activate this coupon?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: currentState ? 'Yes, Deactivate' : 'Yes, Activate',
          cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
          try {
            // Disable button and show a loading state
            buttonElement.disabled = true;
            buttonElement.textContent = 'Processing...';

            const response = await fetch('/admin/coupon/unlist', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ id, newState: !currentState }), // Send ID and newState to server
            });

            // Ensure HTTP response is ok before parsing
            if (!response.ok) throw new Error('Network response was not ok.');

            const data = await response.json();

            if (data.success) {
              Swal.fire(
                'Success!',
                `Coupon is now ${data.newState ? 'Active' : 'Inactive'}.`,
                'success'
              );

              // Update UI based on new state
              if (data.newState) {
                buttonElement.classList.remove('badge-outline-danger');
                buttonElement.classList.add('badge-outline-success');
                buttonElement.textContent = 'Active';
              } else {
                buttonElement.classList.remove('badge-outline-success');
                buttonElement.classList.add('badge-outline-danger');
                buttonElement.textContent = 'Inactive';
              }
            } else {
              Swal.fire('Error!', data.message || 'Could not update status.', 'error');
            }
          } catch (error) {
            console.error('Error during fetch request:', error);
            Swal.fire('Error!', 'Something went wrong.', 'error');
          } finally {
            // Re-enable the button and revert text in case of failure
            buttonElement.disabled = false;
            if (!buttonElement.classList.contains('badge-outline-success') &&
              !buttonElement.classList.contains('badge-outline-danger')) {
              buttonElement.textContent = currentState ? 'Active' : 'Inactive';
            }
          }
        }
      });
    });
  });





/* Generate random coupon code
<=================================>
*/
document.getElementById('generateCoupon').addEventListener('click', function () {
  const randomCode = 'COUPON-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  document.getElementById('couponCode').value = randomCode;
});

