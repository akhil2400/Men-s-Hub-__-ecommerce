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
    const { otp } = req.body;
    console.log("otp1:",otp)
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

      if(user.isDeleted){
        return res.status(400).json({type:'ban',st:false,msg:'Your account has been banned'});
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
    const {email} = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      res.render('userdashboard', { user });
    } catch (err) {
      console.error("Error loading dashboard:", err);
      res.status(500).send("Error loading dashboard");
    }
  },

  async loadmyaddress(req, res) {
    const {email} = req.session.userData;
    try {
      const user = await userModel.findOne({ email });
      const address = await addressModel.find({ userId: user._id });
      console.log(address)
      res.render('myaddress', { user,address });
    } catch (err) {
      console.error("Error loading myaddress:", err);
      res.status(500).send("Error loading my address");
    }
  },

  async myAddAddress(req, res) {
    const {houseNumber,street,city,landmark,district,state,country,pinCode} = req.body;
    const {email}=req.session.userData
  try{
    const user = await userModel.findOne({email});
    await addressModel.create({
      userId:user._id,
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
      msg:"Address added successfully"
      }); 
  
  } catch (err) {
      console.error("Error adding address:", err);
      res.status(500).json({
        type: "error",
        st: false,
        msg:"Error in adding address"
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

  updateCartItem(req, res) {
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
    console.log('dggd')
    try {
      const {email} = req.session.userData;
      console.log(email)
      const user = await userModel.findOne({email}).lean();

      console.log(user)

      const cart = await cartModel.findOne({ userId:user._id }).populate('items.productId');
      console.log(cart)
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
    console.log('Add to cart endpoint hit');
    try {
      if (!req.session.logedIn) {
        return res.status(401).json({val:false,msg:'Please login first'});
      }
      const { email } = req.session.userData;
      const user = await userModel.findOne({ email });
      console.log(email)
      const { productId, productSize,color, quantity } = req.body;
      console.log(productId, productSize,color, quantity)
      if (!productId || !productSize || !color || !quantity) {
        return res.status(400).json({val:false,msg:'All fields are required'});
      }

      const parsedQuantity = parseInt(quantity);

      const product = await productModel.findById(productId);
      if (!product) {
        return res.status(404).json({val:false,msg:'Product not found'});
      }

      if(parsedQuantity>product.stock){
        return res.status(400).json({val:false,msg:'Quantity exceeds stock'});
      }

      let cart = await cartModel.findOne({ userId: user._id });
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
            size:productSize,
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
              size: productSize,
              color: color,
              total: productTotal,
            },
          ],
          cartTotal: productTotal,
        });
      }

      res.status(200).json({val:true,msg:'Added to cart'});
    } catch (error) {
      console.error('Error in addToCart:', error);
      res.status(500).send('An error occurred while adding to cart');
    }
  },

}

