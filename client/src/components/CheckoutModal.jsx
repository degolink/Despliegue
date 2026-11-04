import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Truck, AlertCircle, ShoppingBag, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckoutModal({ isOpen, onClose, cart, onExecuteCheckout, loading }) {
  if (!isOpen) return null;

  const [direccionEnvio, setDireccionEnvio] = useState('Bóveda Residencial Privada, Distrito Capital');
  const [metodoEnvio, setMetodoEnvio] = useState('Custodia Blindada Priority (Seguro y Seguimiento Satelital)');
  const [receipt, setReceipt] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const response = await onExecuteCheckout({
        direccion_envio: direccionEnvio,
        metodo_envio: metodoEnvio,
      });
      setReceipt(response);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error al procesar la transacción atómica.');
    }
  };

  const handleFinish = () => {
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-xl bg-noir-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={handleFinish}
          className="absolute top-5 right-5 p-2 rounded-full bg-noir-950/80 text-platinum-400 hover:text-white transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* Transaction Success Receipt Plaque */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-gold-500/10 border-2 border-gold-400 rounded-full flex items-center justify-center mx-auto text-gold-400 shadow-gold-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              Adquisición Confirmada
            </h2>
            <p className="text-xs text-platinum-400 max-w-md mx-auto leading-relaxed font-light">
              La orden <strong className="text-gold-400 font-mono">#{receipt.orden_id}</strong> fue asentada atómicamente en SQL Server. El inventario ha sido bloqueado y los certificados emitidos.
            </p>

            {/* Receipt Box */}
            <div className="bg-noir-950 border border-white/[0.08] rounded-2xl p-6 text-left text-xs font-mono space-y-3 mt-6 shadow-luxury">
              <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-platinum-500">Número de Orden:</span>
                <span className="text-gold-400 font-bold">#{receipt.orden_id}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-platinum-500">Fecha y Hora UTC:</span>
                <span className="text-platinum-200">{new Date(receipt.fecha_orden).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-platinum-500">Dirección de Custodia:</span>
                <span className="text-platinum-200 truncate max-w-[240px]">{receipt.direccion_envio}</span>
              </div>
              <div className="flex justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-platinum-500">Logística de Envío:</span>
                <span className="text-platinum-200 truncate max-w-[240px]">{receipt.metodo_envio}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold">
                <span className="font-serif text-white uppercase tracking-wider text-xs">Total Liquidado:</span>
                <span className="font-serif text-gold-400 text-lg">
                  ${Number(receipt.total).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow"
            >
              Cerrar Comprobante
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="flex items-center space-x-2 text-gold-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-500" />
              <span>Checkout Transaccional Blindado (ACID)</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide">
              Finalizar Adquisición
            </h2>
            <p className="text-xs text-platinum-400 mb-6 font-light leading-relaxed">
              Las existencias se bloquean con cerradura de fila (<code className="text-gold-400 font-mono">UPDLOCK</code>) durante el procesamiento.
            </p>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-rose-300 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-crimson-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
                  Dirección de Entrega Custodiada
                </label>
                <input
                  type="text"
                  required
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500 font-sans shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center space-x-1.5">
                  <Truck className="w-3.5 h-3.5 text-gold-400" />
                  <span>Método de Custodia y Logística</span>
                </label>
                <select
                  value={metodoEnvio}
                  onChange={(e) => setMetodoEnvio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 font-sans cursor-pointer"
                >
                  <option value="Custodia Blindada Priority (Seguro y Seguimiento Satelital)">
                    Custodia Blindada Priority (Seguro y Seguimiento Satelital)
                  </option>
                  <option value="Entrega Premium Personalizada en Mano (Courier Mythic VIP)">
                    Entrega Premium Personalizada en Mano (Courier Mythic VIP)
                  </option>
                  <option value="Retiro en Cámara Fuerte de Seguridad (Bóveda Central)">
                    Retiro en Cámara Fuerte de Seguridad (Bóveda Central)
                  </option>
                </select>
              </div>

              {/* Order Summary Plaque */}
              <div className="bg-noir-950 p-5 rounded-2xl border border-white/[0.08] text-xs font-mono space-y-2.5 mt-5 shadow-luxury">
                <div className="text-platinum-500 uppercase tracking-widest text-[10px]">
                  Resumen de Reserva ({cart?.items?.length || 0} piezas)
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-white/[0.06]">
                  <span className="font-serif text-platinum-300 uppercase tracking-wider text-xs">Monto Total a Liquidar:</span>
                  <span className="font-serif text-lg text-gold-400">
                    ${Number(cart?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-50"
                >
                  {loading ? 'Confirmando Transacción en SQL Server...' : 'Confirmar y Liquidar Pedido'}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
