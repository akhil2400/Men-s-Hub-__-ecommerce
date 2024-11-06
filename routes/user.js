const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require("../models/userModel");

router.get('/login',userController.loadlogin);
router.get ('/register',userController.loadregister);
router.post('/register', userController.registerUser); 
router.post('/login', userController.loginUser);
router.get('/home', userController.loadhome);
router.get('/otp-verify', userController.loadotp); 
router.get('/dashboard', userController.loaddashboard)
router.get('/forgotpasswordemailverification',userController.loademailverify)
router.get('/forgotpassword',userController.loadforgotpassword)

module.exports = router;
