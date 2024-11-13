const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// const {checkSession}   = require('../middlewares/auth');


router.get('/',userController.loadstartingpage);
router.get('/login',userController.loadlogin);
router.get ('/register',userController.loadregister);
router.post('/register', userController.registerUser); 
router.post('/login', userController.loginUser);
router.get('/home', userController.loadhome);
router.get('/otp-verify', userController.loadotp); 
router.get('/dashboard', userController.loaddashboard)
router.get('/forgotpasswordemailverification',userController.loademailverify)
router.post('/forgotpasswordemailverification',userController.emailverify)
router.get('/forgotpassword',userController.loadforgotpassword)
router.post('/forgotpassword',userController.forgotpassword)
router.get('/fotp-verify',userController.loadfotp)
router.get('/ban',userController.loadban)
router.get('/shop',userController.shopPageLoad)
router.get('/productDetails/:id',userController.productDetails)

router.get('/about',userController.loadabout)
router.get('/contact',userController.loadcontact)





module.exports = router;
