// Select all nav links
const navLinks = document.querySelectorAll('.nav-link');

// Loop through each nav link and add an event listener
navLinks.forEach(link => {
  link.addEventListener('click', function() {
    // Remove the 'active' class from all nav links
    navLinks.forEach(item => item.classList.remove('active'));

    // Add the 'active' class to the clicked link
    this.classList.add('active');
  });
});

// Get the current URL
const currentUrl = window.location.href;

// Loop through the nav links and check if href matches the current URL
navLinks.forEach(link => {
  if (link.href === currentUrl) {
    link.classList.add('active');
  }
});

