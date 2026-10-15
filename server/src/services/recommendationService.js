const { getPool, sql } = require('../config/db');

/**
 * SERVICIO: Algoritmo de Recomendación Basado en Contenido (Content-Based Matching)
 * 
 * Reglas de Puntuación:
 * - Coincidencia de Franquicia: +3 puntos
 * - Coincidencia de Categoría: +2 puntos
 * - Coincidencia dentro del rango de Precio/Presupuesto (min <= precio <= max): +1 punto
 */
class RecommendationService {
  /**
   * Calcula el puntaje de afinidad para un producto individual dado un perfil de preferencias
   * @param {Object} product Datos del producto (franquicia, categoria, precio)
   * @param {Object} preferences Perfil de preferencias del usuario o cuestionario
   * @returns {{ score: number, breakdown: { franquicia: number, categoria: number, presupuesto: number } }}
   */
  calculateProductScore(product, preferences) {
    let score = 0;
    const breakdown = {
      franquicia: 0,
      categoria: 0,
      presupuesto: 0,
    };

    if (!preferences) {
      return { score: 0, breakdown };
    }

    const {
      franquicia_interes,
      categoria_preferida,
      presupuesto_min,
      presupuesto_max,
    } = preferences;

    // 1. Coincidencia de Franquicia (+3 puntos)
    if (
      franquicia_interes &&
      product.franquicia &&
      product.franquicia.trim().toLowerCase() === franquicia_interes.trim().toLowerCase()
    ) {
      score += 3;
      breakdown.franquicia = 3;
    }

    // 2. Coincidencia de Categoría (+2 puntos)
    if (
      categoria_preferida &&
      product.categoria &&
      product.categoria.trim().toLowerCase() === categoria_preferida.trim().toLowerCase()
    ) {
      score += 2;
      breakdown.categoria = 2;
    }

    // 3. Coincidencia en Rango de Precio / Presupuesto (+1 punto)
    const productPrice = Number(product.precio);
    const minPrice = presupuesto_min != null ? Number(presupuesto_min) : 0;
    const maxPrice = presupuesto_max != null ? Number(presupuesto_max) : Infinity;

    if (
      !isNaN(productPrice) &&
      productPrice >= minPrice &&
      productPrice <= maxPrice &&
      (presupuesto_min != null || presupuesto_max != null)
    ) {
      score += 1;
      breakdown.presupuesto = 1;
    }

    return { score, breakdown };
  }

  /**
   * Obtiene recomendaciones personalizadas para un usuario autenticado o basadas en datos del cuestionario
   * @param {number|null} usuarioId ID del usuario (opcional si se pasa customPreferences)
   * @param {Object|null} customPreferences Preferencias transitorias provenientes del cuestionario
   * @param {number} limit Límite de productos a retornar
   */
  async getRecommendations({ usuarioId = null, customPreferences = null, limit = 20 }) {
    const pool = await getPool();
    let preferences = customPreferences;

    // Si no se pasaron preferencias personalizadas directas, buscar las almacenadas del usuario
    if (!preferences && usuarioId) {
      const prefResult = await pool
        .request()
        .input('usuario_id', sql.Int, usuarioId)
        .query(`
          SELECT franquicia_interes, categoria_preferida, decada_interes, presupuesto_min, presupuesto_max
          FROM dbo.PREFERENCIAS_USUARIO
          WHERE usuario_id = @usuario_id
        `);

      if (prefResult.recordset.length > 0) {
        preferences = prefResult.recordset[0];
      }
    }

    // Consultar el catálogo activo de productos junto a su contexto histórico
    const productsResult = await pool.request().query(`
      SELECT 
        p.producto_id,
        p.vendedor_id,
        p.nombre,
        p.franquicia,
        p.categoria,
        p.decada,
        p.precio,
        p.estado_conservacion,
        p.stock,
        p.imagen_url,
        p.fecha_publicacion,
        u.nombre_completo AS vendedor_nombre,
        ch.ano_fabricacion,
        ch.tirada_produccion,
        ch.procedencia,
        ch.variantes_diseno,
        ch.relevancia_cultural,
        ch.nivel_autenticidad
      FROM dbo.PRODUCTOS p
      INNER JOIN dbo.USUARIOS u ON p.vendedor_id = u.usuario_id
      LEFT JOIN dbo.CONTEXTO_HISTORICO ch ON p.producto_id = ch.producto_id
      WHERE p.stock > 0
    `);

    const products = productsResult.recordset;

    // Aplicar el algoritmo Content-Based Matching
    const scoredProducts = products.map((product) => {
      const { score, breakdown } = this.calculateProductScore(product, preferences);
      return {
        ...product,
        recommendation_score: score,
        score_breakdown: breakdown,
      };
    });

    // Ordenar descendente: primero los de mayor puntaje (+3, +2, +1), luego por fecha de publicación
    scoredProducts.sort((a, b) => {
      if (b.recommendation_score !== a.recommendation_score) {
        return b.recommendation_score - a.recommendation_score;
      }
      return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
    });

    return {
      total: scoredProducts.length,
      preferences_applied: preferences || null,
      recommendations: scoredProducts.slice(0, limit),
    };
  }

  /**
   * Guarda o actualiza las preferencias de un usuario en base de datos (RF-09 / CU-06)
   */
  async saveUserPreferences(usuarioId, preferencesData) {
    const {
      franquicia_interes,
      categoria_preferida,
      decada_interes,
      presupuesto_min,
      presupuesto_max,
    } = preferencesData;

    const pool = await getPool();

    const query = `
      MERGE dbo.PREFERENCIAS_USUARIO AS target
      USING (SELECT @usuario_id AS usuario_id) AS source
      ON (target.usuario_id = source.usuario_id)
      WHEN MATCHED THEN
        UPDATE SET 
          franquicia_interes = @franquicia_interes,
          categoria_preferida = @categoria_preferida,
          decada_interes = @decada_interes,
          presupuesto_min = @presupuesto_min,
          presupuesto_max = @presupuesto_max
      WHEN NOT MATCHED THEN
        INSERT (usuario_id, franquicia_interes, categoria_preferida, decada_interes, presupuesto_min, presupuesto_max)
        VALUES (@usuario_id, @franquicia_interes, @categoria_preferida, @decada_interes, @presupuesto_min, @presupuesto_max);
    `;

    await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('franquicia_interes', sql.VarChar(100), franquicia_interes || null)
      .input('categoria_preferida', sql.VarChar(50), categoria_preferida || null)
      .input('decada_interes', sql.VarChar(20), decada_interes || null)
      .input('presupuesto_min', sql.Decimal(10, 2), presupuesto_min != null ? presupuesto_min : null)
      .input('presupuesto_max', sql.Decimal(10, 2), presupuesto_max != null ? presupuesto_max : null)
      .query(query);

    return this.getRecommendations({ usuarioId });
  }
}

module.exports = new RecommendationService();

