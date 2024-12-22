const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const path = require("path");
const mongoose = require("mongoose");
const couponModel = require("../models/couponModel");
const offerModel = require("../models/offerModel");

module.exports = {
  async loadoffer(req, res) {
    try {
      // Fetch all offers from the database and populate the referenced field properly
      const offers = await offerModel.find().populate({
        path: "categoryOrProduct", // Ensure the correct path is provided
        select: "name", // Select only the name field from the referenced document
      });

      console.log(`offers: ${offers}`);

      // Check if any offers exist
      if (!offers || offers.length === 0) {
        return res.render("offermanagement", {
          val: false, // No offers available
          msg: "No offers found.", // Message to display when no offers exist
        });
      }

      // Render the page with offers data
      res.render("offermanagement", {
        val: true, // Offers exist
        offers: offers.map((offer) => ({
          _id: offer._id,
          name: offer.name,
          type: offer.type,
          categoryOrProduct: offer.categoryOrProduct ? offer.categoryOrProduct._id : null, // Ensure it's null if categoryOrProduct isn't defined
          categoryOrProductName: offer.categoryOrProduct ? offer.categoryOrProduct.name : null, // Handle null safely
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          minPurchase: offer.minPurchase || null,
          startDate: offer.startDate ? offer.startDate.toISOString().split("T")[0] : null,
          endDate: offer.endDate ? offer.endDate.toISOString().split("T")[0] : null,
          status: offer.status ? "Active" : "Inactive",
          description: offer.description || null,
        })),
      });
    } catch (error) {
      console.error("Error loading offers:", error);
      res.status(500).render("offermanagement", {
        val: false,
        msg: "An error occurred while fetching offers.",
      });
    }
  },


  async loadproductoffer(req, res) {
    try {
      // Fetch all products from the database
      const products = await productModel.find();
      res.json({ items: products });
    } catch (error) {
      console.error("Error loading products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  },
  async loadcategoryoffer(req, res) {
    try {
      // Fetch all categories from the database
      const categories = await categoryModel.find();
      res.json({ items: categories });
    } catch (error) {
      console.error("Error loading categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  },
  async createoffer(req, res) {
    try {
      const {
        name,
        type,
        categoryOrProduct,
        discountType,
        discountValue,
        startDate,
        endDate,
        description,
      } = req.body;

      console.log("categoryOrProduct:", categoryOrProduct);

      const newOffer = new offerModel({
        name,
        type,
        categoryOrProduct,
        discountType,
        discountValue,
        startDate,
        endDate,
        status: "Active",
        description: description || "",
      });

      // If the offer applies to a product
      if (type === "Product") {
        const product = await productModel.findById(categoryOrProduct);

        if (product) {
          // Save old offer price
          product.previousOfferPrice = product.offerPrice;

          // Calculate discount
          if (discountType === "Percentage") {
            const discountAmount = (product.price * discountValue) / 100;
            product.offerPrice = product.price - discountAmount;
            product.offerPercentage = discountValue;
          } else if (discountType === "Fixed Amount") {
            product.offerPrice = product.price - discountValue;
            product.offerPercentage = ((discountValue / product.price) * 100).toFixed(2);
          }

          // Save updated product
          await product.save();
        }
      }
      // If the offer applies to a category
      else if (type === "Category") {
        const products = await productModel.find({ category: categoryOrProduct });

        for (const product of products) {
          // Save old offer price
          product.previousOfferPrice = product.offerPrice;

          // Calculate discount
          if (discountType === "Percentage") {
            const discountAmount = (product.price * discountValue) / 100;
            product.offerPrice = product.price - discountAmount;
            product.offerPercentage = discountValue;
          } else if (discountType === "Fixed Amount") {
            product.offerPrice = product.price - discountValue;
            product.offerPercentage = ((discountValue / product.price) * 100).toFixed(2);
          }

          // Save updated product
          await product.save();
        }
      }

      const savedOffer = await newOffer.save();
      console.log("savedOffer:", savedOffer);

      res.status(201).json({ success: true, offer: savedOffer });
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
  ,

  async deleteoffer(req, res) {
    try {
      const { id } = req.params;

      // Find the offer to be deleted
      const offer = await offerModel.findById(id);
      if (!offer) {
        return res.status(404).json({ success: false, message: "Offer not found" });
      }

      // If the offer applies to a product, update the product details
      if (offer.type === "Product") {
        const product = await productModel.findById(offer.categoryOrProduct);
        if (product) {
          // Revert to the previous offer price
          product.offerPrice = product.previousOfferPrice || product.price;
          product.previousOfferPrice = null;
          product.offerPercentage = null;

          // Save the updated product
          await product.save();
        }
      }
      // If the offer applies to a category, update all products in the category
      else if (offer.type === "Category") {
        const products = await productModel.find({ category: offer.categoryOrProduct });

        for (const product of products) {
          // Revert to the previous offer price
          product.offerPrice = product.previousOfferPrice || product.price;
          product.previousOfferPrice = null;
          product.offerPercentage = null;

          // Save the updated product
          await product.save();
        }
      }

      // Delete the offer from the database
      await offerModel.findByIdAndDelete(id);

      return res.status(200).json({ success: true, message: "Offer deleted successfully" });
    } catch (error) {
      console.error("Error deleting offer:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  }

  ,

  async updateoffer(req, res) {
    const offerId = req.params.id;
    const updatedData = req.body;
    console.log("OfferId:" + offerId)
    console.log(updatedData)

    try {
      const updatedOffer = await offerModel.findByIdAndUpdate(offerId, updatedData, { new: true });
      console.log(`krgwekogj:${updatedOffer}`)
      if (!updatedOffer) {
        return res.status(404).json({ success: false, message: "Offer not found." });
      }

      res.status(200).json({ success: true, message: "Offer updated successfully.", data: updatedOffer });
    } catch (error) {
      console.error("Error updating offer:", error);
      res.status(500).json({ success: false, message: "Internal server error." });
    }
  },

};
