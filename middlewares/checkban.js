const userModel = require('../models/userModel');

let checkBan = async (req, res, next) => {
  if (req.session.logedIn) {
    const email =  req.session?.currentEmail || req.session?.userData?.email
    const user = await userModel.findOne({ email: email });
    
    console.log(user)
    if (user && user.isDeleted) {
      console.log("banned")
      return res.render('ban');
    }
    
    return next();
  }
  return next();
}

module.exports = checkBan;