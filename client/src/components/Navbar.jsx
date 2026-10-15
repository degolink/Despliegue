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
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/40 border border-primary/40">
            <Shield className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <div>
              <span className="font-mythic text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
              MYTHIC SHELF
            </span>
              <span className="block text-[10px] tracking-widest text-tertiary/80 uppercase font-semibold">
              Santuario de Coleccionables
            </span>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Botón de Test de Afinidad (RF-09 / Motor de Recomendación) */}
          <button
            onClick={onOpenQuestionnaire}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-tertiary/10 border border-tertiary/40 text-tertiary hover:border-tertiary hover:bg-tertiary/20 transition-all text-xs sm:text-sm font-medium shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-tertiary group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Test de Afinidad</span>
            <span className="sm:hidden">Afinidad</span>
          </button>

          {/* Carrito de Compras (CU-07) */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-secondary-container text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Autenticación & Perfil (GUS) */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-on-surface">{user.nombre_completo}</div>
                <div className="text-[10px] text-tertiary font-mono font-medium">{user.rol}</div>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-lg bg-surface-container border border-white/10 text-on-surface-variant hover:text-danger hover:border-danger/50 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary-dark text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-lg shadow-primary-container/40"
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

