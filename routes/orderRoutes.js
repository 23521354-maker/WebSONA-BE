const express = require('express');
const router = express.Router();
const { getUserOrders, getOrderDetail } = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/auth');

// Tất cả routes đều cần authentication
router.get('/', authMiddleware, getUserOrders);
router.get('/:orderId', authMiddleware, getOrderDetail);

module.exports = router;
