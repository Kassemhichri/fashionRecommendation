const express = require('express');
const { getProducts } = require('../utils/product_data_processor');

const router = express.Router();

/**
 * GET /api/merged-products
 * Returns all products with merged data from styles.csv and images.csv
 */
router.get('/', (req, res) => {
  try {
    const products = getProducts();
    
    // Apply pagination if requested
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || products.length;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    res.json({
      products: paginatedProducts,
      totalCount: products.length,
      totalPages: Math.ceil(products.length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error retrieving merged products:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
});

/**
 * GET /api/merged-products/:id
 * Returns a specific product by ID
 */
router.get('/:id', (req, res) => {
  try {
    const products = getProducts();
    const id = parseInt(req.params.id, 10);
    
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error retrieving product:', error);
    res.status(500).json({ message: 'Failed to retrieve product' });
  }
});

module.exports = router;