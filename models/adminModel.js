const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin',  // Default role for this schema will be 'admin'
    enum: ['admin']    // Restrict to only 'admin' role in this case
  }
});

module.exports = mongoose.model("Admin", adminSchema);
