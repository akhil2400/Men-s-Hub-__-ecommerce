const express = require("express");
const userModel = require("../models/userModel");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const cartModel = require("../models/cartModel");
const path = require("path");
const mongoose = require("mongoose");
const couponModel = require("../models/couponModel");
const walletModel = require('../models/walletModel')

module.exports = {
  async loadWallet(req, res) {
    const { email } = req.session.userData;
  
    
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
  
    
    const wallet = await walletModel.findOne({ userId: user._id });
  
    const walletData = wallet
      ? {
          holderName: user.name || "User",
          cardLastDigits: "9667", 
          balance: `Rs. ${wallet.balance.toFixed(2)}`,
          transactions: wallet.transactions.map((transaction, index) => ({
            id: index + 1,
            amount: `Rs. ${transaction.amount.toFixed(2)}`,
            type: transaction.type,
            date: transaction.date.toLocaleDateString(),
          })),
        }
      : {
          holderName: user.name || "User",
          cardLastDigits: "9667",
          balance: "Rs. 0.00",
          transactions: [],
        };
  
    res.render("wallet", { user, walletData });
  },
  
  }

