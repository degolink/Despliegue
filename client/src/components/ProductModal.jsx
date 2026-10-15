import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Award, Calendar, Layers, ScrollText, CheckCircle2 } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToCart(product.producto_id, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0E1526] border border-amber-500/30 rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/80 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Columna Izquierda: Imagen y Estado */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative shadow-inner">
              <img
                src={product.imagen_url || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800'}
                alt={product.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wide">
                {product.decada}
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 font-medium block mb-1">Estado de Conservación Curado:</span>
              <p className="text-sm font-semibold text-amber-200">
                {product.estado_conservacion}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Información y Contexto Histórico (CU-05) */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <span>{product.franquicia}</span>
                <span>•</span>
                <span className="text-slate-400">{product.categoria}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-100 mb-3 font-mythic">
                {product.nombre}
              </h2>

              <div className="text-3xl font-black text-amber-400 font-mono mb-4">
                ${Number(product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>

              {/* Ficha de Contexto Histórico & Procedencia */}
              <div className="bg-slate-900/60 rounded-xl border border-amber-500/20 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <ScrollText className="w-4 h-4" />
                  <span>Contexto Histórico & Procedencia</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Año de Fabricación</span>
                    <span className="text-slate-200 font-semibold">{product.ano_fabricacion || 'N/D'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tirada de Producción</span>
                    <span className="text-slate-200 font-semibold">{product.tirada_produccion || 'Edición Limitada'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Procedencia / Origen</span>
                    <span className="text-slate-200 font-semibold">{product.procedencia || 'Colección Privada Verificada'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Certificación de Autenticidad</span>
                    <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-semibold mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{product.nivel_autenticidad || 'Certificado Original Mythic Shelf'}</span>
                    </span>
                  </div>
                </div>

                {product.variantes_diseno && (
                  <div className="text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 block">Variantes de Diseño Específicas</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">{product.variantes_diseno}</p>
                  </div>
                )}

                {product.relevancia_cultural && (
                  <div className="text-xs pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 block">Relevancia Cultural e Histórica</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed italic">{product.relevancia_cultural}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selector de Cantidad y Botón Comprar */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4 text-xs text-slate-400">
                <span>Disponibilidad en almacén bóveda:</span>
                <span className="font-mono text-emerald-400 font-bold">{product.stock} unidades</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-slate-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-bold font-mono text-slate-100">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-slate-300 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Adquirir Coleccionable' : 'Agotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

