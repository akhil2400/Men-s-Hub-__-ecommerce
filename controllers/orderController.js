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

const mongoose = require('mongoose');
const path = require('path');

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
      // Fetch the order
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).send('Order not found');
      }

      // Fetch all products in the order
      const productsDetails = await Promise.all(
        order.products.map(async (product) => {
          const productData = await productModel.findById(product.productId);
          return {
            ...product,
            productData,
          };
        })
      );

      // Fetch the delivery address
      const deliveryAddress = await addressModel.findById(order.deliveryAddress);
      if (!deliveryAddress) {
        console.error(`Delivery address not found for order: ${orderId}`);
      }
      console.log('Order:', order);
      console.log('Delivery Address:', deliveryAddress);

      console.log( productsDetails);
      // Render the page with fetched data
      res.render('Editordermanagement', {
        order,
        productsDetails,
        deliveryAddress,
      });
    } catch (error) {
      console.error('Error loading order details:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  async updateOrderStatus(req, res) {
    const orderId  = req.params.id;
  const { status } = req.body;

  console.log(orderId, status);

  try {
    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
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
      const { orderId } = req.body;
  
      // Find the order
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }
  
      // Check if the order is already in the return process
      if (order.status === "Return Requested" || order.status === "Return Approved") {
        return res.status(400).json({ success: false, message: "Return already initiated or approved" });
      }
  
      // Update the order status to "Return Requested"
      order.status = "Return Requested";
      await order.save();
  
      res.status(200).json({ success: true, message: "Return request initiated successfully" });
    } catch (error) {
      console.error("Error initiating return request:", error);
      res.status(500).json({ success: false, message: "Failed to initiate return request" });
    }
  },
  
  
  

}

