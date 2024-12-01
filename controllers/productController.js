const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const path = require('path');


module.exports = {

  //admin side

  async productsPageLoad(req, res) {
    try {
      const page = parseInt(req.query.page) || 1; 
      const limit = 6; 
      const skip = (page - 1) * limit;
  
      
      const category = await categoryModel.find({});
  
      
      const totalProducts = await productModel.countDocuments({});
      const totalPages = Math.ceil(totalProducts / limit);
  
      
      const products = await productModel.find({})
        .skip(skip)
        .limit(limit)
        
  
      return res.status(200).render("products", {
        val: products.length > 0,
        msg: products.length ? null : "No products found",
        products,
        category,
        currentPage: page,
        totalPages: totalPages,
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
      return res.status(400).json({ val: false, msg: "No files were uploaded" });
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
async loadupdateProducts(req, res) {
    console.log("Yes you are here")
    const productId = req.params.id;

    try {
      const category = await categoryModel.find({});
      const products = await productModel.findById(productId).populate("category")
      res.status(200).render('updateProducts', { products, category });
    } catch (error) {
      console.log(error);
    }


  },

  async updateProduct(req, res) {
    console.log('Starting updateProduct');

    try {
      const  {productId}  = req.params;
      console.log('Received productId:', productId);
      const { name, description, category, price, offerPrice, stock, warranty, returnPolicy, existingImages } = req.body;

      console.log('Received productId:', productId, category);

      // Array to store final image paths
      let imgArr = [];

      console.log(req.files);
      // Check for uploaded images
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          const imagePath = `uploads/${file.filename}`;
          imgArr.push(imagePath);
        });
      }

      // console.log('Uploaded image paths:', imgArr);

      // // Include existing images
      // if (existingImages) {
      //   const parsedExistingImages = Array.isArray(existingImages)
      //     ? existingImages
      //     : JSON.parse(existingImages);
      //   imgArr = [...parsedExistingImages, ...imgArr];
      // }

      // console.log('Final image array:', imgArr);

      // Check if product exists
      const product = await productModel.findOne({ _id: productId });
      if (!product) {
        console.log('Product not found');
        return res.status(404).json({ val: false, msg: 'Product not found' });
      }

      console.log('Product found:', product);

      // Check if category exists
      const categoryMod = await categoryModel.findOne({ _id: category });
      if (!categoryMod) {
        console.log('Category not found');
        return res.status(400).json({ val: false, msg: 'Category not found' });
      }

      console.log('Category found:', categoryMod._id);

      // Update product
      const updateResult = await productModel.updateOne(
        { _id: productId },
        {
          $set: {
            name,
            description,
            category: categoryMod._id,
            price,
            offerPrice,
            stock,
            warranty,
            returnPolicy,
          },
        }
      );

      console.log('Update result:', updateResult);

      res.status(200).json({ val: true, msg: 'Product updated successfully' });
      // if (updateResult.modifiedCount > 0) {
      // } else {
      //   res.status(500).json({ val: false, msg: 'Product update failed' });
      // }
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ val: false, msg: 'Internal server error' });
    }
  },

  async productImageUpdate(req, res) {
    console.log("GAdyjuu");
    try {
      const { productIndex } = req.body;
      const { productId } = req.params;
      if (!req.file) {
        return res.status(400).json({ val: false, msg: "No file was uploaded" });
      }
      const filePath = path.relative(path.join(__dirname, "..", "public"), req.file.path);
      console.log("Product Index:", productIndex);
      console.log("Product ID:", productId);
      console.log("File Path:", filePath);
      const product = await productModel.findOne({ _id: productId });
      if (!product) {
        return res.status(404).json({ val: false, msg: "Product not found" });
      }
      product.images[productIndex] = filePath;
      await product.save();
      return res.status(200).json({ val: true, msg: "Product image updated successfully" });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ val: false, msg: "Server error" });
    }
  },

  // user side

  async shopPageLoad(req, res) {
    try {
      let filters = {};
  
      // Get filter parameters from query
      if (req.query.category) {
        filters.category = req.query.category;
      }
      if (req.query.priceRange) {
        // You can add your price range logic here
        filters.priceRange = req.query.priceRange;
      }
      if (req.query.searchTerm) {
        filters.searchTerm = req.query.searchTerm;
      }
  
      // If there's a category filter, fetch the products by that category
      if (req.query.category) {
        const cat = await categoryModel.findOne({ name: req.query.category });
        filters.category = cat._id;
      }
  
      // Retrieve filtered products based on the filters
      const products = await productModel.find(filters).populate('category').exec();
      const categories = await categoryModel.find({ isDeleted: false });
  
      if (req.xhr) {  // Check if it's an AJAX request (for fetch)
        // Render only the product grid for AJAX requests
        return res.status(200).render('partials/product-grid', { products, categories });
      }
  
      // Otherwise, render the full page (shop page)
      return res.status(200).render('shop', { products, categories });
  
    } catch (err) {
      console.log(err);
    }
  },
  
  

  // Route for product details page
  async productDetails(req, res) {
    try {
      const { id: productId } = req.params;
      console.log('Fetching product details for ID:', productId);
  
      // Fetch product from the database
      const product = await productModel.findById(productId).lean();
      if (!product || product.isDeleted) {
        return res.status(404).render("productDetails", { msg: "Product not found" });
      }
  
      // Fetch related products (example logic based on category)
      const relatedProducts = await productModel.find({
        category: product.category,
        _id: { $ne: productId } // Exclude the current product
      }).limit(4).lean(); // Adjust the limit as per your need
  
      return res.status(200).render("productDetails", { product, relatedProducts });
    } catch (err) {
      console.error('Error loading product details:', err.stack);
      res.status(500).render("productDetails", { msg: "Error loading product details" });
    }
  },
  
}
