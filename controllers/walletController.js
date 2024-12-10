const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const path = require("path");
const mongoose = require("mongoose");
const couponModel = require("../models/couponModel");

module.exports = {
  async loadWallet(req,res){
    const { email } = req.session.userData;
    const user = await userModel.findOne({ email });

    const walletData = {
      holderName: "Akhil",
      cardLastDigits: "9667",
      balance: "4,322.89",
      transactions: [
        { id: 1, amount: "Rs. 499.90", type: "Debit", date: "12/05/2024" },
        { id: 2, amount: "Rs. 549.90", type: "EMI", date: "06/05/2024" },
        { id: 3, amount: "Rs. 200.00", type: "EMI", date: "05/02/2024" },
        { id: 4, amount: "Rs. 149.90", type: "Debit", date: "20/12/2023" },
      ],
    };

    // Render the wallet view with user and wallet data
    res.render("wallet", { user, walletData });
  },
  }

