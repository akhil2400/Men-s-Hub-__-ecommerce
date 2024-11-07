const userModel = require('../models/userModel');

let checkBan = async (req, res, next) => {
  console.log(req.session);
  if (req.session.loggedIn) {
    const session = req.session.userData;
    console.log(session.email);
    const user = await userModel.findOne({ email:session.email });
    if (user.isDeleted) {
      return res.render('ban');
    }
    return next()
  }
  next();
}

module.exports = { checkBan }