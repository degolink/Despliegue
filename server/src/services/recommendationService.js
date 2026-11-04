const { getPool, sql } = require('../config/db');
const { QUESTIONS, DIMENSION_WEIGHTS } = require('../data/quizQuestions');

/**
 * SERVICIO: Algoritmo de Recomendación Multidimensional y Concierge Arqueológico
 * 
 * Modos de scoring:
 * 1. Multidimensional (Test de Personalidad de 20 preguntas):
 *    - Universos ficticios (25%)
 *    - Categorías de coleccionables (25%)
 *    - Personajes y arquetipos (15%)
 *    - Eventos narrativos (15%)
 *    - Nostalgia y épocas (10%)
 *    - Rareza y condición (10%)
 *    Genera justificación semántica en español (match_reason) por ítem.
 * 
 * 2. Content-Based clásico (Retrocompatible):
 *    - Franquicia (+3), Categoría (+2), Presupuesto (+1).
 */
class RecommendationService {
  /**
   * Analiza las 20 respuestas del test y computa el perfil multidimensional del coleccionista
   * @param {Object} respuestas Mapa de { [preguntaId]: opcionId }
   * @returns {Object} Perfil analítico multidimensional y proyecciones
   */
  analyzeMultidimensionalProfile(respuestas = {}) {
    if (!respuestas || Object.keys(respuestas).length === 0) {
      return null;
    }

    const franchiseCounts = {};
    const categoryCounts = {};
    const keywordsSet = new Set();
    const motivations = [];
    const dimensionRawScores = {
      universos: 0,
      categorias: 0,
      personajes: 0,
      eventos: 0,
      nostalgia: 0,
      rareza: 0,
    };

    let answeredCount = 0;
    let selectedMotivationTitle = 'Custodio del Patrimonio Cultural';

    // Procesar cada respuesta contra el banco de preguntas oficial
    QUESTIONS.forEach((q) => {
      const selectedOptionId = respuestas[q.id] || respuestas[String(q.id)];
      if (!selectedOptionId) return;

      const opt = q.opciones.find((o) => o.id === selectedOptionId);
      if (!opt) return;

      answeredCount++;

      // Acumular franquicias
      if (opt.franquicia) {
        franchiseCounts[opt.franquicia] = (franchiseCounts[opt.franquicia] || 0) + 1;
      }
      // Acumular categorías
      if (opt.categoria) {
        categoryCounts[opt.categoria] = (categoryCounts[opt.categoria] || 0) + 1;
      }
      // Acumular keywords
      if (Array.isArray(opt.keywords)) {
        opt.keywords.forEach((kw) => keywordsSet.add(kw.toLowerCase()));
      }
      // Título de perfil de la pregunta 20
      if (opt.perfilTitulo) {
        selectedMotivationTitle = opt.perfilTitulo;
        motivations.push(opt.perfilTitulo);
      }

      // Sumar impacto en dimensión
      const dim = q.dimension === 'motivacion' ? 'rareza' : q.dimension;
      if (dimensionRawScores[dim] !== undefined) {
        dimensionRawScores[dim] += 1;
      }
    });

    if (answeredCount === 0) {
      return null;
    }

    // Determinar franquicia y categoría predominante
    const primaryFranchise = Object.keys(franchiseCounts).reduce(
      (a, b) => (franchiseCounts[a] > franchiseCounts[b] ? a : b),
      'Star Wars'
    );
    const primaryCategory = Object.keys(categoryCounts).reduce(
      (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
      'Figuras de Acción'
    );

    // Calcular porcentajes normalizados por dimensión
    const dimensionPercentages = {
      universos: Math.min(100, Math.round(((dimensionRawScores.universos || 1) / 4) * 100)),
      categorias: Math.min(100, Math.round(((dimensionRawScores.categorias || 1) / 4) * 100)),
      personajes: Math.min(100, Math.round(((dimensionRawScores.personajes || 1) / 3) * 100)),
      eventos: Math.min(100, Math.round(((dimensionRawScores.eventos || 1) / 3) * 100)),
      nostalgia: Math.min(100, Math.round(((dimensionRawScores.nostalgia || 1) / 3) * 100)),
      rareza: Math.min(100, Math.round(((dimensionRawScores.rareza || 1) / 3) * 100)),
    };

    // Arquetipo final bautizado
    let archetypeTitle = selectedMotivationTitle;
    let archetypeDescription = `Tu perfil denota un alto rigor de preservación con afinidad central hacia el universo ${primaryFranchise} y formato ${primaryCategory}.`;

    if (primaryFranchise === 'Star Wars') {
      archetypeTitle = 'Guardián de Reliquias Galácticas';
      archetypeDescription = 'Especialista en la preservación de artefactos de la Guerra Civil Galáctica, la Fuerza y la edad de oro de Kenner (1977-1985).';
    } else if (primaryFranchise === 'Pokémon') {
      archetypeTitle = 'Archivista Legendario de Kanto';
      archetypeDescription = 'Coleccionista de precisión enfocado en rareza holográfica de Wizards of the Coast (1999) y especímenes PSA grado 9-10.';
    } else if (primaryFranchise === 'Transformers') {
      archetypeTitle = 'Comandante de Titanes Cybertronianos';
      archetypeDescription = 'Devoto de la ingeniería Takara / Hasbro G1 de 1984 y las matrices de liderazgo meca vintage.';
    } else if (primaryFranchise === 'Nintendo') {
      archetypeTitle = 'Curador de la Época Dorada de 8 y 16 Bits';
      archetypeDescription = 'Investigador de títulos pioneros en cartucho sellado, con devoción por Shigeru Miyamoto y la era NES/SNES.';
    } else if (primaryFranchise === 'DC Comics' || primaryFranchise === 'Marvel Comics') {
      archetypeTitle = 'Cronista de la Edad de Oro del Cómic';
      archetypeDescription = 'Custodio de primeras apariciones heroicas, grapas históricas y el choque mitológico entre el orden y el caos.';
    }

    return {
      answeredCount,
      primaryFranchise,
      primaryCategory,
      archetypeTitle,
      archetypeDescription,
      dimensionPercentages,
      weights: DIMENSION_WEIGHTS,
      keywords: Array.from(keywordsSet),
      franchiseCounts,
      categoryCounts,
    };
  }

  /**
   * Calcula el puntaje multidimensional para un producto contra el perfil del test de 20 preguntas
   */
  calculateMultidimensionalScore(product, profile) {
    if (!profile) {
      return { score: 0, reason: null, breakdown: {} };
    }

    const { primaryFranchise, primaryCategory, keywords, dimensionPercentages } = profile;
    const reasons = [];

    // 1. Universo / Franquicia (Ponderación 25%)
    let universeScore = 0;
    const prodFranchise = (product.franquicia || '').toLowerCase().trim();
    const prodName = (product.nombre || '').toLowerCase();
    const prodRelevance = (product.relevancia_cultural || '').toLowerCase();
    const prodVariants = (product.variantes_diseno || '').toLowerCase();

    if (prodFranchise === primaryFranchise.toLowerCase()) {
      universeScore = 25;
      reasons.push(`Alineación directa con tu universo predilecto (${primaryFranchise})`);
    } else if (prodName.includes(primaryFranchise.toLowerCase())) {
      universeScore = 18;
      reasons.push(`Contenido directamente relacionado con ${primaryFranchise}`);
    }

    // 2. Categoría de Coleccionable (Ponderación 25%)
    let categoryScore = 0;
    const prodCategory = (product.categoria || '').toLowerCase().trim();
    if (prodCategory === primaryCategory.toLowerCase()) {
      categoryScore = 25;
      reasons.push(`Formato exacto de vitrina deseado: ${primaryCategory}`);
    } else if (prodCategory.includes('figura') && primaryCategory.toLowerCase().includes('figura')) {
      categoryScore = 20;
      reasons.push(`Formato afín de figuras y estatuas`);
    }

    // 3. Personajes, Arquetipos y Keywords (Ponderación 15%)
    let characterScore = 0;
    let matchedKeywords = [];
    keywords.forEach((kw) => {
      if (
        kw.length > 2 &&
        (prodName.includes(kw) || prodRelevance.includes(kw) || prodVariants.includes(kw))
      ) {
        matchedKeywords.push(kw);
      }
    });

    if (matchedKeywords.length > 0) {
      characterScore = Math.min(15, matchedKeywords.length * 5);
      reasons.push(`Coincidencia iconográfica en personajes clave (${matchedKeywords.slice(0, 3).join(', ')})`);
    }

    // 4. Eventos Narrativos y Contexto Histórico (Ponderación 15%)
    let eventScore = 0;
    if (product.relevancia_cultural && product.relevancia_cultural.length > 10) {
      eventScore = 15;
    } else if (product.ano_fabricacion) {
      eventScore = 10;
    }

    // 5. Nostalgia y Épocas (Ponderación 10%)
    let nostalgiaScore = 0;
    const decada = product.decada || '';
    if (decada.includes('1970') || decada.includes('1980') || decada.includes('1990')) {
      nostalgiaScore = 10;
      reasons.push(`Pieza histórica genuina de la época vintage (${decada})`);
    } else {
      nostalgiaScore = 6;
    }

    // 6. Rareza y Condición de Conservación (Ponderación 10%)
    let rarityScore = 0;
    const estado = (product.estado_conservacion || '').toLowerCase();
    const tirada = (product.tirada_produccion || '').toLowerCase();
    if (
      estado.includes('mint') ||
      estado.includes('sellado') ||
      estado.includes('graduado') ||
      tirada.includes('limitada') ||
      tirada.includes('rara')
    ) {
      rarityScore = 10;
      reasons.push(`Grado de conservación superior y alta demanda coleccionista`);
    } else {
      rarityScore = 6;
    }

    const totalScore = universeScore + categoryScore + characterScore + eventScore + nostalgiaScore + rarityScore;
    const normalizedScore = Math.min(100, Math.round(totalScore));

    const matchReason =
      reasons.length > 0
        ? `${reasons.join('. ')}.`
        : `Pieza del catálogo Mythic Shelf seleccionada por compatibilidad histórica y estética.`;

    return {
      score: normalizedScore,
      reason: matchReason,
      breakdown: {
        universos: universeScore,
        categorias: categoryScore,
        personajes: characterScore,
        eventos: eventScore,
        nostalgia: nostalgiaScore,
        rareza: rarityScore,
      },
    };
  }

  /**
   * Calcula el puntaje de afinidad clásico (+3 / +2 / +1) para retrocompatibilidad
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
   */
  async getRecommendations({
    usuarioId = null,
    customPreferences = null,
    respuestas_test = null,
    limit = 20,
  }) {
    const pool = await getPool();
    let preferences = customPreferences;
    let profileAnalysis = null;

    // Si viene el cuestionario de 20 preguntas, computar el perfil multidimensional
    if (respuestas_test && Object.keys(respuestas_test).length > 0) {
      profileAnalysis = this.analyzeMultidimensionalProfile(respuestas_test);
      if (profileAnalysis) {
        preferences = {
          franquicia_interes: profileAnalysis.primaryFranchise,
          categoria_preferida: profileAnalysis.primaryCategory,
          decada_interes: 'Vintage',
          presupuesto_min: 50,
          presupuesto_max: 3000,
        };
      }
    }

    // Si no se pasaron preferencias ni test directo, buscar las almacenadas del usuario en SQL Server
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

    // Calcular afinidad: Multidimensional si hubo test, o Clásico si fue por formulario de filtros
    const scoredProducts = products.map((product) => {
      if (profileAnalysis) {
        const { score, reason, breakdown } = this.calculateMultidimensionalScore(product, profileAnalysis);
        return {
          ...product,
          recommendation_score: score,
          match_reason: reason,
          score_breakdown: breakdown,
        };
      } else {
        const { score, breakdown } = this.calculateProductScore(product, preferences);
        return {
          ...product,
          recommendation_score: score,
          match_reason:
            score >= 3
              ? `Coincidencia destacada con tus preferencias de ${product.franquicia} y ${product.categoria}.`
              : null,
          score_breakdown: breakdown,
        };
      }
    });

    // Ordenar descendente: mayor puntaje de afinidad primero, luego fecha de publicación
    scoredProducts.sort((a, b) => {
      if (b.recommendation_score !== a.recommendation_score) {
        return b.recommendation_score - a.recommendation_score;
      }
      return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
    });

    return {
      total: scoredProducts.length,
      preferences_applied: preferences || null,
      profile_analysis: profileAnalysis,
      recommendations: scoredProducts.slice(0, limit),
    };
  }

  /**
   * Guarda o actualiza las preferencias de un usuario en base de datos (RF-09 / CU-06)
   * Respeta al 100% las tablas y columnas existentes en SQL Server
   */
  async saveUserPreferences(usuarioId, preferencesData) {
    const {
      franquicia_interes,
      categoria_preferida,
      decada_interes,
      presupuesto_min,
      presupuesto_max,
      respuestas_test,
    } = preferencesData;

    let finalFranchise = franquicia_interes;
    let finalCategory = categoria_preferida;
    let profileAnalysis = null;

    if (respuestas_test) {
      profileAnalysis = this.analyzeMultidimensionalProfile(respuestas_test);
      if (profileAnalysis) {
        finalFranchise = profileAnalysis.primaryFranchise || finalFranchise;
        finalCategory = profileAnalysis.primaryCategory || finalCategory;
      }
    }

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
      .input('franquicia_interes', sql.VarChar(100), finalFranchise || null)
      .input('categoria_preferida', sql.VarChar(50), finalCategory || null)
      .input('decada_interes', sql.VarChar(20), decada_interes || null)
      .input('presupuesto_min', sql.Decimal(10, 2), presupuesto_min != null ? presupuesto_min : null)
      .input('presupuesto_max', sql.Decimal(10, 2), presupuesto_max != null ? presupuesto_max : null)
      .query(query);

    return this.getRecommendations({ usuarioId, respuestas_test });
  }
}

module.exports = new RecommendationService();
