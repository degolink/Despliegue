import React from 'react';
import { Search, Filter, ShieldCheck, Calendar, Sparkles, Layers, Box, Tag } from 'lucide-react';

export default function Catalog({
  products,
  filters,
  metadata,
  onFilterChange,
  onSelectProduct,
  onAddToCart,
  loading,
}) {
  return (
    <div>
      {/* Barra de Filtros y Búsqueda Dinámica */}
      <div className="bg-surface-container/60 border border-white/10 rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Búsqueda por texto */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar pieza o personaje..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface placeholder-outline focus:outline-none focus:border-tertiary transition-colors"
            />
          </div>

          {/* Filtro Franquicia */}
          <div>
            <select
              value={filters.franquicia}
              onChange={(e) => onFilterChange('franquicia', e.target.value)}
              className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
            >
              <option value="">Todas las Franquicias</option>
              {metadata.franquicias.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Categoría */}
          <div>
            <select
              value={filters.categoria}
              onChange={(e) => onFilterChange('categoria', e.target.value)}
              className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
            >
              <option value="">Todas las Categorías</option>
              {metadata.categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Década */}
          <div>
            <select
              value={filters.decada}
              onChange={(e) => onFilterChange('decada', e.target.value)}
              className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
            >
              <option value="">Todas las Décadas</option>
              {metadata.decadas.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Precio Máximo */}
          <div>
            <select
              value={filters.precio_max}
              onChange={(e) => onFilterChange('precio_max', e.target.value)}
              className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
            >
              <option value="">Cualquier Presupuesto</option>
              <option value="600">Hasta $600</option>
              <option value="1000">Hasta $1,000</option>
              <option value="1500">Hasta $1,500</option>
              <option value="2500">Hasta $2,500</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant text-sm mt-3 font-mono">Buscando reliquias en la bóveda...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-surface-container/40 rounded-2xl border border-white/10 p-8">
          <Box className="w-12 h-12 text-outline mx-auto mb-3" />
          <h3 className="text-base font-bold text-on-surface-variant">No se encontraron piezas con estos filtros</h3>
          <p className="text-xs text-outline mt-1 max-w-md mx-auto">
            Prueba ajustando los criterios de búsqueda o limpiando las opciones seleccionadas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => {
            const hasScore = item.recommendation_score != null && item.recommendation_score > 0;
            // Las cartas son verticales: se muestran completas en lugar de recortarlas al 4:3.
            const isCard = /^cartas/i.test(item.categoria || '');
            const isSimilarImage = (item.imagen_url || '').includes('/catalog/similares/');
            return (
              <div
                key={item.producto_id}
                className="group bg-gradient-to-b from-surface-container to-surface rounded-xl border border-white/10 hover:border-tertiary/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-primary-container/20 relative"
              >
                {/* Badge de Puntuación de Recomendación (+3, +2, +1) */}
                {hasScore && (
                  <div className="absolute top-3 left-3 z-10 bg-secondary-container text-surface-lowest text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 fill-surface-lowest" />
                    <span>Afinidad: {item.recommendation_score} pts</span>
                  </div>
                )}

                {/* Badge de Stock */}
                <div className="absolute top-3 right-3 z-10 bg-surface-lowest/80 backdrop-blur-sm border border-white/10 text-on-surface-variant text-[11px] font-mono px-2 py-0.5 rounded-md">
                  Stock: {item.stock} u.
                </div>

                {/* Imagen del Coleccionable */}
                <div
                  onClick={() => onSelectProduct(item.producto_id)}
                  className="aspect-[4/3] w-full bg-surface-lowest overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={item.imagen_url || '/placeholder-collectible.svg'}
                    alt={item.nombre}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-collectible.svg'; }}
                    className={`w-full h-full ${isCard ? 'object-contain p-3' : 'object-cover'} group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-transparent opacity-80" />
                  {isSimilarImage && (
                    <div className="absolute bottom-2 left-3 z-10 bg-surface-lowest/80 backdrop-blur-sm border border-white/10 text-on-surface-variant text-[10px] font-medium px-2 py-0.5 rounded-md">
                      Imagen referencial
                    </div>
                  )}
                </div>

                {/* Contenido & Metadatos Coleccionables */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tags: Franquicia & Categoría */}
                    <div className="flex items-center space-x-2 text-[11px] font-semibold text-primary mb-2">
                      <span className="uppercase tracking-wider">{item.franquicia}</span>
                      <span>•</span>
                      <span className="text-on-surface-variant">{item.categoria}</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(item.producto_id)}
                      className="font-bold text-on-surface text-base leading-snug hover:text-primary cursor-pointer line-clamp-2 transition-colors mb-2"
                    >
                      {item.nombre}
                    </h3>

                    {/* Fila de Contexto Histórico Resumido */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant py-2 border-y border-white/10 mb-3">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        <span>Año: <strong>{item.ano_fabricacion || item.decada}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-tertiary" />
                        <span className="truncate">{item.nivel_autenticidad || 'Autenticado'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2 italic mb-3">
                      "{item.estado_conservacion}"
                    </p>
                  </div>

                  {/* Precio y CTA */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-outline uppercase block font-medium">Precio</span>
                      <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-secondary font-mono">
                        ${Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectProduct(item.producto_id)}
                        className="px-3 py-1.5 rounded-lg bg-metal border border-metal-border text-on-surface hover:bg-metal-hover text-xs font-medium transition-colors"
                      >
                        Historia
                      </button>
                      <button
                        onClick={() => onAddToCart(item.producto_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-primary-container hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary-container/30 active:scale-95"
                      >
                        + Carrito
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}