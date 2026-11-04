import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthModal({ isOpen, onClose, onLogin, onRegister, loading }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({
    nombre_completo: '',
    correo_electronico: 'buyer@mythicshelf.com',
    contrasena: 'Mythic2024!',
    rol: 'Comprador',
  });
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (mode === 'login') {
        await onLogin({
          correo_electronico: formData.correo_electronico,
          contrasena: formData.contrasena,
        });
      } else {
        await onRegister(formData);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error en la autenticación.');
    }
  };

  const handleFillDemo = (role) => {
    if (role === 'buyer') {
      setFormData({
        nombre_completo: 'Luke Skywalker Collector',
        correo_electronico: 'buyer@mythicshelf.com',
        contrasena: 'Mythic2024!',
        rol: 'Comprador',
      });
      setMode('login');
    } else if (role === 'seller') {
      setFormData({
        nombre_completo: 'Obi-Wan Vintage Seller',
        correo_electronico: 'seller@mythicshelf.com',
        contrasena: 'Mythic2024!',
        rol: 'Vendedor',
      });
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-noir-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-noir-950/80 text-platinum-400 hover:text-white transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Selector */}
        <div className="flex border-b border-white/[0.08] mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-widest transition-all ${
              mode === 'login'
                ? 'border-b-2 border-gold-400 text-gold-300'
                : 'text-platinum-500 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-3 text-xs font-mono font-bold uppercase tracking-widest transition-all ${
              mode === 'register'
                ? 'border-b-2 border-gold-400 text-gold-300'
                : 'text-platinum-500 hover:text-white'
            }`}
          >
            Registro VIP
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-crimson-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ej. Howard Hughes"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500 font-sans shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
              Credencial / Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="collector@mythicshelf.com"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500 font-sans shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-platinum-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold-500 font-sans shadow-inner"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5">
                Rango en la Plataforma
              </label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 font-sans cursor-pointer"
              >
                <option value="Comprador">Comprador (Coleccionista Privado)</option>
                <option value="Vendedor">Vendedor (Curador de Bóveda)</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-50"
            >
              {loading
                ? 'Validando Credencial...'
                : mode === 'login'
                ? 'Ingresar al Santuario VIP'
                : 'Registrar Cuenta de Custodia'}
            </button>
          </div>
        </form>

        {/* Demo Fast-login Buttons */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
          <span className="text-[10px] font-mono tracking-widest text-platinum-500 uppercase block mb-2">
            Acceso Inmediato de Prueba:
          </span>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleFillDemo('buyer')}
              className="px-3 py-1.5 text-xs bg-noir-950 hover:bg-noir-850 text-gold-300 rounded-lg border border-gold-500/30 font-mono"
            >
              Comprador Demo
            </button>
            <button
              onClick={() => handleFillDemo('seller')}
              className="px-3 py-1.5 text-xs bg-noir-950 hover:bg-noir-850 text-platinum-300 rounded-lg border border-white/10 font-mono"
            >
              Vendedor Demo
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
