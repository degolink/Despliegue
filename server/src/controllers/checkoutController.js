const checkoutService = require('../services/checkoutService');

/**
 * Procesa la compra atómica con datos de envío
 * POST /api/checkout
 */
const processCheckout = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const { direccion_envio, metodo_envio } = req.body;

    const receipt = await checkoutService.processCheckout(usuarioId, {
      direccion_envio,
      metodo_envio,
    });

    res.status(201).json({
      success: true,
      message: '¡Orden de compra completada exitosamente!',
      data: receipt,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        detalles: error.detalles || [],
      });
    }
    next(error);
  }
};

/**
 * Consulta las órdenes del usuario autenticado
 * GET /api/checkout/orders
 */
const getOrderHistory = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const orders = await checkoutService.getUserOrders(usuarioId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  processCheckout,
  getOrderHistory,
};

