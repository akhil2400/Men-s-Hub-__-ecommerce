const express = require('express')
const bcrypt = require('bcrypt');
const Otp = require('../models/otpModel');
const userModel = require('../models/userModel');


module.exports = {

async loadlogin(req, res) {
    res.render('login');
  },

  async loadregister(req, res) {
    res.render('register');
  },

async loadhome(req, res) {
    res.render('home');
  },

  async registerUser(req, res) {
    const { otp } = req.body;
    const { userName, email, password, mobileNumber, gender } = req.session.userData;
    try {
      console.log('1')
      console.log('2')
      const otpData = await Otp.findOne({email});
      console.log(otpData.otp);
      console.log(otp);
      console.log('3')
      if(!otpData){
        console.log('4')
        return res.status(400).json({
          st: false,
          msg: 'Enter valid OTP',
        });
      }
      console.log('5')

      if(otpData.otp !== otp){
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
      if(emailuserName.includes('@')){
        user = await userModel.findOne({ email: emailuserName });
        key = 'email';
      }else{
        user = await userModel.findOne({ userName: emailuserName });
        key = 'userName';
      }
      
      if(key === 'email' && !user) {
        return res.status(400).json({
          type: 'email',
          st: false,
          msg: 'Enter valid email',
        });
      }else if(key === 'userName' && !user) {
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
      req.session.userData ={
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

}


