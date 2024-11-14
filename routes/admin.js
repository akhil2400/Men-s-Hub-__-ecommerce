const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../utils/multer');
const isAuthenticated = require('../middlewares/adminauth');  // Import middleware

router.get("/admin", adminController.loadadminlogin);
router.post("/admin", adminController.adminLogin);
router.get("/admin/usermanagement", adminController.loadusermanagement);
router.get("/admin/users/ban", adminController.banuser);
router.get("/admin/categorymanagement", adminController.loadcategorymanagement);
router.post('/admin/category/add', upload.single('categoryImage'), adminController.categoryAdd);
router.get('/admin/category/unlist', adminController.categoryUnlist);
router.get('/admin/products', adminController.productsPageLoad);
router.post('/admin/products/add', upload.fields([
  { name: 'productImage1', maxCount: 1 },
  { name: 'productImage2', maxCount: 1 },
  { name: 'productImage3', maxCount: 1 },
  { name: 'productImage4', maxCount: 1 },
  { name: 'productImage5', maxCount: 1 }
]), adminController.productsAdd);
router.get('/admin/products/unlist', adminController.productUnlist);
router.get('/admin/users/view', adminController.viewUser);
router.get('/admin/category/update/:id', adminController.loadupdatecategory);
router.put('/admin/category/update/:id', adminController.updateCategory);
router.get('/admin/Product/update/:id', adminController.loadupdateProducts);
router.put('/admin/products/update/:id', upload.fields([
  { name: 'productImage1', maxCount: 1 },
  { name: 'productImage2', maxCount: 1 },
  { name: 'productImage3', maxCount: 1 },
  { name: 'productImage4', maxCount: 1 },
  { name: 'productImage5', maxCount: 1 }
]), adminController.updateProduct);

module.exports = router;
