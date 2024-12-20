const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const downloadBtn = document.querySelector(".btnDownloadPdf");
const errorMsg = document.getElementById("error-msg");

const dateButtons = document.querySelectorAll(".btnDateRange");
const customDateInputs = document.getElementById("customDateInputs");

let selectedRange = "daily";

function updateActiveButton(selectedButton) {
  dateButtons.forEach((btn) => btn.classList.remove("btn-primary"));
  dateButtons.forEach((btn) => btn.classList.add("btn-outline-primary"));
  // selectedButton.classList.remove("btn-outline-primary");
  // selectedButton.classList.add("btn-primary");
}
const defaultButton = document.querySelector('[data-range="daily"]');
updateActiveButton(defaultButton);
dateButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const range = btn.getAttribute("data-range");

    updateActiveButton(btn);

    selectedRange = range;
    if (range === "custom") {
      customDateInputs.style.display = "flex";
    } else {
      customDateInputs.style.display = "none";
      console.log(`Fetching data for ${range} range`);
      fetchData(`/admin/dashboard/data?range=${range}`);
    }
  });
});

let topSellingProductsChartInstance = null;
let topSellingCategoriesChartInstance = null;
let topSellingBrandsChartInstance = null;
let lineChartWithDotsInstance = null;

async function fetchData(url) {
  const dashboardData = document.querySelector(".dashboardData");
  dashboardData.innerHTML = "";

  try {
    const response = await fetch(url);
    console.log(response);
    const data = await response.json();

    console.log(data)

    if (data.val) {
      dashboardData.innerHTML = `
        <!-- Revenue, Pending Money, and Discounts Card -->
        <div class="row">
          <div class="col-sm-4 grid-margin">
            <div class="card">
              <div class="card-body">
                <h5>Revenue</h5>
                <div class="row">
                  <div class="col-8 col-sm-12 col-xl-8 my-auto">
                    <h2 class="mb-0">&#8377;${data.dashboard.totalRevenue}</h2>
                  </div>
                  <div class="col-4 col-sm-12 col-xl-4 text-center text-xl-right">
                    <i class="icon-lg mdi mdi-codepen text-primary ml-auto"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-4 grid-margin">
            <div class="card">
              <div class="card-body">
                <h5>Pending Money</h5>
                <div class="row">
                  <div class="col-8 col-sm-12 col-xl-8 my-auto">
                    <h2 class="mb-0">&#8377;${data.dashboard.totalPendingMoney}</h2>
                  </div>
                  <div class="col-4 col-sm-12 col-xl-4 text-center text-xl-right">
                    <i class="icon-lg mdi mdi-wallet-travel text-danger ml-auto"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-4 grid-margin">
            <div class="card">
              <div class="card-body">
                <h5>Overall Discount</h5>
                <div class="row">
                  <div class="col-8 col-sm-12 col-xl-8 my-auto">
                    <h2 class="mb-0">&#8377;${data.dashboard.totalDiscounts}</h2>
                  </div>
                  <div class="col-4 col-sm-12 col-xl-4 text-center text-xl-right">
                    <i class="icon-lg mdi mdi-monitor text-success ml-auto"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Other Information Cards -->
        <div class="row">
          <div class="col-xl-3 col-sm-6 grid-margin stretch-card">
            <div class="card">
              <div class="card-body">
                <h3 class="mb-0">${data.dashboard.usersCount}</h3>
                <h6 class="text-muted font-weight-normal">Total Users</h6>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 grid-margin stretch-card">
            <div class="card">
              <div class="card-body">
                <h3 class="mb-0">${data.dashboard.productsCount}</h3>
                <h6 class="text-muted font-weight-normal">Total Products</h6>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 grid-margin stretch-card">
            <div class="card">
              <div class="card-body">
                <h3 class="mb-0">${data.dashboard.ordersCount}</h3>
                <h6 class="text-muted font-weight-normal">Total Orders</h6>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 grid-margin stretch-card">
            <div class="card">
              <div class="card-body">
                <h3 class="mb-0">${data.dashboard.categories.length}</h3>
                <h6 class="text-muted font-weight-normal">Total Categories</h6>
              </div>
            </div>
          </div>
        </div>
      `;

      // Chart generation functions
      const generateRandomColor = () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`;

      const generateRandomBorderColor = () =>
        `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`;

      // Top Selling Products Chart
      const topSellingProductsCtx = document.getElementById("topSellingChart").getContext("2d");
      if (topSellingProductsChartInstance) {
        topSellingProductsChartInstance.destroy();
      }
      topSellingProductsChartInstance = new Chart(topSellingProductsCtx, {
        type: "bar",
        data: {
          labels: data.dashboard.topSellingProducts.map(prod => prod.product.name),
          datasets: [
            {
              label: "Total Quantity",
              data: data.dashboard.topSellingProducts.map(prod => prod.totalQuantity),
              backgroundColor: data.dashboard.topSellingProducts.map(generateRandomColor),
              borderColor: data.dashboard.topSellingProducts.map(generateRandomBorderColor),
              borderWidth: 2,
            },
          ],
        },
      });

      // Top Selling Categories Chart
      const topSellingCategoriesCtx = document.getElementById("topSellingCategoriesChart").getContext("2d");
      if (topSellingCategoriesChartInstance) {
        topSellingCategoriesChartInstance.destroy();
      }
      topSellingCategoriesChartInstance = new Chart(topSellingCategoriesCtx, {
        type: "pie",
        data: {
          labels: data.dashboard.topSellingCategories.map(category => category.category),
          datasets: [
            {
              label: "Total Quantity",
              data: data.dashboard.topSellingCategories.map(category => category.totalQuantity),
              backgroundColor: data.dashboard.topSellingCategories.map(generateRandomColor),
            },
          ],
        },
      });
    }
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
}

fetchData("/admin/dashboard/data");

document.querySelector(".btnDownloadPdf").addEventListener("click", () => {});

fetchData(`/admin/dashboard/data?range=${selectedRange}`);

downloadBtn.addEventListener("click", async () => {
  errorMsg.textContent = "";
  downloadBtn.disabled = true;

  if (selectedRange === "custom") {
    if (!startDateInput.value || !endDateInput.value) {
      errorMsg.textContent =
        "Both start and end dates are required for custom range.";
      downloadBtn.disabled = false;
      return;
    }

    if (new Date(startDateInput.value) >= new Date(endDateInput.value)) {
      errorMsg.textContent = "Start date must be earlier than end date.";
      downloadBtn.disabled = false;
      return;
    }
  }

  try {
    const requestData = { range: selectedRange };
    if (selectedRange === "custom") {
      requestData.startDate = startDateInput.value;
      requestData.endDate = endDateInput.value;
    }

    console.log(requestData);

    const response = await fetch("/admin/dashboard/download-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SalesReport.pdf`;  
      document.body.appendChild(a);
      a.click(); 
      document.body.removeChild(a);  
      window.URL.revokeObjectURL(url);
    } else {
      const { msg } = await response.json();
      errorMsg.textContent = msg || "Failed to download report.";
    }
  } catch (err) {
    errorMsg.textContent = "An error occurred while processing the request.";
    console.error(err);
  } finally {
    downloadBtn.disabled = false;
  }
});
