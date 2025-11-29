const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/flashsale', productController.getFlashsaleProducts);
router.get('/bestsellers', productController.getBestSellers);
router.get('/accessories', productController.getAccessories);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;
