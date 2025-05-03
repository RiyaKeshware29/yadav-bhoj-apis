const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu');

// Category Routes
router.post("/category", menuController.addCategory);
router.get("/category/:category_id?", menuController.getCategory);
router.patch("/category/:category_id", menuController.updateCategory);
router.delete("/category/:category_id", menuController.deleteCategory);

// Item Routes
router.post("/item", menuController.addItem);
router.get("/item/:item_id?", menuController.getItem);
router.get("/category-item/:category_id", menuController.getItemByCategoryId);
router.patch("/item/:item_id", menuController.updateItem);
router.delete("/item/:item_id", menuController.deleteItem);

module.exports = router;
