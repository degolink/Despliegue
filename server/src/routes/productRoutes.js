const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createProductSchema } = require('../validators');

router.get('/', productController.getProducts);
router.get('/meta/filters', productController.getFilterMetadata);
router.get('/:id', productController.getProductById);

// CU-09: Alta de producto (solo Vendedor o Administrador)
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Vendedor', 'Administrador'),
  validate(createProductSchema),
  productController.createProduct
);

module.exports = router;
