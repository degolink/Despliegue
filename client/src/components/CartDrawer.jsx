import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';

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
        className="absolute inset-0 bg-surface-lowest/70 backdrop-blur-md transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-low border-l border-white/10 shadow-2xl shadow-primary-container/20 flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-on-surface font-mythic">
                Carrito de Bóveda ({count})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-on-surface-variant hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="w-12 h-12 text-outline mx-auto mb-3" />
                <p className="text-on-surface-variant text-sm">Tu carrito de coleccionables está vacío.</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 border border-tertiary/50 hover:bg-tertiary/10 text-xs font-semibold text-tertiary rounded-lg transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.item_id}
                  className="bg-surface-container border border-white/10 rounded-xl p-4 flex gap-4 items-center"
                >
                  <img
                    src={item.imagen_url || 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800'}
                    alt={item.nombre}
                    className="w-16 h-16 rounded-lg object-cover bg-surface-lowest border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-on-surface truncate">{item.nombre}</h4>
                    <div className="text-xs text-secondary font-mono font-semibold mt-0.5">
                      ${Number(item.precio).toFixed(2)} c/u
                    </div>

                    {/* Alerta de Stock insuficiente si aplica */}
                    {item.stock_disponible === 0 && (
                      <div className="flex items-center space-x-1 text-[11px] text-danger mt-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Stock insuficiente (disponibles: {item.stock})</span>
                      </div>
                    )}

                    {/* Controles de Cantidad */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-white/10 rounded bg-surface-lowest">
                        <button
                          onClick={() => onUpdateQuantity(item.item_id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                          className="px-2 py-0.5 text-xs text-on-surface-variant hover:text-white disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-on-surface">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.item_id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                          className="px-2 py-0.5 text-xs text-on-surface-variant hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.item_id)}
                        className="p-1 text-outline hover:text-danger transition-colors"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-surface-lowest/60 space-y-4">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <button
                  onClick={onClearCart}
                  className="text-danger/80 hover:text-danger underline"
                >
                  Vaciar carrito completo
                </button>
                <span>Impuestos & Envíos calculados al cierre</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-on-surface-variant">Total Estimado</span>
                <span className="text-2xl font-black text-secondary font-mono">
                  ${Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-primary-container hover:bg-primary-dark text-white font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-primary-container/40 transition-all"
              >
                <span>Proceder al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}