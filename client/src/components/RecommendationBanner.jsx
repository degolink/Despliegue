import React from 'react';
import { Sparkles, Target, Award, DollarSign, RefreshCw } from 'lucide-react';

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
    <div className="mb-8 rounded-xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 p-5 shadow-xl relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Motor de Recomendación Inteligente (Content-Based Matching)</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Feed Personalizado según tu Perfil de Coleccionista
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Priorizamos piezas con base en: <span className="text-amber-300 font-medium">+3 pts por Franquicia</span>, <span className="text-amber-300 font-medium">+2 pts por Categoría</span> y <span className="text-amber-300 font-medium">+1 pto en Rango de Presupuesto</span>.
          </p>
        </div>

        <button
          onClick={onRetakeQuiz}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-amber-300 border border-amber-500/30 transition-all shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ajustar Preferencias</span>
        </button>
      </div>

      {/* Chips de preferencias activas */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/80">
        {franquicia_interes && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <Target className="w-3 h-3" />
            <span>Franquicia: <strong>{franquicia_interes}</strong> (+3 pts)</span>
          </span>
        )}
        {categoria_preferida && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300">
            <Award className="w-3 h-3" />
            <span>Categoría: <strong>{categoria_preferida}</strong> (+2 pts)</span>
          </span>
        )}
        {(presupuesto_min != null || presupuesto_max != null) && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
            <DollarSign className="w-3 h-3" />
            <span>
              Presupuesto: ${presupuesto_min || 0} - ${presupuesto_max || '∞'} (+1 pto)
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

