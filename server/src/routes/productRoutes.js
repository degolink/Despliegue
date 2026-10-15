const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/meta/filters', productController.getFilterMetadata);
router.get('/:id', productController.getProductById);

module.exports = router;

