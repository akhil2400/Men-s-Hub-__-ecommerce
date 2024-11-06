function handleCredentialResponse(response) {
  console.log("Encoded JWT ID token: " + response.credential);
  
  // Send the Google ID token to the backend for further validation
  fetch('/google-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential })
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          // If login is successful, you can redirect the user to the dashboard
          window.location.href = '/dashboard'; // Redirect to dashboard or home page
      } else {
          console.log('Google login failed');
      }
  });
}