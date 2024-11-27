const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const noCache = require('../middlewares/noCache');
const productController = require('../controllers/productController');


router.get('/',noCache,userController.loadstartingpage);
router.get('/login',noCache,userController.loadlogin);
router.get ('/register',noCache,userController.loadregister);
router.post('/register', userController.registerUser); 
router.post('/login', userController.loginUser);
router.get('/home',noCache, userController.loadhome);
router.get('/otp-verify', noCache ,userController.loadotp); 
router.get('/dashboard', userController.loaddashboard)
router.put('/dashboard/update', userController.updateProfile);
router.get('/my-address',userController.loadmyaddress)
router.post('/my-address',userController.myAddAddress)
router.get('/my-address-edit/:id',userController.preloadAddress)
router.put('/my-address-edit/:address_id', userController.myAddAddressEdit);
router.get('/forgotpasswordemailverification',userController.loademailverify)
router.post('/forgotpasswordemailverification',userController.emailverify)
router.get('/forgotpassword',noCache,userController.loadforgotpassword)
router.post('/forgotpassword',userController.forgotpassword)
router.get('/fotp-verify',noCache,userController.loadfotp)
router.get('/ban',userController.loadban)
router.get('/shop',productController.shopPageLoad)
router.get('/productDetails/:id',productController.productDetails)
router.get('/logout',userController.logout)
router.get('/about',userController.loadabout)
router.get('/contact',userController.loadcontact)
router.get('/cart',userController.loadcart)
router.post('/add-to-cart',userController.addToCart)
router.delete('/cart/remove', userController.removeCartItem);





module.exports = router;
