function addressAddForm(e) {
  e.preventDefault();
  document.querySelector("#addressForm").style.display = "block";
  document.querySelector("#addAddress").style.display = "none"

}


function addressFormValidation(e) {
  e.preventDefault();
  console.log("Validation triggered");

  // Clear previous error messages
  document.getElementById("houseNumberError").innerText = "";
  document.getElementById("streetError").innerText = "";
  document.getElementById("cityError").innerText = "";
  document.getElementById("landmarkError").innerText = "";
  document.getElementById("districtError").innerText = "";
  document.getElementById("stateError").innerText = "";
  document.getElementById("CountryError").innerText = "";
  document.getElementById("pinCodeError").innerText = "";

  // Get input values
  const houseNumber = document.getElementById("houseNumber").value.trim();
  const street = document.getElementById("street").value.trim();
  const city = document.getElementById("city").value.trim();
  const landmark = document.getElementById("landmark").value.trim();
  const district = document.getElementById("district").value.trim();
  const state = document.getElementById("state").value.trim();
  const country = document.getElementById("Country").value.trim();
  const pinCode = document.getElementById("pinCode").value.trim();

  let valid = true;

  // Validation patterns
  const houseNumberPattern = /^[a-zA-Z0-9\s]+$/; // Letters, numbers, and spaces
  const streetPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
  const cityPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
  const landmarkPattern = /^[a-zA-Z0-9\s]+$/; // Letters, numbers, and spaces
  const districtPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
  const statePattern = /^[a-zA-Z\s]+$/; // Letters and spaces
  const countryPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
  const pinCodePattern = /^\d{6}$/; // Exactly 6 digits

  // Check for empty fields and display sweetalert for missing fields
  if (!houseNumber || !street || !city || !landmark || !district || !state || !country || !pinCode) {
    swal.fire({
      title: "Error",
      text: "All fields are required!",
      icon: "error",
      timer: 2500,
      showConfirmButton: false,
    });
    valid = false;
  }

  // House Number validation
  if (!houseNumberPattern.test(houseNumber)) {
    const error = document.getElementById("houseNumberError");
    error.innerText = "House Number can only contain letters, numbers, and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // Street validation
  if (!streetPattern.test(street)) {
    const error = document.getElementById("streetError");
    error.innerText = "Street can only contain letters and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // City validation
  if (!cityPattern.test(city)) {
    const error = document.getElementById("cityError");
    error.innerText = "City can only contain letters and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // Landmark validation
  if (!landmarkPattern.test(landmark)) {
    const error = document.getElementById("landmarkError");
    error.innerText = "Landmark can only contain letters, numbers, and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // District validation
  if (!districtPattern.test(district)) {
    const error = document.getElementById("districtError");
    error.innerText = "District can only contain letters and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // State validation
  if (!statePattern.test(state)) {
    const error = document.getElementById("stateError");
    error.innerText = "State can only contain letters and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // Country validation
  if (!countryPattern.test(country)) {
    const error = document.getElementById("CountryError");
    error.innerText = "Country can only contain letters and spaces.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // Pin Code validation
  if (!pinCodePattern.test(pinCode)) {
    const error = document.getElementById("pinCodeError");
    error.innerText = "Pin Code must be exactly 6 digits.";
    valid = false;
    setTimeout(() => (error.innerText = ""), 16000);
  }

  // Submit form if valid
  if (valid) {

    async function fetchData() {

      console.log("Here now!")
      try {
        const response = await fetch('/my-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            houseNumber: houseNumber,
            street: street,
            city: city,
            landmark: landmark,
            district: district,
            state: state,
            country: country,
            pinCode: pinCode
          })
        });
        const data = await response.json();
        if (data.st === false) {
          if (data.type === "houseNumber") {
            document.getElementById("houseNumberError").innerText = data.msg;
            setTimeout(() => (document.getElementById("houseNumberError").innerText = ""), 16000);
          } else if (data.type === "street") {
            document.getElementById("streetError").innerText = data.msg;
            setTimeout(() => (document.getElementById("streetError").innerText = ""), 16000);
          } else if (data.type === "city") {
            document.getElementById("cityError").innerText = data.msg;
            setTimeout(() => (document.getElementById("cityError").innerText = ""), 16000);
          } else if (data.type === "landmark") {
            document.getElementById("landmarkError").innerText = data.msg;
            setTimeout(() => (document.getElementById("landmarkError").innerText = ""), 16000);
          } else if (data.type === "district") {
            document.getElementById("districtError").innerText = data.msg;
            setTimeout(() => (document.getElementById("districtError").innerText = ""), 16000);
          } else if (data.type === "state") {
            document.getElementById("stateError").innerText = data.msg;
            setTimeout(() => (document.getElementById("stateError").innerText = ""), 16000);
          } else if (data.type === "country") {
            document.getElementById("countryError").innerText = data.msg;
            setTimeout(() => (document.getElementById("countryError").innerText = ""), 16000);
          } else if (data.type === "pinCode") {
            document.getElementById('pinCodeError').innerText = data.msg;
            setTimeout(() => (document.getElementById('pinCodeError').innerText = ""), 16000);
          }
        } else {
          swal.fire("Address Added Successfully");
          console.log(data.msg);
          setTimeout(() => {

            window.location.href = "/my-address";
          }, 2000)
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchData();
  }
  return valid;
}

// Edit address button click listener
const editAddressBtns = document.querySelectorAll(".edit-address");

editAddressBtns.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    const addressId = e.target.getAttribute("data-id"); // Get the address ID
    const addressBox = e.target.closest('.address-box'); // Get the closest address box
    const editForm = addressBox.querySelector(".edit-address-form"); // Find the specific edit form

    // Toggle visibility of the edit form and hide the address details
    editForm.style.display = "block"; // Show the edit form
    addressBox.querySelector(".address-boxes").style.display = "none"; // Hide the address details
    addressBox.querySelector(".edit-address").style.display = "none"; // Hide the "EDIT" button
    addressBox.querySelector(".remove-address").style.display = "none"; // Hide the "REMOVE" button

    try {
      // Fetch the existing address details for editing using async/await
      const response = await fetch(`/my-address-edit/${addressId}`);
      const data = await response.json();

      // Pre-fill the form with the existing data
      addressBox.querySelector(".EhouseNumber").value = data.houseNumber;
      addressBox.querySelector(".Estreet").value = data.street;
      addressBox.querySelector(".Ecity").value = data.city;
      addressBox.querySelector(".Elandmark").value = data.landmark;
      addressBox.querySelector(".Edistrict").value = data.district;
      addressBox.querySelector(".Estate").value = data.state;
      addressBox.querySelector(".ECountry").value = data.country;
      addressBox.querySelector(".EpinCode").value = data.pinCode;
    } catch (error) {
      console.error("Error fetching address data:", error);
    }
  });
});

// Add validation and submit the form
document.querySelectorAll('.edit-address-form').forEach(form => {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const addressId = form.getAttribute('data-id');
    const updatedData = {
      houseNumber: form.querySelector(".EhouseNumber").value,
      street: form.querySelector(".Estreet").value,
      city: form.querySelector(".Ecity").value,
      landmark: form.querySelector(".Elandmark").value,
      district: form.querySelector(".Edistrict").value,
      state: form.querySelector(".Estate").value,
      country: form.querySelector(".ECountry").value,
      pinCode: form.querySelector(".EpinCode").value
    };

    // Validation function
    async function editaddressFormValidation(e) {
      e.preventDefault();
      console.log("Validation triggered");

      // Clear previous error messages
      const errorMessages = document.querySelectorAll('.EhouseNumberError, .EstreetError, .EcityError, .ElandmarkError, .EdistrictError, .EstateError, .ECountryError, .EpinCodeError');
      errorMessages.forEach(msg => msg.innerText = "");

      // Get input values
      const EhouseNumber = form.querySelector(".EhouseNumber").value.trim();
      const Estreet = form.querySelector(".Estreet").value.trim();
      const Ecity = form.querySelector(".Ecity").value.trim();
      const Elandmark = form.querySelector(".Elandmark").value.trim();
      const Edistrict = form.querySelector(".Edistrict").value.trim();
      const Estate = form.querySelector(".Estate").value.trim();
      const Ecountry = form.querySelector(".ECountry").value.trim();
      const EpinCode = form.querySelector(".EpinCode").value.trim();

      let valid = true;

      // Validation patterns
      const EhouseNumberPattern = /^[a-zA-Z0-9\s]+$/; // Letters, numbers, and spaces
      const EstreetPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
      const EcityPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
      const ElandmarkPattern = /^[a-zA-Z0-9\s]+$/; // Letters, numbers, and spaces
      const EdistrictPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
      const EstatePattern = /^[a-zA-Z\s]+$/; // Letters and spaces
      const EcountryPattern = /^[a-zA-Z\s]+$/; // Letters and spaces
      const EpinCodePattern = /^\d{6}$/; // Exactly 6 digits

      // Check for empty fields and regex validation
      if (!EhouseNumber || !Estreet || !Ecity || !Elandmark || !Edistrict || !Estate || !Ecountry || !EpinCode) {
        swal.fire({
          title: "Error",
          text: "All fields are required",
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
        });
        valid = false;
      }
      if (!EhouseNumberPattern.test(EhouseNumber)) {
        document.querySelector(".EhouseNumberError").innerText = "Invalid house number. Only letters, numbers, and spaces are allowed.";
        valid = false;
      }
      if (!EstreetPattern.test(Estreet)) {
        document.querySelector(".EstreetError").innerText = "Invalid street. Only letters and spaces are allowed.";
        valid = false;
      }
      if (!EcityPattern.test(Ecity)) {
        document.querySelector(".EcityError").innerText = "Invalid city. Only letters and spaces are allowed.";
        valid = false;
      }
      if (!ElandmarkPattern.test(Elandmark)) {
        document.querySelector(".ElandmarkError").innerText = "Invalid landmark. Only letters, numbers, and spaces are allowed.";
        valid = false;
      }
      if (!EdistrictPattern.test(Edistrict)) {
        document.querySelector(".EdistrictError").innerText = "Invalid district. Only letters and spaces are allowed.";
        valid = false;
      }
      if (!EstatePattern.test(Estate)) {
        document.querySelector(".EstateError").innerText = "Invalid state. Only letters and spaces are allowed.";
        valid = false;
      }
      if (!EcountryPattern.test(Ecountry)) {
        document.querySelector(".ECountryError").innerText = "Invalid country. Only letters and spaces are allowed.";
        valid = false;
      }
      if (!EpinCodePattern.test(EpinCode)) {
        document.querySelector(".EpinCodeError").innerText = "Invalid pin code. Only 6 digits are allowed.";
        valid = false;
      }

      if (valid) {
        // Proceed with updating address if validation passes
        try {
          const response = await fetch(`/my-address-edit/${addressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
          });

          const result = await response.json();
          console.log(result);
          if (result.st) {
            // On success, update the UI accordingly and hide the form
            swal.fire({
              position: "center",
              icon: "success",
              title: "Address updated successfully",
              showConfirmButton: false,
              timer: 1500
            });
            form.style.display = "none";
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            form.closest('.address-box').querySelector(".address-boxes").style.display = "block";
          } else {
            swal.fire("Failed to update the address.");
          }
        } catch (error) {
          console.error("Error updating address:", error);
          swal.fire("An error occurred while updating the address.");
        }
      }
    }


    editaddressFormValidation(e);
  });
});


// delete
document.addEventListener('DOMContentLoaded', function () {
  // Handle Remove Address button click
  document.querySelectorAll('.remove-address').forEach(button => {
    button.addEventListener('click', async function () {
      const addressId = this.closest('.address-box').getAttribute('data-id');

      // Confirmation popup
      const result = await swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to remove this address?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!',
      });

      if (result.isConfirmed) {
        try {
          // Send request to backend
          const response = await fetch(`/my-address/${addressId}`, {
            method: 'DELETE',
          });

          const data = await response.json();
          if (data.success) {
            // Remove the address from the frontend
            const addressBox = document.querySelector(`.address-box[data-id="${addressId}"]`);
            addressBox.remove();

            swal.fire({
              position: "center",
              icon: "success",
              title: "Address removed successfully",
              showConfirmButton: false,
              timer: 1500
          })
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          } else {
            Swal.fire('Error', data.message, 'error');
          }
        } catch (error) {
          console.error('Error removing address:', error);
          Swal.fire('Error', 'Failed to remove the address.', 'error');
        }
      }
    });
  });
});
