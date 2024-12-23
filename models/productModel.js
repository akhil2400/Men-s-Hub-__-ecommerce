const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number },
  previousOfferPrice: { type: Number }, // New field to store old offer price
  offerPercentage: { type: Number },   // New field to store discount percentage
  images: [{ type: String }],
  tags: [{ type: String }],
  variants: [{ 
    size: { type: String },
    stock: { type: Number },
  }],
  totalStock: { type: Number, default: 0 },
  colors: [{ type: String }],
  category: { type: mongoose.Schema.ObjectId, ref: 'Category' },
  brand: { type: String },
  cashOnDelivery: { type: Boolean },
  warranty: { type: String },
  returnPolicy: { type: String },
  rating: { type: Number, default: 0 },
  returnReason: { type: String, default: null },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      rating: { type: Number, required: true },
      comment: { type: String },
    },
  ],
  isDeleted: { type: Boolean, default: false },
},{timestamps:true});
const Product = mongoose.model('Product', productSchema);

module.exports = Product;