const croppedImages = [];

const name = document.getElementById("productName");
const description = document.getElementById("productDescription");
const categorySelect = document.getElementById("productCategory");
const brand = document.getElementById("productBrand");
const ogPrice = document.getElementById("productOgPrice");
const offerPrice = document.getElementById("productOfferPrice");
const stock = document.getElementById("productStock");
const tags = document.getElementById("productTags");
const warranty = document.getElementById("productWarranty");
const returnPolicy = document.getElementById("productReturnPolicy");
const cashOnDelivery = document.getElementById("cashOnDelivery");

const nameRegex = /^[a-zA-Z0-9 ]{3,}$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;
const stockRegex = /^(0|[1-9]\d*)$/;
const textRegex = /^[a-zA-Z0-9 ]+$/;
const tagsRegex = /^(#\w+)(\s#\w+)*$/;

const cropperInstances = {}; // Store cropper instances by index
let currentImageIndex = null;

function previewAndCrop(event, index) {
  const file = event.target.files[0];
  if (!file) return;

  const cropPreview = document.getElementById(`cropPreview${index}`);
  const cropPreviewSection = document.getElementById(`cropPreviewSection${index}`);

  cropPreview.src = URL.createObjectURL(file);
  cropPreviewSection.style.display = "block";

  // Destroy previous cropper instance if exists
  if (cropperInstances[index]) {
    cropperInstances[index].destroy();
  }

  // Initialize a new Cropper instance for this image
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



const colorsOption = [];




const selectedSizes = [];

function updateSelectedSizes() {
  selectedSizes.length = 0;
  const checkboxes = document.querySelectorAll('.form-check-input');
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedSizes.push(checkbox.value);
    }
  });
  console.log(selectedSizes);
}

function startCropping(index) {
  if (!cropperInstances[index]) {
    alert("Please select an image to crop.");
    return;
  }

  const cropper = cropperInstances[index];
  const canvas = cropper.getCroppedCanvas();

  if (canvas) {
    // Convert the cropped canvas to a base64 data URL
    const croppedDataUrl = canvas.toDataURL("image/png");

    // Find the image element in the preview area and update its src attribute
    const imageElement = document.querySelector(`.product-update-image-div label[for="productImage${index}"] img`);
    if (imageElement) {
      imageElement.src = croppedDataUrl; // Update the image preview with the cropped image
    }

    // Convert the cropped canvas to a blob and save as File for further processing if needed
    canvas.toBlob((blob) => {
      const croppedImageFile = new File(
        [blob],
        `croppedImage${index + 1}.png`,
        {
          type: "image/png",
          lastModified: Date.now(),
        }
      );
      croppedImages[index] = croppedImageFile;

      // Clean up the cropper instance and hide the crop preview
      cropper.destroy();
      cropperInstances[index] = null;
      document.getElementById(`cropPreviewSection${index}`).style.display = "none";
      currentImageIndex = null;
    });
  } else {
    alert(`Could not retrieve the cropped canvas for index: ${index}`);
  }
}

function validateAndSubmit() {
  const errorMsgs = document.querySelectorAll(".error-message");
  errorMsgs.forEach((error) => error.remove());

  if (!nameRegex.test(name.value)) {
    showError(name, "Product name must be at least 3 characters long and alphanumeric.");
  } else if (description.value.length < 5) {
    showError(description, "Description must be at least 5 characters long.");
  } else if (categorySelect.value === "") {
    showError(categorySelect, "Please select a category.");
  } else if (!tagsRegex.test(tags.value)) {
    showError(tags, "Tags should start with #, have letters or numbers, and be separated by spaces.");
  } else if (!textRegex.test(brand.value)) {
    showError(brand, "Brand name must be alphanumeric.");
  } else if (!priceRegex.test(ogPrice.value)) {
    showError(ogPrice, "Original Price must be a valid number with up to 2 decimal places.");
  } else if (!stockRegex.test(stock.value) || stock.value < 1) {
    showError(stock, "Stock must be a positive integer.");
  } else {
    const formData = new FormData();
    formData.append("name", name.value);
    formData.append("description", description.value);
    formData.append("category", categorySelect.value);
    formData.append("brand", brand.value);
    formData.append("price", parseFloat(ogPrice.value));
    formData.append("tags", tags.value);
    formData.append("sizes", selectedSizes);
    formData.append("colors", colorsOption);
    formData.append("cashOnDelivery", cashOnDelivery.checked);
    formData.append("offerPrice", offerPrice.value !== "" ? offerPrice.value : null);
    formData.append("stock", parseInt(stock.value));
    formData.append("warranty", warranty.value !== "" ? warranty.value : null);
    formData.append("returnPolicy", returnPolicy.value !== "" ? returnPolicy.value : null);
    croppedImages.forEach((croppedImage, index) => {
      if (croppedImage) {
        formData.append(`productImage${index + 1}`,croppedImage);
      }
    });

    (async function addData() {
      try {
        const response = await fetch("/admin/products/add", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log(data.msg);
      } catch (err) {
        console.log("Error ::- " + err);
      }
    })();
  }
}

function showError(input, message) {
  const error = document.createElement("p");
  error.className = "error-message";
  error.style.color = "red";
  error.textContent = message;
  input.parentElement.appendChild(error);
}
document.querySelector(".btn-CreateProduct").addEventListener("click", (event) => {
  event.preventDefault();
  validateAndSubmit();
});
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


const btnUnlist = document.querySelectorAll(".btnListAndUnlist");

btnUnlist.forEach((elem) => {
  elem.addEventListener("click", async () => {
    try {
      const productId = elem.getAttribute("data-id");
      const res = await fetch(`/admin/products/unlist?id=${productId}&val=${elem.textContent}`);
      const data = await res.json();
      console.log(data);
      if (data.val) {
        if (elem.textContent === "Unlist") {
          elem.classList.replace(
            "badge-outline-primary",
            "badge-outline-success"
          );
          elem.textContent = "List";
        } else {
          console.log(elem.textContent);
          elem.classList.replace(
            "badge-outline-success",
            "badge-outline-primary"
          );
          elem.textContent = "Unlist";
        }
      }
    } catch (err) {
      console.log(err);
    }
  });
});



// let productColors = <%= JSON.stringify(products.colors) %> || [];

//     // Function to add a new color to the list
//     function addColor() {
//         const colorPicker = document.getElementById('colorPicker');
//         const selectedColor = colorPicker.value;

//         // Check if the color is already in the list to avoid duplicates
//         if (!productColors.includes(selectedColor)) {
//             productColors.push(selectedColor);  // Add new color to array
//             updateColorList();  // Update the color display
//         } else {
//             alert("This color is already added.");
//         }
//     }

//     // Function to remove a color from the list
//     function removeColor(index) {
//         productColors.splice(index, 1);  // Remove the color from array
//         updateColorList();  // Update the color display
//     }

//     // Function to update the color list in the UI
//     function updateColorList() {
//         const colorList = document.getElementById('colorList');
//         colorList.innerHTML = '';  // Clear the existing color list

//         // Loop through each color in the productColors array
//         productColors.forEach((color, index) => {
//             const colorDiv = document.createElement('div');
//             colorDiv.id = `color-${index}`;
//             colorDiv.style = `position: relative; width: 20px; height: 20px; margin: 5px; background-color: ${color}; border-radius: 50%;`;

//             const removeSpan = document.createElement('span');
//             removeSpan.innerHTML = '&times;';
//             removeSpan.onclick = function() { removeColor(index); };
//             removeSpan.style = 'position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; cursor: pointer; font-size: 12px; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center;';

//             colorDiv.appendChild(removeSpan);
//             colorList.appendChild(colorDiv);
//         });
//     }

//     // Initial call to update color list based on the current product colors
//     updateColorList();




