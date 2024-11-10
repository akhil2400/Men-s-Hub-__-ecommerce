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
      console.log('Hiiiii')
      if (err) {
        return next(err);
      }
      console.log('dhhdh')
      console.log("User:", user)
      if (!user) {
        return res.redirect('/suii');
      }
      console.log("User:", user)
      req.session.logedIn = true;
      req.session.currentUsername = user.userName;
      req.session.userData = {email:user.email,useNname:user.userName};
      req.session.currentEmail = user.email;
      return res.redirect('/home');
    })(req, res, next);
  }
};