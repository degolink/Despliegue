import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Award, Calendar, Layers, ScrollText, CheckCircle2 } from 'lucide-react';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    onAddToCart(product.producto_id, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-lowest/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface-container border border-white/10 rounded-2xl shadow-2xl shadow-primary-container/20 overflow-y-auto flex flex-col">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-surface-lowest/80 text-on-surface-variant hover:text-on-surface hover:bg-surface-high transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Columna Izquierda: Imagen y Estado */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-surface-lowest border border-white/10 relative shadow-inner">
              <img
                src={product.imagen_url || '/placeholder-collectible.svg'}
                alt={product.nombre}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder-collectible.svg'; }}
                className={`w-full h-full ${/^cartas/i.test(product.categoria || '') ? 'object-contain p-4' : 'object-cover'}`}
              />
              <div className="absolute top-3 left-3 bg-primary-container text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wide">
                {product.decada}
              </div>
            </div>

            {product.imagenes && product.imagenes.length > 0 && (
              <p className="text-[10px] leading-snug text-outline">
                Imagen: {product.imagenes[0].atribucion}
                {product.imagenes[0].licencia ? ` · Licencia: ${product.imagenes[0].licencia}` : ''}
                {product.imagenes[0].pagina_fuente && (
                  <>
                    {' · '}
                    <a
                      href={product.imagenes[0].pagina_fuente}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-on-surface-variant"
                    >
                      fuente
                    </a>
                  </>
                )}
              </p>
            )}

            <div className="bg-surface-low p-4 rounded-xl border border-white/10">
              <span className="text-xs text-on-surface-variant font-medium block mb-1">Estado de Conservación Curado:</span>
              <p className="text-sm font-semibold text-primary">
                {product.estado_conservacion}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Información y Contexto Histórico (CU-05) */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                <span>{product.franquicia}</span>
                <span>•</span>
                <span className="text-on-surface-variant">{product.categoria}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-on-surface mb-3 font-mythic">
                {product.nombre}
              </h2>

              <div className="text-3xl font-black text-secondary font-mono mb-4">
                ${Number(product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>

              {/* Ficha de Contexto Histórico & Procedencia */}
              <div className="bg-surface-low rounded-xl border border-primary-container/30 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-primary uppercase tracking-wider pb-2 border-b border-white/10">
                  <ScrollText className="w-4 h-4" />
                  <span>Contexto Histórico & Procedencia</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-outline block">Año de Fabricación</span>
                    <span className="text-on-surface font-semibold">{product.ano_fabricacion || 'N/D'}</span>
                  </div>
                  <div>
                    <span className="text-outline block">Tirada de Producción</span>
                    <span className="text-on-surface font-semibold">{product.tirada_produccion || 'Edición Limitada'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-outline block">Procedencia / Origen</span>
                    <span className="text-on-surface font-semibold">{product.procedencia || 'Colección Privada Verificada'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-outline block">Certificación de Autenticidad</span>
                    <span className="inline-flex items-center space-x-1.5 text-tertiary font-semibold mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{product.nivel_autenticidad || 'Certificado Original Mythic Shelf'}</span>
                    </span>
                  </div>
                </div>

                {product.variantes_diseno && (
                  <div className="text-xs pt-2 border-t border-white/10">
                    <span className="text-outline block">Variantes de Diseño Específicas</span>
                    <p className="text-on-surface-variant mt-0.5 leading-relaxed">{product.variantes_diseno}</p>
                  </div>
                )}

                {product.relevancia_cultural && (
                  <div className="text-xs pt-2 border-t border-white/10">
                    <span className="text-outline block">Relevancia Cultural e Histórica</span>
                    <p className="text-on-surface-variant mt-0.5 leading-relaxed italic">{product.relevancia_cultural}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Selector de Cantidad y Botón Comprar */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4 text-xs text-on-surface-variant">
                <span>Disponibilidad en almacén bóveda:</span>
                <span className="font-mono text-tertiary font-bold">{product.stock} unidades</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-white/10 rounded-lg bg-surface-lowest">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-on-surface-variant hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-bold font-mono text-on-surface">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-on-surface-variant hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3 px-6 rounded-lg bg-primary-container hover:bg-primary-dark text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-primary-container/40 disabled:opacity-50 disabled:cursor-not-allowed"
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