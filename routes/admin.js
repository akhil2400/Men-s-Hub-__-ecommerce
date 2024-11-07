const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get("/admin/usermanagement",adminController.loadusermanagement);
router.get("/admin/users/ban",adminController.banuser);
router.get("/admin/categorymanagement",adminController.loadcategorymanagement);
module.exports = router;