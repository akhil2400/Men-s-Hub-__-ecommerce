const passport = require('passport');

module.exports = {
  whenGoogleLogin: (req, res, next) => {
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  },

  whenGoogleCallbacks: (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: '/koii'
    }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/suii');
      }
      console.log(user)
      req.session.loggedIn = true;
      req.session.currentUsername = user.useNname;
      req.session.userData = {email:user.email,useNname:user.userName};
      req.session.currentEmail = user.email;
      return res.redirect('/home');
    })(req, res, next);
  }
};