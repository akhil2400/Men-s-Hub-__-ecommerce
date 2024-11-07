const express = require('express')
const bcrypt = require('bcrypt');
const Otp = require('../models/otpModel');
const userModel = require('../models/userModel');
const { generateOTP, otpExpire } = require('../utils/otpGenerator');
const { sendOTP } = require('../utils/mailSender');


module.exports = {

  loadstartingpage(req, res) {
    res.render('starting');
  },

  async loadlogin(req, res) {
    res.render('login');
  },

  async loadregister(req, res) {
    res.render('register');
  },

  async loadhome(req, res) {
    if (!req.session.logedIn) {
      return res.render('home', { user: null });
    } else {
      const email = req.session.emailverfy;
      res.render('home', { user: email });
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

      let user;
      let key = '';
      if (emailuserName.includes('@')) {
        user = await userModel.findOne({ email: emailuserName });
        key = 'email';
      } else {
        user = await userModel.findOne({ userName: emailuserName });
        key = 'userName';
      }

      if (key === 'email' && !user) {
        return res.status(400).json({
          type: 'email',
          st: false,
          msg: 'Enter valid email',
        });
      } else if (key === 'userName' && !user) {
        return res.status(400).json({
          type: 'username',
          st: false,
          msg: 'Enter valid username',
        })
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          type: 'password',
          st: false,
          msg: 'Enter valid password',
        });
      }
      req.session.userData = {
        userName: user.userName,
        email: user.email,
        password: user.password,
        mobileNumber: user.mobileNumber,
        gender: user.gender
      }
      req.session.logedIn = true;
      return res.status(200).json({
        type: null,
        st: true,
        msg: 'Logged in successfully',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
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

  loadshop(req, res) {
    res.render('shop');
  },
  
}

