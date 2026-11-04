import React from 'react';
import { Sparkles, Target, Award, DollarSign, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecommendationBanner({ preferences, onRetakeQuiz }) {
  if (!preferences) return null;

  const { franquicia_interes, categoria_preferida, presupuesto_min, presupuesto_max } = preferences;

  const hasPreferences =
    franquicia_interes ||
    categoria_preferida ||
    presupuesto_min != null ||
    presupuesto_max != null;

  if (!hasPreferences) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12 rounded-2xl bg-noir-900 border border-gold-500/30 p-6 sm:p-8 shadow-luxury relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono font-semibold uppercase tracking-widest mb-1.5">
            <Zap className="w-3.5 h-3.5 text-gold-400" />
            <span>Algoritmo Content-Based Matching • Personalización de Bóveda</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-normal text-white tracking-tight">
            Archivo Calibrado a tu Perfil de Inversión
          </h2>
          <p className="text-xs text-platinum-400 mt-1.5 max-w-2xl font-light leading-relaxed">
            Prioridad inteligente: <strong className="text-gold-300 font-medium">+3 pts por Franquicia</strong>,{' '}
            <strong className="text-gold-300 font-medium">+2 pts por Categoría</strong> y{' '}
            <strong className="text-gold-300 font-medium">+1 pto en Rango de Presupuesto</strong>.
          </p>
        </div>

        <button
          onClick={onRetakeQuiz}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-noir-850 hover:bg-noir-800 text-xs font-semibold uppercase tracking-wider text-gold-300 border border-gold-500/30 hover:border-gold-400 transition-all shadow-luxury-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ajustar Parámetros</span>
        </button>
      </div>

      {/* Applied Preference Chips */}
      <div className="flex flex-wrap gap-2.5 mt-5 pt-5 border-t border-white/[0.06] relative z-10">
        {franquicia_interes && (
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/25 text-xs text-gold-300 font-mono">
            <Target className="w-3.5 h-3.5 text-gold-400" />
            <span>Franquicia: <strong className="text-white">{franquicia_interes}</strong> (+3 pts)</span>
          </span>
        )}
        {categoria_preferida && (
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-platinum-200 font-mono">
            <Award className="w-3.5 h-3.5 text-gold-400" />
            <span>Categoría: <strong className="text-white">{categoria_preferida}</strong> (+2 pts)</span>
          </span>
        )}
        {(presupuesto_min != null || presupuesto_max != null) && (
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-platinum-200 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-gold-400" />
            <span>
              Rango: ${presupuesto_min || 0} — ${presupuesto_max || 'Sin tope'} (+1 pto)
            </span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
