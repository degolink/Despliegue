const recommendationService = require('../services/recommendationService');

/** Lee ?page y ?limit con valores seguros (nunca NaN, límite máximo 50). */
const parsePagination = (query) => ({
  page: Math.max(1, parseInt(query.page, 10) || 1),
  limit: Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20)),
});

/**
 * Obtener feed de recomendaciones personalizadas
 * GET /api/recommendations
 */
const getRecommendations = async (req, res, next) => {
  try {
    const usuarioId = req.user ? req.user.usuario_id : null;
    const { page, limit } = parsePagination(req.query);

    const result = await recommendationService.getRecommendations({
      usuarioId,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      message: 'Recomendaciones calculadas según afinidad de perfil.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Evaluar recomendaciones transitorias o guardar preferencias tras cuestionario
 * POST /api/recommendations/questionnaire
 * Soporta tanto el test multidimensional de 20 preguntas (respuestas_test) como el formulario clásico
 */
const submitQuestionnaire = async (req, res, next) => {
  try {
    const usuarioId = req.user ? req.user.usuario_id : null;
    const {
      franquicia_interes,
      categoria_preferida,
      decada_interes,
      presupuesto_min,
      presupuesto_max,
      respuestas_test,
      persistir = true,
    } = req.body;

    const { page, limit } = parsePagination(req.query);
    let result;

    // Si el usuario está autenticado y se solicita persistir, guardamos en PREFERENCIAS_USUARIO
    if (usuarioId && persistir) {
      result = await recommendationService.saveUserPreferences(usuarioId, {
        franquicia_interes,
        categoria_preferida,
        decada_interes,
        presupuesto_min,
        presupuesto_max,
        respuestas_test,
      }, { page, limit });
    } else {
      // Cálculo dinámico para visitantes o previsualización sin alterar preferencias guardadas
      result = await recommendationService.getRecommendations({
        customPreferences: {
          franquicia_interes,
          categoria_preferida,
          decada_interes,
          presupuesto_min,
          presupuesto_max,
        },
        respuestas_test,
        page,
        limit,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cuestionario procesado exitosamente. Perfil multidimensional y recomendaciones actualizadas.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  submitQuestionnaire,
};
