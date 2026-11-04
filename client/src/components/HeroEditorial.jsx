import React from 'react';
import { Sparkles, Shield, Compass, ChevronRight, Award, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroEditorial({ onOpenQuestionnaire, onExploreCatalog, featuredCount = 42 }) {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-noir-900 border border-white/[0.08] p-8 sm:p-14 lg:p-16 mb-16 shadow-2xl">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-crimson-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-noir-sheen pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold-500/[0.08] border border-gold-500/30 text-gold-300 text-[11px] font-mono tracking-widest uppercase shadow-luxury-sm"
          >
            <Shield className="w-3.5 h-3.5 text-gold-400" />
            <span>Masterpiece Grade • Provenance & Authentication Guaranteed</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.08]"
          >
            The Definitive Archive of
            <span className="block mt-1 font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-600">
              Legendary Collectibles
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-platinum-400 leading-relaxed max-w-xl font-light"
          >
            Una experiencia boutique curada al estándar de las casas de subasta y marcas de hiperrealismo.
            Cada figura histórica, carta emblemática y tesoro sellado resguardado con cadena de custodia verificada.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="pt-2 flex flex-wrap items-center gap-4"
          >
            <button
              onClick={onOpenQuestionnaire}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow flex items-center space-x-2.5 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Configurar Afinidad</span>
            </button>

            <button
              onClick={onExploreCatalog}
              className="px-7 py-3.5 rounded-xl bg-noir-850 hover:bg-noir-800 border border-white/10 hover:border-gold-500/40 text-platinum-200 hover:text-white font-medium text-xs uppercase tracking-widest transition-all shadow-luxury-sm flex items-center space-x-2"
            >
              <span>Ver Archivo Completo</span>
              <ChevronRight className="w-3.5 h-3.5 text-gold-400" />
            </button>
          </motion.div>

          {/* Quick Stats Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg"
          >
            <div>
              <div className="font-serif text-2xl font-bold text-white tracking-wide">100%</div>
              <div className="text-[10px] font-mono tracking-widest text-platinum-500 uppercase mt-0.5">
                Autenticidad Curada
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-gold-400 tracking-wide">+{featuredCount}</div>
              <div className="text-[10px] font-mono tracking-widest text-platinum-500 uppercase mt-0.5">
                Piezas Icónicas
              </div>
            </div>
            <div>
              <div className="font-serif text-2xl font-bold text-white tracking-wide">AFA / PSA</div>
              <div className="text-[10px] font-mono tracking-widest text-platinum-500 uppercase mt-0.5">
                Grados Certificados
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Editorial Showcase Plaque */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden bg-noir-950 border border-white/10 shadow-2xl p-4 flex flex-col justify-between group">
            <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/40 to-transparent z-10 pointer-events-none" />

            {/* Top Badge */}
            <div className="relative z-20 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-noir-900/90 border border-gold-500/30 text-gold-400 text-[10px] font-mono tracking-widest uppercase flex items-center space-x-1.5">
                <Flame className="w-3 h-3 text-gold-500" />
                <span>Featured Masterpiece</span>
              </span>
              <span className="text-[10px] font-mono text-platinum-400">ARCHIVE #001</span>
            </div>

            {/* Hero Visual Mockup */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <img
                src="/logo-mythic-shelf.webp"
                alt="Mythic Shelf Vault"
                className="w-full max-h-72 object-contain drop-shadow-[0_20px_40px_rgba(200,155,43,0.3)] transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Bottom Plaque Label */}
            <div className="relative z-20 pt-4 border-t border-white/[0.08] backdrop-blur-md bg-noir-900/60 -mx-4 -mb-4 p-5 rounded-b-2xl">
              <div className="text-[10px] font-mono uppercase tracking-widest text-gold-400 mb-1">
                Curaduría de Alta Gama
              </div>
              <div className="font-serif text-base font-bold text-white tracking-wide truncate">
                Mythic Shelf Archival Vault Collection
              </div>
              <p className="text-[11px] text-platinum-400 mt-1 line-clamp-2 font-light">
                Inspección microscópica de plásticos, blisters sellados de fábrica y tiradas limitadas de 1970 a 2020.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
