const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Category", "Product"], required: true },
    categoryOrProduct: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "type",
      required: true,
    },
    discountType: { type: String, enum: ["Percentage", "Fixed Amount"], required: false },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["Active", "Inactive", "Scheduled"], default: "Scheduled" },
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);