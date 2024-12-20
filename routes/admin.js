const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const upload = require('../utils/multer');
const isAuthenticated = require('../middlewares/adminauth');  // Import middleware
const productModel = require('../models/productModel');

router.get("/admin", adminController.loadadminlogin);
router.post("/admin", adminController.adminLogin);
router.get("/admin/usermanagement", adminController.loadusermanagement);
router.get("/admin/users/ban", adminController.banuser);
router.get("/admin/categorymanagement", categoryController.loadcategorymanagement);
router.post('/admin/category/add', upload.single('categoryImage'), categoryController.categoryAdd);
router.get('/admin/category/unlist', categoryController.categoryUnlist);
router.get('/admin/products', productController.productsPageLoad);
router.post('/admin/products/add', upload.fields([
  { name: 'productImage1', maxCount: 1 },
  { name: 'productImage2', maxCount: 1 },
  { name: 'productImage3', maxCount: 1 },
  { name: 'productImage4', maxCount: 1 },
  // { name: 'productImage5', maxCount: 1 }
]), productController.productsAdd);
router.get('/admin/products/unlist', productController.productUnlist);
router.get('/admin/users/view', adminController.viewUser);
router.get('/admin/category/update/:id', categoryController.loadupdatecategory);
router.post('/update-category-image/:categoryId',upload.single('categoryImage'),categoryController.categoryImageUpdate);
router.post('/admin/category/update/:categoryId', categoryController.updateCategory);
router.get('/admin/Product/update/:id', productController.loadupdateProducts);
router.put('/admin/products/update/:productId', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 },
  // { name: 'image5', maxCount: 1 }
]), productController.updateProduct);
router.post('/update-product-image/:productId',upload.single('productImage'),productController.productImageUpdate);
router.get('/admin/ordermanagement', orderController.loadordermanagement);
router.post('/admin/order/:orderid/updatestatus',orderController.updateOrderStatus)
router.get('/admin/vieworder/:orderid',orderController.loadorderdetails);


module.exports = router;
