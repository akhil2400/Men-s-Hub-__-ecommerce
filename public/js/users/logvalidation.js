
        
function validateform(e){

  e.preventDefault();

  // to clear all previous error messages
  document.getElementById("emailusernameError").innerText = "";
  document.getElementById("passwordError").innerText = "";

  const emailuserName = document.getElementById("userName-email").value;
  const password = document.getElementById("password").value;

  
  
  //  Email regex pattern
  const emailuserNamePattern = /^[a-zA-Z0-9_.@]+$/;;
// Password regex pattern
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;


let valid = true;

// email validation
if(!emailuserNamePattern.test(emailuserName)){
  document.getElementById("emailusernameError").innerText = "invalid email format.";
  valid = false;
}

// password validation 
if(!passwordPattern.test(password)){
  document.getElementById("passwordError").innerText =  'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character.';
  valid = false;
}

if(valid){
  async function fetchData() {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailuserName: emailuserName,
          password: password
        })
      });
      const data = await response.json();
      if (data.st === false) {
        if (data.type === "username" || data.type === "email") {
          document.getElementById("emailusernameError").innerText = data.msg;
        } else if (data.type === "password") {
          document.getElementById("passwordError").innerText = data.msg;
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
