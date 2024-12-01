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
const mongoose = require('mongoose');
const path = require('path');

module.exports = {
  async loadorders(req, res) {
    try {
      const user = await userModel.findOne({ email: req.session.userData.email });
      const userId = user.id;
      req.session.userId = userId;      
  
      const orders = await orderModel.find({ userId })
        .populate({
          path: "products.productId",
          populate: {
            path: "category", // Populate the category field
            select: "name",   // Only select the category name
          },
        })
        .sort({ createdAt: -1 }); // Sort by latest order first
  
        const transformedOrders = orders.map((order) => ({
          id: order._id,
          date: order.createdAt ? order.createdAt.toLocaleDateString() : "N/A",
          products: order.products.map((product) => ({
            name: product.productId?.product_name || "Unknown Product",
            productImage: product.productId?.product_images?.[0] || "/images/placeholder.jpg",
            category: product.productId?.category?.name || "N/A",
            quantity: product.quantity || 0,
            price: product.price || 0,
          })),
          totalPrice: order.totalAmount || 0,
          status: order.status || "Unknown",
          statusClass: order.status ? order.status.toLowerCase() : "unknown",
          shippingAddress: order.deliveryAddress
            ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}, ${order.deliveryAddress.pincode}`
            : "Address not available",
          trackOrderLink: `/orders/track/${order._id}`,
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
  
}