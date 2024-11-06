const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get("/admin/usermanagement",adminController.loadusermanagement);


module.exports = router;