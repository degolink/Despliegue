import React, { useState } from 'react';
import { X, ShieldCheck, MapPin, Award, Calendar, Layers, ScrollText, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const gallery = (product.imagenes && product.imagenes.length > 0)
    ? product.imagenes.map(img => img.url)
    : [product.imagen_url || '/placeholder-collectible.svg'];

  const handleAdd = () => {
    onAddToCart(product.producto_id, quantity);
  };

  const isCard = /^cartas/i.test(product.categoria || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-5xl max-h-[92vh] bg-noir-900 border border-white/10 rounded-3xl shadow-2xl overflow-y-auto flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-noir-950/80 text-platinum-400 hover:text-white hover:bg-noir-800 transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Left Column: Gallery & Large Photography (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-noir-950 border border-white/10 shadow-2xl p-4 flex items-center justify-center">
              <img
                src={gallery[activeImgIndex] || '/placeholder-collectible.svg'}
                alt={product.nombre}
                className={`w-full h-full ${isCard ? 'object-contain p-4' : 'object-cover rounded-xl'}`}
              />
              <div className="absolute top-4 left-4 z-10 bg-noir-900/90 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-md">
                {product.decada} • Original
              </div>
            </div>

            {/* Thumbnail selector */}
            {gallery.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {gallery.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden bg-noir-950 border transition-all shrink-0 ${
                      activeImgIndex === idx ? 'border-gold-400 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Conservation Status Card */}
            <div className="bg-noir-950 p-4 rounded-2xl border border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-platinum-500 uppercase block">
                  Estado de Conservación Microscópico
                </span>
                <span className="text-sm font-serif font-bold text-gold-300 mt-0.5 block">
                  {product.estado_conservacion}
                </span>
              </div>
              <ShieldCheck className="w-6 h-6 text-gold-500 shrink-0" />
            </div>
          </div>

          {/* Right Column: Historical Dossier & Ordering (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              {/* Franchise & Category */}
              <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest uppercase text-gold-400 mb-2">
                <span>{product.franquicia}</span>
                <span className="text-white/20">•</span>
                <span className="text-platinum-400">{product.categoria}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 tracking-wide leading-tight">
                {product.nombre}
              </h2>

              <div className="font-serif text-3xl font-bold text-gold-400 mb-6">
                ${Number(product.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                <span className="text-xs font-mono font-normal text-platinum-400">USD</span>
              </div>

              {/* Historical Archive Plaque */}
              <div className="bg-noir-950 rounded-2xl border border-gold-500/20 p-5 space-y-4 shadow-luxury">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-gold-400 uppercase tracking-widest pb-3 border-b border-white/[0.08]">
                  <ScrollText className="w-4 h-4 text-gold-500" />
                  <span>Dossier Histórico & Procedencia</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                  <div>
                    <span className="text-platinum-500 block text-[10px] uppercase tracking-wider">Año Original</span>
                    <span className="text-white font-medium">{product.ano_fabricacion || 'N/D'}</span>
                  </div>
                  <div>
                    <span className="text-platinum-500 block text-[10px] uppercase tracking-wider">Tirada Estimada</span>
                    <span className="text-white font-medium">{product.tirada_produccion || 'Lote Limitado'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-platinum-500 block text-[10px] uppercase tracking-wider">Línea de Custodia / Origen</span>
                    <span className="text-white font-medium">{product.procedencia || 'Colección Privada Verificada'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-platinum-500 block text-[10px] uppercase tracking-wider">Certificación de Grado</span>
                    <span className="inline-flex items-center space-x-1.5 text-gold-300 font-semibold mt-1">
                      <ShieldCheck className="w-4 h-4 text-gold-500" />
                      <span>{product.nivel_autenticidad || 'Archival Vault Certified'}</span>
                    </span>
                  </div>
                </div>

                {product.variantes_diseno && (
                  <div className="text-xs pt-3 border-t border-white/[0.08]">
                    <span className="text-platinum-500 font-mono text-[10px] uppercase tracking-wider block">
                      Variantes de Manufactura
                    </span>
                    <p className="text-platinum-300 mt-1 leading-relaxed font-light">{product.variantes_diseno}</p>
                  </div>
                )}

                {product.relevancia_cultural && (
                  <div className="text-xs pt-3 border-t border-white/[0.08]">
                    <span className="text-platinum-500 font-mono text-[10px] uppercase tracking-wider block">
                      Relevancia Cultural e Histórica
                    </span>
                    <p className="text-platinum-300 mt-1 leading-relaxed italic font-light">{product.relevancia_cultural}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory & Purchase Action Area */}
            <div className="pt-5 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between text-xs text-platinum-400 font-mono">
                <span>Disponibilidad en bóveda física:</span>
                <span className="text-gold-400 font-bold">{product.stock} unidades</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-white/10 rounded-xl bg-noir-950 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-platinum-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-platinum-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? 'Adquirir y Resguardar' : 'Agotado en Bóveda'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
