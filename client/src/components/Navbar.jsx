import React, { useState } from 'react';
import { ShoppingBag, Sparkles, User, LogOut, ChevronDown, ShieldCheck, Flame, Compass, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenQuestionnaire,
  onOpenAuth,
  user,
  onLogout,
  onSelectFranchiseFilter,
  onSelectCategoryFilter,
  franchises = [],
  categories = [],
}) {
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-noir-950/90 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      {/* Top micro-bar: Collector status & guarantees */}
      <div className="hidden lg:block border-b border-white/[0.04] bg-noir-900/60 text-[11px] text-platinum-400 py-1.5 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-mono tracking-wider">
          <div className="flex items-center space-x-6">
            <span className="flex items-center space-x-1.5 text-gold-400">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
              <span className="tracking-widest uppercase">Archival Authenticity Guarantee</span>
            </span>
            <span className="text-white/20">•</span>
            <span>Worldwide Insured Vault Shipping</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white/40">Curated Boutique for Serious Collectors</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-300 text-[10px]">
              V1.0 High-End
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity / Hot Toys style luxury logotype */}
        <div className="flex items-center space-x-8">
          <a href="/" className="group flex items-center space-x-3.5">
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 via-gold-600 to-noir-950 p-[1px] shadow-luxury transition-transform duration-500 group-hover:scale-105">
              <div className="w-full h-full bg-noir-950 rounded-lg flex items-center justify-center">
                <span className="font-serif font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-gold-200 via-gold-400 to-gold-600">
                  M
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.2em] text-white group-hover:text-gold-200 transition-colors">
                  MYTHIC
                </span>
                <span className="font-serif text-xl sm:text-2xl font-light tracking-[0.25em] text-gold-400">
                  SHELF
                </span>
              </div>
              <span className="block text-[9px] tracking-widest-luxury uppercase text-platinum-500 font-mono">
                High-End Collectibles & Archives
              </span>
            </div>
          </a>

          {/* Desktop Mega-Menu Trigger */}
          <nav className="hidden lg:flex items-center space-x-1">
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-medium tracking-widest uppercase transition-colors ${
                  megaMenuOpen ? 'text-gold-400 bg-white/[0.04]' : 'text-platinum-300 hover:text-white'
                }`}
              >
                <span>Explorar Archivos</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${megaMenuOpen ? 'rotate-180 text-gold-400' : ''}`} />
              </button>

              {/* Mega-Menu Dropdown Panel */}
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full pt-2 w-[540px] z-50 pointer-events-auto"
                  >
                    <div className="bg-noir-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-2xl grid grid-cols-2 gap-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />

                      {/* Franchises Column */}
                      <div>
                        <div className="flex items-center space-x-2 pb-2.5 border-b border-white/[0.06] mb-3">
                          <Flame className="w-3.5 h-3.5 text-gold-400" />
                          <span className="text-[11px] font-mono tracking-widest uppercase text-gold-400 font-semibold">
                            Franquicias Icónicas
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {franchises.slice(0, 6).map((franchise) => (
                            <li key={franchise}>
                              <button
                                onClick={() => {
                                  onSelectFranchiseFilter?.(franchise);
                                  setMegaMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-platinum-300 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                              >
                                <span>{franchise}</span>
                                <span className="text-[10px] text-white/20 group-hover:text-gold-400 transition-colors">→</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Categories Column */}
                      <div>
                        <div className="flex items-center space-x-2 pb-2.5 border-b border-white/[0.06] mb-3">
                          <Award className="w-3.5 h-3.5 text-gold-400" />
                          <span className="text-[11px] font-mono tracking-widest uppercase text-gold-400 font-semibold">
                            Categorías Maestras
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {categories.slice(0, 6).map((cat) => (
                            <li key={cat}>
                              <button
                                onClick={() => {
                                  onSelectCategoryFilter?.(cat);
                                  setMegaMenuOpen(false);
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-platinum-300 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-between group"
                              >
                                <span>{cat}</span>
                                <span className="text-[10px] text-white/20 group-hover:text-gold-400 transition-colors">→</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Recommendation / Affinity Concierge CTA */}
          <button
            onClick={onOpenQuestionnaire}
            className="relative group px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500/10 via-gold-500/20 to-gold-500/10 border border-gold-500/30 text-gold-300 hover:border-gold-400 hover:text-white transition-all text-xs font-semibold tracking-wider uppercase flex items-center space-x-2 shadow-luxury-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">Concierge de Afinidad</span>
            <span className="sm:hidden">Afinidad</span>
          </button>

          {/* Cart Icon / Counter */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-noir-900 border border-white/10 text-platinum-300 hover:text-gold-300 hover:border-gold-500/40 transition-all shadow-luxury-sm"
            aria-label="Ver Bóveda y Carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-gold-400 to-gold-600 text-noir-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg font-mono">
                {cartCount}
              </span>
            )}
          </button>

          {/* Authentication & Profile */}
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-white/10">
              <div className="text-right hidden md:block">
                <div className="text-xs font-semibold text-white tracking-wide">{user.nombre_completo}</div>
                <div className="text-[10px] text-gold-400 font-mono tracking-wider uppercase">{user.rol}</div>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl bg-noir-900 border border-white/10 text-platinum-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 text-xs font-black tracking-widest uppercase transition-all shadow-gold-glow active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              <span>Acceso VIP</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
