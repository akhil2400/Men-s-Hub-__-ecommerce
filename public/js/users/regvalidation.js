

function showAlert(message, type = 'error') {
    swal.fire({
        icon: type,
        title: type === 'error' ? 'Error!' : 'Success!',
        text: message,
        timer: 3000, // Time in milliseconds (3000 ms = 3 seconds)
        timerProgressBar: true,
        willClose: () => {
            if (type === "success") {
                document.getElementById("registerForm").reset();
            }
        }
    });
}

document.getElementById("registerBtn").addEventListener("click", regFormvalidation);

function regFormvalidation(e) {
    // Prevent default form submission
    e.preventDefault();

    document.querySelector(".getotp").style.display = "none";
    document.querySelector(".loader").style.display = "block";

    // Clear previous error messages
    document.getElementById("userNameError").innerText = "";
    document.getElementById("emailError").innerText = "";
    document.getElementById("passwordError").innerText = "";
    document.getElementById("confirmPasswordError").innerText = "";
    document.getElementById("mobileNumberError").innerText = "";
    document.getElementById("referralCodeError").style.border = "";
    document.getElementById("genderError").innerText = "";


    // Get input values
    const userName = document.getElementById("userName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const mobileNumber = document.getElementById("mobileNumber").value.trim();
    const referralCode = document.getElementById("referralCode").value.trim();
    const gender1 = document.getElementById('gender1').value;
    const gender2 = document.getElementById('gender2').value;
    const gender3 = document.getElementById('gender3').value;


    // Check if any field is empty
    if (!userName || !email || !password || !confirmPassword || !mobileNumber || !gender1 || !gender2 || !gender3) {
        showAlert("All fields are required!", 'error');
        document.querySelector(".getotp").style.display = "block";
        document.querySelector(".loader").style.display = "none";
        return;
    }

    // Regex patterns
    const userNamePattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    const referralCodePattern = /^[a-zA-Z0-9]{6}$/;
    const mobilePattern = /^\d{10}$/; // Ensures exactly 10 digits

    if (referralCode.value){
        if (!referralCodePattern.test(referralCode.value)) {
            document.getElementById("referralCodeError").innerHTML = "Invalid Referral Code";
            document.querySelector(".getotp").style.display = "block";
            document.querySelector(".loader").style.display = "none";
            return;
        }
    }

    let valid = true;

    // userName validation
    if (!userNamePattern.test(userName)) {
        document.getElementById("userNameError").innerText = "The username must start with a letter, can contain letters, numbers, and underscores, and must be 3 to 16 characters long.";
        document.querySelector(".getotp").style.display = "block";
        document.querySelector(".loader").style.display = "none";
        valid = false;
    }
    // Email validation
    if (!emailPattern.test(email)) {
        document.getElementById("emailError").innerText = "Invalid email format.";
        document.querySelector(".getotp").style.display = "block";
        document.querySelector(".loader").style.display = "none";
        valid = false;
    }

    // Password validation
    if (!passwordPattern.test(password)) {
        document.getElementById("passwordError").innerText = "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.";
        document.querySelector(".getotp").style.display = "block";
        document.querySelector(".loader").style.display = "none";
        valid = false;
    }

    // Confirm Password validation
    if (password !== confirmPassword) {
        document.getElementById("confirmPasswordError").innerText = "Passwords do not match.";
        document.querySelector(".getotp").style.display = "block";
        document.querySelector(".loader").style.display = "none";
        valid = false;
    }

    // Mobile Number validation
    if (!mobilePattern.test(mobileNumber)) {
        document.getElementById("mobileNumberError").innerText = "Mobile number should contain exactly 10 digits.";
        document.querySelector(".getotp").style.display = "block";
        document.querySelector(".loader").style.display = "none";
        valid = false;
    }
   


    let gendertest = "";

    if (gender1) {
        gendertest = gender1;
    } else if (gender2) {
        gendertest = gender2;
    } else if (gender3) {
        gendertest = gender3;
    } else {
        document.getElementById("genderError").innerText = "Please select a gender.";
    }
    // If the form is valid, show SweetAlert and submit the form only after user confirms
    if (valid) {
        async function fetchData() {
            try {
                const response = await fetch('/register/request-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userName: userName,
                        email: email,
                        password: password,
                        mobileNumber: mobileNumber,
                        referralCode: referralCode,
                        gender: gendertest,
                        isResend: false,

                    })
                })
                const data = await response.json();
                if (data.st === false) {
                    document.querySelector(".getotp").style.display = "block";
                    document.querySelector(".loader").style.display = "none";
                    if (data.type === "userName") {
                        document.getElementById("userNameError").innerText = data.msg;
                    } else if (data.type === "email") {
                        document.getElementById("emailError").innerText = data.msg;
                    }
                } else {
                    document.querySelector(".getotp").style.display = "none";
                    document.querySelector(".loader").style.display = "block";
                    console.log(data.msg);
                    window.location.href = "/otp-verify";
                }
            }
            catch (error) {
                console.log(error);
            }

        }

        fetchData();
    }


    return valid;
}






