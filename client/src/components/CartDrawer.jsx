import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
}) {
  if (!isOpen) return null;

  const { items = [], total = 0, count = 0 } = cart || {};

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-noir-950/80 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-screen max-w-md bg-noir-900 border-l border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5 h-5 text-gold-400" />
              <div>
                <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                  Bóveda Personal ({count})
                </h2>
                <span className="text-[10px] font-mono tracking-widest uppercase text-platinum-500">
                  Reserva Temporal Custodiada
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-platinum-400 hover:text-white hover:bg-white/[0.05]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-24 text-center">
                <ShoppingBag className="w-12 h-12 text-platinum-500 mx-auto mb-3 opacity-40" />
                <p className="font-serif text-white text-base">Tu bóveda está vacía</p>
                <p className="text-xs text-platinum-400 mt-1 font-light">
                  Aún no has agregado coleccionables a tu reserva de custodia.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-noir-850 hover:bg-noir-800 border border-white/10 hover:border-gold-500/40 text-xs font-semibold uppercase tracking-wider text-gold-300 rounded-xl transition-all shadow-luxury-sm"
                >
                  Explorar Archivo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.item_id}
                  className="bg-noir-950 border border-white/[0.08] rounded-2xl p-4 flex gap-4 items-center shadow-luxury-sm"
                >
                  <img
                    src={item.imagen_url || '/placeholder-collectible.svg'}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-xl object-cover bg-noir-900 border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-white truncate">
                      {item.nombre}
                    </h4>
                    <div className="text-xs font-mono font-bold text-gold-400 mt-0.5">
                      ${Number(item.precio).toFixed(2)} USD c/u
                    </div>

                    {/* Stock Alert */}
                    {item.stock_disponible === 0 && (
                      <div className="flex items-center space-x-1 text-[11px] text-rose-400 mt-1 font-mono">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Límite de existencias ({item.stock} u.)</span>
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/10 rounded-lg bg-noir-900">
                        <button
                          onClick={() => onUpdateQuantity(item.item_id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="px-2.5 py-0.5 text-xs text-platinum-400 hover:text-white disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-white">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.item_id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                          className="px-2.5 py-0.5 text-xs text-platinum-400 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.item_id)}
                        className="p-1 text-platinum-500 hover:text-rose-400 transition-colors"
                        title="Retirar de bóveda"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/[0.08] bg-noir-950/90 space-y-4">
              <div className="flex items-center justify-between text-xs text-platinum-500 font-mono">
                <button
                  onClick={onClearCart}
                  className="text-rose-400/80 hover:text-rose-300 underline"
                >
                  Vaciar bóveda
                </button>
                <span>Envío asegurado incluido</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-serif text-sm text-platinum-300">Total Liquidación</span>
                <span className="font-serif text-2xl font-bold text-gold-400">
                  ${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-mono text-platinum-400">USD</span>
                </span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-gold-glow transition-all active:scale-95"
              >
                <span>Proceder a Adquisición Blindada</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
