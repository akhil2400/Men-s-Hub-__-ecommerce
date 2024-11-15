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
      const users = await userModel.find({});
      console.log(users)
      if (!users) {
        return res.status(200).render('usermanagement', { msg: 'No users found' });
      }
      return res.status(200).render('usermanagement', { user: users });
    } catch (err) {
      console.log(err)
    }
    res.render('usermanagement.');

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


  async loadcategorymanagement(req, res) {
    console.log('dhhd')
    try {
      const categories = await categoryModel.find({});
      console.log(categories)
      if (!categories) {
        return res.status(200).render('category', {
          category: null,
        });
      }
      return res.status(200).render('category', {
        category: categories,
      });
    } catch (err) {
      console.log(err);
      res.status(500).render('category', {
        category: null,
      });
    }
  },

  async productsPageLoad(req, res) {
    try {
      const category = await categoryModel.find({});
      const products = await productModel.find({});

      return res.status(200).render("products", {
        val: products.length > 0,
        msg: products.length ? null : "No products found",
        products,
        category,
      });
    } catch (err) {
      console.log(err);
      res.status(500).render("products", {
        val: false,
        msg: "Error loading products",
        products: null,
        category: null,
      });
    }
  },
  async productsAdd(req, res) {
    let {
      name,
      description,
      category,
      tags,
      brand,
      price,
      colors,
      sizes,
      cashOnDelivery,
      offerPrice,
      stock,
      warranty,
      returnPolicy,
    } = req.body;

    price = Number(price);
    offerPrice = Number(offerPrice);
    stock = Number(stock);
    cashOnDelivery = cashOnDelivery === "true";
    offerPrice = offerPrice === NaN ? 0 : offerPrice;

    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ val: false, msg: "No files were uploaded" });
      }
      const categoryObject = await categoryModel.findOne({ name: category });
      if (!categoryObject) {
        return res.status(400).json({ val: false, msg: "Category not found" });
      }
      const imagePaths = [];
      for (const key in req.files) {
        req.files[key].forEach((file) => {
          imagePaths.push(
            path.relative(path.join(__dirname, "..", "public"), file.path)
          );
        });
      }

      console.log(imagePaths);
      console.log(warranty);
      await productModel.create({
        name,
        description,
        price,
        offerPrice: offerPrice,
        stock,
        category: categoryObject._id,
        images: imagePaths,
        colors: colors.split(",").filter(Boolean),
        sizes: sizes.split(","),
        brand,
        tags: tags.split("#").filter(Boolean),
        cashOnDelivery,
        warranty,
        returnPolicy,
      });
      res.status(200).json({ val: true, msg: "Upload successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ val: false, msg: "Internal server error" });
    }
  },
  async productUnlist(req, res) {
    const { id, val } = req.query;
    try {
      if (val === "Unlist") {
        await productModel.updateOne({ _id: id }, { isDeleted: true });
      } else {
        await productModel.updateOne({ _id: id }, { isDeleted: false });
      }
      res.status(200).json({ val: true });
    } catch (err) {
      res.status(500).json({ val: false });
    }
  },

  async categoryAdd(req, res) {
    const { categoryName } = req.body;
    try {
      console.log('1')
      const imagePath = path.relative(path.join(__dirname, '..', 'public'), req.file.path);
      console.log(imagePath);
      await categoryModel.create({ name: categoryName, image: imagePath })
      console.log('2')
      res.status(200).json({ val: true, msg: 'Category added successfully' });
    } catch (err) {
      console.log(err)
      res.status(200).json({ val: false, msg: 'Category add failed' });
    }
  },
  async categoryUnlist(req, res) {
    const { id, val } = req.query;
    console.log(id)
    console.log(val)
    try {
      if (val === "Unlist") {
        await categoryModel.updateOne({ _id: id }, { isDeleted: true });
      } else {
        await categoryModel.updateOne({ _id: id }, { isDeleted: false });
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


  async loadupdatecategory(req, res) {
    console.log('not  in')
    const categoryId = req.params.id;
    try {
      const category = await categoryModel.findById(categoryId);
      if (!category) {
        return res.redirect("/admin/categorymanagement")
      } res.render('updatecategory', { category: category });
    } catch (error) {
      console.log(error);
    }
  },



  async updateCategory(req, res) {

    const categoryId = req.params.id;
    const { categoryname, categoryimage } = req.body;
    console.log(req.body)

    try {
      const category = await categoryModel.findById(categoryId);
      console.log(category)
      if (!category) {
        return res.status(404).json({ val: false, msg: "Category not found" });
      }
      category.name = categoryname
      category.image = categoryimage
      category.updatedAt = new Date();

      await category.save();
      return res.status(200).json({ val: true, msg: "Category updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ val: false, msg: "Internal server error" });
    }

  },

  async loadupdateProducts(req, res) {
    console.log("Yes you are here")
    const productId = req.params.id;

    try {
      const category = await categoryModel.find({});
      const products = await productModel.findById(productId)
      res.status(200).render('updateProducts', { products, category });
    } catch (error) {
      console.log(error);
    }


  },

  async updateProduct(req, res) {
    console.log('Starting updateProduct');
    
    try {
      const { productId } = req.params;
      const { name, description, category, price, offerPrice, stock, warranty, returnPolicy } = req.body;
      console.log('Received productId:', productId);
  
      const imgArr = [];
  
      // Check if images are uploaded
      if (!req.files || req.files.length === 0) {
        console.log("No images uploaded");
        return res.status(400).json({ val: false, msg: "Please select all images" });
      }
  
      // Process image paths
      for (let i = 0; i < req.files.length; i++) {
        const imagePath = path.relative(path.join(__dirname, '..', 'public'), req.files[i].path);
        imgArr.push(imagePath);
      }
  
      console.log('Image paths:', imgArr);
  
      // Check if product exists
      const product = await productModel.findOne({ _id: productId });
      if (!product) {
        console.log("Product not found");
        return res.status(200).json({ val: false, msg: "Product not found" });
      }
  
      console.log('Product found:', product);
  
      // Check if category exists
      const categoryMod = await categoryModel.findOne({ _id: product.category });
      if (!categoryMod) {
        console.log("Category not found");
        return res.status(400).json({ val: false, msg: "Category not found for the product" });
      }
  
      console.log('Category found:', categoryMod);
  
      // Update product with new data
      const updateResult = await productModel.updateOne(
        { _id: product._id },
        {
          $set: {
            name,
            description,
            category: categoryMod._id,
            price,
            offerPrice,
            stock,
            images: imgArr,
            warranty,
            returnPolicy,
          }
        }
      );
  
      console.log('Update result:', updateResult);
  
      if (updateResult.modifiedCount > 0) {
        res.status(200).json({ val: true, msg: "Product updated successfully" });
      } else {
        res.status(500).json({ val: false, msg: "Product update failed" });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ val: false, msg: "Internal server error" });
    }
  }
  ,


}