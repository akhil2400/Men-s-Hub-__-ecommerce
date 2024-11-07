document.getElementById('Verifiy-forgot-email').addEventListener('click', validateform);

function validateform(e){
  e.preventDefault();

  // to clear all previous error messages
  document.getElementById("emailError").innerText = "";

  const email = document.getElementById("email").value.trim();

  // Email regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  let valid = true;

  if (!emailPattern.test(email)) {
    document.getElementById("emailError").innerText = "invalid email format";
    valid = false;
  }

  if (valid) {
        async function fetchData() {
          console.log(email)
            try {
                const response = await fetch('/forgotpasswordemailverification', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        isResend: false
                    })
                })                
                const data = await response.json();
                if (data.st === false) {
                  document.getElementById("emailError").innerText = data.msg;
                } else {
                    console.log(data.msg);
                    window.location.href = "/fotp-verify";
                }
            } catch (error) {
                console.log(error);
            }
                    }
            fetchData();
  }
}