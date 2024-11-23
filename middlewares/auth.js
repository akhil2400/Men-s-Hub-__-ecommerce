let authCheck = (req, res, next) => {
    console.log(req.session);
    // console.log("authCheck Middleware: ", req.url);

    if (['/home', '/dashboard', '/wishlist', '/cart'].includes(req.url)) {
        if (!req.session.logedIn) {
            // console.log("Redirecting to /register from authCheck");
            return res.redirect('/register');
        }
        return next();
    } else if (['/register', '/login'].includes(req.url)) {
        if (req.session.logedIn) {
            // console.log("Redirecting to / from authCheck");
            return res.redirect('/home');
        }
        return next();
    }
    return next();
};

module.exports = authCheck;