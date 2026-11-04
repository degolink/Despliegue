import React from 'react';
import { Search, Filter, ShieldCheck, Calendar, Sparkles, Layers, Box, Tag, ArrowUpRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Catalog({
  products,
  filters,
  metadata,
  onFilterChange,
  onSelectProduct,
  onAddToCart,
  loading,
  pagination = { total: 0, page: 1, totalPages: 1 },
  onPageChange,
}) {
  const totalItems = pagination.total || products.length;
  const currentPage = pagination.page || 1;
  const totalPages = Math.max(1, pagination.totalPages || 1);

  return (
    <div id="catalog-section" className="scroll-mt-24">
      {/* Editorial Catalog Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono tracking-widest uppercase mb-1">
            <Layers className="w-3.5 h-3.5 text-gold-500" />
            <span>Curated Inventory</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-tight">
            Archivo Principal de Coleccionables
          </h2>
          <p className="text-xs text-platinum-400 mt-1 max-w-xl font-light">
            Piezas originales catalogadas por procedencia, estado de conservación microscópico y año de tirada.
          </p>
        </div>

        <div className="text-xs font-mono text-platinum-400">
          Mostrando <span className="text-gold-400 font-bold">{products.length}</span> de{' '}
          <span className="text-gold-400 font-bold">{totalItems}</span> piezas certificadas
        </div>
      </div>

      {/* Luxury Filter Controls Bar */}
      <div className="bg-noir-900 border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-10 shadow-luxury">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Text Search Input */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar pieza o personaje..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white placeholder-platinum-500 focus:outline-none focus:border-gold-500 transition-colors font-sans shadow-inner"
            />
          </div>

          {/* Franchise Select */}
          <div>
            <select
              value={filters.franquicia}
              onChange={(e) => onFilterChange('franquicia', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 transition-colors font-sans cursor-pointer"
            >
              <option value="">Todas las Franquicias</option>
              {metadata.franquicias.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div>
            <select
              value={filters.categoria}
              onChange={(e) => onFilterChange('categoria', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 transition-colors font-sans cursor-pointer"
            >
              <option value="">Todas las Categorías</option>
              {metadata.categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Decade Select */}
          <div>
            <select
              value={filters.decada}
              onChange={(e) => onFilterChange('decada', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 transition-colors font-sans cursor-pointer"
            >
              <option value="">Todas las Décadas</option>
              {metadata.decadas.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Max Price Range Select */}
          <div>
            <select
              value={filters.precio_max}
              onChange={(e) => onFilterChange('precio_max', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 transition-colors font-sans cursor-pointer"
            >
              <option value="">Cualquier Presupuesto</option>
              <option value="600">Hasta $600 USD</option>
              <option value="1000">Hasta $1,000 USD</option>
              <option value="1500">Hasta $1,500 USD</option>
              <option value="2500">Hasta $2,500 USD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Product Grid */}
      {loading ? (
        <div className="py-28 text-center">
          <div className="inline-block w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-platinum-400 text-xs font-mono tracking-widest uppercase mt-4">
            Consultando registros en la bóveda...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-28 text-center bg-noir-900 rounded-3xl border border-white/[0.08] p-10 max-w-xl mx-auto shadow-luxury">
          <Box className="w-12 h-12 text-platinum-500 mx-auto mb-4" />
          <h3 className="font-serif text-lg font-normal text-white">No se hallaron piezas bajo estos parámetros</h3>
          <p className="text-xs text-platinum-400 mt-1.5 leading-relaxed font-light">
            Ajusta los filtros seleccionados o consulta el catálogo completo sin restricciones de búsqueda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((item) => {
            const hasScore = item.recommendation_score != null && item.recommendation_score > 0;
            const isCard = /^cartas/i.test(item.categoria || '');
            const isSimilarImage = (item.imagen_url || '').includes('/catalog/similares/');

            return (
              <motion.article
                key={item.producto_id}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="group relative bg-noir-900 rounded-2xl border border-white/[0.08] hover:border-gold-500/50 shadow-luxury hover:shadow-luxury-hover transition-all duration-500 overflow-hidden flex flex-col justify-between"
              >
                {/* Affinity Score Ribbon Badge */}
                {hasScore && (
                  <div className="absolute top-3.5 left-3.5 z-20 bg-gradient-to-r from-gold-500 to-gold-400 text-noir-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center space-x-1 font-mono">
                    <Sparkles className="w-3 h-3 fill-noir-950" />
                    <span>Afinidad: +{item.recommendation_score} pts</span>
                  </div>
                )}

                {/* Stock Counter Badge */}
                <div className="absolute top-3.5 right-3.5 z-20 bg-noir-950/80 backdrop-blur-md border border-white/10 text-platinum-300 text-[10px] font-mono px-2.5 py-1 rounded-md">
                  Stock: {item.stock} u.
                </div>

                {/* Large Editorial Photography Box */}
                <div
                  onClick={() => onSelectProduct(item.producto_id)}
                  className="aspect-[4/3] w-full bg-noir-950 overflow-hidden relative cursor-pointer flex items-center justify-center p-2"
                >
                  <img
                    src={item.imagen_url || '/placeholder-collectible.svg'}
                    alt={item.nombre}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-collectible.svg';
                    }}
                    className={`w-full h-full ${
                      isCard ? 'object-contain p-3' : 'object-cover rounded-xl'
                    } transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-transparent to-transparent opacity-80 pointer-events-none" />

                  {isSimilarImage && (
                    <div className="absolute bottom-3 left-3 z-10 bg-noir-950/85 backdrop-blur-md border border-white/10 text-platinum-400 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded">
                      Imagen referencial
                    </div>
                  )}
                </div>

                {/* Product Metadata & Actions */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Franchise & Category header */}
                    <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest uppercase text-gold-400 mb-2">
                      <span>{item.franquicia}</span>
                      <span className="text-white/20">•</span>
                      <span className="text-platinum-400">{item.categoria}</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(item.producto_id)}
                      className="font-serif text-lg font-bold text-white hover:text-gold-200 cursor-pointer line-clamp-2 transition-colors mb-2.5 leading-snug tracking-wide"
                    >
                      {item.nombre}
                    </h3>

                    {/* Historical Specs Summary Bar */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-platinum-400 py-2.5 border-y border-white/[0.06] mb-3 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-platinum-500" />
                        <span>Año: <strong className="text-white font-medium">{item.ano_fabricacion || item.decada}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                        <span className="truncate">{item.nivel_autenticidad || 'Archival Grade'}</span>
                      </div>
                    </div>

                    {/* Multidimensional Match Reason Badge */}
                    {item.match_reason && (
                      <div className="mb-3 px-3 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-[11px] text-gold-300 font-sans leading-relaxed flex items-start space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                        <span>{item.match_reason}</span>
                      </div>
                    )}

                    <p className="text-xs text-platinum-400 line-clamp-2 italic font-light mb-4">
                      "{item.estado_conservacion}"
                    </p>
                  </div>

                  {/* Price & Action Button */}
                  <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-platinum-500 uppercase tracking-widest block font-mono">
                        Valor de Inversión
                      </span>
                      <span className="font-serif text-xl sm:text-2xl font-bold text-gold-400 tracking-tight">
                        ${Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectProduct(item.producto_id)}
                        className="p-2.5 rounded-xl bg-noir-850 hover:bg-noir-800 border border-white/10 hover:border-gold-500/40 text-platinum-300 hover:text-white transition-all shadow-luxury-sm"
                        title="Ver ficha histórica completa"
                      >
                        <ArrowUpRight className="w-4 h-4 text-gold-400" />
                      </button>

                      <button
                        onClick={() => onAddToCart(item.producto_id)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow active:scale-95"
                      >
                        + Adquirir
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <nav
          aria-label="Paginación del catálogo"
          className="mt-12 flex flex-wrap items-center justify-center gap-3 font-mono text-xs"
        >
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-noir-900 border border-white/10 hover:border-gold-500/40 text-platinum-300 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="uppercase tracking-widest">Anterior</span>
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                aria-current={n === currentPage ? 'page' : undefined}
                className={`w-9 h-9 rounded-lg border transition-all ${
                  n === currentPage
                    ? 'bg-gold-500 border-gold-400 text-noir-950 font-black'
                    : 'bg-noir-900 border-white/10 text-platinum-300 hover:border-gold-500/40 hover:text-white'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-noir-900 border border-white/10 hover:border-gold-500/40 text-platinum-300 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <span className="uppercase tracking-widest">Siguiente</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
