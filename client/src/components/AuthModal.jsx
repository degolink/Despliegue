import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Selector Login / Registro */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-sm font-bold transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-amber-400 text-amber-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-3 text-sm font-bold transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-amber-400 text-amber-300'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ej. Indiana Jones"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="collector@mythicshelf.com"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Rol en la Plataforma
              </label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Comprador">Comprador (Coleccionista)</option>
                <option value="Vendedor">Vendedor (Curador / Tienda)</option>
              </select>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading
                ? 'Conectando...'
                : mode === 'login'
                ? 'Ingresar al Santuario'
                : 'Registrar Cuenta Segura'}
            </button>
          </div>
        </form>

        {/* Demo Fast-login Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <span className="text-[10px] text-slate-500 uppercase block font-semibold mb-2">
            Acceso Rápido a Cuentas Semilla:
          </span>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleFillDemo('buyer')}
              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-amber-500/30"
            >
              Comprador Demo
            </button>
            <button
              onClick={() => handleFillDemo('seller')}
              className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-300 rounded border border-sky-500/30"
            >
              Vendedor Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

