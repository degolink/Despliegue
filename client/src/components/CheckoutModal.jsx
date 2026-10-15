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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-lowest/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-surface-container border border-white/10 rounded-2xl shadow-2xl shadow-primary-container/20 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {receipt ? (
          /* Vista de Confirmación de Compra Transaccional */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-tertiary/20 border-2 border-tertiary rounded-full flex items-center justify-center mx-auto text-tertiary">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-on-surface font-mythic">
              ¡Transacción Confirmada!
            </h2>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto">
              La orden <strong className="text-secondary font-mono">#{receipt.orden_id}</strong> fue registrada atómicamente en SQL Server. El inventario ha sido actualizado y se emitieron los certificados de resguardo.
            </p>

            {/* Recibo */}
            <div className="bg-surface-low border border-white/10 rounded-xl p-5 text-left text-xs space-y-2.5 mt-4">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-on-surface-variant">Orden ID:</span>
                <span className="font-mono text-secondary font-bold">#{receipt.orden_id}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-on-surface-variant">Fecha y Hora:</span>
                <span className="text-on-surface">{new Date(receipt.fecha_orden).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-on-surface-variant">Destino de Envío:</span>
                <span className="text-on-surface">{receipt.direccion_envio}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-on-surface-variant">Logística Especial:</span>
                <span className="text-on-surface">{receipt.metodo_envio}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-on-surface">Total Liquidado:</span>
                <span className="text-secondary font-mono text-base">
                  ${Number(receipt.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="mt-6 w-full py-3 rounded-lg bg-primary-container hover:bg-primary-dark text-white font-bold text-sm tracking-wider uppercase transition-all shadow-lg shadow-primary-container/40"
            >
              Cerrar y Continuar Explorando
            </button>
          </div>
        ) : (
          /* Formulario de Checkout (CU-08) */
          <div>
            <div className="flex items-center space-x-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Checkout Transaccional Blindado (ACID)</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface font-mythic mb-2">
              Finalizar Pedido
            </h2>
            <p className="text-xs text-on-surface-variant mb-6">
              Tus artículos serán reservados mediante bloqueo de fila en base de datos para garantizar disponibilidad inmediata.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-danger-container/30 border border-danger/40 text-danger text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  Dirección de Entrega Custodiada
                </label>
                <input
                  type="text"
                  required
                  value={direccionEnvio}
                  onChange={(e) => setDireccionEnvio(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1 flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-tertiary" />
                  <span>Método de Envío Asegurado</span>
                </label>
                <select
                  value={metodoEnvio}
                  onChange={(e) => setMetodoEnvio(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
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
              <div className="bg-surface-low p-4 rounded-xl border border-white/10 text-xs space-y-2 mt-4">
                <div className="text-on-surface-variant font-bold uppercase tracking-wider text-[10px]">
                  Resumen de Bóveda ({cart?.items?.length || 0} coleccionables)
                </div>
                <div className="flex justify-between text-on-surface font-bold pt-2 border-t border-white/10">
                  <span>Monto Total a Liquidar:</span>
                  <span className="text-secondary font-mono text-base">
                    ${Number(cart?.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-primary-container hover:bg-primary-dark text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-primary-container/40 disabled:opacity-50"
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