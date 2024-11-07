function togglePasswordVisibility() {
  const passwordInput = document.getElementById("newPassword");
  const toggleIcon = document.getElementById("togglePassword");
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  }
}

function toggleConfirmPasswordVisibility() {
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const toggleIcon = document.getElementById("toggleConfirmPassword");
  if (confirmPasswordInput.type === "password") {
    confirmPasswordInput.type = "text";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  } else {
    confirmPasswordInput.type = "password";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  }
}
