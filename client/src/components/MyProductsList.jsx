import React, { useEffect, useState } from 'react';
import { Boxes, RefreshCw, AlertTriangle, PlusCircle, Search, Sparkles } from 'lucide-react';
import api from '../services/api';

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

/**
 * CU-10: "Mis piezas" — inventario propio del vendedor autenticado.
 * Consume GET /api/products/mine, que solo responde a Vendedor/Administrador
 * y filtra por el vendedor del token.
 */
export default function MyProductsList({ highlightId, onAddNew, reloadKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/products/mine');
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar tu inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [reloadKey]);

  const term = search.trim().toLowerCase();
  const filtered = items.filter(
    (p) =>
      !term ||
      p.nombre.toLowerCase().includes(term) ||
      p.franquicia.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term)
  );

  const totalStock = items.reduce((acc, p) => acc + p.stock, 0);
  const inventoryValue = items.reduce((acc, p) => acc + Number(p.precio) * p.stock, 0);
  const soldOut = items.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono tracking-widest uppercase mb-1">
            <Boxes className="w-3.5 h-3.5 text-gold-500" />
            <span>Inventario privado</span>
          </div>
          <h2 className="font-serif text-xl text-white">Mis piezas publicadas</h2>
          <p className="text-xs text-platinum-400 mt-1 font-light">
            Solo tú ves esta lista. Incluye las piezas agotadas, que no aparecen en el catálogo público.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            title="Actualizar"
            className="p-2.5 rounded-xl bg-noir-950 border border-white/10 text-platinum-400 hover:text-gold-300 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gold-500/20 border border-gold-500/40 text-gold-300 hover:bg-gold-500/30 text-xs font-mono font-bold transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar pieza</span>
          </button>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Piezas publicadas', value: items.length },
          { label: 'Unidades en stock', value: totalStock },
          { label: 'Valor del inventario', value: money(inventoryValue) },
          { label: 'Agotadas', value: soldOut },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-2xl bg-noir-950/70 border border-white/10">
            <div className="text-[10px] font-mono uppercase tracking-wider text-platinum-500 mb-1">{k.label}</div>
            <div className="font-serif text-xl font-bold text-gold-400">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, franquicia o categoría..."
          className="w-full pl-10 pr-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white placeholder-platinum-500 focus:outline-none focus:border-gold-500 font-sans"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center">
          <RefreshCw className="w-7 h-7 text-gold-400 animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-platinum-400 uppercase tracking-widest">Cargando tu inventario...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs text-center font-mono">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-noir-950/60 border border-white/10">
          <Boxes className="w-10 h-10 text-platinum-500 mx-auto mb-3" />
          <p className="text-sm text-white font-serif">
            {items.length === 0 ? 'Aún no has publicado ninguna pieza' : 'Ninguna pieza coincide con la búsqueda'}
          </p>
          {items.length === 0 && (
            <button onClick={onAddNew} className="mt-3 text-xs text-gold-400 hover:text-gold-300 font-mono">
              Publicar mi primera pieza →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isNew = p.producto_id === highlightId;
            return (
              <div
                key={p.producto_id}
                className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-noir-950/70 border transition-all ${
                  isNew ? 'border-gold-400 shadow-gold-glow' : 'border-white/10'
                }`}
              >
                <div className="w-full sm:w-24 h-40 sm:h-24 shrink-0 rounded-xl bg-noir-900 border border-white/10 overflow-hidden">
                  <img
                    src={p.imagen_url || '/placeholder-collectible.svg'}
                    alt={p.nombre}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder-collectible.svg';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {isNew && (
                      <span className="flex items-center space-x-1 text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold-500 text-noir-950">
                        <Sparkles className="w-3 h-3" />
                        <span>Recién publicada</span>
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        p.stock === 0
                          ? 'border-rose-500/40 text-rose-300 bg-rose-950/30'
                          : 'border-emerald-500/30 text-emerald-300 bg-emerald-950/20'
                      }`}
                    >
                      {p.stock === 0 ? 'Agotada · oculta del catálogo' : 'Visible en catálogo'}
                    </span>
                    <span className="text-[10px] font-mono text-platinum-500">#{p.producto_id}</span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-white truncate">{p.nombre}</h3>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-gold-400 mt-0.5">
                    {p.franquicia} <span className="text-white/20">•</span>{' '}
                    <span className="text-platinum-400">{p.categoria}</span> <span className="text-white/20">•</span>{' '}
                    <span className="text-platinum-400">{p.ano_fabricacion || p.decada}</span>
                  </div>
                  <p className="text-xs text-platinum-400 italic mt-1 truncate">
                    "{p.estado_conservacion}"{p.nivel_autenticidad ? ` · ${p.nivel_autenticidad}` : ''}
                  </p>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-2 gap-x-6 gap-y-1 text-right shrink-0 font-mono text-[11px] sm:w-56">
                  <span className="text-platinum-500 text-left sm:text-right">Precio</span>
                  <span className="text-gold-400 font-bold">{money(p.precio)}</span>
                  <span className="text-platinum-500 text-left sm:text-right">Stock</span>
                  <span className="text-white">{p.stock} u.</span>
                  <span className="text-platinum-500 text-left sm:text-right">Vendidas</span>
                  <span className="text-white">{p.unidades_vendidas} u.</span>
                  <span className="text-platinum-500 text-left sm:text-right">Publicada</span>
                  <span className="text-white">
                    {p.fecha_publicacion ? new Date(p.fecha_publicacion).toLocaleDateString('es-ES') : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
