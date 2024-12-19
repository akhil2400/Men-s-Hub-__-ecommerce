const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const path = require("path");
const mongoose = require("mongoose");
const couponModel = require("../models/couponModel");
const wishlistModel = require("../models/wishlistModel");

module.exports = {
  async loadwishlist(req, res) {
    try {
      const user = await userModel.findOne({
        email: req.session.userData.email,
      });
      const userId = user.id;
      const wishlistItems = await wishlistModel
        .find({ userId })
      console.log(wishlistItems)
      res.render("wishlist", { wishlistItems });

    } catch (error) {
      console.error("Error loading wishlist:", error);
      res.status(500).render("error", { message: "Could not load wishlist." });
    }
  },
  async addToWishlist(req, res) {
    try {
      const { productId, productName, productPrice } = req.body;
      console.log("product Id : " + productId + "product Name : " + productName + "product price : " + productPrice);

      const productImage = await productModel.findOne({ _id: productId }).select("images");
      const wishlistImage = productImage.images[0];
      const user = await userModel.findOne({ email: req.session.userData.email });
      const userId = user.id;

      const existingItem = await wishlistModel.findOne({ userId, productId });
      if (existingItem) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      const newWishlistItem = new wishlistModel({
        userId,
        productId,
        productName,
        productPrice,
        wishlistImage
      });
      console.log(newWishlistItem);

      await newWishlistItem.save();
      res.status(201).json({ message: "Product added to wishlist" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error adding to wishlist" });
    }
  },

  async removeFromWishlist(req, res) {
    try {
      const { id } = req.params; // Match the :id parameter in the route
      const result = await wishlistModel.deleteOne({ _id: id });
      if (result.deletedCount > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: "Item not found" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  },

  // async addToCartFromWishlist(req, res) {
  //   try {
  //     // Validate productId
  //     let productId = req.params.id;
  //     productId=JSON.stringify(productId)
  //     if (!mongoose.Types.ObjectId.isValid(productId)) {
  //       return res.status(400).json({ success: false, message: "Invalid product ID" });
  //     }

  //     const productIdObj = mongoose.Types.ObjectId(productId); // Convert to ObjectId

  //     // Fetch the user based on the session email
  //     const user = await userModel.findOne({ email: req.session.userData.email });
  //     if (!user) {
  //       return res.status(404).json({ success: false, message: "User not found" });
  //     }
  //     const userId = user._id; // Always use `_id` from Mongoose

  //     // console.log("User ID:", userId);
  //     // console.log("Product ID:", productIdObj);

  //     // Find the specific wishlist entry for the user and product
  //     const wishlistItem = await wishlistModel.findOne({ userId, productId: productIdObj });
  //     if (!wishlistItem) {
  //       return res
  //         .status(404)
  //         .json({ success: false, message: "Product not found in wishlist" });
  //     }

  //     // Find or create a cart for the user
  //     let cart = await cartModel.findOne({ userId });
  //     if (!cart) {
  //       cart = new cartModel({ userId, items: [], cartTotal: 0 });
  //     }

  //     // Check if the product already exists in the cart
  //     const cartItemIndex = cart.items.findIndex(
  //       (item) => item.productId.toString() === wishlistItem.productId.toString()
  //     );

  //     if (cartItemIndex !== -1) {
  //       // Increment quantity if product already exists
  //       cart.items[cartItemIndex].quantity += 1;
  //     } else {
  //       // Add new product to the cart
  //       cart.items.push({
  //         productId: wishlistItem.productId,
  //         quantity: 1,
  //         price: wishlistItem.productPrice,
  //       });
  //     }

  //     // Update the cart's total price
  //     cart.cartTotal += wishlistItem.productPrice;

  //     // Save the updated cart
  //     await cart.save();

  //     // Remove the product from the wishlist
  //     await wishlistModel.deleteOne({ userId, productId: productIdObj });

  //     res.status(200).json({ success: true, message: "Product moved to cart." });
  //   } catch (error) {
  //     console.error("Error in addToCartFromWishlist:", error);
  //     res.status(500).json({ success: false, message: "An error occurred." });
  //   }
  // }
  // async addToCartFromWishlist(req, res) {
  //   console.log(1111)
  //   const {productId} = req.params;
  //   let { quantity, productSize, color, price, total } = req.body;
  //   const { email } = req.session.userData; 

  //   console.log(`productId : ${productId}`)

  //   console.log(price)
  //   console.log(total)
  //   console.log(productSize)
  //   console.log(quantity)

  //   try {
  //     // Find the product in the database
  //     console.log(11)
  //     const product = await productModel.findOne({productId});

  //     console.log(12)

  //     const user = await userModel.findOne({ email });
  //     // Find the user's cart
  //     let cart = await cartModel.findOne({ userId: user._id });

  //     if (!cart) {
  //       // If the cart doesn't exist, create a new cart
  //       cart = new cartModel({
  //         userId,
  //         items: [{
  //           productId,
  //           quantity,
  //           price,
  //           size: productSize,
  //           color,
  //           total,
  //         }],
  //         cartTotal: total,
  //       });
  //     } else {
  //       // If the cart exists, check if the product is already in the cart
  //       const existingItem = cart.items.find(item => item.productId.toString() === productId);
  //       if (existingItem) {
  //         // Update the quantity of the existing item in the cart
  //         existingItem.quantity += quantity;
  //         existingItem.total = existingItem.quantity * price;
  //       } else {
  //         // Add the new product to the cart
  //         cart.items.push({
  //           productId,
  //           quantity,
  //           price,
  //           size: productSize,
  //           color,
  //           total,
  //         });
  //       }

  //       // Update the cart's total price
  //       cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
  //     }

  //     // Save the updated cart to the database
  //     await cart.save();

  //     return res.status(200).json({ success: true, message: "Product added to cart successfully" });
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ success: false, message: "Server error" });
  //   }

  // }

}
