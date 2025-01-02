const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const path = require('path');
const { handleUpload } = require('../utils/cloudinary');

module.exports = {
  // admin side
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



  async categoryAdd(req, res) {
    const { categoryName } = req.body;
    try {
      // Check if a category with the same name already exists
      const existingCategory = await categoryModel.findOne({
        name: {
          $regex: new RegExp('^' + categoryName + '$', 'i')
        }
      });
      if (existingCategory) {
        return res.status(400).json({
          val: false,
          msg: 'Category name already exists. Please choose a different name.',
        });
      }
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      const imagePath = cldRes.secure_url;
      // Process and store the image path
      // const imagePath = path.relative(path.join(__dirname, '..', 'public'), req.file.path);
      // console.log(imagePath);

      // Create the new category
      await categoryModel.create({ name: categoryName, image: imagePath });
      console.log('Category added successfully');

      res.status(200).json({ val: true, msg: 'Category added successfully' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ val: false, msg: 'Category add failed due to an error.' });
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
    const { categoryId } = req.params;
    const { categoryName } = req.body;

    try {
      const category = await categoryModel.findOne({ _id: categoryId });
      if (!category) {
        return res.status(404).json({ val: false, msg: "Category not found" });
      }
      category.name = categoryName;
      await category.save();
      return res.status(200).json({ val: true, msg: "Category updated successfully" });
    } catch (err) {
      console.error("Error during category update:", err);
      return res.status(500).json({ val: false, msg: "Server error" });
    }
  },

  async categoryImageUpdate(req, res) {
    console.log("Updating category image");
    try {
      const { categoryId } = req.params;
      if (!req.file) {
        return res
          .status(400)
          .json({ val: false, msg: "No file was uploaded" });
      }
      
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      const filePath = cldRes.secure_url;

      // const filePath = path.relative(
      //   path.join(__dirname, "..", "public"),
      //   req.file.path
      // );

      console.log("Category ID:", categoryId);
      console.log("File Path:", filePath);
      const category = await categoryModel.findOne({ _id: categoryId });
      if (!category) {
        return res.status(404).json({ val: false, msg: "Category not found" });
      }
      category.image = filePath;
      await category.save();
      return res
        .status(200)
        .json({ val: true, msg: "Category image updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ val: false, msg: "Server error" });
    }
  },
  async categoryUpdate(req, res) {
    const { categoryId } = req.params;
    const { categoryName } = req.body;

    try {
      const category = await categoryModel.findOne({ _id: categoryId });
      if (!category) {
        return res.status(404).json({ val: false, msg: "Category not found" });
      }
      category.name = categoryName;
      await category.save();
      return res.status(200).json({ val: true, msg: "Category updated successfully" });
    } catch (err) {
      console.error("Error during category update:", err);
      return res.status(500).json({ val: false, msg: "Server error" });
    }
  },

  // user side
  
};