const express = require('express');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const path = require('path');
const mongoose = require('mongoose');
const adminModel = require('../models/adminModel');


module.exports = {

  async loadadminlogin(req, res) {
    res.render('adminlogin');
  },

  async adminLogin(req, res) {
    const { username, password } = req.body;

    try {
      // Find the admin by username
      const admin = await adminModel.findOne({ username });

      if (!admin) {
        // Return error if admin doesn't exist
        return res.status(400).json({ val: false, msg: "Admin not found" });
      }

      // Compare the entered password with the stored hash
      const isMatch = await bcrypt.compare(password, admin.password);

      if (isMatch) {
        // If the password matches, send a success response (no redirect)
        return res.status(200).json({ val: true, msg: 'Login successful' });
      } else {
        // If the password doesn't match, send an error message
        return res.status(400).json({ val: false, msg: 'Invalid password' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ val: false, msg: 'Internal Server Error' });
    }
  },


  async loadusermanagement(req, res) {
    try {
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = 6; // Number of users per page
      const skip = (page - 1) * limit;
  
      // Count total users for pagination
      const totalUsers = await userModel.countDocuments({});
      const totalPages = Math.ceil(totalUsers / limit);
  
      // Fetch paginated users
      const users = await userModel.find({})
        .skip(skip)
        .limit(limit).sort({ createdAt: -1 });
  
      console.log(users);
  
      if (!users || users.length === 0) {
        return res.status(200).render('usermanagement', { 
          msg: 'No users found', 
          user: [], 
          currentPage: page, 
          totalPages: totalPages 
        });
      }
  
      return res.status(200).render('usermanagement', { 
        user: users, 
        currentPage: page, 
        totalPages: totalPages 
      });
    } catch (err) {
      console.log(err);
      return res.status(500).render('usermanagement', { msg: 'Error loading users' });
    }
  },
  

  async banuser(req, res) {
    console.log("23445---")
    const { id, val } = req.query;
    try {
      console.log(id, val)
      if (val === "Ban") {
        await userModel.updateOne({ _id: id }, { isDeleted: true });
      } else {
        await userModel.updateOne({ _id: id }, { isDeleted: false });
      }
      res.status(200).json({ val: true });
    } catch (err) {
      res.status(500).json({ val: false });
    }
  },

  async viewUser(req, res) {
    try {
      const { email } = req.query;
      const user = await userModel.findOne({ email: email });

      if (!user) {
        return res.status(400).json({ val: false, msg: "User not found" });
      }

      res.status(200).json({
        username: user.userName,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        createdAt: user.createdAt.toISOString().split("T")[0],
      });

    } catch (err) {
      console.error("Error fetching user:", err);  // Log the error for debugging
      res.status(500).json({ val: false, msg: "Internal server error" });
    }
  },

 
  

}