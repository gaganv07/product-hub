const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema(
  {
    ram: {
      type: String,
      trim: true,
      default: 'N/A'
    },
    storage: {
      type: String,
      trim: true,
      default: 'N/A'
    },
    processor: {
      type: String,
      trim: true,
      default: 'N/A'
    }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z0-9_-]+$/, 'Product ID can only contain letters, numbers, hyphens, and underscores']
    },
    name: {
      type: String,
      required: [true, 'Product Name is required'],
      trim: true,
      minlength: [2, 'Product Name must be at least 2 characters long']
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be a positive number or zero']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
    },
    specifications: {
      type: specificationSchema,
      default: () => ({ ram: 'N/A', storage: 'N/A', processor: 'N/A' })
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'products'
  }
);

// Compound text index for MongoDB search capability
productSchema.index({
  productId: 'text',
  name: 'text',
  brand: 'text',
  category: 'text'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

