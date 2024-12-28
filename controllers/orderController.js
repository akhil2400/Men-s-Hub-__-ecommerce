const express = require('express')
const bcrypt = require('bcrypt');
const Otp = require('../models/otpModel');
const userModel = require('../models/userModel');
const { generateOTP, otpExpire } = require('../utils/otpGenerator');
const { sendOTP } = require('../utils/mailSender');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const cartModel = require('../models/cartModel');
const addressModel = require('../models/addressModel')
const orderModel = require('../models/orderModel');
const walletModel = require('../models/walletModel');
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require('path');
const mongoose = require('mongoose');

module.exports = {
  //Admin side
  async loadordermanagement(req, res) {
    try {
      // Fetch all orders with populated fields
      const orders = await orderModel.find().sort({ createdAt: -1 })
        .populate('userId', 'userName')  // Populate the userName field from the User model
        .populate('products.productId', 'name price')  // Populate product details (name, price)
        .exec();

      // Pass orders data to the view
      res.render('ordermanagement', { orders });
    } catch (err) {
      console.log(err);
      res.status(500).send('Error loading orders');
    }
  },

  async loadorderdetails(req, res) {
    const orderId = req.params.orderid;
  
    try {
      // Fetch the order details along with the related data
      const order = await orderModel.findById(orderId).lean(); // .lean() for plain objects
  
      if (!order) {
        return res.status(404).send("Order not found");
      }
  
      // Fetch all products in the order
      const productsDetails = await Promise.all(
        order.products.map(async (product) => {
          const productData = await productModel.findById(product.productId).lean(); // Fetch product details
          if (!productData) {
            console.error(`Product not found: ${product.productId}`);
            return null;
          }
          return {
            ...product, // Keep quantity and price
            productData, // Add product data
          };
        })
      );
  
      // Filter out null products (in case a product is missing)
      const filteredProductsDetails = productsDetails.filter((item) => item !== null);
  
      // Fetch the delivery address
      const deliveryAddress = await addressModel.findById(order.deliveryAddress).lean(); // Fetch address details
  
      if (!deliveryAddress) {
        console.error(`Delivery address not found for order: ${orderId}`);
      }
      console.log('Order:', order);
      console.log('Delivery Address:', deliveryAddress);

      console.log(productsDetails);
      // Render the page with fetched data
      res.render("Editordermanagement", {
        order,
        productsDetails: filteredProductsDetails,
        deliveryAddress: deliveryAddress || {}, // Ensure fallback for undefined address
      });
    } catch (error) {
      console.error("Error loading order details:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  
  

  async updateOrderStatus(req, res) {
    const orderId = req.params.orderid;
    const { status } = req.body;

    console.log(orderId, status);

    try {
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Enforce status progression rules
      const validTransitions = {
        Pending: ["Delivered", "Cancelled"],
        Delivered: ["Returned"],
        Cancelled: [],
        Returned: []
      };

      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status transition" });
      }

      order.status = status;
      await order.save();

      res.json({ success: true, message: 'Order status updated successfully!' });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ success: false, message: 'An error occurred while updating the status.' });
    }
  },




  async loadorders(req, res) {
    try {

      const user = await userModel.findOne({ email: req.session.userData.email });
      const userId = user._id;

      req.session.userId = userId;

      const addresses = await addressModel.find({ userId });

      const orders = await orderModel
        .find({ userId })
        .populate({
          path: "products.productId",
          populate: {
            path: "category",
            select: "name",
          },
        })
        .populate("deliveryAddress")
        .sort({ createdAt: -1 });

      const transformedOrders = orders.map((order) => ({
        id: order._id,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentStatus: order.razorpayPaymentStatus,
        paymentMethod: order.paymentMethod || "N/A",
        paymentStatus: order.paymentStatus || "N/A",
        date: order.createdAt ? order.createdAt.toLocaleDateString() : "N/A",
        products: order.products.map((product) => ({
          name: product.productId?.name || "Unknown Product",
          price: product.productId?.offerPrice || product.productId?.price || 0,
          category: product.productId?.category?.name || "Unknown Category",
          quantity: product.quantity || 0,
          image: product.productId?.images?.[0] || "/images/placeholder.jpg",
        })),
        totalPrice: order.totalAmount || 0,
        status: order.status || "Unknown",
        statusClass: order.status ? order.status.toLowerCase() : "unknown",

        shippingAddress: order.deliveryAddress ? {
          houseNumber: order.deliveryAddress.houseNumber || "N/A",
          street: order.deliveryAddress.street || "N/A",
          landmark: order.deliveryAddress.landmark || "N/A",
          city: order.deliveryAddress.city || "N/A",
          district: order.deliveryAddress.district || "N/A",
          state: order.deliveryAddress.state || "N/A",
          country: order.deliveryAddress.country || "N/A",
          pinCode: order.deliveryAddress.pinCode || "N/A",
        } : null,
        detailsLink: `/my-orders/order-details/${order._id}`,
      }));

      res.render("orders", {
        user: req.session.user,
        orders: transformedOrders,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).send("Something went wrong while fetching your orders.");
    }
  },


  async viewOrderDetails(req, res) {
    try {
      const orderId = req.params.id;


      const order = await orderModel
        .findById(orderId)
        .populate('products.productId')
        .populate('deliveryAddress');

      if (!order) {
        return res.status(404).send("Order not found");
      }

      if (!order.total) {
        order.total = 0;
      }

      if (!order.paymentMethod) {
        order.paymentMethod = {};
      }

      if (order.paymentMethod === "razorpay" && order.razorpayPaymentId) {
        order.paymentMethodLast4 = order.razorpayPaymentId.slice(-4);
      } else {
        order.paymentMethodLast4 = null;
      }

      res.render("orderDetails", {
        user: req.user,
        order,
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).send("Internal Server Error");
    }
  },


  async cancelOrder(req, res) {
    console.log('Canceling order...');
    try {
      const orderId = req.params.id;

      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      order.status = "Cancelled";

      if (order.paymentMethod === "razorpay" && order.paymentStatus === "paid") {
        const refundAmount = order.totalAmount;

        let wallet = await walletModel.findOne({ userId: order.userId });
        if (!wallet) {

          console.log(`Wallet not found for userId: ${order.userId}. Creating a new wallet.`);
          wallet = new walletModel({
            userId: order.userId,
            balance: 0,
            transactions: [],
          });
        }

        console.log("Current Balance:", wallet.balance);
        console.log("Refund Amount:", refundAmount);

        wallet.balance += refundAmount;
        wallet.transactions.push({
          id: `REFUND-${order._id}`,
          type: "Credit",
          amount: refundAmount,
          date: new Date(),
        });
        console.log("Updated Balance:", wallet.balance);

        await wallet.save();

        order.refundStatus = "completed";
        order.refundAmount = refundAmount;
      }

      await order.save();

      res.status(200).json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ success: false, message: "Failed to cancel order" });
    }
  },
  async initiateReturn(req, res) {
    try {
      const { orderId } = req.query;
      const { reason } = req.body; // Extract the reason from the request body

      // Validate the reason
      if (!reason || reason.trim() === '') {
        return res.status(400).json({ success: false, message: 'Reason for return is required' });
      }

      // Find the order
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      // Check if the order is already in the return process
      if (order.status === 'Return Requested' || order.status === 'Return Approved') {
        return res.status(400).json({ success: false, message: 'Return already initiated or approved' });
      }

      // Update the order status and add reason
      order.status = 'Return Requested';
      order.returnReason = reason;
      await order.save();

      res.status(200).json({ success: true, message: 'Return request initiated successfully' });
    } catch (error) {
      console.error('Error initiating return request:', error);
      res.status(500).json({ success: false, message: 'Failed to initiate return request' });
    }
  },

  async saveReturnReason(req, res) {
    const { orderId, returnReason } = req.body;

    try {
      // Find the order by ID and update the returnReason field
      const order = await orderModel.findByIdAndUpdate(
        orderId,
        { returnReason: returnReason, status: 'Return Requested' },
        { new: true } // Return the updated order
      );

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      // Successfully updated the order
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }

  },
  async downloadInvoice(req, res) {
    try {
        const { orderId } = req.params;

        // Fetch order details from the database with populated references
        const order = await orderModel.findById(orderId)
            .populate("userId", "userName email") // Populate user details
            .populate("products.productId", "name") // Populate product details
            .populate("deliveryAddress", "houseNumber street city landmark district state country pinCode") // Populate delivery address
            .lean();

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Create a new PDF document
        const pdfDoc = new PDFDocument({ margin: 50 });

        // Register and set custom font (NotoSans)
        const rupeeFontPath = path.join(__dirname, '..', 'public', 'fonts', 'NotoSans-Regular.ttf');
        const rupeeFontPathBold = path.join(__dirname, '..', 'public', 'fonts', 'NotoSans_Condensed-Bold.ttf');

        pdfDoc.registerFont('NotoSans', rupeeFontPath);
        pdfDoc.registerFont('NotoSans-Bold', rupeeFontPathBold);

        pdfDoc.font('NotoSans');

        // Set headers to prompt the download
        const fileName = `invoice-${orderId}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

        // Pipe the PDF stream directly to the response
        pdfDoc.pipe(res);

        // Add Company Logo and Details
        const logoPath = path.join(__dirname, '..', 'public', 'images', 'img', 'logo', 'A_logo_with_the_letters_M_and_H_together_with_a_cap_on_M-removebg-preview.png');
        pdfDoc.image(logoPath, 50, 20, { width: 80 }); // Adjusted position for logo

        pdfDoc.fillColor('#000000').fontSize(12).font('NotoSans-Bold');
        pdfDoc.text("MEN'S HUB", 150, 25, { align: "left" }); // Aligned company name with logo
        pdfDoc.font('NotoSans').fontSize(10);
        pdfDoc.text("777, Business Street, kinfra, INDIA", 150, 40, { align: "left" });
        pdfDoc.text("Phone: +123 456 7890 | Email: menshub@gmail.com", 150, 55, { align: "left" });
        pdfDoc.moveDown(2);

        // Generate the Invoice Header with background color
        pdfDoc.rect(50, 90, 500, 40).fill('#4CAF50');
        pdfDoc.fillColor('#FFFFFF').fontSize(20).text("INVOICE", 50, 100, { align: "center" });
        pdfDoc.moveDown(2);

        // Order and Customer Details Section
        pdfDoc.fillColor('#000000').fontSize(12).text(`Order ID: ${order._id}`, 50, 150, { align: "left" });
        pdfDoc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: "left" });
        pdfDoc.text(`Customer Name: ${order.userId.userName}`, { align: "left" });
        pdfDoc.text(`Customer Email: ${order.userId.email}`, { align: "left" });
        pdfDoc.text(`Address: ${order.deliveryAddress.houseNumber}, ${order.deliveryAddress.street}, ${order.deliveryAddress.landmark}, ${order.deliveryAddress.city}, ${order.deliveryAddress.district}, ${order.deliveryAddress.state}, ${order.deliveryAddress.country} - ${order.deliveryAddress.pinCode}`);
        pdfDoc.moveDown(2);

        // Products Table Header with styled background
        const headerY = pdfDoc.y;
        pdfDoc.rect(50, headerY, 500, 25).fill('#ffab00');
        pdfDoc.fillColor('#000000').fontSize(12).font('NotoSans-Bold');
        pdfDoc.text("#", 60, headerY + 5, { width: 40, align: "center" });
        pdfDoc.text("Product Name", 100, headerY + 5, { width: 200, align: "left" });
        pdfDoc.text("Quantity", 300, headerY + 5, { width: 60, align: "center" });
        pdfDoc.text("Price (₹)", 380, headerY + 5, { width: 60, align: "center" });
        pdfDoc.text("Total (₹)", 460, headerY + 5, { width: 60, align: "center" });

        let tableY = headerY + 25;

        // Draw table rows for products
        pdfDoc.font('NotoSans').fontSize(10);
        order.products.forEach((item, index) => {
            const productTotal = item.quantity * item.price;
            const isEvenRow = index % 2 === 0;

            // Alternate row colors
            pdfDoc.rect(50, tableY, 500, 20).fill(isEvenRow ? '#ffffff' : '#f9f9f9').stroke();
            pdfDoc.fillColor('#000000');

            pdfDoc.text(index + 1, 60, tableY + 5, { width: 40, align: "center" });
            pdfDoc.text(item.productId.name, 100, tableY + 5, { width: 200, align: "left" });
            pdfDoc.text(item.quantity, 300, tableY + 5, { width: 60, align: "center" });
            pdfDoc.text(`₹${item.price.toFixed(2)}`, 380, tableY + 5, { width: 60, align: "center" });
            pdfDoc.text(`₹${productTotal.toFixed(2)}`, 460, tableY + 5, { width: 60, align: "center" });

            tableY += 20;
        });

        pdfDoc.moveDown(2);

        // Total Amount Section with bold fonts
        pdfDoc.fontSize(12).font('NotoSans-Bold').fillColor('#000000');
        pdfDoc.text(`Subtotal: ₹${(order.totalAmount - (order.deliveryCharges || 0)).toFixed(2)}`, { align: "right", indent: -50 });
        pdfDoc.text(`Delivery Charges: ₹${(order.deliveryCharges || 0).toFixed(2)}`, { align: "right", indent: -50 });
        pdfDoc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, { align: "right", indent: -50, underline: true });

        pdfDoc.moveDown(2);

        // Payment Method and Footer
        pdfDoc.fontSize(12).font('NotoSans-Bold').text(`Payment Method: ${order.paymentMethod}`, { align: "left", indent: -50 });
        pdfDoc.moveDown();

        pdfDoc.rect(50, pdfDoc.y, 500, 40).fill('#4CAF50');
        pdfDoc.fillColor('#FFFFFF').fontSize(16).text("Thank you for your order!", 50, pdfDoc.y + 10, { align: "center" });

        // End the PDF document
        pdfDoc.end();
    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).send("Internal Server Error");
    }
},









  // async initiateIndividualReturn(req, res) {
  //   const orderId = req.params.id;
  //   const { reason } = req.body;

  //   try {
  //     const order = await orderModel.findById(orderId);
  //     if (!order) {
  //       return res.status(404).json({ success: false, message: 'Order not found' });
  //     }

  //     // Check if the order is already in a returnable state
  //     if (order.status !== 'Pending' && order.status !== 'Delivered') {
  //       return res.status(400).json({ success: false, message: 'This order cannot be returned' });
  //     }

  //     // Update the order status to 'Return Requested' and save the reason
  //     order.status = 'Return Requested';
  //     order.returnReason = reason; // Save the return reason

  //     await order.save();

  //     const product = await productModel.findById(order.products[0].productId);
  //     if (!product) {
  //       return res.status(404).json({ success: false, message: 'Product not found' });
  //     }

  //     // Update the product status to 'Return Requested'
  //     product.status = 'Return Requested';
  //     product.returnReason = reason; // Save the return reason
  //     await product.save();

  //     res.json({ success: true, message: 'Return requested successfully!' });
  //   } catch (error) {
  //     console.error("Error processing return:", error);
  //     res.status(500).json({ success: false, message: 'An error occurred while processing the return.' });
  //   }
  // },

  // async handleReturn(req, res) {
  //   const { action } = req.body;
  //   const productId = req.params.productId;

  //   try {
  //     // Find the order and the specific product
  //     const order = await orderModel.findOne({ 'products._id': productId });
  //     const product = order.products.find(p => p._id.toString() === productId);

  //     if (action === 'approve') {
  //       product.status = 'Return Approved';
  //     } else if (action === 'reject') {
  //       product.status = 'Return Rejected';
  //     }

  //     await order.save();

  //     res.json({ success: true, message: `Return ${action}d successfully!` });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ success: false, message: "An error occurred." });
  //   }
  // },
}

