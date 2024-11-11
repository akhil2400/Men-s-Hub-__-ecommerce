
// Select the main image element
const mainImage = document.getElementById("mainImage");

// Select all thumbnail images
const thumbnails = document.querySelectorAll(".thumbnail");

// Loop through each thumbnail and add a click event
thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", function () {
    // Get the 'src' of the clicked thumbnail
    const newSrc = this.src;

    // Update the 'src' of the main image
    mainImage.src = newSrc;
  });
});


const mainImageContainer = document.getElementById("mainImageContainer");
const zoomCircle = document.getElementById("zoomCircle");

mainImageContainer.addEventListener("mousemove", function (event) {
  const mainImage = document.getElementById("mainImage");
  const rect = mainImage.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate background position for zoom
  const bgX = (x / mainImage.offsetWidth) * 100;
  const bgY = (y / mainImage.offsetHeight) * 100;

  // Set the background image and position
  zoomCircle.style.backgroundImage = `url(${mainImage.src})`;
  zoomCircle.style.backgroundSize = `${mainImage.offsetWidth * 2}px ${mainImage.offsetHeight * 2}px`;
  zoomCircle.style.backgroundPosition = `${bgX}% ${bgY}%`;

  // Position the zoom circle
  zoomCircle.style.left = `${x - zoomCircle.offsetWidth / 2}px`;
  zoomCircle.style.top = `${y - zoomCircle.offsetHeight / 2}px`;
  zoomCircle.style.display = "block";
});

// Hide the zoom circle when not hovering
mainImageContainer.addEventListener("mouseleave", function () {
  zoomCircle.style.display = "none";
});
