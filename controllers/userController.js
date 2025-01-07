const express = require("express");
const bcrypt = require("bcrypt");
const Otp = require("../models/otpModel");
const userModel = require("../models/userModel");
const { generateOTP, otpExpire } = require("../utils/otpGenerator");
const { sendOTP } = require("../utils/mailSender");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const cartModel = require("../models/cartModel");
const addressModel = require("../models/addressModel");
const orderModel = require("../models/orderModel");
const wishlistModel = require("../models/wishlistModel");
const couponModel = require("../models/couponModel");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
require("dotenv").config();
const Referral = require('../models/referralModel');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay key
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Replace with your Razorpay secret
});

module.exports = {
  async loadstartingpage(req, res) {
    try {
      const category = await categoryModel.find({ isDeleted: false });
      const products = await productModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(9);
      res.status(200).render("starting", { category, products });
    } catch (err) {
      console.log(err);
    }
  },

  async loadlogin(req, res) {
    res.render("login");
  },

  async loadregister(req, res) {
    res.render("register");
  },

  async loadhome(req, res) {
    try {
      if (!req.session.userData || !req.session.userData.email) {
        return res.status(403).redirect("/login");
      }

      const category = await categoryModel.find({ isDeleted: false });
      const products = await productModel
        .find({})
        .sort({ createdAt: -1 })
        .limit(9);

      const user = await userModel.findOne({
        email: req.session.userData.email,
      });

      const isAdmin = user && user.role === "admin";

      console.log("User Data:", user);
      res.status(200).render("home", { category, products, isAdmin });
    } catch (err) {
      console.error("Error loading home page:", err);
      res.status(500).send("Internal Server Error");
    }
  },

  async registerUser(req, res) {

    const { otp } = req.body;
    console.log("otp1:", otp);
    if (!req.session.userData) {
      console.log("User data cleared ");
      return res.status(400).json({
        st: false,
        msg: "session expired",
      });
    }
    const { userName, email, password, mobileNumber, gender } =
      req.session.userData;
    console.log(userName, email, password, mobileNumber, gender);
    try {
      console.log("1");
      const otpData = await Otp.findOne({ email });
      console.log(otpData.otp);
      console.log(otp);

      if (!otpData) {
        console.log("4");
        return res.status(400).json({
          st: false,
          msg: "Enter valid OTP",
        });
      }
      console.log("5");

      if (otpData.otp !== otp) {
        return res.status(400).json({
          st: false,
          msg: "Enter valid OTP",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await userModel.create({
        userName,
        email,
        password: hashedPassword,
        mobileNumber,
        gender,
      });

      req.session.logedIn = true;
      req.session.userData = { userName, email, mobileNumber, gender };

      return res.status(200).json({
        st: true,
        msg: "User registered successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        st: false,
        msg: "Internal server error",
      });
    }
  },

  loadotp(req, res) {
    res.render("registerOtp");
  },

  async loginUser(req, res) {
    const { emailuserName, password } = req.body;
    try {
      let key = emailuserName.includes("@") ? "email" : "userName";

      // Fetch user based on email or username
      const user = await userModel.findOne({ [key]: emailuserName });

      // Check if user exists
      if (!user) {
        return res.status(400).json({
          type: key,
          st: false,
          msg: `Enter valid ${key === "email" ? "email" : "username"}`,
        });
      }

      // Check if password exists for the user
      if (!user.password) {
        console.error("User found but password is missing in the database.");
        return res.status(500).json({
          type: "password",
          st: false,
          msg: "Password not set for this account.",
        });
      }

      if (user.isDeleted) {
        return res.status(400).json({
          type: "ban",
          st: false,
          msg: "Your account has been banned",
        });
      }

      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          type: "password",
          st: false,
          msg: "Enter valid password",
        });
      }

      // Store essential user data in session (excluding password)
      req.session.userData = {
        userName: user.userName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        gender: user.gender,
      };
      req.session.logedIn = true;
      req.session.userData = { userName:user.userName, email: user.email, mobileNumber: user.mobileNumber, gender: user.gender };
      // Send success response
      return res.status(200).json({
        type: null,
        st: true,
        msg: "Logged in successfully",
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
        type: null,
        st: false,
        msg: "Error logging in",
      });
    }
  },

  async loaddashboard(req, res) {
    const { email } = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      res.render("userdashboard", { user });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      res.status(500).send("Error loading dashboard");
    }
  },

  async updateProfile(req, res) {
    const { userName, email, mobileNumber } = req.body;
    const currentUserEmail = req.session.userData.email;
    console.log(userName, email, mobileNumber, currentUserEmail);
    const errors = {};

    try {
      // Check if username, email, or mobile number are already in use
      const user = await userModel.findOne({ email: currentUserEmail });

      if (!user) {
        return res.status(404).json({ st: false, msg: "User not found" });
      }

      if (userName !== user.userName) {
        const existingUserName = await userModel.findOne({ userName });
        if (existingUserName) {
          errors.userName = "Username is already taken";
        }
      }

      if (email !== user.email) {
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
          errors.email = "Email is already taken";
        }
      }

      if (mobileNumber !== user.mobileNumber) {
        const existingMobile = await userModel.findOne({ mobileNumber });
        if (existingMobile) {
          errors.mobileNumber = "Mobile number is already taken";
        }
      }

      // Return validation errors
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ st: false, errors });
      }

      // Update user information
      user.userName = userName;
      user.email = email;
      user.mobileNumber = mobileNumber;

      await user.save();

      // Update session with new email if changed
      req.session.userData.email = email;

      return res
        .status(200)
        .json({ st: true, msg: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(500).json({ st: false, msg: "Internal server error" });
    }
  },

  async loadmyaddress(req, res) {
    const { email } = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      const address = await addressModel.find({ userId: user._id, isDeleted: false }).sort({ createdAt: -1 });
      // console.log(address)
      res.render("myAddress", { user, address });
    } catch (err) {
      console.error("Error loading myaddress:", err);
      res.status(500).send("Error loading my address");
    }
  },

  async myAddAddress(req, res) {
    const {
      houseNumber,
      street,
      city,
      landmark,
      district,
      state,
      country,
      pinCode,
      mobileNumber
    } = req.body;
    const { email } = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      await addressModel.create({
        userId: user._id,
        houseNumber,
        street,
        city,
        landmark,
        district,
        state,
        country,
        pinCode,
        mobileNumber
      });
      return res.status(200).json({
        type: null,
        st: true,
        msg: "Address added successfully",
      });
    } catch (err) {
      console.error("Error adding address:", err);
      res.status(500).json({
        type: "error",
        st: false,
        msg: "Error in adding address",
      });
    }
  },

  async preloadAddress(req, res) {
    const { id } = req.params;
    console.log(id);
    try {
      const address = await addressModel.findOne({ _id: id });
      console.log(address);
      res.json(address);
    } catch (err) {
      console.error("Error loading address:", err);
    }
  },

  async myAddAddressEdit(req, res) {
    const { address_id } = req.params;
    const {
      houseNumber,
      street,
      city,
      landmark,
      district,
      state,
      country,
      pinCode,
      mobileNumber,
    } = req.body;

    console.log("Request Params ID:", address_id, req.body);

    try {
      const updatedAddress = await addressModel.findByIdAndUpdate(
        address_id,
        {
          houseNumber,
          street,
          city,
          landmark,
          district,
          state,
          country,
          pinCode,
          mobileNumber,
        },
        { new: true } // Ensures the updated document is returned
      );
      console.log(updatedAddress);
      if (!updatedAddress) {
        consol.log("Address not found");
        return res.status(404).json({
          type: "error",
          st: false,
          msg: "Address not found",
        });
      }
      console.log("Address updated successfully");
      return res.status(200).json({
        type: null,
        st: true,
        msg: "Address updated successfully",
      });
    } catch (err) {
      console.error("Error updating address:", err);
      res.status(500).json({
        type: "error",
        st: false,
        msg: "Error in updating address",
      });
    }
  },
  async removeAddress(req, res) {
    try {
      const { addressId } = req.params;
      const user = await userModel.findOne({ email: req.session.userData.email });
      const userId = user._id;

      // Find the address and set `isDeleted` to true
      const address = await addressModel.findOneAndUpdate(
        { _id: addressId, userId },
        { isDeleted: true },
        { new: true }
      );

      if (!address) {
        return res.status(404).json({ success: false, message: 'Address not found.' });
      }

      res.status(200).json({ success: true, message: 'Address removed successfully.' });
    } catch (error) {
      console.error('Error removing address:', error);
      res.status(500).json({ success: false, message: 'Failed to remove address.' });
    }
  },

  loademailverify(req, res) {
    res.render("forgotpasswordemailverification");
  },

  loadforgotpassword(req, res) {
    res.render("forgotpassword");
  },

  async forgotpassword(req, res) {
    const { password } = req.body;
    console.log(password);
    const email = req.session.emailverfy;
    console.log("1----");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("2------");
    await userModel.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );
    console.log("3------");
    req.session.logedIn = true;
    return res.status(200).json({
      st: true,
      msg: "Password changed successfully",
    });
  },

  loadfotp(req, res) {
    res.render("forgetpasswordotp");
  },

  async emailverify(req, res) {
    console.log(req.body.isResend);

    try {
      if (req.body.isResend) {
        await Otp.deleteMany({ email: req.session.emailverfy });
        const email = req.session.emailverfy;
        const otp = generateOTP();
        console.log(email, otp);
        await sendOTP(email, otp);
        await Otp.create({
          email,
          otp,
          createdAt: Date.now(),
          expiresAt: otpExpire,
        });
        return res.status(200).json({
          st: true,
          msg: "OTP sent successfully",
        });
      } else {
        await Otp.deleteMany({ email: req.body.email });
        req.session.emailverfy = req.body.email;
        const user = await userModel.findOne({ email: req.body.email });
        console.log("3``````");
        if (!user) {
          return res.status(400).json({
            st: false,
            msg: "Enter valid email",
          });
        }
        console.log("4``````");
        const otp = generateOTP();
        await sendOTP(req.body.email, otp);
        await Otp.create({
          email: req.body.email,
          otp,
        });
        console.log("5``````");
        return res.status(200).json({
          st: true,
          msg: "OTP sent successfully",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        st: false,
        msg: "Internal server error",
      });
    }
  },
  loadban(req, res) {
    res.render("ban");
  },

  loadabout(req, res) {
    res.render("about");
  },
  loadcontact(req, res) {
    res.render("contact");
  },
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  },

  async removeCartItem(req, res) {
    try {
      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ st: false, msg: "Invalid itemId" });
      }

      const cart = await cartModel.findOne({
        "items._id": new mongoose.Types.ObjectId(itemId),
      });
      if (!cart) {
        return res.status(404).json({ st: false, msg: "Cart not found" });
      }

      // Remove the item by itemId
      await cartModel.updateOne(
        { "items._id": new mongoose.Types.ObjectId(itemId) },
        { $pull: { items: { _id: new mongoose.Types.ObjectId(itemId) } } }
      );

      // Recalculate the cart total
      cart.cartTotal = cart.items.reduce(
        (total, item) => total + item.total,
        0
      );
      await cart.save();

      res.status(200).json({ st: true });
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({
        st: false,
        message: "An error occurred while removing the item",
      });
    }
  },

  async loadcart(req, res) {
    console.log("Load cart endpoint hit");
    try {
      const { email } = req.session.userData;
      console.log(email);
      const user = await userModel.findOne({ email }).lean();

      if (!user) {
        return res.status(404).send("User not found");
      }

      const cart = await cartModel
        .findOne({ userId: user._id })
        .populate("items.productId");
      console.log(cart);

      // If the cart doesn't exist, create an empty cart object
      if (!cart) {
        return res.render("cart", { cart: { items: [], cartTotal: 0 } });
      }

      // Ensure cart.items is always an array
      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }
      const message = req.session.message;
      req.session.message = null; // Clear the message after displaying it

      // Add stock info to each cart item and adjust quantities if needed
      cart.items = cart.items.map((item) => {
        const stockAvailable = item.productId.stock;

        // If the cart quantity exceeds available stock, adjust it
        if (item.quantity > stockAvailable) {
          console.log(
            `Adjusting quantity for product ${item.productId._id}: cart quantity (${item.quantity}) exceeds stock (${stockAvailable})`
          );
          item.quantity = stockAvailable;
        }

        // Attach stock information
        item.stockAvailable = stockAvailable;
        return item;
      });

      // Ensure cartTotal exists, calculate it if missing or after adjustments
      if (cart.cartTotal === undefined || cart.cartTotal === null) {
        cart.cartTotal = cart.items.reduce(
          (total, item) => total + item.productId.price * item.quantity,
          0
        );
      }

      console.log("Cart loaded:", cart);
      return res.render("cart", { cart, message });
    } catch (error) {
      console.error("Error in loadcart:", error);
      res.status(500).send("An error occurred while loading the cart");
    }
  },

  async fetchCart(req, res) {
    try {
      const { email } = req.session.userData;
      const user = await userModel.findOne({ email }).lean();
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const cart = await cartModel
        .findOne({ userId: user._id })
        .populate("items.productId");
      if (!cart) {
        return res.status(404).json({ msg: "Cart not found" });
      }

      // Ensure cart.items is always an array
      cart.items = Array.isArray(cart.items) ? cart.items : [];

      // Calculate cartTotal if missing
      if (!cart.cartTotal) {
        cart.cartTotal = cart.items.reduce(
          (total, item) => total + (item.productId.price || 0) * item.quantity,
          0
        );
      }

      console.log(cart);

      // Return cart items and the total
      return res.status(200).json({ cart });
    } catch (error) {
      console.error("Error fetching cart:", error);
      return res
        .status(500)
        .json({ msg: "An error occurred while fetching the cart" });
    }
  },

  async addToCart(req, res) {
    console.log("Add to cart endpoint hit");
    try {
      if (!req.session.logedIn) {
        return res.status(401).json({ val: false, msg: "Please login first" });
      }

      const { email } = req.session.userData;
      const user = await userModel.findOne({ email });
      const { productId, productSize, color, quantity } = req.body;

      if (!productId || !productSize || !color || !quantity) {
        return res
          .status(400)
          .json({ val: false, msg: "All fields are required" });
      }

      const parsedQuantity = parseInt(quantity);

      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({ val: false, msg: "Product not found" });
      }

      // Check if requested quantity exceeds stock
      if (parsedQuantity > product.stock) {
        return res
          .status(400)
          .json({ val: false, msg: "Quantity exceeds stock" });
      }

      // Check if quantity exceeds the maximum allowed (3 units per product or 3 distinct items in the cart)
      if (parsedQuantity > 3) {
        return res.status(400).json({
          val: false,
          msg: "Cannot add more than 3 units of this product.",
        });
      }

      let cart = await cartModel.findOne({ userId: user._id });
      const productTotal = product.offerPrice
        ? product.offerPrice * parsedQuantity
        : product.price * parsedQuantity;

      // If the cart exists, check for product-specific and cart-wide limits
      if (cart) {
        // Find existing item in cart
        const existingItem = cart.items.find(
          (item) =>
            item.productId.toString() === productId &&
            item.size === productSize &&
            item.color === color
        );

        // Check if adding this product exceeds its quantity limit
        if (existingItem) {
          const newQuantity = existingItem.quantity + parsedQuantity;

          if (newQuantity > 3) {
            return res.status(400).json({
              val: false,
              msg: "Cannot add more than 3 units of this product to the cart.",
            });
          }

          if (newQuantity > product.stock) {
            return res
              .status(400)
              .json({ val: false, msg: "Quantity exceeds available stock" });
          }

          // Update existing item's quantity and total
          existingItem.quantity = newQuantity;
          const priceToUse = existingItem.offerPrice || existingItem.price;
          existingItem.total = priceToUse * existingItem.quantity;
        } else {
          // Check if the total number of distinct items in the cart exceeds 3
          if (cart.items.length >= 3) {
            return res.status(400).json({
              val: false,
              msg: "Cannot add more than 3 distinct items to the cart.",
            });
          }

          // Add a new item to the cart
          cart.items.push({
            productId,
            quantity: parsedQuantity,
            price: product.price,
            offerPrice: product.offerPrice,
            size: productSize,
            color,
            total: productTotal,
          });
        }

        // Recalculate cart total
        cart.cartTotal = cart.items.reduce(
          (total, item) => total + item.total,
          0
        );
        await cart.save();
      } else {
        // Create a new cart for the user
        await cartModel.create({
          userId: user._id,
          items: [
            {
              productId,
              quantity: parsedQuantity,
              price: product.price,
              offerPrice: product.offerPrice,
              size: productSize,
              color,
              total: productTotal,
            },
          ],
          cartTotal: productTotal,
        });
      }

      res.status(200).json({ val: true, msg: "Added to cart" });
    } catch (error) {
      console.error("Error in addToCart:", error);
      res.status(500).send("An error occurred while adding to cart");
    }
  },

  async updateCartItemQuantity(req, res) {
    try {
      const { index, quantity } = req.body;
      console.log(index, quantity);
      if (!quantity || quantity < 1) {
        return res
          .status(400)
          .json({ success: false, msg: "Invalid quantity" });
      }
      if (quantity > 3) {
        return res
          .status(400)
          .json({ success: false, msg: "Quantity cannot be more" });
      }
      const { email } = req.session.userData;
      const user = await userModel.findOne({ email }).lean();

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      const cart = await cartModel.findOne({ userId: user._id });

      if (!cart) {
        return res.status(404).json({ success: false, msg: "Cart not found" });
      }

      // Find the cart item and update the quantity
      //const cartItem = cart.items.find(item => item.productId.toString() === productId);
      cart.items[index].quantity = quantity;
      cart.items[index].total = cart.items[index].offerPrice * quantity;
      cart.cartTotal = cart.items.reduce((acc, item) => acc + item.total, 0);

      await cart.save();

      res.status(200).json({
        success: true,
        cartTotal: cart.cartTotal,
        itemTotal: cart.items[index].total,
      });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      res.status(500).json({ success: false, msg: "Server error" });
    }
  },

  async processCheckout(req, res) {
    try {
      const user = await userModel.findOne({
        email: req.session.userData.email,
      });
      const userId = user.id;

      if (!userId) {
        return res.status(400).send("User ID is required");
      }

      const addresses = await addressModel.find({ userId });
      if (!addresses || addresses.length === 0) {
        return res.status(400).send("No addresses found for this user");
      }
      console.log("address", addresses);

      const cartData = req.body.cartData ? JSON.parse(req.body.cartData) : {};
      if (!cartData.items || cartData.items.length === 0) {
        return res.status(400).send("Invalid or empty cart data");
      }

      // Check product quantities from the product model
      for (const cartItem of cartData.items) {
        const product = await productModel.findById(cartItem.productId);

        if (!product) {
          req.session.message = `Product with ID ${cartItem.productId} not found.`;
          return res.redirect("/cart");
        }

        // If cart quantity exceeds stock, redirect to cart with a message
        if (cartItem.quantity > product.stock) {
          req.session.message = `We Are adjusted the stock for product: ${product.name}. Available stock: ${product.stock}, your cart quantity: ${cartItem.quantity}.So we are adjusting your cart quantity if you are ok you can proceed to the checkout page.`;
          return res.redirect("/cart");
        }
      }

      // Calculate the subtotal
      const subtotal = cartData.items.reduce((sum, item) => {
        return sum + item.offerPrice * item.quantity;
      }, 0);

      const shippingCost = 50;
      let cartTotal = subtotal + shippingCost;

      // Coupon application logic
      const { couponCode } = req.body;
      let discount = 0;

      if (couponCode) {
        const coupon = await couponModel.findOne({ couponCode, isActive: true });

        if (coupon) {
          const currentDate = new Date().toISOString();
          if (
            currentDate >= coupon.startDate &&
            currentDate <= coupon.expiryDate
          ) {
            if (subtotal >= coupon.minimumPurchase) {
              // Calculate discount based on type
              if (coupon.discountType === "percentage") {
                discount = (subtotal * coupon.discountValue) / 100;
              } else if (coupon.discountType === "fixed") {
                discount = coupon.discountValue;
              }

              // Ensure discount doesn't exceed maximum purchase limit (if defined)
              if (coupon.maximumPurchase && subtotal > coupon.maximumPurchase) {
                discount = Math.min(discount, coupon.maximumPurchase);
              }

              // Deduct the discount from the total
              cartTotal -= discount;
            } else {
              req.session.message =
                "Subtotal does not meet the minimum purchase requirement for this coupon.";
              return res.redirect("/cart");
            }
          } else {
            req.session.message = "Coupon is expired or not yet valid.";
            return res.redirect("/cart");
          }
        } else {
          req.session.message = "Invalid or inactive coupon code.";
          return res.redirect("/cart");
        }
      }

      cartData.subtotal = subtotal;
      cartData.shippingCost = shippingCost;
      cartData.discount = discount;
      cartData.cartTotal = cartTotal;

      res.render("checkout", { cart: cartData, addresses, userId });
    } catch (error) {
      console.error("Error processing checkout:", error);
      res.status(500).send("Internal Server Error");
    }
  },


  async loadthankyou(req, res) {
    res.render("thankyou");
  },

  async placeOrder(req, res) {
    try {
      const user = await userModel.findOne({
        email: req.session.userData.email,
      });
      if (!user) {
        return res.status(400).json({ val: false, msg: "User not found" });
      }
      const userId = user.id;
      req.session.userId = userId;

      const { selectedAddress, items, payableAmount } = req.body;
      console.log("items:", items);
      if (!selectedAddress || !items || items.length === 0) {
        return res
          .status(400)
          .json({ val: false, msg: "Address and items are required" });
      }

      // Ensure user is logged in
      if (!req.session.userId) {
        return res
          .status(401)
          .json({ val: false, msg: "User is not logged in" });
      }

      // Validate products and stock
      for (const item of items) {
        const product = await productModel.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ val: false, msg: `Product not found: ${item.productId}` });
        }
        console.log(product.totalStock)
        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            val: false,
            msg: `Insufficient stock for product: ${product.name}`,
          });
        }
      }

      // Calculate total price based on product price and quantity
      const totalOrderPrice = items.reduce(
        (sum, item) => sum + item.offerPrice * item.quantity,
        50
      );

      // Check if total order price exceeds the limit for COD payment
      if (totalOrderPrice > 1000) {
        return res.status(400).json({
          val: false,
          msg: "Cash on Delivery is not available for orders exceeding ₹1000.",
        });
      }

      // Deduct stock after price check
      for (const item of items) {
        const product = await productModel.findById(item.productId);
        product.totalStock -= item.quantity;
        for (let i = 0; i < product.variants.length; i++) {
          if (product.variants[i].size === item.size) {
            product.variants[i].stock -= item.quantity
          }

        }
        await product.save();
      }

      // Create the order with COD payment method
      const order = new orderModel({
        userId: req.session.userId,
        deliveryAddress: selectedAddress,
        products: items,
        totalAmount: totalOrderPrice,
        payableAmount: payableAmount,
        paymentMethod: "cod",
        paymentStatus: "pending", 
      });
      
      await order.save();

      // Empty the cart
      await cartModel.findOneAndUpdate(
        { userId: req.session.userId },
        { $set: { items: [], cartTotal: 0 } }
      );

      res.status(200).json({
        val: true,
        msg: "Order placed successfully with Cash on Delivery.",
      });
    } catch (error) {
      console.error("Error placing order with COD:", error);
      res
        .status(500)
        .json({ val: false, msg: "An error occurred while placing the order" });
    }
  }
  ,

  async placeOrderRazorpay(req, res) {
    try {
      const user = await userModel.findOne({
        email: req.session.userData.email,
      });
      if (!user) {
        return res.status(400).json({ val: false, msg: "User not found" });
      }
      const userId = user.id;
      req.session.userId = userId;
  
      const { selectedAddress, items, payableAmount } = req.body;
      console.log(payableAmount);
      if (!selectedAddress || !items || items.length === 0) {
        return res
          .status(400)
          .json({ val: false, msg: "Address and items are required" });
      }
  
      // Ensure user is logged in
      if (!req.session.userId) {
        return res
          .status(401)
          .json({ val: false, msg: "User is not logged in" });
      }
  
      // Validate products and stock
      const productsForOrder = [];
      for (const item of items) {
        const product = await productModel.findById(item.productId);
        if (!product) {
          return res
            .status(404)
            .json({ val: false, msg: `Product not found: ${item.productId}` });
        }
        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            val: false,
            msg: `Insufficient stock for product: ${product.name}`,
          });
        }
  
        // Deduct stock and prepare product entry
        product.totalStock -= item.quantity;
        await product.save();
  
        productsForOrder.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.offerPrice, // Ensure price is included
        });
      }
  
      // Calculate total price based on product price and quantity
      const totalOrderPrice = items.reduce(
        (sum, item) => sum + item.offerPrice * item.quantity,
        50
      );
  
      // Create the order with Razorpay payment method
      const order = new orderModel({
        userId: req.session.userId,
        deliveryAddress: selectedAddress,
        products: productsForOrder, // Pass the prepared products array
        totalAmount: totalOrderPrice,
        payableAmount: payableAmount,
        paymentMethod: "razorpay",
        paymentStatus: "paid", // Payment will be pending until verified by Razorpay
      });
  
      const savedOrder = await order.save();
  
      // Call Razorpay payment initiation logic
      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
  
      const razorpayOrder = await razorpayInstance.orders.create({
        amount: payableAmount * 100, // Convert amount to paise
        currency: "INR",
        receipt: `order_receipt_${order._id}`,
        payment_capture: 1,
      });
  
      // Save the Razorpay order ID in the order document
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();
  
      await cartModel.findOneAndUpdate(
        { userId: req.session.userId },
        { $set: { items: [], cartTotal: 0 } }
      );
  
      res.status(200).json({
        val: true,
        razorpayOrderId: razorpayOrder.id,
        orderId: savedOrder._id,
        amount: totalOrderPrice * 100,
        msg: "Razorpay order created successfully",
      });
    } catch (error) {
      console.error("Error placing order with Razorpay:", error);
      res.status(500).json({
        val: false,
        msg: "An error occurred while placing the order with Razorpay",
      });
    }
  },
  
  
  // Verify Razorpay Payment
  async verifyRazorpayPayment(req, res) {
    try {
      const { paymentId, razorpayOrderId ,orderId} = req.body;
      console.log(paymentId, razorpayOrderId)

      if (!paymentId || !razorpayOrderId) {
        return res.status(400).json({
          success: false,
          msg: "Payment ID and Order ID are required",
        });
      }
      
      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      
      const paymentDetails = await razorpayInstance.payments.fetch(paymentId);
      if (paymentDetails.status === "captured") {
        console.log(`Payment details: ${JSON.stringify(paymentDetails)}`);
        
        // Update the order payment status to "paid" using razorpayOrderId
        await orderModel.findOneAndUpdate(
          { razorpayOrderId: razorpayOrderId },
          { razorpayPaymentStatus: "paid" },
        );
        
        res
        .status(200)
        .json({ success: true, msg: "Payment verified successfully" });
      } else {
        res.status(400).json({ success: false, msg: "Payment failed" });
      }
    } catch (error) {
      console.error("Error verifying payment:", error.message, error.stack);
      res.status(500).json({ success: false, msg: "Error verifying payment" });
    }
  },
  
  async retryPayment(req, res) {
    const { orderId } = req.body;

    try {
      const existingOrder = await orderModel.findOne({ razorpayOrderId: orderId });

      if (!existingOrder) {
        return res.status(404).json({ success: false, message: "Order not found." });
      }
      const razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const newOrder = await razorpayInstance.orders.create({
        amount: existingOrder.payableAmount * 100,
        currency: "INR",
        receipt: `retry_${orderId}`,
      });

      existingOrder.razorpayOrderId = newOrder.id;
      existingOrder.razorpayPaymentStatus = "pending";
      await existingOrder.save();

      res.status(200).json({
        success: true,
        message: "Retry initiated successfully.",
        newOrder,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: "Failed to create Razorpay order for retry.",
      });
    }
  },

  async loadsearch(req, res) {
    const query = req.query.query;

    if (!query) {
      console.log("No query received");
      return res.json([]); // No query received, return empty array
    }

    try {
      // Search query is case-insensitive
      const products = await productModel
        .find({
          name: { $regex: query, $options: "i" }, // Use regex search for case-insensitivity
        })
        .select("name _id images"); // Only return relevant fields (name, _id, images)

      if (products.length > 0) {
        return res.json(products); // If products found, return them
      } else {
        console.log("No products found.");
        return res.json([]); // If no products found, return empty array
      }
    } catch (error) {
      console.error("Error in search:", error);
      return res.status(500).json({ error: "Failed to fetch search results" });
    }
  },
  async getAddresses(req, res) {
    try {
      const user = await userModel.findOne({
        email: req.session.userData.email,
      });
      const userId = user.id;
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = 2;

      // Fetch paginated addresses
      const addresses = await addressModel
        .find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Get total number of addresses for pagination calculation
      const totalAddresses = await addressModel.countDocuments({ userId });

      res.status(200).json({
        success: true,
        addresses,
        currentPage: page,
        totalPages: Math.ceil(totalAddresses / limit),
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
    }
  },

};
