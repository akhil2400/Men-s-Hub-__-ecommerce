const userModel = require('../models/userModel');

let checkBan = async (req, res, next) => {
  console.log("checking ban");
  console.log(req.session.userData , req.session.logedIn)
  if (req.session.logedIn) {
    console.log("current email exist")
    const email =  req.session?.currentEmail || req.session?.userData?.email
    const user = await userModel.findOne({ email: email });
    console.log("user is")
    console.log(user)
    if (user && user.isDeleted) {
      console.log("banned")
      return res.render('ban');
    }
    console.log("here")
    return next();
  }
  console.log("hasdfahksdflk")
  return next();
}

module.exports = checkBan;