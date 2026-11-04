import React, { useState } from 'react';
import { X, Lock, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * RF-03: Restablecer contraseña con el token recibido por correo.
 * Se abre automáticamente cuando la app se carga en /reset-password?token=...
 */
export default function ResetPasswordModal({ isOpen, onClose, onSubmit }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);
    try {
      const message = await onSubmit(password);
      setSuccessMsg(message || 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500 font-sans shadow-inner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-noir-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10"
      >
        <button
          onClick={() => onClose(false)}
          aria-label="Cerrar"
          className="absolute top-5 right-5 p-2 rounded-full bg-noir-950/80 text-platinum-400 hover:text-white transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono tracking-widest uppercase mb-2">
          <KeyRound className="w-3.5 h-3.5 text-gold-500" />
          <span>Recuperación de acceso</span>
        </div>
        <h2 className="font-serif text-2xl text-white mb-6">Nueva contraseña</h2>

        {successMsg ? (
          <div className="space-y-6">
            <div className="p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-gold-400" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => onClose(true)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow"
            >
              Iniciar sesión
            </button>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-rose-300 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-crimson-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Restablecer contraseña'}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
