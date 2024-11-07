const express = require('express');
const userModel = require('../models/userModel');
const categoryModel = require('../models/categoryModel');
const productModel = require('../models/productModel');
const path = require('path')



module.exports = {
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
    async productUnlist(req, res){
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
  }

}


