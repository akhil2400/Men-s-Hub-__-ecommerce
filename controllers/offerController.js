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
  async loadoffer(req, res){
    try {
      // Fetch all offers from the database
      const offers = await offerModel.find();
  
      // Check if any offers exist
      if (!offers || offers.length === 0) {
        return res.render('offermanagement', {
          val: false, // No offers available
          msg: 'No offers found.', // Message to display when no offers exist
        });
      }
  
      // Render the page with offers data
      res.render('offermanagement', {
        val: true, // Offers exist
        offers: offers.map(offer => ({
          _id: offer._id,
          name: offer.name,
          type: offer.type,
          categoryOrProduct: offer.categoryOrProduct,
          categoryOrProductName: offer.categoryOrProductName, // Use correct field name if populated
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          minPurchase: offer.minPurchase || null,
          startDate: offer.startDate.toISOString().split('T')[0],
          endDate: offer.endDate.toISOString().split('T')[0],
          status: offer.status ? 'Active' : 'Inactive',
          description: offer.description || null,
        })),
      });
    } catch (error) {
      console.error('Error loading offers:', error);
      res.status(500).render('offermanagement', {
        val: false,
        msg: 'An error occurred while fetching offers.',
      });
    }
  },

 async loadproductoffer(req, res) {
    try {
      // Fetch all products from the database
      const products = await productModel.find();
      res.json(products);
    } catch (error) {
      console.error('Error loading products:', error);  
      res.status(500).json({ error: 'Failed to fetch products' });
    }
},
async loadcategoryoffer(req, res) {
    try {
      // Fetch all categories from the database
      const categories = await categoryModel.find();
      res.json(categories);
    } catch (error) {
      console.error('Error loading categories:', error);  
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
},


}