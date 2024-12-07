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
  //Admin side
  async loadordermanagement(req, res) {
    try {
      // Fetch all orders with populated fields
      const orders = await orderModel.find()
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
    const { orderId } = req.params;
  const { status } = req.body;

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



  //User side
  async loadorders(req, res) {
    try {
      // Fetch the user by email from session data
      const user = await userModel.findOne({ email: req.session.userData.email });
      const userId = user._id;

      req.session.userId = userId;

      // Fetch user's addresses (if needed for multiple addresses)
      const addresses = await addressModel.find({ userId });

      // Fetch orders and populate product details, category, and address
      const orders = await orderModel
        .find({ userId })
        .populate({
          path: "products.productId",
          populate: {
            path: "category",
            select: "name", // Populate the category field inside the products
          },
        })
        .populate("deliveryAddress") // Correctly populate the deliveryAddress field
        .sort({ createdAt: -1 }); // Sort by latest order first

      // Transform the fetched orders into the desired format
      const transformedOrders = orders.map((order) => ({
        id: order._id,
        date: order.createdAt ? order.createdAt.toLocaleDateString() : "N/A",
        products: order.products.map((product) => ({
          name: product.productId?.name || "Unknown Product",
          price: product.productId?.price || 0,
          category: product.productId?.category?.name || "Unknown Category",
          quantity: product.quantity || 0,
          image: product.productId?.images?.[0] || "/images/placeholder.jpg",
        })),
        totalPrice: order.totalAmount || 0,
        status: order.status || "Unknown",
        statusClass: order.status ? order.status.toLowerCase() : "unknown",
        // Assuming the shipping address comes from the populated deliveryAddress
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

      // Send the transformed orders to the view
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

      // Fetch the order details from your database
      const order = await orderModel.findById(orderId).populate('products.productId') // Use `.lean()` for Mongoose performance

      if (!order) {
        return res.status(404).send("Order not found");
      }

      // Ensure order.total, shippingAddress, and paymentMethod are set
      if (!order.total) {
        order.total = 0; // Default value if not already calculated
      }

      if (!order.shippingAddress) {
        order.shippingAddress = {}; // Default to an empty object if missing
      }

      if (!order.paymentMethod) {
        order.paymentMethod = {}; // Default to an empty object if missing
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

      // Update the order status to "Cancelled"
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { status: "Cancelled" },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      res.status(200).json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ success: false, message: "Failed to cancel order" });
    }


  },

}

