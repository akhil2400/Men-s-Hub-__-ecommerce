const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
    offerPrice: { type: Number },
    size: { type: String, required: true },
    color: { type: String },
    total: { type: Number, required: true }
  }],
  cartTotal: { type: Number, default: 0 },
},{timestamps:true});

module.exports = mongoose.model('Cart', cartSchema);