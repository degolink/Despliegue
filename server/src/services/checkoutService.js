const { getPool, sql } = require('../config/db');

/**
 * SERVICIO: Procesamiento Transaccional de Checkout (CHK / CU-08)
 * 
 * Garantiza Atomicidad, Consistencia, Aislamiento y Durabilidad (ACID)
 * mediante transacciones de Microsoft SQL Server:
 * 1. Validación de stock con bloqueo de lectura (UPDLOCK) para prevenir condiciones de carrera.
 * 2. Creación de cabecera en ORDENES.
 * 3. Inserción de líneas en DETALLE_ORDEN.
 * 4. Descuento atómico de existencias en PRODUCTOS.
 * 5. Vaciado de los ítems adquiridos en CARRITO_ITEMS.
 * 6. Commit de la transacción o Rollback ante cualquier anomalía.
 */
class CheckoutService {
  /**
   * Ejecuta el checkout completo para un usuario autenticado
   * @param {number} usuarioId ID del comprador
   * @param {Object} checkoutData Datos del envío (direccion_envio, metodo_envio)
   */
  async processCheckout(usuarioId, { direccion_envio, metodo_envio }) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      // Iniciar la transacción de base de datos
      await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

      const request = new sql.Request(transaction);

      // PASO 1: Obtener ítems del carrito y bloquear filas de productos para validar stock en tiempo real
      request.input('usuario_id', sql.Int, usuarioId);

      const cartQuery = `
        SELECT 
          c.item_id,
          c.producto_id,
          c.cantidad,
          p.nombre,
          p.precio,
          p.stock,
          p.imagen_url
        FROM dbo.CARRITO_ITEMS c
        INNER JOIN dbo.PRODUCTOS p WITH (UPDLOCK, ROWLOCK) ON c.producto_id = p.producto_id
        WHERE c.usuario_id = @usuario_id;
      `;

      const cartResult = await request.query(cartQuery);
      const items = cartResult.recordset;

      if (!items || items.length === 0) {
        const error = new Error('El carrito de compras está vacío.');
        error.statusCode = 400;
        throw error;
      }

      // Validar disponibilidad de stock de cada ítem
      const stockErrors = [];
      let totalCalculado = 0;

      for (const item of items) {
        if (item.stock < item.cantidad) {
          stockErrors.push({
            producto_id: item.producto_id,
            nombre: item.nombre,
            stock_disponible: item.stock,
            cantidad_solicitada: item.cantidad,
          });
        }
        totalCalculado += Number(item.precio) * item.cantidad;
      }

      if (stockErrors.length > 0) {
        const error = new Error('Uno o más productos no cuentan con stock suficiente para completar la compra.');
        error.statusCode = 409; // Conflict
        error.detalles = stockErrors;
        throw error;
      }

      // PASO 2: Insertar la cabecera en ORDENES
      const orderInsertRequest = new sql.Request(transaction);
      orderInsertRequest.input('comprador_id', sql.Int, usuarioId);
      orderInsertRequest.input('total', sql.Decimal(10, 2), totalCalculado);
      orderInsertRequest.input('direccion_envio', sql.VarChar(255), direccion_envio);
      orderInsertRequest.input('metodo_envio', sql.VarChar(50), metodo_envio || 'Estándar Asegurado para Coleccionistas');
      orderInsertRequest.input('estado_orden', sql.VarChar(20), 'Completada');

      const orderInsertQuery = `
        INSERT INTO dbo.ORDENES (comprador_id, total, direccion_envio, metodo_envio, estado_orden, fecha_orden)
        OUTPUT INSERTED.orden_id, INSERTED.fecha_orden
        VALUES (@comprador_id, @total, @direccion_envio, @metodo_envio, @estado_orden, GETDATE());
      `;

      const orderResult = await orderInsertRequest.query(orderInsertQuery);
      const ordenId = orderResult.recordset[0].orden_id;
      const fechaOrden = orderResult.recordset[0].fecha_orden;

      // PASO 3 & 4: Insertar DETALLE_ORDEN y descontar stock en PRODUCTOS
      for (const item of items) {
        // 3. Detalle
        const detailRequest = new sql.Request(transaction);
        detailRequest.input('orden_id', sql.Int, ordenId);
        detailRequest.input('producto_id', sql.Int, item.producto_id);
        detailRequest.input('cantidad', sql.Int, item.cantidad);
        detailRequest.input('precio_unitario', sql.Decimal(10, 2), item.precio);

        await detailRequest.query(`
          INSERT INTO dbo.DETALLE_ORDEN (orden_id, producto_id, cantidad, precio_unitario)
          VALUES (@orden_id, @producto_id, @cantidad, @precio_unitario);
        `);

        // 4. Descontar existencias
        const stockUpdateRequest = new sql.Request(transaction);
        stockUpdateRequest.input('producto_id', sql.Int, item.producto_id);
        stockUpdateRequest.input('cantidad_descontar', sql.Int, item.cantidad);

        await stockUpdateRequest.query(`
          UPDATE dbo.PRODUCTOS
          SET stock = stock - @cantidad_descontar
          WHERE producto_id = @producto_id;
        `);
      }

      // PASO 5: Vaciar los ítems del carrito de este comprador
      const clearCartRequest = new sql.Request(transaction);
      clearCartRequest.input('usuario_id', sql.Int, usuarioId);
      await clearCartRequest.query(`
        DELETE FROM dbo.CARRITO_ITEMS
        WHERE usuario_id = @usuario_id;
      `);

      // Confirmar la transacción atómicamente
      await transaction.commit();
      console.log(`💳 [Checkout Transaccional] Orden #${ordenId} procesada con éxito para usuario ${usuarioId}. Total: $${totalCalculado}`);

      // PASO 6: Retornar comprobante estructurado
      return {
        orden_id: ordenId,
        fecha_orden: fechaOrden,
        total: totalCalculado,
        direccion_envio,
        metodo_envio: metodo_envio || 'Estándar Asegurado para Coleccionistas',
        estado_orden: 'Completada',
        articulos: items.map((it) => ({
          producto_id: it.producto_id,
          nombre: it.nombre,
          precio_unitario: it.precio,
          cantidad: it.cantidad,
          subtotal: Number(it.precio) * it.cantidad,
          imagen_url: it.imagen_url,
        })),
      };
    } catch (error) {
      // Reversión ante cualquier falla o desabastecimiento
      if (transaction._acquiredConfig) {
        try {
          await transaction.rollback();
          console.warn(`🔄 [Checkout Transaccional] Rollback ejecutado correctamente tras error: ${error.message}`);
        } catch (rollbackErr) {
          console.error('❌ Error al revertir la transacción de checkout:', rollbackErr.message);
        }
      }
      throw error;
    }
  }

  /**
   * Consulta el historial de órdenes de un usuario
   */
  async getUserOrders(usuarioId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        SELECT 
          o.orden_id,
          o.fecha_orden,
          o.total,
          o.direccion_envio,
          o.metodo_envio,
          o.estado_orden,
          (
            SELECT 
              d.detalle_id,
              d.producto_id,
              p.nombre,
              p.imagen_url,
              d.cantidad,
              d.precio_unitario,
              (d.cantidad * d.precio_unitario) AS subtotal
            FROM dbo.DETALLE_ORDEN d
            INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
            WHERE d.orden_id = o.orden_id
            FOR JSON PATH
          ) AS articulos_json
        FROM dbo.ORDENES o
        WHERE o.comprador_id = @usuario_id
        ORDER BY o.fecha_orden DESC;
      `);

    return result.recordset.map((row) => ({
      ...row,
      articulos: row.articulos_json ? JSON.parse(row.articulos_json) : [],
    }));
  }
}

module.exports = new CheckoutService();

