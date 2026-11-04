const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { getPool, sql } = require('../config/db');

/**
 * Semilla segura e idempotente de órdenes históricas de prueba para Seller Analytics.
 * Garantías:
 * - NO borra tablas ni registros.
 * - Solo se ejecuta si dbo.ORDENES está vacía (0 órdenes).
 * - Crea transacciones de compra realistas entre el comprador (Luke) y el vendedor (Obi-Wan).
 */
async function seedSampleOrders() {
  const pool = await getPool();

  try {
    const countRes = await pool.request().query('SELECT COUNT(*) AS total FROM dbo.ORDENES');
    if (countRes.recordset[0].total > 0) {
      console.log('ℹ️ Ya existen órdenes en dbo.ORDENES. Omitiendo siembra de muestra.');
      process.exit(0);
    }

    console.log('⏳ Sembrando órdenes iniciales de prueba para vendedor...');

    // Orden 1: Hace 6 días - Luke compra Darth Vader y Boba Fett
    const order1 = await pool.request().query(`
      INSERT INTO dbo.ORDENES (comprador_id, total, direccion_envio, metodo_envio, estado_orden, fecha_orden)
      OUTPUT INSERTED.orden_id
      VALUES (3, 2140.00, 'Tatooine Dune Sea Way #4, Mos Eisley', 'Transporte Blindado Interestelar', 'Completada', DATEADD(day, -6, GETDATE()));
    `);
    const id1 = order1.recordset[0].orden_id;

    await pool.request().query(`
      INSERT INTO dbo.DETALLE_ORDEN (orden_id, producto_id, cantidad, precio_unitario)
      VALUES 
      (${id1}, 1, 1, 1250.00),
      (${id1}, 4, 1, 890.00);
    `);

    // Orden 2: Hace 2 días - Luke compra Charizard PSA 9
    const order2 = await pool.request().query(`
      INSERT INTO dbo.ORDENES (comprador_id, total, direccion_envio, metodo_envio, estado_orden, fecha_orden)
      OUTPUT INSERTED.orden_id
      VALUES (3, 2400.00, 'Tatooine Dune Sea Way #4, Mos Eisley', 'Cápsula Criogénica Grado Museo', 'Completada', DATEADD(day, -2, GETDATE()));
    `);
    const id2 = order2.recordset[0].orden_id;

    await pool.request().query(`
      INSERT INTO dbo.DETALLE_ORDEN (orden_id, producto_id, cantidad, precio_unitario)
      VALUES 
      (${id2}, 2, 1, 2400.00);
    `);

    console.log(`✅ [Órdenes Sembradas] Creadas órdenes #${id1} ($2,140) y #${id2} ($2,400) vinculadas al vendedor Obi-Wan.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al sembrar órdenes de prueba:', err.message);
    process.exit(1);
  }
}

seedSampleOrders();
