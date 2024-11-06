const express = require('express');
const otpController = require('../controllers/otpController');
const router = express.Router();

router.post('/register/request-otp', otpController.requestOtp);

module.exports = router;