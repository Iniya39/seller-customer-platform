// models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Books', 'Furniture']
  },
  // Base price (for products without variations)
  price: {
    type: Number,
    min: 0
  },
  discountedPrice: {
    type: Number,
    min: 0
  },
  // Stock (for products without variations)
  stock: {
    type: Number,
    min: 0,
    default: 0
  },
  // Product variations (for products with different sizes, colors, etc.)
  variations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discountedPrice: {
      type: Number,
      min: 0
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Variation type (e.g., "Size", "Color", "Storage", etc.)
  variationType: {
    type: String,
    trim: true
  },
  // Whether this product has variations
  hasVariations: {
    type: Boolean,
    default: false
  },
  photo: {
    type: String,
    trim: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true,
    trim: true
  },
  sellerEmail: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Additional fields for each category
  specifications: {
    type: Map,
    of: String
  }
}, { 
  timestamps: true 
});

// Index for better search performance
productSchema.index({ productId: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
