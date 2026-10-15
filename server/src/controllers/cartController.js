const { getPool, sql } = require('../config/db');

/**
 * Obtener ítems del carrito con validación de stock en vivo
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        SELECT 
          c.item_id,
          c.producto_id,
          c.cantidad,
          c.fecha_agregado,
          p.nombre,
          p.precio,
          p.stock,
          p.imagen_url,
          p.franquicia,
          p.categoria,
          (c.cantidad * p.precio) AS subtotal,
          CASE WHEN p.stock < c.cantidad THEN 0 ELSE 1 END AS stock_disponible
        FROM dbo.CARRITO_ITEMS c
        INNER JOIN dbo.PRODUCTOS p ON c.producto_id = p.producto_id
        WHERE c.usuario_id = @usuario_id
        ORDER BY c.fecha_agregado DESC;
      `);

    const items = result.recordset;
    const total = items.reduce((acc, item) => acc + Number(item.subtotal), 0);

    res.status(200).json({
      success: true,
      data: {
        items,
        total,
        count: items.reduce((acc, item) => acc + item.cantidad, 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CU-07.1: Agregar producto al carrito con validación de stock en tiempo real (CU-07.5)
 * POST /api/cart
 */
const addToCart = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const { producto_id, cantidad = 1 } = req.body;
    const pool = await getPool();

    // CU-07.5: Validar stock en tiempo real en SQL Server
    const prodCheck = await pool
      .request()
      .input('producto_id', sql.Int, producto_id)
      .query('SELECT stock, nombre, precio FROM dbo.PRODUCTOS WHERE producto_id = @producto_id');

    if (prodCheck.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado.' });
    }

    const { stock, nombre } = prodCheck.recordset[0];

    // Verificar si ya existe en el carrito del usuario
    const cartItemCheck = await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('producto_id', sql.Int, producto_id)
      .query('SELECT item_id, cantidad FROM dbo.CARRITO_ITEMS WHERE usuario_id = @usuario_id AND producto_id = @producto_id');

    const cantidadActual = cartItemCheck.recordset.length > 0 ? cartItemCheck.recordset[0].cantidad : 0;
    const nuevaCantidad = cantidadActual + cantidad;

    if (stock < nuevaCantidad) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente para "${nombre}". Disponibles: ${stock}, en carrito con esta adición: ${nuevaCantidad}.`,
      });
    }

    if (cartItemCheck.recordset.length > 0) {
      // Actualizar cantidad
      await pool
        .request()
        .input('item_id', sql.Int, cartItemCheck.recordset[0].item_id)
        .input('cantidad', sql.Int, nuevaCantidad)
        .query('UPDATE dbo.CARRITO_ITEMS SET cantidad = @cantidad WHERE item_id = @item_id');
    } else {
      // Insertar nuevo ítem
      await pool
        .request()
        .input('usuario_id', sql.Int, usuarioId)
        .input('producto_id', sql.Int, producto_id)
        .input('cantidad', sql.Int, cantidad)
        .query('INSERT INTO dbo.CARRITO_ITEMS (usuario_id, producto_id, cantidad) VALUES (@usuario_id, @producto_id, @cantidad)');
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * CU-07.2: Modificar cantidad de un ítem en el carrito con validación de stock (CU-07.5)
 * PUT /api/cart/:itemId
 */
const updateCartItem = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const { itemId } = req.params;
    const { cantidad } = req.body;

    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ success: false, message: 'La cantidad debe ser mayor a 0.' });
    }

    const pool = await getPool();

    // Validar pertenencia del item y stock del producto correspondiente
    const itemQuery = await pool
      .request()
      .input('item_id', sql.Int, itemId)
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        SELECT c.item_id, c.producto_id, p.stock, p.nombre
        FROM dbo.CARRITO_ITEMS c
        INNER JOIN dbo.PRODUCTOS p ON c.producto_id = p.producto_id
        WHERE c.item_id = @item_id AND c.usuario_id = @usuario_id;
      `);

    if (itemQuery.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Ítem de carrito no encontrado.' });
    }

    const { stock, nombre } = itemQuery.recordset[0];

    // CU-07.5: Validar stock en tiempo real
    if (stock < cantidad) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente para "${nombre}". Existencias actuales: ${stock}.`,
      });
    }

    await pool
      .request()
      .input('item_id', sql.Int, itemId)
      .input('cantidad', sql.Int, cantidad)
      .query('UPDATE dbo.CARRITO_ITEMS SET cantidad = @cantidad WHERE item_id = @item_id');

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * CU-07.3: Eliminar ítem individual del carrito
 * DELETE /api/cart/:itemId
 */
const removeCartItem = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const { itemId } = req.params;
    const pool = await getPool();

    await pool
      .request()
      .input('item_id', sql.Int, itemId)
      .input('usuario_id', sql.Int, usuarioId)
      .query('DELETE FROM dbo.CARRITO_ITEMS WHERE item_id = @item_id AND usuario_id = @usuario_id');

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * CU-07.4: Vaciar todo el carrito del usuario
 * DELETE /api/cart
 */
const clearCart = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const pool = await getPool();

    await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .query('DELETE FROM dbo.CARRITO_ITEMS WHERE usuario_id = @usuario_id');

    res.status(200).json({
      success: true,
      message: 'Carrito vaciado exitosamente.',
      data: { items: [], total: 0, count: 0 },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

