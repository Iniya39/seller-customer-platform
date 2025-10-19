// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller
} from '../controllers/productController.js';

const router = express.Router();

// Product routes
router.post('/', createProduct);                    // Create new product
router.get('/', getAllProducts);                    // Get all products with filters
router.get('/seller/:sellerId', getProductsBySeller); // Get products by specific seller
router.get('/:id', getProductById);                 // Get single product by ID
router.put('/:id', updateProduct);                  // Update product
router.delete('/:id', deleteProduct);               // Delete product (soft delete)

export default router;
