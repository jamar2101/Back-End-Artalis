import asyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  // Build query based on request parameters
  const query = {};

  // Filter by category if provided
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by featured if provided
  if (req.query.featured) {
    query.isFeatured = req.query.featured === 'true';
  }

  // Search by keyword
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Count total products with the query
  const count = await Product.countDocuments(query);

  // Build sort options
  let sortOptions = { createdAt: -1 }; // Default sort by newest

  if (req.query.sort) {
    switch (req.query.sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'name_asc':
        sortOptions = { name: 1 };
        break;
      case 'name_desc':
        sortOptions = { name: -1 };
        break;
      case 'featured':
        sortOptions = { isFeatured: -1, createdAt: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
  }

  // Fetch products with pagination
  const products = await Product.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort(sortOptions);

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
    message: `${count} parfum ditemukan`,
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json({
      success: true,
      data: product,
      message: 'Parfum ditemukan',
    });
  } else {
    res.status(404);
    throw new Error('Parfum tidak ditemukan');
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock, isFeatured, imagePath, brand, size, concentration, notes } = req.body;

  // Validation
  if (!name || !description || !price || !category) {
    res.status(400);
    throw new Error('Nama, deskripsi, harga, dan kategori parfum wajib diisi');
  }

  // Determine image path
  let finalImagePath = '/uploads/default-perfume.jpg'; // default

  if (imagePath) {
    // If imagePath is provided (from upload), use it
    finalImagePath = imagePath;
  } else if (req.file) {
    // If file is uploaded directly, use the file path
    finalImagePath = `/uploads/${req.file.filename}`;
  }

  // Create product
  const product = new Product({
    name,
    description,
    price: parseFloat(price),
    category,
    inStock: parseInt(inStock) || 0,
    isFeatured: isFeatured === 'true' || isFeatured === true,
    image: finalImagePath,
    brand,
    size: size || '100ml',
    concentration: concentration || 'EDP',
    notes: notes ? (typeof notes === 'string' ? JSON.parse(notes) : notes) : undefined,
  });

  const createdProduct = await product.save();

  res.status(201).json({
    success: true,
    data: createdProduct,
    message: 'Parfum berhasil ditambahkan',
  });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock, isFeatured, imagePath, brand, size, concentration, notes } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ? parseFloat(price) : product.price;
    product.category = category || product.category;
    product.inStock = inStock !== undefined ? parseInt(inStock) : product.inStock;
    product.isFeatured = isFeatured === 'true' || isFeatured === true;
    product.brand = brand || product.brand;
    product.size = size || product.size;
    product.concentration = concentration || product.concentration;

    if (notes) {
      product.notes = typeof notes === 'string' ? JSON.parse(notes) : notes;
    }

    // Update image if a new one is provided
    if (imagePath) {
      product.image = imagePath;
    } else if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await product.save();

    res.json({
      success: true,
      data: updatedProduct,
      message: 'Parfum berhasil diperbarui',
    });
  } else {
    res.status(404);
    throw new Error('Parfum tidak ditemukan');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.deleteOne();

    res.json({
      success: true,
      message: 'Parfum berhasil dihapus',
    });
  } else {
    res.status(404);
    throw new Error('Parfum tidak ditemukan');
  }
});

// @desc    Get unique product categories
// @route   GET /api/products/categories
// @access  Public
const getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category');

  res.json({
    success: true,
    data: categories,
    message: 'Kategori parfum berhasil diambil',
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;

  const products = await Product.find({ isFeatured: true }).limit(limit).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
    total: products.length,
    message: 'Parfum unggulan berhasil diambil',
  });
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductCategories, getFeaturedProducts };
