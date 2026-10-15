const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { optionalJWT } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { questionnaireSchema } = require('../validators');

// Obtener recomendaciones basadas en el perfil del usuario autenticado o catálogo general
router.get('/', optionalJWT, recommendationController.getRecommendations);

// RF-09 y CU-06: Procesar cuestionario interactivo de preferencias (autenticado o invitado)
router.post(
  '/questionnaire',
  optionalJWT,
  validate(questionnaireSchema),
  recommendationController.submitQuestionnaire
);

module.exports = router;

