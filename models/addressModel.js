const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId:{type:String, required: true},
  houseNumber: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true},
  landmark: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  pinCode: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Address", addressSchema)