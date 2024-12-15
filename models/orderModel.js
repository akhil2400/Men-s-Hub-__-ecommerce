const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      // name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      // offerPrice: { type: Number ,required: true},
      
    },
  ],
  status: { type: String, default: 'Pending', enum:['Return Requested','Return Approved','Return Rejected','Pending','Delivered','Cancelled'] },
  deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'razorpay'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  returnReason:{type: String,default:null}
},{timestamps:true});

module.exports = mongoose.model('Order', orderSchema);
