
        
function validateform(e){

  e.preventDefault();

  // to clear all previous error messages
  document.getElementById("newPasswordError").innerText = "";
  document.getElementById("confirmPasswordError").innerText = "";

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  
  
  
// Password regex pattern
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;


let valid = true;




// password validation 
if(!passwordPattern.test(newPassword)){
  document.getElementById("newPasswordError").innerText =  'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.';
  valid = false;
}
if(newPassword !== confirmPassword){
  document.getElementById("confirmPasswordError").innerText = "Passwords do not match";
  valid = false;
}
if(valid){
  async function fetchData() {
    try {
      const response = await fetch('/forgotpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword
        })
      });
      const data = await response.json();
      if (data.st === false) {
        if (data.type === "password") {
          document.getElementById("newPasswordError").innerText = data.msg;
        } 
      } else {
        console.log(data.msg);
        window.location.href = '/home';
      }
    } catch (error) {
      console.log(error);
    }
  }

  fetchData();

}
}

document.getElementById('loginBtn').addEventListener('click', validateform);
