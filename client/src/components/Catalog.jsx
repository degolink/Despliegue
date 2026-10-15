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
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Búsqueda por texto */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar pieza o personaje..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Filtro Franquicia */}
          <div>
            <select
              value={filters.franquicia}
              onChange={(e) => onFilterChange('franquicia', e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
          <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm mt-3 font-mono">Buscando reliquias en la bóveda...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No se encontraron piezas con estos filtros</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Prueba ajustando los criterios de búsqueda o limpiando las opciones seleccionadas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((item) => {
            const hasScore = item.recommendation_score != null && item.recommendation_score > 0;
            return (
              <div
                key={item.producto_id}
                className="group bg-[#111827] rounded-xl border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg hover:shadow-amber-500/5 relative"
              >
                {/* Badge de Puntuación de Recomendación (+3, +2, +1) */}
                {hasScore && (
                  <div className="absolute top-3 left-3 z-10 bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-lg flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Afinidad: {item.recommendation_score} pts</span>
                  </div>
                )}

                {/* Badge de Stock */}
                <div className="absolute top-3 right-3 z-10 bg-slate-950/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded-md">
                  Stock: {item.stock} u.
                </div>

                {/* Imagen del Coleccionable */}
                <div
                  onClick={() => onSelectProduct(item.producto_id)}
                  className="aspect-[4/3] w-full bg-slate-950 overflow-hidden relative cursor-pointer"
                >
                  <img
                    src={item.imagen_url || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800'}
                    alt={item.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-80" />
                </div>

                {/* Contenido & Metadatos Coleccionables */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tags: Franquicia & Categoría */}
                    <div className="flex items-center space-x-2 text-[11px] font-semibold text-amber-400 mb-2">
                      <span className="uppercase tracking-wider">{item.franquicia}</span>
                      <span>•</span>
                      <span className="text-slate-400">{item.categoria}</span>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(item.producto_id)}
                      className="font-bold text-slate-100 text-base leading-snug hover:text-amber-300 cursor-pointer line-clamp-2 transition-colors mb-2"
                    >
                      {item.nombre}
                    </h3>

                    {/* Fila de Contexto Histórico Resumido */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 py-2 border-y border-slate-800/80 mb-3">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Año: <strong>{item.ano_fabricacion || item.decada}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate">{item.nivel_autenticidad || 'Autenticado'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">
                      "{item.estado_conservacion}"
                    </p>
                  </div>

                  {/* Precio y CTA */}
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">Precio</span>
                      <span className="text-xl font-black text-amber-400 font-mono">
                        ${Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectProduct(item.producto_id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Historia
                      </button>
                      <button
                        onClick={() => onAddToCart(item.producto_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10 active:scale-95"
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

