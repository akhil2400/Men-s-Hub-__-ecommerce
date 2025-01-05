const userModel = require('../models/userModel');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const path = require('path');
const { handleUpload } = require('../utils/cloudinary');


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
      sizes,
      cashOnDelivery,
      offerPrice,
      stockQuantities,
      warranty,
      returnPolicy,
      colors,
    } = req.body;

    console.log(req.body);
  
    price = Number(price);
    offerPrice = Number(offerPrice);
    cashOnDelivery = cashOnDelivery === "true";
    offerPrice = isNaN(offerPrice) ? 0 : offerPrice;
  
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ val: false, msg: "No files were uploaded" });
      }

      console.log(JSON.parse(stockQuantities));
  
      // Ensure sizes and stock quantities are arrays
      const sizesArray = typeof sizes === "string" && sizes.startsWith("[")
      ? JSON.parse(sizes)
      : sizes.split(",").map(size => size.trim());

      const stockQuantitiesArray = typeof stockQuantities === "string"
  ? JSON.parse(stockQuantities)
  : stockQuantities;

  
      if (sizesArray.length !== stockQuantitiesArray.length) {
        return res.status(400).json({ val: false, msg: "Sizes and stock quantities mismatch" });
      }
      const variants = sizesArray.map((size, index) => ({
  size: size.trim().toUpperCase(), // Use consistent format for sizes like XS, S
  stock: stockQuantitiesArray[index]?.stock || 0, // Safely access stock
}));
      console.log(variants);
      let totalStock = stockQuantitiesArray.reduce((total, stock) => total + stock, 0);
      totalStock=Number(totalStock);

      if (isNaN(totalStock)) {
        totalStock = 0; // Default to 0 if totalStock is not a valid number
      }
  
      // Calculate offer percentage
      const offerPercentage = offerPrice && price > 0 
        ? Math.round(((price - offerPrice) / price) * 100)
        : 0;
  
      const categoryObject = await categoryModel.findOne({ name: category });
      if (!categoryObject) {
        return res.status(400).json({ val: false, msg: "Category not found" });
      }
  
      // Process images
      const imagePaths = [];
      for (const key in req.files) {
        for (const file of req.files[key]) {
          const b64 = Buffer.from(file.buffer).toString("base64");
          const dataURI = "data:" + file.mimetype + ";base64," + b64;
          const cldRes = await handleUpload(dataURI);
          imagePaths.push(cldRes.secure_url);
        }
      }
      
      // for(const file of req.files){
      //   const b64 = Buffer.from(file.buffer).toString("base64");
      //   let dataURI = "data:" + file.mimetype + ";base64," + b64;
      //   const cldRes = await handleUpload(dataURI);
      //   imagePaths.push(cldRes.secure_url);
      // }
  
      // Create the product
      await productModel.create({
        name,
        description,
        price,
        offerPrice,
        previousOfferPrice: null, // Initialize as null
        offerPercentage,
        category: categoryObject._id,
        images: imagePaths,
        variants:variants,
        totalStock,
        colors: Array.isArray(colors) ? colors : colors.split(","),
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

  async updateAddStock(req, res){
    const { id } = req.params;
  let { sizes, stockQuantities } = req.body;

  try {
    const products = await productModel.findById(id);

    if (!products) {
      return res.status(404).json({success:false, message: "Product not found" });
    }

    sizes.forEach((size, index) => {
      let stock = stockQuantities[index];
      stock=parseInt(stock)
      const variantIndex = products.variants.findIndex((variant) => variant.size == size);
      
      if (variantIndex !== -1) {
        products.variants[variantIndex].stock += stock;
      } else {
        products.variants.push({ size, stock });
      }

    });
    
    products.totalStock = products.variants.reduce((total, variant) => total + variant.stock, 0);
    await products.save();

    res.status(200).json({success:true, message: "Product stock updated successfully", products });
  } catch (error) {
    console.error(error);
    res.status(500).json({success:false, message: "Server error" });
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
     // const filePath = path.relative(path.join(__dirname, "..", "public"), req.file.path);
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      const filePath = cldRes.secure_url;


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
        let sortOption = {};

        // Get filter parameters from query
        if (req.query.category) {
            const cat = await categoryModel.findOne({ name: req.query.category });
            if (cat) {
                filters.category = cat._id;
            }
        }

        if (req.query.priceRange) {
            const range = req.query.priceRange.split('-');
            if (range.length === 2) {
                filters.offerPrice = { $gte: parseInt(range[0]), $lte: parseInt(range[1]) };
            } else if (req.query.priceRange === 'lowToHigh') {
                sortOption.offerPrice = 1;
            } else if (req.query.priceRange === 'highToLow') {
                sortOption.offerPrice = -1;
            } else if (req.query.priceRange === '5000+') {
                filters.offerPrice = { $gt: 5000 }; // Added handling for "5000+" range
            }
        }

        if (req.query.searchTerm) {
            filters.name = { $regex: req.query.searchTerm, $options: "i" };
        }

        if (req.query.orderBy === 'A-Z') {
            sortOption.name = 1;
        } else if (req.query.orderBy === 'Z-A') {
            sortOption.name = -1;
        }

        // Fetch products based on filters and sorting
        const products = await productModel.find(filters).populate('category').sort(sortOption).exec();
        const categories = await categoryModel.find({ isDeleted: false });

        // Add offerPercentage for frontend
        const productsWithOffer = products.map(product => ({
            ...product.toObject(),
            offerPercentage: product.offerPercentage || 0,
        }));

        if (req.xhr) {
            return res.status(200).render('partials/product-grid', { products: productsWithOffer });
        }

        return res.status(200).render('shop', { products: productsWithOffer, categories });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
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
