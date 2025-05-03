const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders');

router.get('/order/:uid?', orderController.getOrder);
router.get('/get-order/:order_id', orderController.getOrderByOrderId);
router.get('/get-table-order/:table?', orderController.getOrderByTable);
router.post('/order', orderController.createOrder);
router.patch('/order-status-update', orderController.updateOrderStatus); 
router.patch('/update-item-status', orderController.updateItemStatus); 
router.patch('/order-payment/:order_id', orderController.updatePaymentByOrderId);
router.get('/check-table', orderController.checkAvailableTables);

module.exports = router;
