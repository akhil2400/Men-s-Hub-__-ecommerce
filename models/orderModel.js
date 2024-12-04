const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  status: { type: String, default: 'Pending' }, // Order status, e.g., Pending, Shipped, Delivered
  deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true }, // Reference to Address model
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cod', 'razorpay'], required: true }, // Added payment method field
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' }, // Payment status
  razorpayOrderId: { type: String }, // Razorpay order ID, to be populated when using Razorpay
  razorpayPaymentId: { type: String }, // Razorpay payment ID, if payment is successful
  razorpaySignature: { type: String }, // Razorpay payment signature, to verify payment
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
