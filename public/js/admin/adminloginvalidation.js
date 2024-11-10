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
    passwordError.textContent = "Please enter your password.";
    isValid = false;
  } else if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters long.";
    isValid = false;
  }

  return isValid; // Only submit if all validations pass
}