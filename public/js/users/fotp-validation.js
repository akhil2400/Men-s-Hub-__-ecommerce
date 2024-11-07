// Start the countdown when the page loads
startCountdown(59);

const otpText = document.querySelector('.otpText'); // Get the span element

// Function to start the countdown
function startCountdown(countdown) {
  const interval = setInterval(() => {
    // Update the text content with the remaining time
    otpText.textContent = `00:${countdown < 10 ? '0' + countdown : countdown}`;

    // Decrement the countdown value
    countdown--;

    // When countdown reaches 0, clear the interval and call the function
    if (countdown < 0) {
      clearInterval(interval);
      otpExpired(); // Call your function here
    }
  }, 1000); // Run the code every second (1000 milliseconds)
}

// Function to be called after countdown ends
function otpExpired() {
  document.querySelector('.resendBtn').style.display = 'block';
  document.querySelector('.resendTimer').style.display = 'none';
}

document.querySelector('.resendBtn').addEventListener('click', async () => {
  async function fetchData() {
    try {
      const response = await fetch('/forgotpasswordemailverification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isResend: true
        })
        
      })
      const data = await response.json();
      if (data.st === false) {
        document.getElementById("otpError").innerText = data.msg;
      } else {
        document.querySelector('.otp-btn-text').textContent = data.msg;
        setTimeout(() => {
          document.querySelector('.otp-btn-text').textContent = "Verifiy-OTP";
        }, 3000);
       startCountdown(59);
      }
    } catch (error) {
      console.log(error);
    }
  }
  fetchData();

})


document.getElementById('Verifiy-OTP-btn').addEventListener('click', validateOTP);
function validateOTP(e) {
  e.preventDefault();

  // to clear all previous error messages
  document.getElementById("otpError").innerText = "";

  const otp = document.getElementById("otp").value.trim();

  const otpPattern = /^[0-9]{6}$/;

  let valid = true;

  if (!otpPattern.test(otp)) {
    document.getElementById("otpError").innerText = "Otp must be 6 digits long.";
    valid = false;
  }

  if (valid) {
    async function fetchData() {
      try {
        const response = await fetch('/fotp-verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            otp: otp
          })
        })
        const data = await response.json();
        if (data.st === false) {
          document.getElementById("otpError").innerText = data.msg;
        } else {
          window.location.href = "/forgotpassword";
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }
}

