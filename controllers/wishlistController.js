const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const path = require("path");
const mongoose = require("mongoose");
const couponModel = require("../models/couponModel");
const wishlistModel = require("../models/wishlistModel")


module.exports = {

  async loadwishlist (req, res) {
    try {
      const user = await userModel.findOne({ email: req.session.userData.email })
      const userId = user.id
      const wishlistItems = await wishlistModel.find({ userId }).populate('productId');
  
      res.render('wishlist', { wishlistItems });
    } catch (error) {
      console.error('Error loading wishlist:', error);
      res.status(500).render('error', { message: 'Could not load wishlist.' });
    }
  },
async addToWishlist(req, res) {
  try {
    const { productId } = req.body;

    // Validate productId
    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const user = await userModel.findOne({ email: req.session.userData.email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingWishlistItem = await wishlistModel.findOne({
      userId: user.id,
      productId
    });

    if (existingWishlistItem) {
      return res.status(400).json({ success: false, message: 'Product is already in your wishlist' });
    }

    // Fetch product details
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Create a new wishlist item
    const newWishlistItem = new wishlistModel({
      userId: user.id,
      productId,
      name: product.name,
      price: product.price,
      image: product.images[0] || '' // Handle case where images array might be empty
    });

    await newWishlistItem.save();
    
    res.status(201).json({  message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({  message: 'Could not add product to wishlist' });
  }
},

async removeFromWishlist(req, res) {
  try {
    const { id } = req.params; // Match the :id parameter in the route
    const result = await wishlistModel.deleteOne({ _id: id });

    if (result.deletedCount > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
},

async addToCartFromWishlist(req, res) {
  try {
    const { userId } = req.session.userData;
    const productId = req.params.id;

    // Fetch user's wishlist
    const wishlist = await wishlistModel.findOne({ userId });
    if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });

    // Find the product in the wishlist
    const wishlistItem = wishlist.items.find(item => item._id.toString() === productId);
    if (!wishlistItem) return res.status(404).json({ success: false, message: "Product not found in wishlist" });

    // Fetch or create user's cart
    let cart = await cartModel.findOne({ userId });
    if (!cart) {
      cart = new cartModel({ userId, items: [], cartTotal: 0 });
    }

    // Add product to the cart
    const cartItemIndex = cart.items.findIndex(item => item.productId.toString() === wishlistItem.productId.toString());
    if (cartItemIndex !== -1) {
      // If product already in cart, update quantity
      cart.items[cartItemIndex].quantity += wishlistItem.quantity || 1;
    } else {
      // Else, add as a new item
      cart.items.push({
        productId: wishlistItem.productId,
        quantity: wishlistItem.quantity || 1,
        price: wishlistItem.price
      });
    }

    // Update cart total
    cart.cartTotal += wishlistItem.price * (wishlistItem.quantity || 1);
    await cart.save();

    // Remove product from wishlist
    wishlist.items = wishlist.items.filter(item => item._id.toString() !== productId);
    await wishlist.save();

    res.status(200).json({ success: true, message: "Product moved to cart." });
  } catch (error) {
    console.error("Error in addToCartFromWishlist:", error);
    res.status(500).json({ success: false, message: "An error occurred." });
  }
}

}

