const btnBan = document.querySelectorAll(".btn-ban");
btnBan.forEach((elem) => {
  elem.addEventListener("click", async () => {
    try {
      const userId = elem.getAttribute("data-id");
      console.log(userId);
      console.log(elem.textContent);
      const res = await fetch(`/admin/users/ban/?id=${userId}&val=${elem.textContent}`);
      console.log(res);
      const data = await res.json();
      console.log(data);
      if (data.val) {
        if (elem.textContent === "Ban") {
          console.log(elem.textContent);
          elem.classList.replace(
            "badge-outline-danger",
            "badge-outline-primary"
          );
          elem.textContent = "Unban";
        } else {
          console.log(elem.textContent);
          elem.classList.replace(
            "badge-outline-primary",
            "badge-outline-danger"
          );
          elem.textContent = "Ban";
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
});


document.querySelectorAll(".btn-view").forEach(btn => {
  btn.addEventListener("click", async function () {
    const email = this.getAttribute("data-id");

    try {
      console.log(`/admin/users/view/?email=${email}`);
      const response = await fetch(`/admin/users/view/?email=${email}`);

      if (!response.ok) {
        const newError = await response.text();
        throw new Error(`failed to fetch user information ${response.status}- ${newError}`);

      }
      const data = await response.json();
      console.log('CQKCJWOIEC');
      document.querySelector(".userInfoView").innerHTML = `
      <h3>User Information</h3>
      <p><strong>Name:</strong> ${data.username}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Role:</strong> ${data.role}</p>
      <p><strong>Mobile Number:</strong> ${data.mobileNumber}</p>
      <p><strong>Joined date:</strong> ${data.createdAt}</p>`
    } catch (err) {
      console.log(err);
      alert(err);
    }

  })

})
