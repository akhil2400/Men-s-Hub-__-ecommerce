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
    document.querySelector('.resendTimer').style.display = 'none';
    document.querySelector('.resendBtn').style.display = 'none';
    document.querySelector('.loader1').style.display = 'block';
  async function fetchData() {
    try {
      const response = await fetch('/register/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: otp,
          isResend: true
        })

      })
      console.log(response)
      const data = await response.json();
      if (data.st === false) {
        document.getElementById("otpError").innerText = data.msg;
      } else {
        swal.fire({
          title: 'OTP Sent',
          text: data.msg,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false ,
        })
        // alert(data.msg);
        // document.querySelector('.otp-btn-text').textContent = data.msg;
        
          document.querySelector('.otp-btn-text').textContent = "Verifiy-OTP";
        
        console.log("countdown started");
        document.querySelector('.resendTimer').style.display = 'block';
        document.querySelector('.resendBtn').style.display = 'none';
        document.querySelector('.loader1').style.display = 'none';
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
  console.log('thus ')
  e.preventDefault();
  document.querySelector(".otp-btn-text").style.display = "none";
  document.querySelector(".loader").style.display = "block";
  // to clear all previous error messages
  document.getElementById("otpError").innerText = "";

  const otp = document.getElementById("otp").value.trim();

  const otpPattern = /^[0-9]{6}$/;

  let valid = true;

  if (!otpPattern.test(otp)) {
    document.getElementById("otpError").innerText = "Otp must be 6 digits long.";
    document.querySelector(".otp-btn-text").style.display = "block";
    document.querySelector(".loader").style.display = "none";
    valid = false;
  }

  if (valid) {
    document.querySelector(".otp-btn-text").style.display = "block";
    document.querySelector(".loader").style.display = "none";
    async function fetchData() {
      console.log("iam here otp")
      console.log(otp)
      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            otp: otp,
            isResend: false
          })
        });
        console.log(response)
        // if (!response.ok) {
        //   const errorText = await response.text(); // Read as text to avoid JSON parse error
        //   console.error('Server Error:', errorText);
        //   throw new Error('Failed to verify OTP. Check server logs for details.');
        // }
        const data = await response.json();
        console.log(`error found : ${data}`)
        if (data.st === false) {
          document.querySelector(".otp-btn-text").style.display = "block";
          document.querySelector(".loader").style.display = "none";
          document.getElementById("otpError").innerText = data.msg;
        } else {
          document.querySelector(".otp-btn-text").style.display = "none";
          document.querySelector(".loader").style.display = "block";
          console.log("iam here otp")
            setTimeout(() => {
              window.location.href = "/home";
            },2000)
          
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }
}