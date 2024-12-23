// Element References
const name = document.getElementById("productName");
const description = document.getElementById("productDescription");
const categorySelect = document.getElementById("productCategory");
const brand = document.getElementById("productBrand");
const ogPrice = document.getElementById("productOgPrice");
const offerPrice = document.getElementById("productOfferPrice");
const tags = document.getElementById("productTags");
const warranty = document.getElementById("productWarranty");
const returnPolicy = document.getElementById("productReturnPolicy");
const cashOnDelivery = document.getElementById("cashOnDelivery");

// Regex Patterns
const nameRegex = /^[a-zA-Z0-9 ]{3,}$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;
const stockRegex = /^(0|[1-9]\d*)$/;
const textRegex = /^[a-zA-Z0-9 ]+$/;
const tagsRegex = /^(#\w+)(\s#\w+)*$/;

// Image Cropping Variables
const cropperInstances = [];
const croppedImages = [];
let croppedImage = null;
let currentImageIndex = null;

// Image Cropping and Preview
function previewAndCrop(event, index) {
  const file = event.target.files[0];
  if (!file) return;

  // Check if the file is an image
  if (!file.type.startsWith("image/")) {
    Swal.fire({
      icon: "error",
      title: "Invalid File Type",
      text: "Please upload only image files!",
    });
    event.target.value = ""; // Clear the invalid file input
    return;
  }

  const cropPreview = document.getElementById(`cropPreviewUpdate${index}`);
  const cropPreviewSection = document.getElementById(`cropPreviewUpdateSection${index}`);

  cropPreview.src = URL.createObjectURL(file);
  cropPreviewSection.style.display = "block";

  if (cropperInstances[index]) {
    cropperInstances[index].destroy();
  }

  cropperInstances[index] = new Cropper(cropPreview, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 1,
    scalable: true,
    zoomable: true,
    movable: true,
  });

  currentImageIndex = index;
}


function startCroppingUpdate(index) {
  const cropper = cropperInstances[index];
  if (!cropper) return;

  cropper.getCroppedCanvas().toBlob((blob) => {
    croppedImages[index] = blob;
    croppedImage = blob;

    const cropPreviewSection = document.getElementById(`cropPreviewUpdateSection${index}`);
    cropPreviewSection.style.display = "none";

    changeImage(index);
  });
}

// Size Selection
const selectedSizes = [];
function updateSelectedSizes() {
  selectedSizes.length = 0;
  const checkboxes = document.querySelectorAll(".form-check-input");
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedSizes.push(checkbox.value);
    }
  });
}

// Error Display
function showError(input, message) {
  const error = document.createElement("p");
  error.className = "error-message";
  error.style.color = "red";
  error.textContent = message;
  input.parentElement.appendChild(error);
}

// Toggle Inputs
function toggleOfferPriceInput() {
  const offerPriceDiv = document.getElementById("offerPriceDiv");
  const checkbox = document.getElementById("toggleOfferPrice");
  offerPriceDiv.style.display = checkbox.checked ? "block" : "none";
}

function toggleWarrantyInput() {
  const warrantyDiv = document.getElementById("warrantyDiv");
  warrantyDiv.style.display = warrantyDiv.style.display === "none" ? "block" : "none";
}

function toggleReturnPolicyInput() {
  const returnPolicyDiv = document.getElementById("returnPolicyDiv");
  returnPolicyDiv.style.display = returnPolicyDiv.style.display === "none" ? "block" : "none";
}

// Product Update
const updateButton = document.querySelector("#updateProductBtn");

updateButton.addEventListener("click", async (event) => {
  event.preventDefault();
  console.log("Iam here 45454");
  const productId = event.target.getAttribute("data-id");
  const formData = new FormData();

  formData.append("name", name.value);
  formData.append("description", description.value);
  formData.append("category", categorySelect.value);
  formData.append("brand", brand.value);
  formData.append("price", ogPrice.value);
  formData.append("offerPrice", offerPrice.value);
  formData.append("tags", tags.value);
  formData.append("warranty", warranty.value);
  formData.append("returnPolicy", returnPolicy.value);

  croppedImages.forEach((image, index) => {
    formData.append(`image${index + 1}`, image);
  });

  try {
    const response = await fetch(`/admin/products/update/${productId}`, {
      method: "PUT",
      body: formData,
    });
    const data = await response.json();

    if (!data.val) {
      console.log("hi")
      console.log(data.msg);
    } else {
      swal.fire("success", "Product Updated Successfully", "success");
      setTimeout(() => {
        window.location.href = "/admin/products";
      }, 1500);
    }
  } catch (err) {
    console.error(err);
  }
});

// Change Image
async function changeImage(index) {
  console.log("Iam here")
  console.log(productId.value);
  try {
    const formData = new FormData();
    formData.append("productImage", croppedImage);
    formData.append("productIndex", index);

    const response = await fetch(`/update-product-image/${productId.value}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log(data);

    if (data.val) {
      window.location.href = `/admin/Product/update/${productId.value}`;
    }
  } catch (err) {
    console.error(err);
  }
}

// document.getElementById('updateProductBtn').addEventListener('click', async (e) => {
//   e.preventDefault();
//   const productId = document.getElementById('productId');

//   const productData = {
//       name: document.getElementById('productName').value,
//       description: document.getElementById('productDescription').value,
//       category: document.getElementById('productCategory').value,
//       brand: document.getElementById('productBrand').value,
//       price: document.getElementById('productOgPrice').value,
//       offerPrice: document.getElementById('productOfferPrice').value,
//       stock: document.getElementById('productStock').value,
//       tags: document.getElementById('productTags').value,
//       warranty: document.getElementById('productWarranty').value,
//       returnPolicy: document.getElementById('productReturnPolicy').value,
//       cashOnDelivery: document.getElementById('cashOnDelivery').checked,
//   };

//   try {
//       const response = await fetch(`/admin/products/update/${productId}`, {
//           method: 'PUT',
//           headers: {
//               'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(productData),
//       });

//       const result = await response.json();
//       console.log(result);
//       if (response.ok) {
//           alert('Product updated successfully');
//       } else {
//           console.error(result.message);
//       }
//   } catch (error) {
//       console.error('Error updating product:', error);
//   }
// });

