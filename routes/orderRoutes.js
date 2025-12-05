const express = require('express');
const router = express.Router();
const { getUserOrders, getOrderDetail, createOrder, deleteOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/auth');

// Tất cả routes đều cần authentication
router.post('/', authMiddleware, createOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/:orderId', authMiddleware, getOrderDetail);
router.delete('/:orderId', authMiddleware, deleteOrder);

module.exports = router;
