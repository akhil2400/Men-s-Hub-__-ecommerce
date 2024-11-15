const userModel = require('../models/userModel');

let checkBan = async (req, res, next) => {
  if (req.session.logedIn) {
    const user = await userModel.findOne({ email: req.session.currentEmail });
    if (user && user.isDeleted) {
      return res.render('ban');
    }
    return next();
  }
  return next();
}

module.exports = checkBan;