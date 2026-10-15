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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-lowest/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-surface-container border border-white/10 rounded-2xl shadow-2xl shadow-primary-container/20 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Selector Login / Registro */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 pb-3 text-sm font-bold transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-primary-container text-primary'
                : 'text-outline hover:text-on-surface-variant'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 pb-3 text-sm font-bold transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-primary-container text-primary'
                : 'text-outline hover:text-on-surface-variant'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-danger-container/30 border border-danger/40 text-danger text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="ej. Indiana Jones"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface placeholder-outline focus:outline-none focus:border-tertiary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="collector@mythicshelf.com"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface placeholder-outline focus:outline-none focus:border-tertiary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface placeholder-outline focus:outline-none focus:border-tertiary"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">
                Rol en la Plataforma
              </label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                className="w-full px-3 py-2 bg-surface-lowest border border-white/10 rounded-lg text-xs text-on-surface focus:outline-none focus:border-tertiary"
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
              className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary-container/40 disabled:opacity-50"
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
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <span className="text-[10px] text-outline uppercase block font-semibold mb-2">
            Acceso Rápido a Cuentas Semilla:
          </span>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => handleFillDemo('buyer')}
              className="px-2.5 py-1 text-[11px] bg-primary-container/10 hover:bg-primary-container/20 text-primary rounded border border-primary-container/40"
            >
              Comprador Demo
            </button>
            <button
              onClick={() => handleFillDemo('seller')}
              className="px-2.5 py-1 text-[11px] bg-tertiary/10 hover:bg-tertiary/20 text-tertiary rounded border border-tertiary/40"
            >
              Vendedor Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}