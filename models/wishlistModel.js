const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // To track which user owns the wishlist
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true }, // Referencing the product
  productName: { type: String, required: true }, // Product name for quick access
  productPrice: { type: Number, required: true }, // Product price
}, { timestamps: true }); // For created/updated timestamps

module.exports = mongoose.model('Wishlist', wishlistSchema);
