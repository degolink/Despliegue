import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Compass,
  Award,
  Layers,
  Shield,
  Target,
  DollarSign,
  Flame,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_QUESTIONS, DIMENSION_WEIGHTS } from '../data/personalityQuiz';

// Mapeo dinámico de GIFs animados por dimensión y arquetipo
const DIMENSION_GIFS = {
  universos: '/gifs/pixel-hero.gif',
  categorias: '/gifs/gemini-relic.gif',
  personajes: '/gifs/sprite-02.gif',
  eventos: '/gifs/pixel-arcade.gif',
  nostalgia: '/gifs/80s-vintage.gif',
  rareza: '/gifs/sprite-01.gif',
  motivacion: '/gifs/sprite-03.gif',
};

const getQuestionGif = (dimension, step) => {
  if (dimension === 'nostalgia') {
    return step % 2 === 0 ? '/gifs/80s-vintage.gif' : '/gifs/90s-nostalgia.gif';
  }
  return DIMENSION_GIFS[dimension] || '/gifs/sprite-01.gif';
};

export default function QuestionnaireModal({ isOpen, onClose, onSubmit, currentPreferences }) {
  if (!isOpen) return null;

  // Modo: 'test' (20 preguntas) o 'manual' (formulario rápido tradicional)
  const [mode, setMode] = useState('test');
  const [currentStep, setCurrentStep] = useState(0); // 0 to 19 (preguntas) o 20 (pantalla de resumen)
  const [respuestas, setRespuestas] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Formulario manual retrocompatible
  const [manualData, setManualData] = useState({
    franquicia_interes: currentPreferences?.franquicia_interes || 'Star Wars',
    categoria_preferida: currentPreferences?.categoria_preferida || 'Figuras de Acción',
    decada_interes: currentPreferences?.decada_interes || '1970s',
    presupuesto_min: currentPreferences?.presupuesto_min ?? 50,
    presupuesto_max: currentPreferences?.presupuesto_max ?? 1500,
  });

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQ = QUIZ_QUESTIONS[currentStep];
  const selectedOptionId = currentQ ? respuestas[currentQ.id] : null;

  // Manejar selección de opción
  const handleSelectOption = (optionId) => {
    setRespuestas((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Pantalla de cierre / pre-resumen
      setCurrentStep(totalQuestions);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setRespuestas({});
    setCurrentStep(0);
  };

  // Enviar test completo de 20 preguntas
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        respuestas_test: respuestas,
        persistir: true,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  // Enviar formulario manual
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ...manualData,
        presupuesto_min: Number(manualData.presupuesto_min),
        presupuesto_max: Number(manualData.presupuesto_max),
        persistir: true,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(respuestas).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-noir-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-2xl bg-noir-900 border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 my-auto overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-noir-950/80 text-platinum-400 hover:text-white transition-all border border-white/10 z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold-300">
              Concierge Arqueológico
            </span>
          </div>

          <div className="flex items-center space-x-2 mr-8">
            <button
              type="button"
              onClick={() => setMode('test')}
              className={`text-[11px] font-mono uppercase px-3 py-1 rounded-full transition-all ${
                mode === 'test'
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                  : 'text-platinum-400 hover:text-white'
              }`}
            >
              Test Completo (20)
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`text-[11px] font-mono uppercase px-3 py-1 rounded-full transition-all ${
                mode === 'manual'
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40 font-bold'
                  : 'text-platinum-400 hover:text-white'
              }`}
            >
              Ajuste Manual
            </button>
          </div>
        </div>

        {mode === 'manual' ? (
          /* FORMULARIO MANUAL RETROCOMPATIBLE */
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
                Calibración Manual de Afinidad
              </h2>
              <p className="text-xs text-platinum-400 mt-1 mb-4 font-light leading-relaxed">
                Ajusta tus parámetros directos. El motor ponderará{' '}
                <strong className="text-gold-300">+3 pts por franquicia</strong>,{' '}
                <strong className="text-gold-300">+2 por categoría</strong> y{' '}
                <strong className="text-gold-300">+1 por rango de precio</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-gold-400" />
                  <span>1. Franquicia Principal</span>
                </span>
                <span className="text-gold-400 text-[10px] font-bold">+3 PTS</span>
              </label>
              <select
                value={manualData.franquicia_interes}
                onChange={(e) => setManualData({ ...manualData, franquicia_interes: e.target.value })}
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

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-gold-400" />
                  <span>2. Categoría Predilecta</span>
                </span>
                <span className="text-gold-400 text-[10px] font-bold">+2 PTS</span>
              </label>
              <select
                value={manualData.categoria_preferida}
                onChange={(e) => setManualData({ ...manualData, categoria_preferida: e.target.value })}
                className="w-full px-4 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-platinum-200 focus:outline-none focus:border-gold-500 font-sans cursor-pointer"
              >
                <option value="Figuras de Acción">Figuras de Acción</option>
                <option value="Cartas TCG">Cartas TCG</option>
                <option value="Videojuegos Retro">Videojuegos Retro</option>
                <option value="Vehículos y Naves">Vehículos y Naves</option>
                <option value="Cómics Vintage">Cómics Vintage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gold-400" />
                  <span>3. Presupuesto Estimado (USD)</span>
                </span>
                <span className="text-gold-400 text-[10px] font-bold">+1 PTO</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">Mínimo</span>
                  <input
                    type="number"
                    min="0"
                    value={manualData.presupuesto_min}
                    onChange={(e) => setManualData({ ...manualData, presupuesto_min: e.target.value })}
                    className="w-full px-3.5 py-2 bg-noir-950 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-platinum-500 uppercase block mb-1">Máximo</span>
                  <input
                    type="number"
                    min="0"
                    value={manualData.presupuesto_max}
                    onChange={(e) => setManualData({ ...manualData, presupuesto_max: e.target.value })}
                    className="w-full px-3.5 py-2 bg-noir-950 border border-white/10 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-50"
              >
                {submitting ? 'Calibrando...' : 'Guardar y Ordenar Catálogo'}
              </button>
            </div>
          </form>
        ) : currentStep < totalQuestions ? (
          /* TEST DE PERSONALIDAD: PANTALLA PREGUNTA A PREGUNTA (1 a 20) */
          <div>
            {/* Header del Test */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs font-mono text-platinum-400 mb-2">
                <span className="text-gold-400 font-bold">
                  Pregunta {currentStep + 1} de {totalQuestions}
                </span>
                <span>{progressPercent}% completado</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-noir-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="min-h-[220px]">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-gold-500/10 border border-gold-500/20 text-[10px] font-mono text-gold-300 uppercase tracking-widest mb-2">
                    Dimensión: {currentQ.dimension.toUpperCase()}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide leading-snug">
                    {currentQ.pregunta}
                  </h2>
                  {currentQ.subtitulo && (
                    <p className="text-xs text-platinum-400 mt-1 font-light leading-relaxed">
                      {currentQ.subtitulo}
                    </p>
                  )}
                </div>

                {/* Animated Pop-Culture Character GIF Badge */}
                <div className="shrink-0 p-1 rounded-2xl bg-noir-950/90 border border-gold-500/30 shadow-luxury overflow-hidden">
                  <img
                    src={getQuestionGif(currentQ.dimension, currentStep)}
                    alt="Animación de Cultura Pop"
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {currentQ.opciones.map((opt) => {
                  const isSelected = respuestas[currentQ.id] === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gold-500/15 border-gold-400 shadow-luxury-sm text-white'
                          : 'bg-noir-950/70 border-white/10 hover:border-gold-500/30 text-platinum-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold text-gold-400">
                          Opción {opt.id.slice(-1).toUpperCase()}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs font-medium leading-relaxed">{opt.texto}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-noir-950 text-platinum-400 hover:text-white border border-white/10 text-xs font-mono disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="text-[11px] font-mono text-platinum-500">
                {answeredCount}/{totalQuestions} respondidas
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedOptionId}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-noir-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-gold-glow"
              >
                <span>{currentStep === totalQuestions - 1 ? 'Revisar Perfil' : 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* PANTALLA FINAL: RESUMEN DE PERFIL Y ENVÍO */
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-3xl bg-noir-950/90 border border-gold-400/40 p-1.5 flex items-center justify-center mx-auto mb-4 shadow-luxury overflow-hidden relative">
              <img
                src="/gifs/gemini-relic.gif"
                alt="Reliquia Arquetípica"
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold">
              Test de Personalidad Completado
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide mt-1 mb-2">
              Descubre tu Perfil Coleccionista
            </h2>
            <p className="text-xs text-platinum-300 max-w-md mx-auto leading-relaxed mb-6 font-light">
              Has respondido las 20 preguntas con éxito. El motor multidimensional está listo para
              evaluar tus afinidades por universos (25%), formatos (25%), arquetipos (15%), eventos (15%),
              nostalgia (10%) y rareza (10%).
            </p>

            {/* Dimension Breakdown Box */}
            <div className="bg-noir-950/80 border border-white/10 rounded-2xl p-4 mb-6 text-left max-w-md mx-auto">
              <div className="text-[10px] font-mono uppercase tracking-wider text-platinum-400 mb-2 font-bold">
                Ponderación Multidimensional Activa:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-platinum-300">
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Universos Ficticios:</span>
                  <span className="text-gold-300 font-bold">25%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Categorías / Formato:</span>
                  <span className="text-gold-300 font-bold">25%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Personajes y Arquetipos:</span>
                  <span className="text-gold-300 font-bold">15%</span>
                </div>
                <div className="flex justify-between border-b border-white/5 py-1">
                  <span>Eventos Narrativos:</span>
                  <span className="text-gold-300 font-bold">15%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Nostalgia Histórica:</span>
                  <span className="text-gold-300 font-bold">10%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Rareza y Condición:</span>
                  <span className="text-gold-300 font-bold">10%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(0)}
                className="flex items-center space-x-1.5 px-4 py-3 rounded-xl bg-noir-950 text-platinum-400 hover:text-white border border-white/10 text-xs font-mono w-full sm:w-auto justify-center"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Revisar Respuestas</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                <span>{submitting ? 'Generando Bóveda...' : 'Revelar Perfil y Bóveda'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
