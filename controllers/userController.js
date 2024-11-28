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
const mongoose = require('mongoose');




module.exports = {

  async loadstartingpage(req, res) {
    try {
      const category = await categoryModel.find({ isDeleted: false });
      const products = await productModel.find({}).sort({ createdAt: -1 }).limit(9);
      res.status(200).render('starting', { category, products });
    } catch (err) {
      console.log(err);
    }
  },

  async loadlogin(req, res) {
    res.render('login');
  },

  async loadregister(req, res) {
    res.render('register');
  },

  async loadhome(req, res) {

    try {

      if (!req.session.userData || !req.session.userData.email) {
        return res.status(403).redirect('/login');
      }

      const category = await categoryModel.find({ isDeleted: false });
      const products = await productModel.find({}).sort({ createdAt: -1 }).limit(9);


      const user = await userModel.findOne({ email: req.session.userData.email });

      const isAdmin = user && user.role === "admin";

      console.log("User Data:", user);
      res.status(200).render('home', { category, products, isAdmin });
    } catch (err) {
      console.error("Error loading home page:", err);
      res.status(500).send("Internal Server Error");
    }
  },


  async registerUser(req, res) {
    console.log('Kamira wovo ');
    const { otp } = req.body;
    console.log("otp1:", otp)
    if (!req.session.userData) {
      console.log('User data cleared ')
      return res.status(400).json({
        st: false,
        msg: 'sessiron expired',
      })
    }
    const { userName, email, password, mobileNumber, gender } = req.session.userData;
    console.log(userName, email, password, mobileNumber, gender)
    try {
      console.log('1')
      const otpData = await Otp.findOne({ email });
      console.log(otpData.otp);
      console.log(otp);

      if (!otpData) {
        console.log('4')
        return res.status(400).json({
          st: false,
          msg: 'Enter valid OTP',
        });
      }
      console.log('5')

      if (otpData.otp !== otp) {
        return res.status(400).json({
          st: false,
          msg: 'Enter valid OTP',
        });
      }


      const hashedPassword = await bcrypt.hash(password, 10);

      await userModel.create({
        userName,
        email,
        password: hashedPassword,
        mobileNumber,
        gender
      });

      req.session.logedIn = true;
      req.session.userData = { userName, email, mobileNumber, gender };

      return res.status(200).json({
        st: true,
        msg: 'User registered successfully',
      });

    } catch (error) {
      console.log(error);
      res.status(500).json({
        st: false,
        msg: 'Internal server error',
      });
    }


  },


  loadotp(req, res) {
    res.render('registerOtp');
  },


  async loginUser(req, res) {
    const { emailuserName, password } = req.body;
    try {
      let key = emailuserName.includes('@') ? 'email' : 'userName';

      // Fetch user based on email or username
      const user = await userModel.findOne({ [key]: emailuserName });

      // Check if user exists
      if (!user) {
        return res.status(400).json({
          type: key,
          st: false,
          msg: `Enter valid ${key === 'email' ? 'email' : 'username'}`,
        });
      }

      // Check if password exists for the user
      if (!user.password) {
        console.error("User found but password is missing in the database.");
        return res.status(500).json({
          type: 'password',
          st: false,
          msg: 'Password not set for this account.',
        });
      }

      if (user.isDeleted) {
        return res.status(400).json({ type: 'ban', st: false, msg: 'Your account has been banned' });
      }

      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          type: 'password',
          st: false,
          msg: 'Enter valid password',
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

      // Send success response
      return res.status(200).json({
        type: null,
        st: true,
        msg: 'Logged in successfully',
      });
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({
        type: null,
        st: false,
        msg: 'Error logging in',
      });
    }
  },


  async loaddashboard(req, res) {
    const { email } = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      res.render('userdashboard', { user });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      res.status(500).send("Error loading dashboard");
    }
  },

  async updateProfile(req, res) {
    const { userName, email, mobileNumber } = req.body;
    const currentUserEmail = req.session.userData.email;
     console.log(userName, email, mobileNumber, currentUserEmail)
    const errors = {};

    try {
      // Check if username, email, or mobile number are already in use
      const user = await userModel.findOne({ email: currentUserEmail });

      if (!user) {
        return res.status(404).json({ st: false, msg: 'User not found' });
      }

      if (userName !== user.userName) {
        const existingUserName = await userModel.findOne({ userName });
        if (existingUserName) {
          errors.userName = 'Username is already taken';
        }
      }

      if (email !== user.email) {
        const existingEmail = await userModel.findOne({ email });
        if (existingEmail) {
          errors.email = 'Email is already taken';
        }
      }

      if (mobileNumber !== user.mobileNumber) {
        const existingMobile = await userModel.findOne({ mobileNumber });
        if (existingMobile) {
          errors.mobileNumber = 'Mobile number is already taken';
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

      return res.status(200).json({ st: true, msg: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ st: false, msg: 'Internal server error' });
    }
  },
  

  async loadmyaddress(req, res) {
    const { email } = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      const address = await addressModel.find({ userId: user._id });
      // console.log(address)
      res.render('myaddress', { user, address });
    } catch (err) {
      console.error("Error loading myaddress:", err);
      res.status(500).send("Error loading my address");
    }
  },

  async myAddAddress(req, res) {
    const { houseNumber, street, city, landmark, district, state, country, pinCode } = req.body;
    const { email } = req.session.userData
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
        pinCode
      });
      return res.status(200).json({
        type: null,
        st: true,
        msg: "Address added successfully"
      });

    } catch (err) {
      console.error("Error adding address:", err);
      res.status(500).json({
        type: "error",
        st: false,
        msg: "Error in adding address"
      });
    }
  },

  async preloadAddress(req, res) {
    const { id } = req.params;
    console.log(id)
    try {
      const address = await addressModel.findOne({_id:id})
      console.log(address)
      res.json(address);
    }
    catch (err) {
      console.error("Error loading address:", err);
    }
  },

  async myAddAddressEdit(req, res) {
    const { address_id } = req.params;
    const { houseNumber, street, city, landmark, district, state, country, pinCode } = req.body;

    console.log("Request Params ID:", address_id,req.body);

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
        },
        { new: true } // Ensures the updated document is returned
      );
     console.log(updatedAddress)
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

  loademailverify(req, res) {
    res.render('forgotpasswordemailverification');
  },

  loadforgotpassword(req, res) {
    res.render('forgotpassword');
  },

  async forgotpassword(req, res) {

    const { password } = req.body;
    console.log(password)
    const email = req.session.emailverfy;
    console.log("1----")
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("2------")
    await userModel.updateOne({ email }, { $set: { password: hashedPassword } })
    console.log("3------")
    req.session.logedIn = true;
    return res.status(200).json({
      st: true,
      msg: 'Password changed successfully',

    });

  },

  loadfotp(req, res) {
    res.render('forgetpasswordotp');
  },

  async emailverify(req, res) {
    console.log(req.body.isResend);

    try {

      if (req.body.isResend) {
        await Otp.deleteMany({ email: req.session.emailverfy });
        const email = req.session.emailverfy;
        const otp = generateOTP();
        console.log(email, otp)
        await sendOTP(email, otp);
        await Otp.create({
          email,
          otp,
          createdAt: Date.now(),
          expiresAt: otpExpire
        });
        return res.status(200).json({
          st: true,
          msg: 'OTP sent successfully',
        });
      } else {
        await Otp.deleteMany({ email: req.body.email });
        req.session.emailverfy = req.body.email;
        const user = await userModel.findOne({ email: req.body.email });
        console.log("3``````");
        if (!user) {
          return res.status(400).json({
            st: false,
            msg: 'Enter valid email',
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
          msg: 'OTP sent successfully',
        });

      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        st: false,
        msg: 'Internal server error',
      });
    }
  },
  loadban(req, res) {
    res.render('ban');
  },



  
  loadabout(req, res) {
    res.render('about');
  },
  loadcontact(req, res) {
    res.render('contact');
  },
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    })
  },
  
  async removeCartItem(req, res) {
    try {
      const { itemId } = req.body;  
      if (!itemId) {
        return res.status(400).json({ st: false, msg: 'Invalid itemId' });
      }
  
      const cart = await cartModel.findOne({ 'items._id': new mongoose.Types.ObjectId(itemId) });
      if (!cart) {
        return res.status(404).json({ st: false, msg: 'Cart not found' });
      }
  
      // Remove the item by itemId
      await cartModel.updateOne(
        { 'items._id': new mongoose.Types.ObjectId(itemId) },
        { $pull: { items: { _id: new mongoose.Types.ObjectId(itemId) } } }
      );
  
      // Recalculate the cart total
      cart.cartTotal = cart.items.reduce((total, item) => total + item.total, 0);
      await cart.save();
  
      res.status(200).json({ st: true });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({
        st: false,
        message: 'An error occurred while removing the item',
      });
    }
  },
  


  async loadcart(req, res) {
    console.log('Load cart endpoint hit');
    try {
      const { email } = req.session.userData;
      console.log(email);
      const user = await userModel.findOne({ email }).lean();
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
      console.log(cart);
  
      // If the cart doesn't exist, create an empty cart object
      if (!cart) {
        return res.render('cart', { cart: { items: [], cartTotal: 0 } });
      }
  
      // Ensure cart.items is always an array
      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }
  
      // Ensure cartTotal exists, calculate it if missing
      if (cart.cartTotal === undefined || cart.cartTotal === null) {
        cart.cartTotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
  
      console.log(cart);
      console.log('cart loaded') // For debugging
      return res.render('cart', { cart });
      
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while loading the cart');
    }
  },
  async fetchCart(req, res) {
    try {
      const { email } = req.session.userData;
      const user = await userModel.findOne({ email }).lean();
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      const cart = await cartModel.findOne({ userId: user._id }).populate('items.productId');
      if (!cart) {
        return res.status(404).json({ msg: 'Cart not found' });
      }
  
      // Ensure cart.items is always an array
      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }
  
      // Calculate cartTotal if missing
      if (cart.cartTotal === undefined || cart.cartTotal === null) {
        cart.cartTotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      }

      console.log(cart)
    
      // Return cart items and the total
      return res.status(200).json({ cart });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'An error occurred while fetching the cart' });
    }
  },
  


  async addToCart(req, res) {
    console.log('Add to cart endpoint hit');
    try {
      if (!req.session.logedIn) {
        return res.status(401).json({ val: false, msg: 'Please login first' });
      }
      const { email } = req.session.userData;
      const user = await userModel.findOne({ email });
      const { productId, productSize, color, quantity } = req.body;
  
      if (!productId || !productSize || !color || !quantity) {
        return res.status(400).json({ val: false, msg: 'All fields are required' });
      }
  
      const parsedQuantity = parseInt(quantity);
  
      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({ val: false, msg: 'Product not found' });
      }
  
      if (parsedQuantity > product.stock) {
        return res.status(400).json({ val: false, msg: 'Quantity exceeds stock' });
      }
  
      let cart = await cartModel.findOne({ userId: user._id });
      const productTotal = product.offerPrice 
        ? product.offerPrice * parsedQuantity 
        : product.price * parsedQuantity;
  
      if (cart) {
        // Find existing item in cart
        const existingItem = cart.items.find(
          (item) =>
            item.productId.toString() === productId &&
            item.size === productSize &&
            item.color === color
        );
  
        if (existingItem) {
          // Update existing item's quantity and total
          existingItem.quantity += parsedQuantity;
          const priceToUse = existingItem.offerPrice || existingItem.price;
          existingItem.total = priceToUse * existingItem.quantity;
        } else {
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
        cart.cartTotal = cart.items.reduce((total, item) => total + item.total, 0);
        console.log(cart.cartTotal)
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
  
      res.status(200).json({ val: true, msg: 'Added to cart' });
    } catch (error) {
      console.error('Error in addToCart:', error);
      res.status(500).send('An error occurred while adding to cart');
    }
  },
  
  async updateCartItemQuantity(req, res) {
    try {
      const { index, quantity } = req.body;
  
      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, msg: "Invalid quantity" });
      }
  
      const { email } = req.session.userData;
      const user = await userModel.findOne({ email }).lean();
  
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      const cart = await cartModel.findOne({ userId: user._id });
      if (!cart || !cart.items[index]) {
        return res.status(404).json({ success: false, msg: "Cart item not found" });
      }
  
      // Update quantity and item total
      const item = cart.items[index];
      const priceToUse = item.offerPrice || item.price;
      item.quantity = quantity;
      item.total = priceToUse * quantity;
  
      // Recalculate cart total
      cart.cartTotal = cart.items.reduce((total, item) => total + item.total, 0);
  
      await cart.save();
  
      res.status(200).json({
        success: true,
        cartTotal: cart.cartTotal,
        itemTotal: item.total,
      });
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      res.status(500).json({ success: false, msg: "Server error" });
    }
  },

  

  async loadcheckout(req, res) {
    res.render('checkout');
    },

}

