import React from 'react';
import { ShoppingBag, Sparkles, User, LogOut, Shield, Compass } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenQuestionnaire,
  onOpenAuth,
  user,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-mythic text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
              MYTHIC SHELF
            </span>
            <span className="block text-[10px] tracking-widest text-amber-500/80 uppercase font-semibold">
              Santuario de Coleccionables
            </span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Botón de Test de Afinidad (RF-09 / Motor de Recomendación) */}
          <button
            onClick={onOpenQuestionnaire}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 text-amber-300 hover:border-amber-400 hover:text-amber-200 transition-all text-xs sm:text-sm font-medium shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Test de Afinidad</span>
            <span className="sm:hidden">Afinidad</span>
          </button>

          {/* Carrito de Compras (CU-07) */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-slate-700 transition-all"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Autenticación & Perfil (GUS) */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-slate-200">{user.nombre_completo}</div>
                <div className="text-[10px] text-amber-400 font-mono font-medium">{user.rol}</div>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-amber-500/20"
            >
              <User className="w-4 h-4" />
              <span>Ingresar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

