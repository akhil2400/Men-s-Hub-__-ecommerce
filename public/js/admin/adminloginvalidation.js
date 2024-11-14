// Your existing form validation function
function validateForm() {
 
  // Get input values
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  // Get error message elements
  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");

  // Reset error messages
  usernameError.textContent = "";
  passwordError.textContent = "";

  // Validation flag
  let isValid = true;

  // Username validation
  if (username === "") {
    usernameError.textContent = "Please enter your username.";
    isValid = false;
  }

  // Password validation
  if (password === "") {
    passwordError.innerHTML = "Please enter your password.";
    isValid = false;
  } else if (password.length < 6) {
    passwordError.innerHTML = "Password must be at least 6 characters long.";
    isValid = false;
  }

  return isValid; // Only submit if all validations pass
}

async function fetchData() {
  // Run validation first
  if (!validateForm()) return;


  document.getElementById("form-error").innerHTML = "";
  document.getElementById("username-error").innerHTML = "";
  document.getElementById("password-error").innerHTML = "";

  // If valid, proceed with login
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch('/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (data.st === false) {
      // Check error type and display message accordingly
      if (data.type === "username") {
        document.getElementById("username-error").innerText = data.msg;
      } else if (data.type === "password") {
        document.getElementById("password-error").innerText = data.msg;
      } else {
        document.getElementById("form-error").innerText = data.msg;
      }
    } else {
      // Redirect on successful login
      window.location.href = '/admin/usermanagement';
    }
  } catch (error) {
    console.error('Login error:', error);
    document.getElementById("form-error").innerText = 'An error occurred. Please try again.';
  }
}
fetchData();


// Add event listener to the login button
document.getElementById('loginBtn').addEventListener('click', function(event) {
  event.preventDefault();
  
});
