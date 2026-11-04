const express = require('express');
const router = express.Router();
const sellerAnalyticsController = require('../controllers/sellerAnalyticsController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/auth');

// Todas las rutas de analítica requieren autenticación y rol de Vendedor o Administrador
router.use(authenticateJWT, authorizeRoles('Vendedor', 'Administrador'));

// Endpoints
router.get('/dashboard', (req, res, next) => sellerAnalyticsController.getFullDashboard(req, res, next));
router.get('/overview', (req, res, next) => sellerAnalyticsController.getOverview(req, res, next));
router.get('/trends', (req, res, next) => sellerAnalyticsController.getSalesTrends(req, res, next));
router.get('/products', (req, res, next) => sellerAnalyticsController.getProductPerformance(req, res, next));
router.get('/customers', (req, res, next) => sellerAnalyticsController.getCustomerIntelligence(req, res, next));
router.get('/opportunities', (req, res, next) => sellerAnalyticsController.getCommercialOpportunities(req, res, next));

module.exports = router;

