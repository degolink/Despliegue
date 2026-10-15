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
    <div className="mb-8 rounded-xl bg-gradient-to-r from-surface-low via-primary-container/15 to-surface-low border border-primary-container/30 p-5 shadow-xl relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-container/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>Motor de Recomendación Inteligente (Content-Based Matching)</span>
          </div>
          <h2 className="text-lg font-bold text-on-surface">
            Feed Personalizado según tu Perfil de Coleccionista
          </h2>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
            Priorizamos piezas con base en: <span className="text-secondary font-medium">+3 pts por Franquicia</span>, <span className="text-secondary font-medium">+2 pts por Categoría</span> y <span className="text-secondary font-medium">+1 pto en Rango de Presupuesto</span>.
          </p>
        </div>

        <button
          onClick={onRetakeQuiz}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 text-xs text-tertiary border border-tertiary/40 transition-all shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ajustar Preferencias</span>
        </button>
      </div>

      {/* Chips de preferencias activas */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
        {franquicia_interes && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-primary-container/15 border border-primary-container/40 text-xs text-primary">
            <Target className="w-3 h-3" />
            <span>Franquicia: <strong>{franquicia_interes}</strong> (+3 pts)</span>
          </span>
        )}
        {categoria_preferida && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-tertiary/10 border border-tertiary/30 text-xs text-tertiary">
            <Award className="w-3 h-3" />
            <span>Categoría: <strong>{categoria_preferida}</strong> (+2 pts)</span>
          </span>
        )}
        {(presupuesto_min != null || presupuesto_max != null) && (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-secondary-container/15 border border-secondary-container/40 text-xs text-secondary">
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