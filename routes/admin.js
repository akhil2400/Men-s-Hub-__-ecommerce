const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../utils/multer');


router.get("/admin/usermanagement",adminController.loadusermanagement);
router.get("/admin/users/ban",adminController.banuser);
router.get("/admin/categorymanagement",adminController.loadcategorymanagement);
// router.get("/admin/productmanagement",adminController.loadproductmanagement);
router.post('/admin/category/add',upload.single('categoryImage'),adminController.categoryAdd);
router.get('/admin/category/unlist', adminController.categoryUnlist); 
router.get('/admin/products',adminController.productsPageLoad);
router.post('/admin/products/add', upload.fields([
    { name: 'productImage1', maxCount: 1 },
    { name: 'productImage2', maxCount: 1 },
    { name: 'productImage3', maxCount: 1 },
    { name: 'productImage4', maxCount: 1 },
    { name: 'productImage5', maxCount: 1 }
  ]), adminController.productsAdd);
router.get('/admin/products/unlist', adminController.productUnlist);
module.exports = router;