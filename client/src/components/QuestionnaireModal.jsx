import React, { useState } from 'react';
import { X, Sparkles, Target, Compass, Award, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg bg-noir-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-noir-950/80 text-platinum-400 hover:text-white transition-all border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-gold-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          <span>Concierge de Afinidad • Scoring Predictivo</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
          Perfil de Inversión y Pasión
        </h2>
        <p className="text-xs text-platinum-400 mt-1.5 mb-6 font-light leading-relaxed">
          Configura tus preferencias. El motor ponderará{' '}
          <strong className="text-gold-300 font-medium">+3 pts por franquicia</strong>,{' '}
          <strong className="text-gold-300 font-medium">+2 por categoría</strong> y{' '}
          <strong className="text-gold-300 font-medium">+1 por rango de precio</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Franchise */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-gold-400" />
                <span>1. Franquicia Principal</span>
              </span>
              <span className="text-gold-400 text-[10px] font-bold">+3 PTS</span>
            </label>
            <select
              value={formData.franquicia_interes}
              onChange={(e) => setFormData({ ...formData, franquicia_interes: e.target.value })}
              className="w-full px-4 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 font-sans cursor-pointer"
            >
              <option value="Star Wars">Star Wars</option>
              <option value="Pokémon">Pokémon</option>
              <option value="Transformers">Transformers</option>
              <option value="Nintendo">Nintendo</option>
              <option value="DC Comics">DC Comics</option>
              <option value="Marvel Comics">Marvel Comics</option>
              <option value="LEGO">LEGO</option>
              <option value="Barbie">Barbie</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5 text-gold-400" />
                <span>2. Categoría Predilecta</span>
              </span>
              <span className="text-gold-400 text-[10px] font-bold">+2 PTS</span>
            </label>
            <select
              value={formData.categoria_preferida}
              onChange={(e) => setFormData({ ...formData, categoria_preferida: e.target.value })}
              className="w-full px-4 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 font-sans cursor-pointer"
            >
              <option value="Figuras de Acción">Figuras de Acción</option>
              <option value="Cartas TCG">Cartas TCG</option>
              <option value="Videojuegos Retro">Videojuegos Retro</option>
              <option value="Vehículos y Naves">Vehículos y Naves</option>
              <option value="Cómics Vintage">Cómics Vintage</option>
            </select>
          </div>

          {/* Decade */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-gold-400" />
              <span>3. Década de Nostalgia</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['1970s', '1980s', '1990s', '2000s'].map((dec) => (
                <button
                  type="button"
                  key={dec}
                  onClick={() => setFormData({ ...formData, decada_interes: dec })}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-all ${
                    formData.decada_interes === dec
                      ? 'bg-gold-500/20 border-gold-400 text-gold-300 shadow-luxury-sm'
                      : 'bg-noir-950 border-white/10 text-platinum-400 hover:border-white/20'
                  }`}
                >
                  {dec}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-gold-400" />
                <span>4. Presupuesto Estimado (USD)</span>
              </span>
              <span className="text-gold-400 text-[10px] font-bold">+1 PTO</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">Mínimo</span>
                <input
                  type="number"
                  min="0"
                  value={formData.presupuesto_min}
                  onChange={(e) => setFormData({ ...formData, presupuesto_min: e.target.value })}
                  className="w-full px-3.5 py-2 bg-noir-950 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">Máximo</span>
                <input
                  type="number"
                  min="0"
                  value={formData.presupuesto_max}
                  onChange={(e) => setFormData({ ...formData, presupuesto_max: e.target.value })}
                  className="w-full px-3.5 py-2 bg-noir-950 border border-white/10 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow"
            >
              Calibrar y Ordenar Bóveda
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
