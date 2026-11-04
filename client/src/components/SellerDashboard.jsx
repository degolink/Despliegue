import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  Search,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  ChevronDown,
  BarChart3,
  Award,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function SellerDashboard({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('resumen');
  const [dateRange, setDateRange] = useState('all'); // '7d', '30d', '90d', 'all'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Filtros locales para la tabla de compradores
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('todos');

  // Calcular fechas según dateRange
  const getDateParams = () => {
    if (dateRange === 'all') return {};
    const now = new Date();
    let days = 30;
    if (dateRange === '7d') days = 7;
    if (dateRange === '90d') days = 90;

    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return {
      startDate: start.toISOString(),
      endDate: now.toISOString(),
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = getDateParams();
      const res = await api.get('/seller/analytics/dashboard', { params });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error cargando analítica de vendedor:', err);
      setError(err.response?.data?.message || 'Error al sincronizar datos analíticos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const overview = data?.overview || {};
  const trends = data?.trends || [];
  const products = data?.products || {};
  const customerIntel = data?.customer_intelligence || {};
  const opportunities = data?.opportunities?.opportunities || [];

  // Filtrar compradores en la tabla
  const filteredCustomers = (customerIntel.customers || []).filter((c) => {
    const matchesSearch =
      c.nombre_completo.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.correo_electronico.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.categoria_mas_comprada.toLowerCase().includes(customerSearch.toLowerCase());

    const matchesSegment =
      selectedSegment === 'todos' || (c.segmentos && c.segmentos.includes(selectedSegment));

    return matchesSearch && matchesSegment;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-noir-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-6xl bg-noir-900 border border-gold-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 my-auto overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Glow ambient background */}
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/[0.08] gap-4 shrink-0 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-gold-400 text-xs font-mono font-bold uppercase tracking-widest mb-1">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              <span>Consola de Inteligencia de Bóveda • Curador Exclusivo</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Panel de ventas
            </h1>
            <p className="text-xs text-platinum-400 mt-1 font-light">
              Conoce el rendimiento de tu tienda y descubre qué buscan tus compradores.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Date Range Selector */}
            <div className="flex items-center space-x-1 p-1 bg-noir-950 border border-white/10 rounded-xl">
              {[
                { id: 'all', label: 'Histórico' },
                { id: '90d', label: '90D' },
                { id: '30d', label: '30D' },
                { id: '7d', label: '7D' },
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    dateRange === range.id
                      ? 'bg-gold-500/20 text-gold-300 font-bold border border-gold-500/40'
                      : 'text-platinum-400 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchDashboardData}
              title="Refrescar métricas"
              className="p-2.5 rounded-xl bg-noir-950 border border-white/10 text-platinum-400 hover:text-gold-300 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-noir-950 border border-white/10 text-platinum-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-white/[0.06] py-3 shrink-0 overflow-x-auto scrollbar-none relative z-10">
          {[
            { id: 'resumen', label: 'Resumen Ejecutivo', icon: BarChart3 },
            { id: 'ventas', label: 'Ventas y Tendencias', icon: TrendingUp },
            { id: 'productos', label: 'Rendimiento de Productos', icon: Package },
            { id: 'compradores', label: 'Conoce a tus compradores', icon: Users },
            { id: 'oportunidades', label: 'Oportunidades de venta', icon: Lightbulb },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold shadow-luxury-sm'
                    : 'text-platinum-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-400' : 'text-platinum-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto pt-6 pr-1 space-y-6">
          {loading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-gold-400 animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-platinum-400 uppercase tracking-widest">
                Consultando transacciones en Microsoft SQL Server...
              </p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs text-center font-mono">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* TAB 1: RESUMEN EJECUTIVO */}
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  {/* KPI Overview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="p-5 rounded-2xl bg-noir-950/70 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center justify-between text-platinum-500 text-[10px] font-mono uppercase tracking-wider mb-2">
                        <span>Ingresos Totales</span>
                        <DollarSign className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div className="font-serif text-2xl font-bold text-gold-400">
                        ${Number(overview.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-platinum-400 font-mono mt-1">Ventas confirmadas</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-noir-950/70 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center justify-between text-platinum-500 text-[10px] font-mono uppercase tracking-wider mb-2">
                        <span>Órdenes Cerradas</span>
                        <ShoppingBag className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div className="font-serif text-2xl font-bold text-white">
                        {overview.completed_orders || 0}
                      </div>
                      <div className="text-[10px] text-platinum-400 font-mono mt-1">Transacciones válidas</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-noir-950/70 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center justify-between text-platinum-500 text-[10px] font-mono uppercase tracking-wider mb-2">
                        <span>Compradores Únicos</span>
                        <Users className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div className="font-serif text-2xl font-bold text-white">
                        {overview.unique_customers || 0}
                      </div>
                      <div className="text-[10px] text-platinum-400 font-mono mt-1">Clientes individuales</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-noir-950/70 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center justify-between text-platinum-500 text-[10px] font-mono uppercase tracking-wider mb-2">
                        <span>Ticket Promedio</span>
                        <Award className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div className="font-serif text-2xl font-bold text-white">
                        ${Number(overview.average_order_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-platinum-400 font-mono mt-1">Por orden de compra</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-noir-950/70 border border-white/10 relative overflow-hidden">
                      <div className="flex items-center justify-between text-platinum-500 text-[10px] font-mono uppercase tracking-wider mb-2">
                        <span>Reliquias Vendidas</span>
                        <Package className="w-3.5 h-3.5 text-gold-400" />
                      </div>
                      <div className="font-serif text-2xl font-bold text-white">
                        {overview.products_sold || 0}
                      </div>
                      <div className="text-[10px] text-platinum-400 font-mono mt-1">Unidades despachadas</div>
                    </div>
                  </div>

                  {/* Inventory & Quick Trend Card */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Inventory Summary */}
                    <div className="p-6 rounded-2xl bg-noir-950/80 border border-white/10">
                      <h3 className="font-serif text-base font-bold text-white mb-1 flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gold-400" />
                        <span>Estado de Inventario en Bóveda</span>
                      </h3>
                      <p className="text-xs text-platinum-400 mb-4 font-light">
                        Piezas activas registradas bajo tu custodia en el catálogo.
                      </p>

                      <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-platinum-400">Modelos en Catálogo:</span>
                          <span className="text-white font-bold">{overview.inventory?.total_products || 0}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-platinum-400">Existencias Disponibles:</span>
                          <span className="text-gold-300 font-bold">{overview.inventory?.total_stock || 0} unidades</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-platinum-400">Valoración Total Inventario:</span>
                          <span className="text-gold-400 font-bold">
                            ${Number(overview.inventory?.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Trend Visual */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-noir-950/80 border border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-serif text-base font-bold text-white flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-gold-400" />
                            <span>Evolución Reciente de Ventas</span>
                          </h3>
                          <span className="text-[10px] font-mono text-gold-400 uppercase tracking-wider">
                            {trends.length} día(s) con actividad
                          </span>
                        </div>
                        <p className="text-xs text-platinum-400 font-light mb-4">
                          Ingresos generados por fecha de confirmación.
                        </p>
                      </div>

                      {trends.length === 0 ? (
                        <div className="py-12 text-center text-platinum-500 text-xs font-mono">
                          Sin transacciones en este rango de tiempo.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {trends.slice(-5).map((t) => {
                            const maxVal = Math.max(...trends.map((x) => x.ventas)) || 1;
                            const pct = Math.round((t.ventas / maxVal) * 100);
                            return (
                              <div key={t.fecha} className="space-y-1">
                                <div className="flex justify-between text-xs font-mono text-platinum-300">
                                  <span>{t.fecha}</span>
                                  <span className="text-gold-300 font-bold">
                                    ${Number(t.ventas).toLocaleString('en-US')} ({t.ordenes} ord.)
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-noir-900 rounded-full overflow-hidden border border-white/5">
                                  <div
                                    className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VENTAS Y TENDENCIAS */}
              {activeTab === 'ventas' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-noir-950/80 border border-white/10">
                    <h3 className="font-serif text-lg font-bold text-white mb-1">
                      Cronología de Facturación
                    </h3>
                    <p className="text-xs text-platinum-400 mb-6 font-light">
                      Desglose cronológico de ventas, tickets generados y volumen de unidades por fecha.
                    </p>

                    {trends.length === 0 ? (
                      <div className="py-16 text-center text-platinum-500 text-xs font-mono">
                        No hay registros de ventas para el período seleccionado ({dateRange}).
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-platinum-400 uppercase tracking-wider text-[10px]">
                              <th className="py-3 px-4">Fecha</th>
                              <th className="py-3 px-4">Órdenes</th>
                              <th className="py-3 px-4">Unidades</th>
                              <th className="py-3 px-4 text-right">Monto Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {trends.map((t) => (
                              <tr key={t.fecha} className="hover:bg-white/[0.02]">
                                <td className="py-3 px-4 text-white font-medium">{t.fecha}</td>
                                <td className="py-3 px-4 text-platinum-300">{t.ordenes}</td>
                                <td className="py-3 px-4 text-platinum-300">{t.unidades}</td>
                                <td className="py-3 px-4 text-right text-gold-300 font-bold">
                                  ${Number(t.ventas).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: RENDIMIENTO DE PRODUCTOS */}
              {activeTab === 'productos' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Selling Products */}
                    <div className="p-6 rounded-2xl bg-noir-950/80 border border-white/10">
                      <h3 className="font-serif text-base font-bold text-white mb-1 flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gold-400" />
                        <span>Reliquias Más Vendidas y Mayor Facturación</span>
                      </h3>
                      <p className="text-xs text-platinum-400 mb-4 font-light">
                        Artículos que concentran la mayor demanda de coleccionistas.
                      </p>

                      {(products.top_selling_products || []).length === 0 ? (
                        <div className="py-12 text-center text-platinum-500 text-xs font-mono">
                          Aún no hay productos vendidos en este período.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {products.top_selling_products.map((item) => (
                            <div
                              key={item.producto_id}
                              className="p-3.5 rounded-xl bg-noir-900 border border-white/5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center space-x-3 overflow-hidden">
                                {item.imagen_url && (
                                  <img
                                    src={item.imagen_url}
                                    alt={item.nombre}
                                    className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0"
                                  />
                                )}
                                <div className="truncate">
                                  <div className="text-xs font-medium text-white truncate">{item.nombre}</div>
                                  <div className="text-[10px] font-mono text-platinum-400">
                                    {item.franquicia} • {item.categoria}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-xs font-bold font-mono text-gold-300">
                                  ${Number(item.ingresos_generados).toLocaleString('en-US')}
                                </div>
                                <div className="text-[10px] font-mono text-platinum-500">
                                  {item.unidades_vendidas} vendida(s) • Stock: {item.stock_actual}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Low Activity Products */}
                    <div className="p-6 rounded-2xl bg-noir-950/80 border border-white/10">
                      <h3 className="font-serif text-base font-bold text-white mb-1 flex items-center space-x-2">
                        <Package className="w-4 h-4 text-platinum-400" />
                        <span>Inventario de Baja Rotación</span>
                      </h3>
                      <p className="text-xs text-platinum-400 mb-4 font-light">
                        Reliquias en vitrina que no registran ventas recientes.
                      </p>

                      {(products.low_activity_products || []).length === 0 ? (
                        <div className="py-12 text-center text-platinum-500 text-xs font-mono">
                          Excelente rotación: todo tu inventario ha tenido movimiento.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {products.low_activity_products.map((item) => (
                            <div
                              key={item.producto_id}
                              className="p-3.5 rounded-xl bg-noir-900 border border-white/5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center space-x-3 overflow-hidden">
                                {item.imagen_url && (
                                  <img
                                    src={item.imagen_url}
                                    alt={item.nombre}
                                    className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0 opacity-80"
                                  />
                                )}
                                <div className="truncate">
                                  <div className="text-xs font-medium text-platinum-300 truncate">{item.nombre}</div>
                                  <div className="text-[10px] font-mono text-platinum-500">
                                    Stock disponible: {item.stock} u.
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0 font-mono">
                                <div className="text-xs font-bold text-white">
                                  ${Number(item.precio).toLocaleString('en-US')}
                                </div>
                                <span className="text-[9px] text-amber-400/80 uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                                  Sin ventas
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category Distribution */}
                  <div className="p-6 rounded-2xl bg-noir-950/80 border border-white/10">
                    <h3 className="font-serif text-base font-bold text-white mb-1">
                      Distribución por Formato de Coleccionable
                    </h3>
                    <p className="text-xs text-platinum-400 mb-4 font-light">
                      Participación de cada categoría en la facturación de tu bóveda.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(products.category_distribution || []).map((cat) => (
                        <div key={cat.categoria} className="p-4 rounded-xl bg-noir-900 border border-white/5">
                          <span className="text-xs font-medium text-platinum-200 block mb-1">
                            {cat.categoria}
                          </span>
                          <div className="font-serif text-lg font-bold text-gold-400">
                            ${Number(cat.ingresos_totales).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </div>
                          <span className="text-[10px] font-mono text-platinum-500">
                            {cat.unidades_vendidas} unidades adquiridas
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CONOCE A TUS COMPRADORES */}
              {activeTab === 'compradores' && (
                <div className="space-y-6">
                  {/* Buyer KPI Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-noir-950/70 border border-white/10">
                      <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">
                        Total Compradores
                      </span>
                      <div className="font-serif text-xl font-bold text-white">
                        {customerIntel.metrics?.total_buyers || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-noir-950/70 border border-white/10">
                      <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">
                        Clientes Recurrentes
                      </span>
                      <div className="font-serif text-xl font-bold text-gold-400">
                        {customerIntel.metrics?.returning_buyers || 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-noir-950/70 border border-white/10">
                      <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">
                        Tasa de Retención
                      </span>
                      <div className="font-serif text-xl font-bold text-gold-300">
                        {customerIntel.metrics?.returning_rate_pct || 0}%
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-noir-950/70 border border-white/10">
                      <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">
                        Gasto Promedio / Cliente
                      </span>
                      <div className="font-serif text-xl font-bold text-white">
                        ${Number(customerIntel.metrics?.avg_spend_per_customer || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Commercial Segments Cards */}
                  <div>
                    <h3 className="font-serif text-base font-bold text-white mb-2 flex items-center space-x-2">
                      <Layers className="w-4 h-4 text-gold-400" />
                      <span>Segmentos Comerciales Activos</span>
                    </h3>
                    <p className="text-xs text-platinum-400 mb-4 font-light">
                      Agrupaciones de compradores computadas según volumen de gasto y formatos adquiridos.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(customerIntel.segments || []).map((seg) => {
                        const isSelected = selectedSegment === seg.key;
                        return (
                          <div
                            key={seg.key}
                            onClick={() => setSelectedSegment(isSelected ? 'todos' : seg.key)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-gold-500/15 border-gold-400 shadow-luxury-sm'
                                : 'bg-noir-950/70 border-white/10 hover:border-gold-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-mono font-bold text-gold-300">
                                {seg.nombre}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                                {seg.cantidad_clientes}
                              </span>
                            </div>
                            <p className="text-[11px] text-platinum-400 font-light mb-3 leading-relaxed">
                              {seg.descripcion}
                            </p>
                            <div className="text-[10px] font-mono text-platinum-400 border-t border-white/5 pt-2 flex justify-between">
                              <span>Monto acumulado:</span>
                              <strong className="text-white">${Number(seg.monto_acumulado).toLocaleString('en-US')}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Interactive Table */}
                  <div className="p-6 rounded-2xl bg-noir-950/80 border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-serif text-base font-bold text-white">
                          Directorio de Compradores y Perfilado Conductual
                        </h3>
                        <p className="text-xs text-platinum-400 font-light">
                          Historial de transacciones, intereses observados y preferencias declaradas.
                        </p>
                      </div>

                      {/* Search Input */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-platinum-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Buscar por nombre o correo..."
                          className="w-full pl-9 pr-3.5 py-2 bg-noir-900 border border-white/10 rounded-xl text-xs text-white placeholder-platinum-500 focus:outline-none focus:border-gold-500 font-sans"
                        />
                      </div>
                    </div>

                    {filteredCustomers.length === 0 ? (
                      <div className="py-12 text-center text-platinum-500 text-xs font-mono">
                        No se encontraron compradores que coincidan con la búsqueda o segmento.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-platinum-400 uppercase tracking-wider font-mono text-[10px]">
                              <th className="py-3 px-3">Coleccionista</th>
                              <th className="py-3 px-3">Tipo</th>
                              <th className="py-3 px-3">Órdenes</th>
                              <th className="py-3 px-3">Total Gastado</th>
                              <th className="py-3 px-3">Intereses Observados</th>
                              <th className="py-3 px-3">Preferencia Declarada</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {filteredCustomers.map((c) => (
                              <tr key={c.comprador_id} className="hover:bg-white/[0.02]">
                                <td className="py-3 px-3">
                                  <div className="font-medium text-white">{c.nombre_completo}</div>
                                  <div className="text-[10px] font-mono text-platinum-500">{c.correo_electronico}</div>
                                </td>
                                <td className="py-3 px-3 font-mono">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      c.tipo_cliente === 'Recurrente'
                                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                                        : 'bg-white/10 text-platinum-300'
                                    }`}
                                  >
                                    {c.tipo_cliente}
                                  </span>
                                </td>
                                <td className="py-3 px-3 font-mono text-platinum-300">{c.total_ordenes}</td>
                                <td className="py-3 px-3 font-mono font-bold text-gold-300">
                                  ${Number(c.monto_total_gastado).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {(c.intereses_observados || []).map((int, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-noir-900 border border-white/10 text-platinum-300"
                                      >
                                        {int}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-3 font-mono text-[11px] text-platinum-400">
                                  {c.preferencias_declaradas?.franquicia ? (
                                    <span>
                                      {c.preferencias_declaradas.franquicia} • {c.preferencias_declaradas.categoria}
                                    </span>
                                  ) : (
                                    <span className="italic text-platinum-600">Sin test completado</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: OPORTUNIDADES DE VENTA */}
              {activeTab === 'oportunidades' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white mb-1 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-gold-400" />
                      <span>Oportunidades Comerciales Detectadas</span>
                    </h3>
                    <p className="text-xs text-platinum-400 font-light">
                      Hallazgos fundamentados en el cruce de tu inventario disponible y el historial de adquisiciones.
                    </p>
                  </div>

                  {opportunities.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-noir-950/70 border border-white/10 text-center font-mono text-xs text-platinum-400">
                      Datos insuficientes para proyectar tendencias comerciales. Se generarán oportunidades a medida que aumenten las compras en tu vitrina.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {opportunities.map((op, idx) => (
                        <div
                          key={idx}
                          className="p-5 rounded-2xl bg-noir-950/80 border border-gold-500/20 shadow-luxury-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold">
                                Impacto: {op.impacto}
                              </span>
                              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                            </div>
                            <h4 className="font-serif text-base font-bold text-white mb-2 leading-snug">
                              {op.titulo}
                            </h4>
                            <p className="text-xs text-platinum-300 font-light leading-relaxed">
                              {op.descripcion}
                            </p>
                          </div>

                          <div className="pt-4 mt-4 border-t border-white/5 text-[10px] font-mono text-platinum-500 flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-gold-500" />
                            <span>Insight automatizado Mythic Shelf</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

