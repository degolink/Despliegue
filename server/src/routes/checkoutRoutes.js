const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { checkoutSchema } = require('../validators');

// Rutas de checkout requieren usuario autenticado
router.use(authenticateJWT);

// Caso de uso CU-08: Checkout transaccional
router.post(
  '/',
  authorizeRoles('Comprador', 'Administrador'),
  validate(checkoutSchema),
  checkoutController.processCheckout
);

// Historial de compras
router.get('/orders', checkoutController.getOrderHistory);

module.exports = router;

