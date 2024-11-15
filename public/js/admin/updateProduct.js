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
    const croppedDataUrl = canvas.toDataURL("image/png");
    const imageElement = document.querySelector(`.product-update-image-div label[for="productImage${index}"] img`);
    if (imageElement) {
      imageElement.src = croppedDataUrl; 
    }
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
      cropper.destroy();
      cropperInstances[index] = null;
      document.getElementById(`cropPreviewSection${index}`).style.display = "none";
      currentImageIndex = null;
    });
  } else {
    alert(`Could not retrieve the cropped canvas for index: ${index}`);
  }
}


function showError(input, message) {
  const error = document.createElement("p");
  error.className = "error-message";
  error.style.color = "red";
  error.textContent = message;
  input.parentElement.appendChild(error);
}
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




const updateButtons  = document.querySelector(".update-product-btn");

console.log(croppedImages)

updateButtons.addEventListener("click",async(event) => {  
  event.preventDefault();

  const productName = document.getElementById("productName")
  const productDescription = document.getElementById("productDescription")
  const productCategory = document.getElementById("productCategory")
  const productBrand = document.getElementById("productBrand")
  const productOgPrice = document.getElementById("productOgPrice")
  const productOfferPrice = document.getElementById("productOfferPrice")
  const productStock = document.getElementById("productStock")
  const productTags = document.getElementById("productTags")
  const productWarranty = document.getElementById("productWarranty")
  const productReturnPolicy = document.getElementById("productReturnPolicy")
  const cashOnDelivery = document.getElementById("cashOnDelivery")

  console.log(productName.value);
  console.log(productDescription.value);
  console.log(productCategory.value);
  console.log(productBrand.value);
  console.log(productOgPrice.value);
  console.log(productOfferPrice.value);
  console.log(productStock.value);
  console.log(productTags.value);
  console.log(productWarranty.value);
  console.log(productReturnPolicy.value);
  // console.log(cashOnDelivery.checked);

  const productId = event.target.getAttribute("data-id");
  const formData = new FormData();

  formData.append("name",productName.value);
  formData.append("description",productDescription.value);
  formData.append("category",productCategory.value);
  formData.append("brand",productBrand.value);
  formData.append("price",productOgPrice.value);
  formData.append("offerPrice",productOfferPrice.value);
  formData.append("stock",productStock.value);
  formData.append("tags",productTags.value);
  formData.append("warranty",productWarranty.value);
  formData.append("returnPolicy",productReturnPolicy.value);
  croppedImages.forEach((image,index) => {
    formData.append(`image${index + 1}`,image);  
  })
  try{
    const response = await fetch(`/admin/products/update/${productId}`,{
      method:'PUT',
      body:formData,
    });
    const data = await response.json();
    if(!data.val){
      console.log(data.msg);
    }else{
      window.location.href = "/admin/products";
    }
  }catch(err){
    console.log(err);
  }
  
})

