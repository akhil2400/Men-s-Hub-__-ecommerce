function detailsFormvalidation(e) {
  e.preventDefault();
  console.log('iam onn')

  // Clear previous error messages
  document.getElementById("userNameError").innerText = "";
  document.getElementById("emailError").innerText = "";
  document.getElementById("mobileNumberError").innerText = "";

  // Get input values
  const userName = document.getElementById("userName").value.trim();
  const email = document.getElementById("email").value.trim();
  const mobileNumber = document.getElementById("mobileNumber").value.trim();

  let valid = true;

  // Validation patterns
  const userNamePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const mobilePattern = /^\d{10}$/;

  // Check for empty fields
  if (!userName || !email || !mobileNumber) {
    swal.fire({
      title: "Error",
      text: "All fields are required",
      icon: "error",
      timer: 3000,
      showConfirmButton: false,

    });
    valid = false;
  }


  
  // Username validation
  if (!userNamePattern.test(userName)) {
    const userNameError = document.getElementById("userNameError")
    userNameError.innerText = "The username must start with a letter, can contain letters, numbers, and underscores, and must be 3 to 16 characters long.";
    valid = false;
  

  setTimeout(() => {
    userNameError.innerText = "";
  }, 6000);
}

  // Email validation
  if (!emailPattern.test(email)) {
    const emailError = document.getElementById("emailError")
    emailError.innerText = "Invalid email format.";
    valid = false;
  
  setTimeout(() => {
    emailError.innerText = "";
  }, 6000);
}

  // Mobile number validation
  if (!mobilePattern.test(mobileNumber)) {
    const mobileNumberError = document.getElementById("mobileNumberError")
    mobileNumberError.innerText = "Invalid Mobile number format. Mobile number should contain exactly 10 digits.";
    valid = false;

    setTimeout(() => {
      mobileNumberError.innerText = "";
    }, 6000);
  }
  

  // Only submit the form if all validations pass
  return valid;
}

// function to handle edit profile
function editProfile(event) {
      event.preventDefault();
      document.querySelector('#form').style.display = 'block';
      document.querySelector('.dashpbox1').style.display = 'none';
    }

