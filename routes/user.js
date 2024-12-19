const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const noCache = require('../middlewares/noCache');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const walletController = require('../controllers/walletController')
const wishlistController = require("../controllers/wishlistController")


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
router.delete('/my-address/:addressId', userController.removeAddress);
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
router.get('/fetch-cart',userController.fetchCart);
router.post('/add-to-cart',userController.addToCart)
router.delete('/cart/remove', userController.removeCartItem);
router.post ('/update-cart', userController.updateCartItemQuantity);
router.get('/thankyou',userController.loadthankyou)
router.post('/place-order', userController.placeOrder);

router.post('/place-order-razorpay', userController.placeOrderRazorpay);

// Route for verifying Razorpay payment
router.post('/verify-razorpay-payment', userController.verifyRazorpayPayment);

router.get('/orders',orderController.loadorders)
router.get('/order/details/:id', orderController.viewOrderDetails);
router.post('/cancel-order/:id',orderController.cancelOrder)
// router.get('/checkout',userController.loadcheckout)
router.get('/search',userController.loadsearch)
router.get('/wishlist',wishlistController.loadwishlist)
router.post('/addToWishlist', wishlistController.addToWishlist);
router.delete('/removeFromWishlist/:id', wishlistController.removeFromWishlist);
// router.post("/wishlist/addToCart/:productId",wishlistController.addToCartFromWishlist)
router.post('/apply-coupon/:userId',couponController.applycoupon)
router.post('/checkout', userController.processCheckout);
router.get('/wallet',walletController.loadWallet)
router.post("/initiate-return", orderController.initiateReturn);
router.post("/save-return-reason", orderController.saveReturnReason);
// router.post("/initiate-individual-return/:id", orderController.initiateIndividualReturn);
// router.put("/handle-return/:productId", orderController.handleReturn);
router.get('/get-addresses', userController.getAddresses);
module.exports = router;
