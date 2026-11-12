const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Helper to escape regex special characters
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Helper to verify MongoDB Atlas connection state before running queries
 */
const checkDbConnection = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database Unavailable: Unable to connect to MongoDB Atlas cluster. Please ensure your database is accessible.',
      error: 'Database Unavailable'
    });
    return false;
  }
  return true;
};

/**
 * Helper to find product by either MongoDB _id or custom productId
 */
const findProductByIdOrCode = async (idParam) => {
  if (!idParam) return null;
  const trimmed = String(idParam).trim();
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    const product = await Product.findById(trimmed);
    if (product) return product;
  }
  return await Product.findOne({ productId: trimmed.toUpperCase() });
};

/**
 * @desc    Get all products with optional filters, search, sorting, and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const { category, brand, minPrice, maxPrice, sort, page = 1, limit = 12, search } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All') {
      const sanitizedCat = escapeRegex(category.trim());
      query.category = { $regex: new RegExp(`^${sanitizedCat}$`, 'i') };
    }

    // Filter by Brand
    if (brand && brand !== 'All') {
      const sanitizedBrand = escapeRegex(brand.trim());
      query.brand = { $regex: new RegExp(`^${sanitizedBrand}$`, 'i') };
    }

    // Filter by Price range
    const numMinPrice = minPrice ? Number(minPrice) : null;
    const numMaxPrice = maxPrice ? Number(maxPrice) : null;
    if ((numMinPrice !== null && !isNaN(numMinPrice)) || (numMaxPrice !== null && !isNaN(numMaxPrice))) {
      query.price = {};
      if (numMinPrice !== null && !isNaN(numMinPrice)) query.price.$gte = numMinPrice;
      if (numMaxPrice !== null && !isNaN(numMaxPrice)) query.price.$lte = numMaxPrice;
    }

    // Search query support (searches ID, name, brand, category, description, and nested processor)
    if (search && search.trim() !== '') {
      const sanitizedSearch = escapeRegex(search.trim());
      const regex = new RegExp(sanitizedSearch, 'i');
      query.$or = [
        { productId: regex },
        { name: regex },
        { brand: regex },
        { category: regex },
        { description: regex },
        { 'specifications.processor': regex }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'name-asc') sortOption = { name: 1 };
    else if (sort === 'name-desc') sortOption = { name: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    // Pagination (guarantee valid integers to prevent NaN skips)
    const parsedPage = parseInt(page, 10);
    const pageNum = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

    const parsedLimit = parseInt(limit, 10);
    const limitNum = isNaN(parsedLimit) || parsedLimit < 1 ? 12 : parsedLimit;

    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Extract unique categories & brands for filter dropdowns
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      categories,
      brands,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search products by query string
 * @route   GET /api/products/search?q=
 * @access  Public
 */
exports.searchProducts = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const q = req.query.q || '';
    if (!q.trim()) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const sanitizedQ = escapeRegex(q.trim());
    const regex = new RegExp(sanitizedQ, 'i');
    const products = await Product.find({
      $or: [
        { productId: regex },
        { name: regex },
        { brand: regex },
        { category: regex },
        { description: regex },
        { 'specifications.ram': regex },
        { 'specifications.storage': regex },
        { 'specifications.processor': regex }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      query: q,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID or productId
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const product = await findProductByIdOrCode(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID '${req.params.id}' was not found.`,
        error: 'Not Found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new product document
 * @route   POST /api/products
 * @access  Public
 */
exports.createProduct = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    let {
      productId,
      name,
      brand,
      category,
      price,
      description,
      image,
      specifications,
      stock
    } = req.body;

    // Validate mandatory fields
    if (!productId || !name || !brand || !category || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: productId, name, brand, category, and price.',
        error: 'Missing Required Fields'
      });
    }

    productId = String(productId).trim().toUpperCase();

    // Validate productId format
    if (!/^[A-Za-z0-9_-]+$/.test(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product ID can only contain letters, numbers, hyphens, and underscores (no spaces or special characters).',
        error: 'Invalid Product ID Format'
      });
    }

    // Validate Price
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number or zero.',
        error: 'Invalid Price'
      });
    }

    // Validate Stock
    const numStock = stock !== undefined ? Number(stock) : 0;
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a valid non-negative integer or zero.',
        error: 'Invalid Stock'
      });
    }

    // Check duplicate productId
    const existing = await Product.findOne({ productId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Product ID '${productId}' already exists in database. Please use a unique Product ID.`,
        error: 'Duplicate Product ID'
      });
    }

    // Default nested specifications if not provided or partial
    const specData = {
      ram: specifications?.ram ? String(specifications.ram).trim() : 'N/A',
      storage: specifications?.storage ? String(specifications.storage).trim() : 'N/A',
      processor: specifications?.processor ? String(specifications.processor).trim() : 'N/A'
    };

    const newProduct = await Product.create({
      productId,
      name: String(name).trim(),
      brand: String(brand).trim(),
      category: String(category).trim(),
      price: numPrice,
      description: description ? String(description).trim() : '',
      image: image && String(image).trim() !== '' ? String(image).trim() : undefined,
      specifications: specData,
      stock: numStock
    });

    res.status(201).json({
      success: true,
      message: `Product '${newProduct.name}' (${newProduct.productId}) added successfully.`,
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing product
 * @route   PUT /api/products/:id
 * @access  Public
 */
exports.updateProduct = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const existingProduct = await findProductByIdOrCode(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Cannot update. Product with ID '${req.params.id}' was not found.`,
        error: 'Not Found'
      });
    }

    const {
      productId,
      name,
      brand,
      category,
      price,
      description,
      image,
      specifications,
      stock
    } = req.body;

    // If changing productId, verify format and uniqueness
    if (productId && productId.trim().toUpperCase() !== existingProduct.productId) {
      const newPid = productId.trim().toUpperCase();
      if (!/^[A-Za-z0-9_-]+$/.test(newPid)) {
        return res.status(400).json({
          success: false,
          message: 'Product ID can only contain letters, numbers, hyphens, and underscores.',
          error: 'Invalid Product ID Format'
        });
      }

      const conflict = await Product.findOne({ productId: newPid });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Product ID '${newPid}' is already assigned to another product.`,
          error: 'Duplicate Product ID'
        });
      }
      existingProduct.productId = newPid;
    }

    if (name !== undefined) existingProduct.name = String(name).trim();
    if (brand !== undefined) existingProduct.brand = String(brand).trim();
    if (category !== undefined) existingProduct.category = String(category).trim();

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid positive number or zero.',
          error: 'Invalid Price'
        });
      }
      existingProduct.price = numPrice;
    }

    if (description !== undefined) existingProduct.description = String(description).trim();

    if (image !== undefined) {
      existingProduct.image = String(image).trim() !== ''
        ? String(image).trim()
        : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
    }

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a valid non-negative integer or zero.',
          error: 'Invalid Stock'
        });
      }
      existingProduct.stock = numStock;
    }

    if (specifications && typeof specifications === 'object') {
      existingProduct.specifications = {
        ram: specifications.ram !== undefined ? String(specifications.ram).trim() : existingProduct.specifications.ram,
        storage: specifications.storage !== undefined ? String(specifications.storage).trim() : existingProduct.specifications.storage,
        processor: specifications.processor !== undefined ? String(specifications.processor).trim() : existingProduct.specifications.processor
      };
    }

    const updatedProduct = await existingProduct.save();

    res.status(200).json({
      success: true,
      message: `Product '${updatedProduct.name}' updated successfully.`,
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Public
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const product = await findProductByIdOrCode(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Cannot delete. Product with ID '${req.params.id}' was not found.`,
        error: 'Not Found'
      });
    }

    await Product.findByIdAndDelete(product._id);

    res.status(200).json({
      success: true,
      message: `Product '${product.name}' (${product.productId}) was deleted successfully from MongoDB.`,
      deletedId: product._id,
      productId: product.productId
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/dashboard/stats
 * @access  Public
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const totalProducts = await Product.countDocuments();
    const distinctBrands = await Product.distinct('brand');
    const distinctCategories = await Product.distinct('category');

    // Aggregate to calculate average price, max price, min price, and total stock
    const statsAgg = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);

    const avgPrice = statsAgg.length > 0 ? Math.round(statsAgg[0].avgPrice || 0) : 0;
    const totalStock = statsAgg.length > 0 ? statsAgg[0].totalStock || 0 : 0;

    // Category distribution
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recently added products (5)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('productId name brand category price stock image createdAt');

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalBrands: distinctBrands.length,
        totalCategories: distinctCategories.length,
        avgPrice,
        totalStock,
        categoryStats,
        brands: distinctBrands,
        categories: distinctCategories,
        recentProducts
      }
    });
  } catch (error) {
    next(error);
  }
};
