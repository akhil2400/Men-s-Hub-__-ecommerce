document.addEventListener('DOMContentLoaded', function () {
  // Handling the category update button click
  const updateButtons = document.querySelectorAll('.update-category-btn');

  // updateButtons.forEach(button => {
  //   button.addEventListener('click', function () {
  //     const categoryId = this.getAttribute('data-id'); // get the category ID from data-id
  //     const updateUrl = `/admin/category/${categoryId}`; // endpoint to fetch the category data

  //     // Fetch the category data for pre-filling the update modal
  //     fetch(updateUrl)
  //       .then(response => response.json())
  //       .then(data => {
  //         if (data.success) {
  //           // Pre-fill the update modal fields with category data
  //           document.getElementById('updateCategoryName').value = data.category.name;
  //           // You can also pre-fill the image field if you need (image URL handling can be added here)

  //           // Show the update modal
  //           const updateModal = new bootstrap.Modal(document.getElementById('categoryUpdateModal'));
  //           updateModal.show();
  //         } else {
  //           console.error('Failed to fetch category data');
  //         }
  //       })
  //       .catch(err => console.error('Error fetching category data:', err));
  //   });
  // });

  // Handling the category update form submission
  document.getElementById('submitUpdateCategory').addEventListener('click', async function(event) {
    event.preventDefault(); // Prevent traditional form submission

    const updateForm = document.getElementById('updateCategoryForm');
    const formData = new FormData(updateForm);
    
    try {
      // Send the update request to the backend
      const response = await fetch('/admin/category/update', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      const alertMessageDiv = document.getElementById('alertUpdateMessage');
      if (result.val) {
        alertMessageDiv.className = 'alert alert-success';
        alertMessageDiv.innerHTML = result.msg;
        setTimeout(() => location.reload(), 2000); // Optionally reload after success
      } else {
        alertMessageDiv.className = 'alert alert-danger';
        alertMessageDiv.innerHTML = result.msg;
      }

      alertMessageDiv.style.display = 'block';

    } catch (err) {
      console.error('Error updating category:', err);
      const alertMessageDiv = document.getElementById('alertUpdateMessage');
      alertMessageDiv.className = 'alert alert-danger';
      alertMessageDiv.innerHTML = 'An unexpected error occurred.';
      alertMessageDiv.style.display = 'block';
    }
  });

  // Category image validation (same for both add and update forms)
  const categoryImageInput = document.getElementById('categoryImage');
  const categoryImageError = document.getElementById('categoryImageError');
  const updateCategoryImageInput = document.getElementById('updateCategoryImage');
  const updateCategoryImageError = document.getElementById('updateCategoryImageError');

  const validateImage = (fileInput, errorElement) => {
    const file = fileInput.files[0];
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      if (!fileType.startsWith('image/')) {
        errorElement.textContent = 'Only image files are allowed.';
        errorElement.style.display = 'block';
        fileInput.value = null;
        fileInput.files[0]=null;
        return false;
      }
      if (fileSize > 5 * 1024 * 1024) {
        errorElement.textContent = 'Image size must be less than 5MB.';
        errorElement.style.display = 'block';
        return false;
      }
      errorElement.style.display = 'none';
      return true;
    }
    return false;
  };

  // Attach validation to image inputs
  categoryImageInput.addEventListener('change', function() {
    validateImage(categoryImageInput, categoryImageError);
  });

  updateCategoryImageInput.addEventListener('change', function() {
    validateImage(updateCategoryImageInput, updateCategoryImageError);
  });
});
