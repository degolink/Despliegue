const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateJWT } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { addToCartSchema, updateCartSchema } = require('../validators');

// Todas las rutas de carrito requieren autenticación del usuario (CU-07)
router.use(authenticateJWT);

router.get('/', cartController.getCart);
router.post('/', validate(addToCartSchema), cartController.addToCart);
router.put('/:itemId', validate(updateCartSchema), cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;

