const sellerAnalyticsService = require('../services/sellerAnalyticsService');

/**
 * CONTROLADOR: Seller Analytics y Customer Intelligence Dashboard
 */
class SellerAnalyticsController {
  /**
   * Resumen general de KPIs de ventas
   * GET /api/seller/analytics/overview
   */
  async getOverview(req, res, next) {
    try {
      const vendedorId = req.user.usuario_id;
      const { startDate, endDate } = req.query;

      const overview = await sellerAnalyticsService.getOverview(vendedorId, {
        startDate,
        endDate,
      });

      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tendencias temporales de ventas
   * GET /api/seller/analytics/trends
   */
  async getSalesTrends(req, res, next) {
    try {
      const vendedorId = req.user.usuario_id;
      const { startDate, endDate } = req.query;

      const trends = await sellerAnalyticsService.getSalesTrends(vendedorId, {
        startDate,
        endDate,
      });

      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rendimiento y rotación de productos
   * GET /api/seller/analytics/products
   */
  async getProductPerformance(req, res, next) {
    try {
      const vendedorId = req.user.usuario_id;
      const { startDate, endDate, limit } = req.query;

      const performance = await sellerAnalyticsService.getProductPerformance(vendedorId, {
        startDate,
        endDate,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analítica, perfilado e inteligencia de clientes
   * GET /api/seller/analytics/customers
   */
  async getCustomerIntelligence(req, res, next) {
    try {
      const vendedorId = req.user.usuario_id;
      const { startDate, endDate } = req.query;

      const intelligence = await sellerAnalyticsService.getCustomerIntelligence(vendedorId, {
        startDate,
        endDate,
      });

      res.status(200).json({
        success: true,
        data: intelligence,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Detección de oportunidades comerciales
   * GET /api/seller/analytics/opportunities
   */
  async getCommercialOpportunities(req, res, next) {
    try {
      const vendedorId = req.user.usuario_id;

      const opportunities = await sellerAnalyticsService.getCommercialOpportunities(vendedorId);

      res.status(200).json({
        success: true,
        data: opportunities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Dashboard completo en una sola llamada para máxima eficiencia
   * GET /api/seller/analytics/dashboard
   */
  async getFullDashboard(req, res, next) {
    try {
      const vendedorId = req.user.usuario_id;
      const { startDate, endDate } = req.query;

      const [overview, trends, products, customerIntelligence, opportunities] = await Promise.all([
        sellerAnalyticsService.getOverview(vendedorId, { startDate, endDate }),
        sellerAnalyticsService.getSalesTrends(vendedorId, { startDate, endDate }),
        sellerAnalyticsService.getProductPerformance(vendedorId, { startDate, endDate }),
        sellerAnalyticsService.getCustomerIntelligence(vendedorId, { startDate, endDate }),
        sellerAnalyticsService.getCommercialOpportunities(vendedorId),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview,
          trends,
          products,
          customer_intelligence: customerIntelligence,
          opportunities,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SellerAnalyticsController();

