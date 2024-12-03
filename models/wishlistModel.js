const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // To track which user owns the wishlist
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true }, // Referencing the product
  name: { type: String, required: true }, // Product name for quick access
  price: { type: Number, required: true },
  image: { type: String, required: true },
}, { timestamps: true }); // For created/updated timestamps

 module.exports = mongoose.model('Wishlist', wishlistSchema);

