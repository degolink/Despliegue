import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeaturedCarousel({
  products = [],
  onSelectProduct,
  onAddToCart,
}) {
  const scrollRef = useRef(null);

  // Take top items or high score items
  const featured = products.slice(0, 8);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!featured.length) return null;

  return (
    <section className="mb-16">
      {/* Section Header with Controls */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono tracking-widest uppercase mb-1">
            <Flame className="w-3.5 h-3.5 text-gold-500" />
            <span>Selección Curatorial Exclusiva</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-white font-normal tracking-tight">
            Coleccionables Destacados de la Bóveda
          </h2>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll('left')}
            className="p-2.5 rounded-xl bg-noir-900 border border-white/10 hover:border-gold-500/40 text-platinum-300 hover:text-white transition-all shadow-luxury-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2.5 rounded-xl bg-noir-900 border border-white/10 hover:border-gold-500/40 text-platinum-300 hover:text-white transition-all shadow-luxury-sm"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {featured.map((item) => {
          const isCard = /^cartas/i.test(item.categoria || '');
          return (
            <motion.div
              key={`featured-${item.producto_id}`}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="w-72 sm:w-80 shrink-0 snap-start bg-noir-900 border border-white/[0.08] hover:border-gold-500/40 rounded-2xl overflow-hidden shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col justify-between group"
            >
              {/* Product Visual Container */}
              <div
                onClick={() => onSelectProduct(item.producto_id)}
                className="relative aspect-square bg-noir-950 p-4 cursor-pointer overflow-hidden flex items-center justify-center"
              >
                <img
                  src={item.imagen_url || '/placeholder-collectible.svg'}
                  alt={item.nombre}
                  className={`w-full h-full ${isCard ? 'object-contain p-2' : 'object-cover rounded-lg'} transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-900 via-transparent to-transparent opacity-70 pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-noir-900/90 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-gold-400 backdrop-blur-md">
                    {item.decada}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-platinum-400 mb-1">
                    {item.franquicia} • {item.categoria}
                  </div>
                  <h3
                    onClick={() => onSelectProduct(item.producto_id)}
                    className="font-serif text-sm font-semibold text-white group-hover:text-gold-200 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {item.nombre}
                  </h3>
                </div>

                <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-platinum-500 font-mono block">
                      Inversión
                    </span>
                    <span className="font-serif text-lg font-bold text-gold-400">
                      ${Number(item.precio).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(item.producto_id)}
                    className="px-3.5 py-2 rounded-xl bg-gold-500/10 hover:bg-gold-500 border border-gold-500/30 hover:border-gold-400 text-gold-300 hover:text-noir-950 text-[11px] font-bold tracking-wider uppercase transition-all shadow-luxury-sm"
                  >
                    + Bóveda
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
