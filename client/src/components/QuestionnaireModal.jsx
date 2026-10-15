import React, { useState } from 'react';
import { X, Sparkles, Target, Compass, Award, DollarSign } from 'lucide-react';

export default function QuestionnaireModal({ isOpen, onClose, onSubmit, currentPreferences }) {
  if (!isOpen) return null;
  const [formData, setFormData] = useState({
    franquicia_interes: currentPreferences?.franquicia_interes || 'Star Wars',
    categoria_preferida: currentPreferences?.categoria_preferida || 'Figuras de Acción',
    decada_interes: currentPreferences?.decada_interes || '1970s',
    presupuesto_min: currentPreferences?.presupuesto_min ?? 50,
    presupuesto_max: currentPreferences?.presupuesto_max ?? 1500,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      presupuesto_min: Number(formData.presupuesto_min),
      presupuesto_max: Number(formData.presupuesto_max),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>RF-09 / Motor de Afinidad</span>
        </div>
        <h2 className="text-2xl font-black text-slate-100 font-mythic">
          Cuestionario de Preferencias
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          Personaliza tu feed. El algoritmo asignará <span className="text-amber-400 font-bold">+3 puntos</span> a tu franquicia, <span className="text-amber-400 font-bold">+2</span> a tu categoría y <span className="text-amber-400 font-bold">+1</span> dentro de tu presupuesto.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Franquicia (+3 pts) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Franquicia de Interés Principal</span>
              </span>
              <span className="text-amber-400 font-mono text-[11px]">+3 pts</span>
            </label>
            <select
              value={formData.franquicia_interes}
              onChange={(e) => setFormData({ ...formData, franquicia_interes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Star Wars">Star Wars</option>
              <option value="Pokémon">Pokémon</option>
              <option value="Transformers">Transformers</option>
              <option value="Nintendo">Nintendo</option>
              <option value="Marvel">Marvel Vintage</option>
              <option value="DC Comics">DC Comics</option>
            </select>
          </div>

          {/* Categoría (+2 pts) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Categoría Preferida</span>
              </span>
              <span className="text-amber-400 font-mono text-[11px]">+2 pts</span>
            </label>
            <select
              value={formData.categoria_preferida}
              onChange={(e) => setFormData({ ...formData, categoria_preferida: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Figuras de Acción">Figuras de Acción</option>
              <option value="Cartas TCG">Cartas TCG</option>
              <option value="Videojuegos Retro">Videojuegos Retro</option>
              <option value="Vehículos y Naves">Vehículos y Naves</option>
              <option value="Cómics Vintage">Cómics Vintage</option>
            </select>
          </div>

          {/* Década de Interés */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Década de Nostalgia</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1970s', '1980s', '1990s', '2000s'].map((dec) => (
                <button
                  type="button"
                  key={dec}
                  onClick={() => setFormData({ ...formData, decada_interes: dec })}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    formData.decada_interes === dec
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>

          {/* Rango de Presupuesto (+1 pt) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Rango de Presupuesto (USD)</span>
              </span>
              <span className="text-amber-400 font-mono text-[11px]">+1 pto</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">Mínimo ($)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.presupuesto_min}
                  onChange={(e) => setFormData({ ...formData, presupuesto_min: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Máximo ($)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.presupuesto_max}
                  onChange={(e) => setFormData({ ...formData, presupuesto_max: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20"
            >
              Aplicar y Calcular Recomendaciones
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
