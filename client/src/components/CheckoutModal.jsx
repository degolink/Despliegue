import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, cart, onExecuteCheckout, loading }) {
  if (!isOpen) return null;

  const [direccionEnvio, setDireccionEnvio] = useState('Av. de los Coleccionistas 742, Sector Épico');
  const [metodoEnvio, setMetodoEnvio] = useState('Estándar Asegurado para Coleccionistas (FedEx Priority)');
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
      setErrorMsg(err.response?.data?.message || err.message || 'Error al procesar el checkout transaccional.');
    }
  };

  const handleFinish = () => {
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0E1626] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* Vista de Confirmación de Compra Transaccional */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-100 font-mythic">
              ¡Transacción Confirmada!
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              La orden <strong className="text-amber-400 font-mono">#{receipt.orden_id}</strong> fue registrada atómicamente en SQL Server. El inventario ha sido actualizado y se emitieron los certificados de resguardo.
            </p>

            {/* Recibo */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-left text-xs space-y-2.5 mt-4">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Orden ID:</span>
                <span className="font-mono text-amber-400 font-bold">#{receipt.orden_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Fecha y Hora:</span>
                <span className="text-slate-200">{new Date(receipt.fecha_orden).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Destino de Envío:</span>
                <span className="text-slate-200">{receipt.direccion_envio}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Logística Especial:</span>
                <span className="text-slate-200">{receipt.metodo_envio}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-slate-200">Total Liquidado:</span>
                <span className="text-amber-400 font-mono text-base">
                  ${Number(receipt.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-6 w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20"
            >
              Cerrar y Continuar Explorando
            </button>
          </div>
        ) : (
          /* Formulario de Checkout (CU-08) */
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout Transaccional Blindado (ACID)</span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 font-mythic mb-2">
              Finalizar Pedido
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Tus artículos serán reservados mediante bloqueo de fila en base de datos para garantizar disponibilidad inmediata.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Dirección de Entrega Custodiada
                </label>
                <input
                  type="text"
                  required
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Método de Envío Asegurado</span>
                </label>
                <select
                  value={metodoEnvio}
                  onChange={(e) => setMetodoEnvio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Estándar Asegurado para Coleccionistas (FedEx Priority)">
                    Estándar Asegurado para Coleccionistas (FedEx Priority con Seguro de Bóveda)
                  </option>
                  <option value="Entrega Premium Blindada en Mano (Courier Mythic Direct)">
                    Entrega Premium Blindada en Mano (Courier Mythic Direct)
                  </option>
                  <option value="Retiro en Cámara Fuerte de Seguridad (Bóveda Central)">
                    Retiro en Cámara Fuerte de Seguridad (Bóveda Central)
                  </option>
                </select>
              </div>

              {/* Resumen de Compra */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2 mt-4">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Resumen de Bóveda ({cart?.items?.length || 0} coleccionables)
                </div>
                <div className="flex justify-between text-slate-200 font-bold pt-2 border-t border-slate-800">
                  <span>Monto Total a Liquidar:</span>
                  <span className="text-amber-400 font-mono text-base">
                    ${Number(cart?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {loading ? 'Procesando Transacción en SQL Server...' : 'Confirmar Compra y Bloquear Stock'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

