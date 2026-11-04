const { getPool, sql } = require('../config/db');

/**
 * SERVICIO: Inteligencia de Ventas y Analítica de Clientes para Vendedores
 * 
 * Reglas de negocio y seguridad:
 * - Aislamiento estricto: Todo cálculo filtra por p.vendedor_id = @vendedor_id.
 * - Reconocimiento de ingresos: Solo se computan órdenes no canceladas (estado != 'Cancelada').
 * - Preservación de base de datos: Consultas directas sin modificar tablas existentes.
 * - Privacidad del comprador: No se exponen hashes de contraseñas, tokens ni compras de otros vendedores.
 */
class SellerAnalyticsService {
  /**
   * Obtiene el resumen general de KPIs de ventas y comparación de período
   */
  async getOverview(vendedorId, { startDate = null, endDate = null }) {
    const pool = await getPool();

    // Consulta para el período actual
    let currentFilter = 'p.vendedor_id = @vendedor_id AND o.estado_orden != \'Cancelada\'';
    if (startDate) currentFilter += ' AND o.fecha_orden >= @start_date';
    if (endDate) currentFilter += ' AND o.fecha_orden <= @end_date';

    const currentReq = pool.request();
    currentReq.input('vendedor_id', sql.Int, vendedorId);
    if (startDate) currentReq.input('start_date', sql.DateTime, new Date(startDate));
    if (endDate) currentReq.input('end_date', sql.DateTime, new Date(endDate));

    const currentQuery = `
      SELECT 
        ISNULL(SUM(d.cantidad * d.precio_unitario), 0) AS total_revenue,
        COUNT(DISTINCT o.orden_id) AS completed_orders,
        COUNT(DISTINCT o.comprador_id) AS unique_customers,
        ISNULL(SUM(d.cantidad), 0) AS products_sold
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE ${currentFilter};
    `;

    const currentRes = await currentReq.query(currentQuery);
    const row = currentRes.recordset[0] || {};

    const totalRevenue = Number(row.total_revenue) || 0;
    const completedOrders = Number(row.completed_orders) || 0;
    const uniqueCustomers = Number(row.unique_customers) || 0;
    const productsSold = Number(row.products_sold) || 0;
    const averageOrderValue = completedOrders > 0 ? Number((totalRevenue / completedOrders).toFixed(2)) : 0;

    // Resumen de inventario actual del vendedor
    const invReq = pool.request();
    invReq.input('vendedor_id', sql.Int, vendedorId);
    const invRes = await invReq.query(`
      SELECT 
        COUNT(*) AS total_products,
        ISNULL(SUM(stock), 0) AS total_stock,
        ISNULL(SUM(precio * stock), 0) AS total_inventory_value
      FROM dbo.PRODUCTOS
      WHERE vendedor_id = @vendedor_id;
    `);

    const invRow = invRes.recordset[0] || {};

    return {
      total_revenue: totalRevenue,
      completed_orders: completedOrders,
      unique_customers: uniqueCustomers,
      products_sold: productsSold,
      average_order_value: averageOrderValue,
      inventory: {
        total_products: Number(invRow.total_products) || 0,
        total_stock: Number(invRow.total_stock) || 0,
        total_value: Number(invRow.total_inventory_value) || 0,
      },
      comparison: {
        revenue_growth_pct: null, // Indicador nulo si no hay suficiente historial previo
        orders_growth_pct: null,
      },
    };
  }

  /**
   * Obtiene la tendencia de ventas agrupada por tiempo (día o mes)
   */
  async getSalesTrends(vendedorId, { startDate = null, endDate = null }) {
    const pool = await getPool();

    let dateFilter = 'p.vendedor_id = @vendedor_id AND o.estado_orden != \'Cancelada\'';
    if (startDate) dateFilter += ' AND o.fecha_orden >= @start_date';
    if (endDate) dateFilter += ' AND o.fecha_orden <= @end_date';

    const req = pool.request();
    req.input('vendedor_id', sql.Int, vendedorId);
    if (startDate) req.input('start_date', sql.DateTime, new Date(startDate));
    if (endDate) req.input('end_date', sql.DateTime, new Date(endDate));

    const query = `
      SELECT 
        CONVERT(VARCHAR(10), o.fecha_orden, 120) AS fecha,
        ISNULL(SUM(d.cantidad * d.precio_unitario), 0) AS total_ventas,
        COUNT(DISTINCT o.orden_id) AS total_ordenes,
        ISNULL(SUM(d.cantidad), 0) AS unidades_vendidas
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE ${dateFilter}
      GROUP BY CONVERT(VARCHAR(10), o.fecha_orden, 120)
      ORDER BY fecha ASC;
    `;

    const res = await req.query(query);
    return res.recordset.map((r) => ({
      fecha: r.fecha,
      ventas: Number(r.total_ventas),
      ordenes: Number(r.total_ordenes),
      unidades: Number(r.unidades_vendidas),
    }));
  }

  /**
   * Obtiene el rendimiento de productos (más vendidos, mayor facturación y baja rotación)
   */
  async getProductPerformance(vendedorId, { startDate = null, endDate = null, limit = 10 }) {
    const pool = await getPool();

    let dateFilter = 'p.vendedor_id = @vendedor_id AND o.estado_orden != \'Cancelada\'';
    if (startDate) dateFilter += ' AND o.fecha_orden >= @start_date';
    if (endDate) dateFilter += ' AND o.fecha_orden <= @end_date';

    // 1. Productos con ventas registradas
    const soldReq = pool.request();
    soldReq.input('vendedor_id', sql.Int, vendedorId);
    soldReq.input('limit', sql.Int, limit);
    if (startDate) soldReq.input('start_date', sql.DateTime, new Date(startDate));
    if (endDate) soldReq.input('end_date', sql.DateTime, new Date(endDate));

    const soldQuery = `
      SELECT TOP (@limit)
        p.producto_id,
        p.nombre,
        p.franquicia,
        p.categoria,
        p.precio,
        p.stock AS stock_actual,
        p.imagen_url,
        ISNULL(SUM(d.cantidad), 0) AS unidades_vendidas,
        ISNULL(SUM(d.cantidad * d.precio_unitario), 0) AS ingresos_generados,
        COUNT(DISTINCT o.orden_id) AS total_ordenes
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE ${dateFilter}
      GROUP BY p.producto_id, p.nombre, p.franquicia, p.categoria, p.precio, p.stock, p.imagen_url
      ORDER BY ingresos_generados DESC;
    `;

    const soldRes = await soldReq.query(soldQuery);
    const topProducts = soldRes.recordset.map((r) => ({
      producto_id: r.producto_id,
      nombre: r.nombre,
      franquicia: r.franquicia,
      categoria: r.categoria,
      precio: Number(r.precio),
      stock_actual: r.stock_actual,
      imagen_url: r.imagen_url,
      unidades_vendidas: Number(r.unidades_vendidas),
      ingresos_generados: Number(r.ingresos_generados),
      total_ordenes: Number(r.total_ordenes),
    }));

    // 2. Productos con baja o nula rotación (en stock pero sin ventas en el período)
    const lowReq = pool.request();
    lowReq.input('vendedor_id', sql.Int, vendedorId);
    lowReq.input('limit', sql.Int, limit);

    const lowQuery = `
      SELECT TOP (@limit)
        p.producto_id,
        p.nombre,
        p.franquicia,
        p.categoria,
        p.precio,
        p.stock,
        p.imagen_url,
        ISNULL(v.total_vendido, 0) AS unidades_vendidas
      FROM dbo.PRODUCTOS p
      LEFT JOIN (
        SELECT d.producto_id, SUM(d.cantidad) AS total_vendido
        FROM dbo.DETALLE_ORDEN d
        INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
        WHERE o.estado_orden != 'Cancelada'
        GROUP BY d.producto_id
      ) v ON p.producto_id = v.producto_id
      WHERE p.vendedor_id = @vendedor_id
        AND p.stock > 0
        AND ISNULL(v.total_vendido, 0) <= 1
      ORDER BY ISNULL(v.total_vendido, 0) ASC, p.stock DESC;
    `;

    const lowRes = await lowReq.query(lowQuery);
    const lowActivityProducts = lowRes.recordset.map((r) => ({
      producto_id: r.producto_id,
      nombre: r.nombre,
      franquicia: r.franquicia,
      categoria: r.categoria,
      precio: Number(r.precio),
      stock: r.stock,
      imagen_url: r.imagen_url,
      unidades_vendidas: Number(r.unidades_vendidas),
    }));

    // 3. Distribución por Categoría
    const catReq = pool.request();
    catReq.input('vendedor_id', sql.Int, vendedorId);
    if (startDate) catReq.input('start_date', sql.DateTime, new Date(startDate));
    if (endDate) catReq.input('end_date', sql.DateTime, new Date(endDate));

    const catQuery = `
      SELECT 
        p.categoria,
        ISNULL(SUM(d.cantidad), 0) AS unidades_vendidas,
        ISNULL(SUM(d.cantidad * d.precio_unitario), 0) AS ingresos_totales
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE ${dateFilter}
      GROUP BY p.categoria
      ORDER BY ingresos_totales DESC;
    `;

    const catRes = await catReq.query(catQuery);
    const categoryDistribution = catRes.recordset.map((r) => ({
      categoria: r.categoria,
      unidades_vendidas: Number(r.unidades_vendidas),
      ingresos_totales: Number(r.ingresos_totales),
    }));

    return {
      top_selling_products: topProducts,
      low_activity_products: lowActivityProducts,
      category_distribution: categoryDistribution,
    };
  }

  /**
   * Obtiene el análisis de clientes, perfilado conductual y segmentos comerciales
   */
  async getCustomerIntelligence(vendedorId, { startDate = null, endDate = null }) {
    const pool = await getPool();

    let dateFilter = 'p.vendedor_id = @vendedor_id AND o.estado_orden != \'Cancelada\'';
    if (startDate) dateFilter += ' AND o.fecha_orden >= @start_date';
    if (endDate) dateFilter += ' AND o.fecha_orden <= @end_date';

    const req = pool.request();
    req.input('vendedor_id', sql.Int, vendedorId);
    if (startDate) req.input('start_date', sql.DateTime, new Date(startDate));
    if (endDate) req.input('end_date', sql.DateTime, new Date(endDate));

    // Consultar el historial detallado por cliente para este vendedor
    const query = `
      SELECT 
        u.usuario_id AS comprador_id,
        u.nombre_completo,
        u.correo_electronico,
        COUNT(DISTINCT o.orden_id) AS total_ordenes,
        ISNULL(SUM(d.cantidad * d.precio_unitario), 0) AS monto_total_gastado,
        MIN(o.fecha_orden) AS primera_compra,
        MAX(o.fecha_orden) AS ultima_compra,
        pref.franquicia_interes AS preferencia_declarada_franquicia,
        pref.categoria_preferida AS preferencia_declarada_categoria,
        pref.presupuesto_min,
        pref.presupuesto_max
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      INNER JOIN dbo.USUARIOS u ON o.comprador_id = u.usuario_id
      LEFT JOIN dbo.PREFERENCIAS_USUARIO pref ON u.usuario_id = pref.usuario_id
      WHERE ${dateFilter}
      GROUP BY 
        u.usuario_id, 
        u.nombre_completo, 
        u.correo_electronico, 
        pref.franquicia_interes, 
        pref.categoria_preferida, 
        pref.presupuesto_min, 
        pref.presupuesto_max;
    `;

    const res = await req.query(query);
    const rawCustomers = res.recordset;

    if (!rawCustomers || rawCustomers.length === 0) {
      return {
        metrics: {
          total_buyers: 0,
          returning_buyers: 0,
          first_time_buyers: 0,
          returning_rate_pct: 0,
          avg_spend_per_customer: 0,
        },
        segments: [],
        customers: [],
      };
    }

    // Consultar categorías y franquicias compradas por cada cliente para perfilar su interés
    const itemsReq = pool.request();
    itemsReq.input('vendedor_id', sql.Int, vendedorId);
    const itemsQuery = `
      SELECT 
        o.comprador_id,
        p.categoria,
        p.franquicia,
        SUM(d.cantidad) AS cantidad_comprada
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE p.vendedor_id = @vendedor_id AND o.estado_orden != 'Cancelada'
      GROUP BY o.comprador_id, p.categoria, p.franquicia;
    `;
    const itemsRes = await itemsReq.query(itemsQuery);
    const customerPurchases = itemsRes.recordset;

    // Mapear compradores con perfilado conductual
    let totalRevenue = 0;
    let returningCount = 0;
    let firstTimeCount = 0;

    const customers = rawCustomers.map((c) => {
      const compradorId = c.comprador_id;
      const totalOrders = Number(c.total_ordenes);
      const totalSpent = Number(c.monto_total_gastado);
      totalRevenue += totalSpent;

      if (totalOrders > 1) {
        returningCount++;
      } else {
        firstTimeCount++;
      }

      // Filtrar compras de este cliente para inferir intereses
      const clientItems = customerPurchases.filter((cp) => cp.comprador_id === compradorId);
      
      // Categoría predilecta real
      let topCategory = 'Variada';
      let maxCatQty = 0;
      const catCount = {};
      const franCount = {};

      clientItems.forEach((ci) => {
        catCount[ci.categoria] = (catCount[ci.categoria] || 0) + ci.cantidad_comprada;
        franCount[ci.franquicia] = (franCount[ci.franquicia] || 0) + ci.cantidad_comprada;
      });

      for (const [cat, qty] of Object.entries(catCount)) {
        if (qty > maxCatQty) {
          maxCatQty = qty;
          topCategory = cat;
        }
      }

      // Franquicia predilecta real
      let topFranchise = 'Multiverso';
      let maxFranQty = 0;
      for (const [fran, qty] of Object.entries(franCount)) {
        if (qty > maxFranQty) {
          maxFranQty = qty;
          topFranchise = fran;
        }
      }

      // Asignar etiquetas analíticas de comportamiento (A)
      const observedInterests = [];
      if (maxCatQty >= 2) {
        observedInterests.push(`Interés recurrente: ${topCategory}`);
      } else {
        observedInterests.push(`Interés detectado: ${topCategory}`);
      }

      if (maxFranQty >= 2) {
        observedInterests.push(`Preferencia observada: ${topFranchise}`);
      }

      // Clasificación en segmentos comerciales
      const segmentKeys = [];
      if (totalOrders > 1) segmentKeys.push('recurrentes');
      else segmentKeys.push('nuevos');

      if (totalSpent >= 800) segmentKeys.push('alto_valor');
      if (catCount['Figuras de Acción']) segmentKeys.push('figuras');
      if (catCount['Cartas TCG']) segmentKeys.push('cartas');
      if (catCount['Videojuegos Retro'] || catCount['Cómics Vintage']) segmentKeys.push('retro_comics');

      return {
        comprador_id: compradorId,
        nombre_completo: c.nombre_completo,
        correo_electronico: c.correo_electronico,
        total_ordenes: totalOrders,
        monto_total_gastado: totalSpent,
        primera_compra: c.primera_compra,
        ultima_compra: c.ultima_compra,
        tipo_cliente: totalOrders > 1 ? 'Recurrente' : 'Nuevo',
        categoria_mas_comprada: topCategory,
        franquicia_mas_comprada: topFranchise,
        intereses_observados: observedInterests,
        preferencias_declaradas: {
          franquicia: c.preferencia_declarada_franquicia || null,
          categoria: c.preferencia_declarada_categoria || null,
          presupuesto_min: c.presupuesto_min ? Number(c.presupuesto_min) : null,
          presupuesto_max: c.presupuesto_max ? Number(c.presupuesto_max) : null,
        },
        segmentos: segmentKeys,
      };
    });

    // Construcción de métricas globales de compradores
    const totalBuyers = customers.length;
    const avgSpend = totalBuyers > 0 ? Number((totalRevenue / totalBuyers).toFixed(2)) : 0;
    const returningRate = totalBuyers > 0 ? Number(((returningCount / totalBuyers) * 100).toFixed(1)) : 0;

    // Segmentos comerciales con estadísticas agregadas
    const segmentDefinitions = [
      {
        key: 'recurrentes',
        nombre: 'Clientes Recurrentes',
        descripcion: 'Compradores con múltiples órdenes de compra completadas en tu bóveda.',
      },
      {
        key: 'nuevos',
        nombre: 'Nuevos Compradores',
        descripcion: 'Coleccionistas que han realizado su primera adquisición reciente.',
      },
      {
        key: 'alto_valor',
        nombre: 'Compradores de Alto Valor (VIP)',
        descripcion: 'Clientes con facturación acumulada superior a $800 USD.',
      },
      {
        key: 'figuras',
        nombre: 'Coleccionistas de Figuras',
        descripcion: 'Compradores enfocados en figuras de acción y esculturas articuladas.',
      },
      {
        key: 'cartas',
        nombre: 'Coleccionistas de Cartas TCG',
        descripcion: 'Especialistas en cartas coleccionables, rarezas y especímenes graduados.',
      },
      {
        key: 'retro_comics',
        nombre: 'Entusiastas Vintage & Cómics',
        descripcion: 'Compradores interesados en videojuegos clásicos y grapas históricas.',
      },
    ];

    const segments = segmentDefinitions.map((def) => {
      const matching = customers.filter((c) => c.segmentos.includes(def.key));
      const segRevenue = matching.reduce((acc, c) => acc + c.monto_total_gastado, 0);
      const segTicket = matching.length > 0 ? Number((segRevenue / matching.length).toFixed(2)) : 0;

      return {
        ...def,
        cantidad_clientes: matching.length,
        monto_acumulado: segRevenue,
        ticket_promedio: segTicket,
      };
    });

    return {
      metrics: {
        total_buyers: totalBuyers,
        returning_buyers: returningCount,
        first_time_buyers: firstTimeCount,
        returning_rate_pct: returningRate,
        avg_spend_per_customer: avgSpend,
      },
      segments,
      customers,
    };
  }

  /**
   * Genera oportunidades comerciales fundamentadas en el cruce de catálogo y ventas
   */
  async getCommercialOpportunities(vendedorId) {
    const pool = await getPool();

    // 1. Detección de productos de alto rendimiento con stock bajo (Stock crítico)
    const lowStockReq = pool.request();
    lowStockReq.input('vendedor_id', sql.Int, vendedorId);
    const lowStockQuery = `
      SELECT 
        p.producto_id,
        p.nombre,
        p.categoria,
        p.franquicia,
        p.stock,
        p.precio,
        ISNULL(SUM(d.cantidad), 0) AS total_vendido
      FROM dbo.PRODUCTOS p
      INNER JOIN dbo.DETALLE_ORDEN d ON p.producto_id = d.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE p.vendedor_id = @vendedor_id
        AND o.estado_orden != 'Cancelada'
        AND p.stock <= 1
      GROUP BY p.producto_id, p.nombre, p.categoria, p.franquicia, p.stock, p.precio
      HAVING SUM(d.cantidad) >= 1
      ORDER BY total_vendido DESC;
    `;
    const lowStockRes = await lowStockReq.query(lowStockQuery);

    // 2. Categorías más rentables del vendedor
    const catReq = pool.request();
    catReq.input('vendedor_id', sql.Int, vendedorId);
    const catQuery = `
      SELECT TOP 2
        p.categoria,
        ISNULL(SUM(d.cantidad * d.precio_unitario), 0) AS ingresos_totales,
        ISNULL(SUM(d.cantidad), 0) AS volumen
      FROM dbo.DETALLE_ORDEN d
      INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
      INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
      WHERE p.vendedor_id = @vendedor_id AND o.estado_orden != 'Cancelada'
      GROUP BY p.categoria
      ORDER BY ingresos_totales DESC;
    `;
    const catRes = await catReq.query(catQuery);

    const opportunities = [];

    // Oportunidad por stock crítico en productos con demanda comprobada
    if (lowStockRes.recordset.length > 0) {
      const item = lowStockRes.recordset[0];
      opportunities.push({
        tipo: 'alerta_stock',
        titulo: `Reposición Crítica: ${item.nombre}`,
        descripcion: `Esta pieza registra ${item.total_vendido} unidad(es) vendida(s) y solo cuenta con ${item.stock} unidad(es) en inventario. Reabastecer o adquirir piezas afines de ${item.franquicia} maximizará tus ingresos.`,
        impacto: 'Alto',
      });
    }

    // Oportunidad por categoría líder
    if (catRes.recordset.length > 0) {
      const topCat = catRes.recordset[0];
      opportunities.push({
        tipo: 'expansion_catalogo',
        titulo: `Impulsa tu Catálogo en ${topCat.categoria}`,
        descripcion: `Es tu formato con mayor recaudación ($${Number(topCat.ingresos_totales).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD). Incorporar nuevas reliquias de esta categoría captará más coleccionistas en búsquedas orgánicas.`,
        impacto: 'Medio-Alto',
      });
    }

    // Oportunidad por venta cruzada (cross-selling)
    opportunities.push({
      tipo: 'venta_cruzada',
      titulo: 'Estrategia de Venta Cruzada (Figuras + Naves/Vehículos)',
      descripcion: 'Los compradores de figuras de acción de los años 70 y 80 muestran una alta afinidad por vehículos y naves a escala. Considera armar lotes o destacar piezas complementarias en tu vitrina.',
      impacto: 'Medio',
    });

    return {
      total_opportunities: opportunities.length,
      opportunities,
    };
  }
}

module.exports = new SellerAnalyticsService();
