const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');

router.get('/auth/google', authController.whenGoogleLogin);
router.get('/auth/google/callback', authController.whenGoogleCallbacks);
module.exports = router