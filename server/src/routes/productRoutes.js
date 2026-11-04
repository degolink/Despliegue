const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createProductSchema } = require('../validators');

router.get('/', productController.getProducts);
router.get('/meta/filters', productController.getFilterMetadata);

// CU-10: Inventario propio (solo Vendedor o Administrador). Debe ir antes de '/:id'.
router.get(
  '/mine',
  authenticateJWT,
  authorizeRoles('Vendedor', 'Administrador'),
  productController.getMyProducts
);

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
