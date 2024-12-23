const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const walletModel = require("../models/walletModel");
const path = require("path");
const mongoose = require("mongoose");
const adminModel = require("../models/adminModel");
const moment = require("moment");
const PDFDocument = require("pdfkit");

module.exports = {
  async loadadminlogin(req, res) {
    res.render("adminlogin");
  },

  async adminLogin(req, res) {
    const { username, password } = req.body;

    try {
      // Find the admin by username
      const admin = await adminModel.findOne({ username });

      if (!admin) {
        // Return error if admin doesn't exist
        return res.status(400).json({ val: false, msg: "Admin not found" });
      }

      // Compare the entered password with the stored hash
      const isMatch = await bcrypt.compare(password, admin.password);

      if (isMatch) {
        // If the password matches, send a success response (no redirect)
        return res.status(200).json({ val: true, msg: "Login successful" });
      } else {
        // If the password doesn't match, send an error message
        return res.status(400).json({ val: false, msg: "Invalid password" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ val: false, msg: "Internal Server Error" });
    }
  },

  async loadusermanagement(req, res) {
    try {
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = 6; // Number of users per page
      const skip = (page - 1) * limit;

      // Count total users for pagination
      const totalUsers = await userModel.countDocuments({});
      const totalPages = Math.ceil(totalUsers / limit);

      // Fetch paginated users
      const users = await userModel
        .find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      console.log(users);

      if (!users || users.length === 0) {
        return res.status(200).render("usermanagement", {
          msg: "No users found",
          user: [],
          currentPage: page,
          totalPages: totalPages,
        });
      }

      return res.status(200).render("usermanagement", {
        user: users,
        currentPage: page,
        totalPages: totalPages,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .render("usermanagement", { msg: "Error loading users" });
    }
  },

  async banuser(req, res) {
    console.log("23445---");
    const { id, val } = req.query;
    try {
      console.log(id, val);
      if (val === "Ban") {
        await userModel.updateOne({ _id: id }, { isDeleted: true });
      } else {
        await userModel.updateOne({ _id: id }, { isDeleted: false });
      }
      res.status(200).json({ val: true });
    } catch (err) {
      res.status(500).json({ val: false });
    }
  },

  async viewUser(req, res) {
    try {
      const { email } = req.query;
      const user = await userModel.findOne({ email: email });

      if (!user) {
        return res.status(400).json({ val: false, msg: "User not found" });
      }

      res.status(200).json({
        username: user.userName,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt.toISOString().split("T")[0],
      });
    } catch (err) {
      console.error("Error fetching user:", err); // Log the error for debugging
      res.status(500).json({ val: false, msg: "Internal server error" });
    }
  },

  whenDashboardLoad(req, res) {
    res.render("dashboard");
  },
  async dashboardData(req, res) {
    console.log(
      "!@@#*#&$&$*&*&&&&*&&&$$&$$$$$&&&&&&&&&&&&&&&&&&&&777777777777787w66ww5w5e5ew5w5ee5we"
    );
    const { range, startDate, endDate } = req.query;

    try {
      let start, end;

      if (range === "daily") {
        start = moment().startOf("day").toDate();
        end = moment().endOf("day").toDate();
      } else if (range === "weekly") {
        start = moment().startOf("week").toDate();
        end = moment().endOf("day").toDate();
      } else if (range === "monthly") {
        start = moment().startOf("month").toDate();
        end = moment().endOf("day").toDate();
      } else if (range === "custom") {
        start = new Date(startDate);
        end = new Date(endDate);
      } else {
        return res.status(400).json({ val: false, msg: "Invalid range." });
      }

      const dateFilter = { createdAt: { $gte: start, $lt: end } };
      console.log(
        "11111========================================================================================="
      );
      const [users, products, orders, sales, pendingMoney, categoryData] =
        await Promise.all([
          userModel.find({}),
          productModel.find({}, "_id"),

          orderModel.find(
            {
              ...dateFilter,
              orderStatus: { $not: { $in: ["cancelled", "delivered"] } },
            },
            "_id"
          ),
          orderModel.aggregate([
            { $match: { ...dateFilter, paymentStatus: "paid" } },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                count: { $sum: 1 },
              },
            },
          ]),
          orderModel.aggregate([
            {
              $match: {
                ...dateFilter,
                paymentMethod: "cash_on_delivery",
                paymentStatus: "pending",
              },
            },
            {
              $group: {
                _id: null,
                totalPendingMoney: { $sum: "$totalAmount" },
                count: { $sum: 1 },
              },
            },
          ]),

          categoryModel.aggregate([
            {
              $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "category",
                as: "products",
              },
            },
            {
              $addFields: {
                productCount: { $size: "$products" },
              },
            },
            {
              $project: {
                name: 1,
                image: 1,
                productCount: 1,
                isDeleted: 1,
              },
            },
          ]),
        ]);
      const totalSales = sales[0]?.count || 0;
      const totalRevenue = sales[0]?.totalRevenue || 0;
      const totalPendingMoney = pendingMoney[0]?.totalPendingMoney || 0;

      const totalDiscounts = await orderModel.aggregate([
        { $match: { ...dateFilter, "coupon.code": { $exists: true } } },
        {
          $group: {
            _id: null,
            totalDiscount: { $sum: "$coupon.discountApplied" },
          },
        },
      ]);
      const dashboard = {
        usersCount: users.length,
        productsCount: products.length,
        ordersCount: orders.length,
        totalSalesCount: totalSales,
        totalRevenue,
        totalPendingMoney,
        categories: categoryData,
        totalDiscounts: totalDiscounts[0]?.totalDiscount || 0,
      };

      res.status(200).json({ val: true, dashboard });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      res.status(500).json({
        val: false,
        msg: "An error occurred while loading the dashboard.",
      });
    }
  },

  async getTopSellingProducts(req, res) {
    try {
      // Aggregate to get top-selling products
      const topProducts = await orderModel.aggregate([
        { $unwind: "$products" }, // Decompose products array
        {
          $group: {
            _id: "$products.productId", // Group by productId
            totalQuantity: { $sum: "$products.quantity" }, // Sum quantities for each product
            totalSales: { $sum: { $multiply: ["$products.quantity", "$products.price"] } }, // Calculate total sales
          },
        },
        { $sort: { totalQuantity: -1 } }, // Sort by quantity sold, descending
        { $limit: 10 }, // Limit to top 10 products
      ]);
  
      // Populate product details
      const populatedProducts = await productModel.populate(topProducts, {
        path: "_id", // Populate product ID
        select: "name price", // Include product name and price
      });
  
      // Prepare and return the response
      res.status(200).json({
        success: true,
        data: populatedProducts.map((product) => ({
          productId: product._id, // Nested productId
          name: product.name, // Populated product name
          price: product.price, // Populated product price
          quantity: product.totalQuantity, // Total quantity sold
          sales: product.totalSales, // Total sales amount
        })),
      });
    } catch (error) {
      console.error("Error fetching top-selling products:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
,  
  
  async getTopSellingCategories(req, res) {
    try {
      const topCategories = await orderModel.aggregate([
        { $unwind: "$products" }, // Split products array
        {
          $lookup: {
            from: "products", // Join with products collection
            localField: "products.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        { $unwind: "$productDetails" }, // Unwind joined products
        {
          $group: {
            _id: "$productDetails.category", // Group by category
            totalQuantity: { $sum: "$products.quantity" }, // Sum of quantities
            totalSales: {
              $sum: { $multiply: ["$products.quantity", "$products.price"] }, // Calculate total sales
            },
          },
        },
        {
          $lookup: {
            from: "categories", // Join with categories collection
            localField: "_id",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        { $unwind: "$categoryDetails" }, // Unwind joined categories
        { $sort: { totalQuantity: -1 } }, // Sort by quantity sold, descending
        { $limit: 10 }, // Limit to top 10 categories
      ]);
  
      res.status(200).json({
        success: true,
        data: topCategories.map((category) => ({
          categoryId: category._id, // Reference to the category ID
          categoryName: category.categoryDetails.name, // Populate the category name
          quantity: category.totalQuantity,
          sales: category.totalSales,
        })),
      });
    } catch (error) {
      console.error("Error fetching top-selling categories:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  },
  

  async downloadReport(req, res) {
    console.log("Processing downloadReport...");

    try {
      const { startDate, endDate, range } = req.body;

      let start, end;
      const today = new Date();

      if (range === "daily") {
        start = new Date(today.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
      } else if (range === "weekly") {
        const startOfWeek = new Date(
          today.setDate(today.getDate() - today.getDay())
        );
        start = new Date(startOfWeek.setHours(0, 0, 0, 0));
        end = new Date(today.setHours(23, 59, 59, 999));
      } else if (range === "monthly") {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
      } else if (range === "custom") {
        if (!startDate || !endDate) {
          return res.status(400).json({
            msg: "Start and end dates are required for custom range.",
          });
        }
        start = new Date(startDate);
        end = new Date(endDate);
      }

      console.log(range);
      console.log(startDate, endDate);
      console.log(start, end);

      const salesDataResult = await orderModel.aggregate([
        {
          $match: {
            status: "Delivered",
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalSales: { $sum: 1 },
            itemsSold: {
              $sum: {
                $sum: "$products.quantity",
              },
            },
          },
        },
      ]);

      const salesData = salesDataResult[0] || {
        totalRevenue: 0,
        totalSales: 0,
        itemsSold: 0,
      };

      const detailedOrders = await orderModel
        .find({
          status: "Delivered",
          createdAt: { $gte: start, $lte: end },
        })
        .populate("products.productId", "name price");

      console.log(salesData);
      console.log(detailedOrders);

      const pdfDoc = new PDFDocument({ margin: 30 });
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=SalesReport.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      pdfDoc.pipe(res);

      // Title of the report
      pdfDoc.fontSize(20).text("Sales Report", { align: "center" }).moveDown();

      // Date Range and Discount
      pdfDoc
        .fontSize(12)
        .text(`Start Date: ${start.toISOString().split("T")[0]}`, {
          align: "left",
        });
      pdfDoc.text(`End Date: ${end.toISOString().split("T")[0]}`, {
        align: "left",
      });
      pdfDoc.text(`Overall Discount: ₹100`, { align: "left" });
      pdfDoc.moveDown();

      // Summary Section
      pdfDoc.text("Summary:", { underline: true }).moveDown();
      pdfDoc.text(`Total Revenue: ₹${salesData.totalRevenue.toFixed(2)}`, {
        align: "left",
      });
      pdfDoc.text(`Total Sales: ${salesData.totalSales}`, { align: "left" });
      pdfDoc.text(`Items Sold: ${salesData.itemsSold}`, { align: "left" });
      pdfDoc.moveDown();

      // Detailed Orders Section
      pdfDoc.text("Detailed Orders:", { underline: true }).moveDown();
      pdfDoc.text(
        `Product Name`.padEnd(30) + `Quantity`.padEnd(10) + `Price`.padEnd(15),
        { align: "left" }
      );

      // Loop through orders and display each item's details
      detailedOrders.forEach((order) => {
        order.products.forEach((item) => {
          const productName = item.productId.name.padEnd(30);
          const quantity = String(item.quantity).padEnd(10);
          const price = `₹${item.productId.price.toFixed(2)}`;

          // Add each line with the appropriate data
          pdfDoc.text(`${productName}${quantity}${price}`);
        });
      });

      // End the PDF document
      pdfDoc.end();
    } catch (error) {
      console.error("Error in downloadReport:", error);

      res
        .status(500)
        .json({ msg: "An error occurred while generating the report." });
    }
  },
  async handleReturn(req, res) {
    try {
      const { orderId } = req.params;
      const { action } = req.body; // "approve" or "reject"

      // Find the order
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res
          .status(404)
          .json({ success: false, message: "Order not found" });
      }

      // Ensure the order is in "Return Requested" status
      if (order.status !== "Return Requested") {
        return res.status(400).json({
          success: false,
          message: "No return request found for this order",
        });
      }

      if (action === "approve") {
        // Approve the return request and process the refund
        const refundAmount = order.totalAmount;

        // Find or create the user's wallet
        let wallet = await walletModel.findOne({ userId: order.userId });
        if (!wallet) {
          wallet = new walletModel({
            userId: order.userId,
            balance: 0,
            transactions: [],
          });
        }

        // Add the refund to the wallet
        wallet.balance += refundAmount;
        wallet.transactions.push({
          id: `REFUND-${order._id}`,
          type: "Credit",
          amount: refundAmount,
          date: new Date(),
        });
        await wallet.save();

        // Update the order status and refund details
        order.status = "Return Approved";
        order.refundStatus = "completed";
        order.refundAmount = refundAmount;
      } else if (action === "reject") {
        // Reject the return request
        order.status = "Return Rejected";
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid action" });
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: `Return request ${action}ed successfully`,
      });
    } catch (error) {
      console.error("Error handling return request:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to handle return request" });
    }
  },

  async loadSalesReport(req, res) {
    try {
      res.render("SalesReport");
    } catch (error) {
      console.error("Error loading sales report", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async reportData(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date and end date are required",
        });
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Ensure start is at midnight
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Ensure end is at the last millisecond of the day

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: "Start date should be less than end date",
        });
      }

      const orders = await orderModel
        .find({
          createdAt: { $gte: start, $lte: end }, // Query orders within the date range
        })
        .populate("userId", "userName");

      console.log(orders);

      const totalSaleAmount = orders.reduce(
        (sum, order) => sum + order.totalAmount,
        0
      );

      return res.status(200).json({
        success: true,
        totalSaleAmount,
        orders: orders.map((order) => ({
          orderId: order._id,
          userId: order.userId._id,
          customerName: order.userId.userName,
          saleAmount: order.totalAmount,
          orderDate: order.createdAt,
        })),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while fetching the sales report",
      });
    }
  },
};
