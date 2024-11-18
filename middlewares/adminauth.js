const userModal = require('../models/userModel');

let roleCheck = async (req, res, next) => {
    const adminRoutes = [
        '/admin/products',
        '/admin/usermanagement',
        '/admin/categorymanagement',
        '/admin/dashboard',
        '/admin/coupens',
        '/admin/orders',
        '/admin/Product/update/:id'

    ];
    if (adminRoutes.includes(req.url)) {
        if (!req.session.logedIn) {
            console.log("User not logged in. Redirecting to login page.");
            return res.redirect('/register');  
        }
        const email = req.session.currentEmail;
        const user = await userModal.findOne({ email });
        if (user.role !== "admin") {
            console.log("User does not have admin privileges. Redirecting to unauthorized page.");
            return res.redirect('/home'); 
        }
    }

    return next();
};

module.exports = roleCheck;