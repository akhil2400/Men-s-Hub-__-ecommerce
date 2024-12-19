const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  mobileNumber: { type: String },
  gender: { type: String },
  role: { type: String, default: "user" },
  isDeleted: { type: Boolean, default: false },
  isGoogleLogin: { type: Boolean, default: false },
  googleId: { type: String },
},{timestamps:true});


module.exports = mongoose.model('User', userSchema);
