const referralController = require('../controllers/referralController');
const express = require('express');
const router = express.Router();

router.get('/referral', referralController.renderReferral);

module.exports = router;