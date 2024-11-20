const express = require('express')
const bcrypt = require('bcrypt');
const Otp = require('../models/otpModel');
const userModel = require('../models/userModel');
const { generateOTP, otpExpire } = require('../utils/otpGenerator');
const { sendOTP } = require('../utils/mailSender');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const cartModel = require('../models/cartModel');




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
    console.log('shsh')
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
    const { otp } = req.body;
    const { userName, email, password, mobileNumber, gender } = req.session.userData;
    try {
      console.log('1')
      console.log('2')
      const otpData = await Otp.findOne({ email });
      console.log(otpData.otp);
      console.log(otp);
      console.log('3')
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




  loaddashboard(req, res) {
    res.render('userdashboard');
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
  async shopPageLoad(req, res) {
    try {
      if (req.query.category) {
        const cat = await categoryModel.findOne({ name: req.query.category });
        const products = await productModel.find({ category: cat._id, isDeleted: false  });
        return res.status(200).render("shop", { products });
      } else {
        const product = await productModel.find({ isDeleted: false });
        return res.status(200).render("shop", { products: product });
      }
    } catch (err) {
      console.log(err);
    }
  },

  // Route for product details page
  async productDetails(req, res) {
    try {
      const { id: productId } = req.params;
      console.log('Fetching product details for ID:', productId);
  
      // Fetch product from the database
      const product = await productModel.findById(productId).lean();
      if (!product || product.isDeleted) {
        return res.status(404).render("productDetails", { msg: "Product not found" });
      }
  
      // Fetch related products (example logic based on category)
      const relatedProducts = await productModel.find({
        category: product.category,
        _id: { $ne: productId } // Exclude the current product
      }).limit(4).lean(); // Adjust the limit as per your need
  
      return res.status(200).render("productDetails", { product, relatedProducts });
    } catch (err) {
      console.error('Error loading product details:', err.stack);
      res.status(500).render("productDetails", { msg: "Error loading product details" });
    }
  },
  
  updateCartItem  (req, res) {
    const { index, quantity } = req.body;
  
    if (req.session.cart && req.session.cart[index]) {
      const item = req.session.cart[index];
      
      if (quantity > 0) {
        item.quantity = quantity; // Update the quantity
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ success: false, message: 'Invalid quantity' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
  },
   removeCartItem(req, res) {
    const { index } = req.body;
  
    if (req.session.cart && req.session.cart[index]) {
      req.session.cart.splice(index, 1); // Remove the item from cart
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
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


async loadcart(req, res) {
  try {
    const userId = req.session.userId; 

    
    const cart = await cartModel.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.render('cart', { cart: { items: [], cartTotal: 0 } });
    }

    res.render('cart', { cart });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while loading the cart');
  } 
},


async addToCart(req, res) {
  console.log('dduhdhdjd')
  console.log('Add to cart endpoint hit');
  try {
    if (!req.session.logedIn) {
      return res.status(401).send('User not authenticated');
    }
    const {email} = req.session.userData ;
    const user = await userModel.findOne({ email });
    console.log(email)
    const { productId, productSize, quantity } = req.body;
    console.log(productId, productSize, quantity)
    if (!productId || !productSize || !quantity) {
      return res.status(400).send('All fields are required');
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).send('Invalid quantity');
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    let cart = await cartModel.findOne({ userId:user._id });
    const productTotal = product.price * parsedQuantity;

    if (cart) {
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItem) {
        existingItem.quantity += parsedQuantity;
        existingItem.total += productTotal;
      } else {
        cart.items.push({
          productId,
          quantity: parsedQuantity,
          price: product.price,
          size,
          color,
          total: productTotal,
        });
      }

      cart.cartTotal += productTotal;
      await cart.save();
    } else {
      await cartModel.create({
        userId: user._id,
        items: [
          {
            productId,
            quantity: parsedQuantity,
            price: product.price,
            size:'Z',
            color:'blue',
            total: productTotal,
          },
        ],
        cartTotal: productTotal,
      });
    }

    res.status(200).redirect('/cart');
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).send('An error occurred while adding to cart');
  }
},

}

