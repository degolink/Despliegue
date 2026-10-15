const recommendationService = require('../services/recommendationService');

/**
 * Obtener feed de recomendaciones personalizadas
 * GET /api/recommendations
 */
const getRecommendations = async (req, res, next) => {
  try {
    const usuarioId = req.user ? req.user.usuario_id : null;
    const limit = parseInt(req.query.limit, 10) || 20;

    const result = await recommendationService.getRecommendations({
      usuarioId,
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
      persistir = true,
    } = req.body;

    let result;

    // Si el usuario está autenticado y se solicita persistir, guardamos en PREFERENCIAS_USUARIO
    if (usuarioId && persistir) {
      result = await recommendationService.saveUserPreferences(usuarioId, {
        franquicia_interes,
        categoria_preferida,
        decada_interes,
        presupuesto_min,
        presupuesto_max,
      });
    } else {
      // Cálculo en caliente para visitantes o sin guardar
      result = await recommendationService.getRecommendations({
        customPreferences: {
          franquicia_interes,
          categoria_preferida,
          decada_interes,
          presupuesto_min,
          presupuesto_max,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cuestionario procesado exitosamente. Puntajes de afinidad actualizados.',
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

