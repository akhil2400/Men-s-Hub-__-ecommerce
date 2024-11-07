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