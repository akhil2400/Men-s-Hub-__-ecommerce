const checkSession = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/user/login');
  } else {
    next();
  }
}

module.exports ={
  checkSession
} 