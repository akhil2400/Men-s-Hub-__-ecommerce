const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const path = require("path");
const mongoose = require("mongoose");
const couponModel = require("../models/couponModel");

module.exports = {
  async loadcoupon(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 5; // Number of coupons per page
      const skip = (page - 1) * limit;

      // Fetch coupon data and count from your database
      const [coupons, totalCoupons] = await Promise.all([
        couponModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }), // Fetch paginated coupons
        couponModel.countDocuments(), // Total coupon count for pagination
      ]);

      const totalPages = Math.ceil(totalCoupons / limit);
      const val = coupons.length > 0;
      const msg = val ? "" : "No coupons found";

      // Render the coupon management page with data
      res.render("couponmanagement", {
        coupons, // Array of coupon objects
        currentPage: page,
        totalPages,
        msg,
        val,
      });
    } catch (error) {
      console.error("Error loading coupons:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  async addCoupon(req, res) {
    try {
      const {
        couponCode,
        discountType,
        discountValue,
        minimumPurchase,
        maximumPurchase,
        startDate,
        expiryDate,
        usageLimit,
      } = req.body;

      // Validate input
      if (
        !couponCode ||
        !discountType ||
        !discountValue ||
        !minimumPurchase ||
        !maximumPurchase ||
        !startDate ||
        !expiryDate ||
        !usageLimit
      ) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Validate dates
      if (isNaN(new Date(startDate)) || isNaN(new Date(expiryDate))) {
        return res.status(400).json({ error: "Invalid date format." });
      }

      // Convert dates to only YYYY-MM-DD string format
      const formatDateToString = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // Converts date to YYYY-MM-DD string
      };

      const formattedStartDate = formatDateToString(startDate);
      const formattedExpiryDate = formatDateToString(expiryDate);

      // Check for duplicate coupon code
      const existingCoupon = await couponModel.findOne({ couponCode });
      if (existingCoupon) {
        return res.status(400).json({ error: "Coupon code already exists." });
      }

      // Save the coupon
      const newCoupon = await couponModel.create({
        couponCode,
        discountType,
        discountValue,
        minimumPurchase,
        maximumPurchase,
        startDate: formattedStartDate, // Store as string
        expiryDate: formattedExpiryDate, // Store as string
        usageLimit,
      });

      res
        .status(201)
        .json({ message: "Coupon created successfully!", coupon: newCoupon });
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  async couponUnlist(req, res) {
    try {
      console.log("Request body:", req.body);

      const { id, newState } = req.body;

      // Validate input
      if (!id || typeof newState !== "boolean") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid input" });
      }

      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid coupon ID" });
      }

      // Find the coupon by ID
      const coupon = await couponModel.findById(id);

      // If the coupon is not found, return an error
      if (!coupon) {
        return res
          .status(404)
          .json({ success: false, message: "Coupon not found" });
      }

      // Update the isActive field
      coupon.isActive = newState;

      // Save the updated coupon to the database
      await coupon.save();

      console.log("Coupon status toggled:", coupon);

      res.status(200).json({ success: true, newState });
    } catch (error) {
      console.error("Error toggling coupon status:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
  async updateCoupon(req, res) {
    const couponId = req.params.id;
    const { couponCode, discountType, discountValue, minimumPurchase, maximumPurchase, startDate, expiryDate, usageLimit, isActive } = req.body;
  
    try {
      await couponModel.updateOne(
        { _id: couponId },
        {
          couponCode,
          discountType,
          discountValue,
          minimumPurchase,
          maximumPurchase,
          startDate,
          expiryDate,
          usageLimit,
          isActive,

        }
      );
  
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating coupon:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
},

};
