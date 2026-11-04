import React from 'react';
import { Sparkles, Target, Award, DollarSign, RefreshCw, Zap, ShieldCheck, Compass, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Tooltip,
} from 'recharts';

export default function RecommendationBanner({ preferences, profileAnalysis, onRetakeQuiz }) {
  if (!preferences && !profileAnalysis) return null;

  const { franquicia_interes, categoria_preferida, presupuesto_min, presupuesto_max } = preferences || {};

  const hasPreferences =
    franquicia_interes ||
    categoria_preferida ||
    presupuesto_min != null ||
    presupuesto_max != null ||
    profileAnalysis;

  if (!hasPreferences) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12 rounded-3xl bg-noir-900 border border-gold-500/30 p-6 sm:p-8 shadow-luxury relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono font-semibold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>
              {profileAnalysis
                ? 'Perfil Coleccionista Multidimensional • Concierge Activo'
                : 'Algoritmo Content-Based Matching • Personalización de Bóveda'}
            </span>
          </div>

          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
            {profileAnalysis?.archetypeTitle || 'Archivo Calibrado a tu Perfil de Inversión'}
          </h2>

          <p className="text-xs text-platinum-300 mt-1.5 max-w-2xl font-light leading-relaxed">
            {profileAnalysis?.archetypeDescription || (
              <>
                Prioridad inteligente: <strong className="text-gold-300 font-medium">+3 pts por Franquicia</strong>,{' '}
                <strong className="text-gold-300 font-medium">+2 pts por Categoría</strong> y{' '}
                <strong className="text-gold-300 font-medium">+1 pto en Rango de Presupuesto</strong>.
              </>
            )}
          </p>
        </div>

        <button
          onClick={onRetakeQuiz}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-noir-850 hover:bg-noir-800 text-xs font-semibold uppercase tracking-wider text-gold-300 border border-gold-500/30 hover:border-gold-400 transition-all shadow-luxury-sm shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{profileAnalysis ? 'Recalibrar Perfil' : 'Ajustar Parámetros'}</span>
        </button>
      </div>

      {/* Multidimensional Dimensions Radar Chart & Chips if available */}
      {profileAnalysis?.dimensionPercentages && (
        <div className="mt-5 pt-5 border-t border-white/[0.06] relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="h-48 w-full bg-noir-950/60 rounded-2xl border border-white/5 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="70%"
                data={[
                  { dimension: 'Universos', valor: profileAnalysis.dimensionPercentages.universos },
                  { dimension: 'Categorías', valor: profileAnalysis.dimensionPercentages.categorias },
                  { dimension: 'Personajes', valor: profileAnalysis.dimensionPercentages.personajes },
                  { dimension: 'Eventos', valor: profileAnalysis.dimensionPercentages.eventos },
                  { dimension: 'Nostalgia', valor: profileAnalysis.dimensionPercentages.nostalgia },
                  { dimension: 'Rareza', valor: profileAnalysis.dimensionPercentages.rareza },
                ]}
              >
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: '#E2E8F0', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A0A0C',
                    borderColor: 'rgba(212, 175, 55, 0.4)',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: '#FFFFFF',
                  }}
                  formatter={(val) => [`${val}%`, 'Afinidad']}
                />
                <Radar
                  name="Perfil"
                  dataKey="valor"
                  stroke="#D4AF37"
                  fill="#D4AF37"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
            <div className="p-3 rounded-xl bg-noir-950/60 border border-white/5">
              <span className="text-platinum-500 block text-[9px] uppercase">Universos (25%)</span>
              <span className="text-gold-400 font-bold text-sm">{profileAnalysis.dimensionPercentages.universos}%</span>
            </div>
            <div className="p-3 rounded-xl bg-noir-950/60 border border-white/5">
              <span className="text-platinum-500 block text-[9px] uppercase">Categorías (25%)</span>
              <span className="text-gold-400 font-bold text-sm">{profileAnalysis.dimensionPercentages.categorias}%</span>
            </div>
            <div className="p-3 rounded-xl bg-noir-950/60 border border-white/5">
              <span className="text-platinum-500 block text-[9px] uppercase">Personajes (15%)</span>
              <span className="text-gold-400 font-bold text-sm">{profileAnalysis.dimensionPercentages.personajes}%</span>
            </div>
            <div className="p-3 rounded-xl bg-noir-950/60 border border-white/5">
              <span className="text-platinum-500 block text-[9px] uppercase">Eventos (15%)</span>
              <span className="text-gold-400 font-bold text-sm">{profileAnalysis.dimensionPercentages.eventos}%</span>
            </div>
            <div className="p-3 rounded-xl bg-noir-950/60 border border-white/5">
              <span className="text-platinum-500 block text-[9px] uppercase">Nostalgia (10%)</span>
              <span className="text-gold-400 font-bold text-sm">{profileAnalysis.dimensionPercentages.nostalgia}%</span>
            </div>
            <div className="p-3 rounded-xl bg-noir-950/60 border border-white/5">
              <span className="text-platinum-500 block text-[9px] uppercase">Rareza (10%)</span>
              <span className="text-gold-400 font-bold text-sm">{profileAnalysis.dimensionPercentages.rareza}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Applied Preference Chips */}
      <div className="flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-white/[0.04] relative z-10">
        {franquicia_interes && (
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/25 text-xs text-gold-300 font-mono">
            <Target className="w-3.5 h-3.5 text-gold-400" />
            <span>
              Universo Principal: <strong className="text-white">{franquicia_interes}</strong>
            </span>
          </span>
        )}
        {categoria_preferida && (
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-platinum-200 font-mono">
            <Award className="w-3.5 h-3.5 text-gold-400" />
            <span>
              Formato Predilecto: <strong className="text-white">{categoria_preferida}</strong>
            </span>
          </span>
        )}
        {(presupuesto_min != null || presupuesto_max != null) && (
          <span className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-platinum-200 font-mono">
            <DollarSign className="w-3.5 h-3.5 text-gold-400" />
            <span>
              Rango: ${presupuesto_min || 0} — ${presupuesto_max || 'Sin tope'}
            </span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
