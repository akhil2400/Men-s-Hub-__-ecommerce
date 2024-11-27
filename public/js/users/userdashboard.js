// function to handle edit profile
function editProfile(event) {
      event.preventDefault();
      document.querySelector('#form').style.display = 'block';
      document.querySelector('.dashpbox1').style.display = 'none';
    }


async function detailsFormvalidation(e) {
  e.preventDefault(); // Prevent default form submission behavior
  console.log('Validation started');

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
    const userNameError = document.getElementById("userNameError");
    userNameError.innerText = "The username must start with a letter, can contain letters, numbers, and underscores, and must be 3 to 16 characters long.";
    valid = false;
    setTimeout(() => {
      userNameError.innerText = "";
    }, 6000);
  }

  // Email validation
  if (!emailPattern.test(email)) {
    const emailError = document.getElementById("emailError");
    emailError.innerText = "Invalid email format.";
    valid = false;
    setTimeout(() => {
      emailError.innerText = "";
    }, 6000);
  }

  // Mobile number validation
  if (!mobilePattern.test(mobileNumber)) {
    const mobileNumberError = document.getElementById("mobileNumberError");
    mobileNumberError.innerText = "Invalid Mobile number format. Mobile number should contain exactly 10 digits.";
    valid = false;
    setTimeout(() => {
      mobileNumberError.innerText = "";
    }, 6000);
  }

  // If validation passes, submit the data
  if (valid) {
    try {
      const response = await fetch('/dashboard/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, email, mobileNumber }),
      });

      const result = await response.json();
      console.log(result);
      // Handling the response from the server
      if (result.st) {
        
        // Update the frontend with new details
        document.querySelector('.dashpbox1').innerHTML = `
          <p><strong>User name:</strong> ${userName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
        `;

        // Hide the edit form and show the updated details
        document.querySelector('#form').style.display = 'none';
        document.querySelector('.dashpbox1').style.display = 'block';

        // Show success message
        swal.fire({
          position: "center",
          icon: "success",
          title: "Profile updated successfully",
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          window.location.reload();
        },1500)
      } else {
        if(result.errors.userName ){
        document.getElementById("userNameError").innerText = result.errors.userName;
        }if(result.errors.email){
        document.getElementById("emailError").innerText = result.errors.email;
      }if(result.errors.mobileNumber){
        document.getElementById("mobileNumberError").innerText = result.errors.mobileNumber;
        }
      
        // Show error message from backend
        // swal.fire('Error', result.msg || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      console.error('Update failed:', error);
      swal.fire('Error', 'An error occurred while updating your profile.', 'error');
    }
  }

  return false; // Prevent form submission by default
}


