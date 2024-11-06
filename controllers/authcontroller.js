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
      console.log('Hii')
      req.session.loggedIn = true;
      req.session.currentUsername = user.username;
      req.session.currentEmail = user.email;
      return res.redirect('/home');
    })(req, res, next);
  }
};