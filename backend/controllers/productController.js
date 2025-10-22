// controllers/productController.js
import Product from '../models/productModel.js';

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { 
      productId, 
      name, 
      description, 
      category, 
      price, 
      discountedPrice, 
      stock, 
      seller, 
      sellerName, 
      sellerEmail,
      hasVariations,
      variationType,
      variations
    } = req.body;

    // Validate required fields
    if (!productId || !name || !description || !category || !seller || !sellerName || !sellerEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: productId, name, description, category, seller, sellerName, and sellerEmail are required' 
      });
    }

    // Validate category
    const validCategories = ['Electronics', 'Clothing', 'Books', 'Furniture'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        error: 'Invalid category. Must be one of: Electronics, Clothing, Books, Furniture' 
      });
    }

    // Check if productId already exists
    const existingProduct = await Product.findOne({ productId: productId.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ 
        error: 'Product ID already exists. Please use a different Product ID.' 
      });
    }

    // Parse variations if provided
    let parsedVariations = [];
    if (hasVariations === 'true' && variations) {
      try {
        parsedVariations = JSON.parse(variations);
        if (!Array.isArray(parsedVariations) || parsedVariations.length === 0) {
          return res.status(400).json({ 
            error: 'Variations must be a non-empty array when hasVariations is true' 
          });
        }
        // Validate each variation
        for (let i = 0; i < parsedVariations.length; i++) {
          const variation = parsedVariations[i];
          if (!variation.name || !variation.price || variation.stock === undefined) {
            return res.status(400).json({ 
              error: `Variation ${i + 1} is missing required fields: name, price, and stock are required` 
            });
          }
        }
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid variations format. Must be valid JSON array.' 
        });
      }
    }

    // If file uploaded, construct public URL
    let photoUrl = undefined;
    if (req.file) {
      // Serve via /uploads; path configured in server.js
      const filename = req.file.filename;
      photoUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    }

    // Create product data object
    const productData = {
      productId: productId.toUpperCase(),
      name,
      description,
      category,
      photo: photoUrl || req.body.photo,
      seller,
      sellerName,
      sellerEmail,
      hasVariations: hasVariations === 'true',
      variationType: variationType || '',
      variations: parsedVariations
    };

    // Add base price/stock only if no variations
    if (!productData.hasVariations) {
      if (!price || !stock) {
        return res.status(400).json({ 
          error: 'Price and stock are required when hasVariations is false' 
        });
      }
      productData.price = parseFloat(price);
      productData.discountedPrice = discountedPrice ? parseFloat(discountedPrice) : parseFloat(price);
      productData.stock = parseInt(stock);
    }

    // Create new product
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    res.status(201).json({
      message: 'Product created successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      error: 'Failed to create product',
      details: error.message 
    });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { category, seller, search, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (seller) {
      filter.seller = seller;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      details: error.message 
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      details: error.message 
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, discountedPrice, stock, photo, isActive } = req.body;

    // Validate category if provided
    if (category) {
      const validCategories = ['Electronics', 'Clothing', 'Books', 'Furniture'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          error: 'Invalid category. Must be one of: Electronics, Clothing, Books, Furniture' 
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (discountedPrice !== undefined) updateData.discountedPrice = discountedPrice;
    if (stock !== undefined) updateData.stock = stock;
    // If a new file is uploaded, override photo with the new public URL
    if (req.file) {
      const filename = req.file.filename;
      updateData.photo = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    } else if (photo !== undefined) {
      updateData.photo = photo;
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      error: 'Failed to update product',
      details: error.message 
    });
  }
};

// Delete product (soft delete by setting isActive to false)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      error: 'Failed to delete product',
      details: error.message 
    });
  }
};

// Get products by seller
export const getProductsBySeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId || req.user?.id;
    
    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }

    const products = await Product.find({ 
      seller: sellerId, 
      isActive: true 
    })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch seller products',
      details: error.message 
    });
  }
};
