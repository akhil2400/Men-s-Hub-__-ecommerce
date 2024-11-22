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
          setTimeout(()=>{

            window.location.href = "/my-address";
          },2000)
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    fetchData();
  }
  return valid;
}

  function addressEditForm(e) {
    e.preventDefault();
    document.querySelector("#editaddressForm").style.display = "block";
    document.querySelector(".address-boxes").style.display = "none";
    document.querySelector(".edit-address").style.display = "none";
    document.querySelector(".remove-address").style.display = "none";
  }

  function editaddressFormValidation(e) {
    e.preventDefault();
    console.log("Validation triggered");
  
    // Clear previous error messages
    document.getElementById("EhouseNumberError").innerText = "";
    document.getElementById("EstreetError").innerText = "";
    document.getElementById("EcityError").innerText = "";
    document.getElementById("ElandmarkError").innerText = "";
    document.getElementById("EdistrictError").innerText = "";
    document.getElementById("EstateError").innerText = "";
    document.getElementById("ECountryError").innerText = "";
    document.getElementById("EpinCodeError").innerText = "";
  
    // Get input values
    const EhouseNumber = document.getElementById("EhouseNumber").value.trim();
    const Estreet = document.getElementById("Estreet").value.trim();
    const Ecity = document.getElementById("Ecity").value.trim();
    const Elandmark = document.getElementById("Elandmark").value.trim();
    const Edistrict = document.getElementById("Edistrict").value.trim();
    const Estate = document.getElementById("Estate").value.trim();
    const Ecountry = document.getElementById("ECountry").value.trim();
    const EpinCode = document.getElementById("EpinCode").value.trim();
  
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
  
    // Check for empty fields
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
      document.getElementById("EhouseNumberError").innerText = "Invalid house number. Only letters, numbers, and spaces are allowed.";
      valid = false;
    }
    if (!EstreetPattern.test(Estreet)) {
      document.getElementById("EstreetError").innerText = "Invalid street. Only letters and spaces are allowed.";
      valid = false;
    }
    if (!EcityPattern.test(Ecity)) {
      document.getElementById("EcityError").innerText = "Invalid city. Only letters and spaces are allowed.";
      valid = false;
    }
    if (!ElandmarkPattern.test(Elandmark)) {
      document.getElementById("ElandmarkError").innerText = "Invalid landmark. Only letters, numbers, and spaces are allowed.";
      valid = false;
    }
    if (!EdistrictPattern.test(Edistrict)) {
      document.getElementById("EdistrictError").innerText = "Invalid district. Only letters and spaces are allowed.";
      valid = false;
      }
    if (!EstatePattern.test(Estate)) {
      document.getElementById("EstateError").innerText = "Invalid state. Only letters and spaces are allowed.";
      valid = false;
    }
    if (!EcountryPattern.test(Ecountry)) {
      document.getElementById("ECountryError").innerText = "Invalid country. Only letters and spaces are allowed.";
      valid = false;
    }
    if (!EpinCodePattern.test(EpinCode)) {
      document.getElementById("EpinCodeError").innerText = "Invalid pin code. Only 6 digits are allowed.";
      valid = false;
    }
    return valid;
  }