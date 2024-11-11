document.addEventListener('DOMContentLoaded', function () {
  const updateButtons = document.querySelectorAll('.update-category-btn');

  updateButtons.forEach(button => {
    button.addEventListener('click', function () {
      const updateUrl = this.getAttribute('data-id'); // get the URL from data-id
      window.location.href = updateUrl; // navigate to the update page
    });
  });
});
