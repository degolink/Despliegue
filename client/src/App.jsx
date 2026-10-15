import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RecommendationBanner from './components/RecommendationBanner';
import Catalog from './components/Catalog';
import ProductModal from './components/ProductModal';
import QuestionnaireModal from './components/QuestionnaireModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import api from './services/api';
import { Sparkles, Shield, Compass, BookOpen, AlertCircle } from 'lucide-react';

export default function App() {
  // Estado de Usuario & Auth (GUS)
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Estado de Catálogo & Filtros (CAT)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    franquicia: '',
    categoria: '',
    decada: '',
    precio_max: '',
  });
  const [filterMeta, setFilterMeta] = useState({
    franquicias: ['Star Wars', 'Pokémon', 'Transformers', 'Nintendo'],
    categorias: ['Figuras de Acción', 'Cartas TCG', 'Videojuegos Retro', 'Vehículos y Naves'],
    decadas: ['1970s', '1980s', '1990s'],
  });

  // Estado de Recomendaciones (REC)
  const [activePreferences, setActivePreferences] = useState(null);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);

  // Estado de Detalle de Producto & Contexto Histórico (CU-05 / CH)
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductData, setSelectedProductData] = useState(null);

  // Estado de Carrito de Compras (CAR / CU-07)
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [cartOpen, setCartOpen] = useState(false);

  // Estado de Checkout Transaccional (CHK / CU-08)
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Toast / Mensajes de estado
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Cargar Perfil de Usuario si existe token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('mythic_token');
    if (token) {
      api
        .get('/auth/profile')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data);
            if (res.data.data.franquicia_interes) {
              setActivePreferences({
                franquicia_interes: res.data.data.franquicia_interes,
                categoria_preferida: res.data.data.categoria_preferida,
                decada_interes: res.data.data.decada_interes,
                presupuesto_min: res.data.data.presupuesto_min,
                presupuesto_max: res.data.data.presupuesto_max,
              });
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('mythic_token');
          setUser(null);
        });
    }
  }, []);

  // 2. Cargar Metadatos de Filtro
  useEffect(() => {
    api
      .get('/products/meta/filters')
      .then((res) => {
        if (res.data.success) {
          setFilterMeta(res.data.data);
        }
      })
      .catch((err) => console.warn('Usando metadatos de filtro predeterminados.'));
  }, []);

  // 3. Cargar Carrito de Compras si está autenticado
  const fetchCart = () => {
    if (!localStorage.getItem('mythic_token')) return;
    api
      .get('/cart')
      .then((res) => {
        if (res.data.success) {
          setCart(res.data.data);
        }
      })
      .catch((err) => console.warn('Error al sincronizar carrito:', err.message));
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], total: 0, count: 0 });
    }
  }, [user]);

  // 4. Cargar Catálogo o Recomendaciones
  const fetchCatalogOrRecommendations = async () => {
    setLoadingProducts(true);
    try {
      // Si el usuario aplicó filtros directos en la barra, consultamos endpoint de productos
      const hasDirectFilters =
        filters.search ||
        filters.franquicia ||
        filters.categoria ||
        filters.decada ||
        filters.precio_max;

      if (hasDirectFilters) {
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.franquicia) params.franquicia = filters.franquicia;
        if (filters.categoria) params.categoria = filters.categoria;
        if (filters.decada) params.decada = filters.decada;
        if (filters.precio_max) params.precio_max = filters.precio_max;

        const res = await api.get('/products', { params });
        setProducts(res.data.data);
      } else {
        // Feed con scoring de afinidad (+3 Franquicia, +2 Categoría, +1 Precio)
        const res = await api.get('/recommendations');
        setProducts(res.data.data.recommendations);
        if (res.data.data.preferences_applied) {
          setActivePreferences(res.data.data.preferences_applied);
        }
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
      showToast('Error al conectar con la base de datos SQL Server.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCatalogOrRecommendations();
  }, [filters, user]);

  // 5. Manejo de Selección de Producto para Detalle y Contexto Histórico (CU-05)
  const handleSelectProduct = async (id) => {
    try {
      setSelectedProductId(id);
      const res = await api.get(`/products/${id}`);
      setSelectedProductData(res.data.data);
    } catch (err) {
      showToast('No se pudo cargar el contexto histórico del producto.', 'error');
    }
  };

  // 6. Manejo de Carrito (CU-07)
  const handleAddToCart = async (productoId, cantidad = 1) => {
    if (!user) {
      setAuthModalOpen(true);
      showToast('Por favor ingresa o crea una cuenta para añadir artículos a la bóveda.', 'info');
      return;
    }

    try {
      const res = await api.post('/cart', { producto_id: productoId, cantidad });
      setCart(res.data.data);
      showToast('Artículo asegurado en tu carrito.', 'success');
      if (selectedProductData) {
        setSelectedProductData(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al validar existencias en tiempo real.', 'error');
    }
  };

  const handleUpdateQuantity = async (itemId, cantidad) => {
    try {
      const res = await api.put(`/cart/${itemId}`, { cantidad });
      setCart(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al actualizar cantidad.', 'error');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/${itemId}`);
      setCart(res.data.data);
      showToast('Artículo retirado del carrito.', 'info');
    } catch (err) {
      showToast('Error al eliminar artículo.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await api.delete('/cart');
      setCart(res.data.data);
      showToast('Carrito vaciado exitosamente.', 'info');
    } catch (err) {
      showToast('Error al vaciar carrito.', 'error');
    }
  };

  // 7. Cuestionario de Recomendación (RF-09 / CU-06)
  const handleQuestionnaireSubmit = async (prefData) => {
    try {
      const res = await api.post('/recommendations/questionnaire', prefData);
      setActivePreferences(res.data.data.preferences_applied);
      setProducts(res.data.data.recommendations);
      setQuestionnaireOpen(false);
      showToast('¡Preferencias guardadas! Feed ordenado por puntaje de afinidad (+3, +2, +1).', 'success');
    } catch (err) {
      showToast('Error al procesar el cuestionario.', 'error');
    }
  };

  // 8. Checkout Transaccional (CU-08)
  const handleExecuteCheckout = async (checkoutData) => {
    setCheckoutLoading(true);
    try {
      const res = await api.post('/checkout', checkoutData);
      fetchCart();
      fetchCatalogOrRecommendations();
      showToast('¡Compra confirmada! Stock actualizado en SQL Server.', 'success');
      return res.data.data;
    } finally {
      setCheckoutLoading(false);
    }
  };

  // 9. Autenticación (Login & Register)
  const handleLogin = async (credentials) => {
    setAuthLoading(true);
    try {
      const res = await api.post('/auth/login', credentials);
      localStorage.setItem('mythic_token', res.data.data.token);
      setUser(res.data.data.usuario);
      showToast(`¡Bienvenido de vuelta, ${res.data.data.usuario.nombre_completo}!`, 'success');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    setAuthLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('mythic_token', res.data.data.token);
      setUser(res.data.data.usuario);
      showToast('Cuenta creada con éxito. Correo de bienvenida en camino.', 'success');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mythic_token');
    setUser(null);
    setCart({ items: [], total: 0, count: 0 });
    setActivePreferences(null);
    showToast('Sesión cerrada correctamente.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold flex items-center space-x-2 ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500 text-rose-200'
                : toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
                : 'bg-slate-900/90 border-amber-500/50 text-amber-200'
            }`}
          >
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Barra de Navegación Principal */}
      <Navbar
        cartCount={cart.count}
        onOpenCart={() => setCartOpen(true)}
        onOpenQuestionnaire={() => setQuestionnaireOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Hero Section Coleccionable */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 p-8 sm:p-12 mb-10 shadow-2xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
              <Shield className="w-3.5 h-3.5" />
              <span>Garantía de Autenticidad Curada & Trazabilidad Histórica</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-mythic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-100 to-amber-300 leading-tight">
              Piezas Legendarias que Trascendieron el Tiempo
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Mythic Shelf es el santuario de comercio electrónico para coleccionistas exigentes. Cada figura vintage, carta codiciada y cartucho sellado cuenta con procedencia verificada, contexto de época y resguardo asegurado.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => setQuestionnaireOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Configurar Preferencias de Búsqueda</span>
              </button>
            </div>
          </div>
        </div>

        {/* Banner de Recomendaciones con Puntaje */}
        <RecommendationBanner
          preferences={activePreferences}
          onRetakeQuiz={() => setQuestionnaireOpen(true)}
        />

        {/* Catálogo con Filtros en Vivo */}
        <Catalog
          products={products}
          filters={filters}
          metadata={filterMeta}
          onFilterChange={(key, val) => setFilters({ ...filters, [key]: val })}
          onSelectProduct={handleSelectProduct}
          onAddToCart={(prodId) => handleAddToCart(prodId, 1)}
          loading={loadingProducts}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#080B12] py-8 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-mythic font-bold text-slate-400 text-sm">MYTHIC SHELF</span>
            <span>• Arquitectura Full-Stack B2C</span>
          </div>
          <div className="text-slate-400">
            Powered by Node.js, Express, Microsoft SQL Server, React & Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Modales y Drawers */}
      <ProductModal
        product={selectedProductData}
        onClose={() => setSelectedProductData(null)}
        onAddToCart={handleAddToCart}
      />

      <QuestionnaireModal
        isOpen={questionnaireOpen}
        onClose={() => setQuestionnaireOpen(false)}
        onSubmit={handleQuestionnaireSubmit}
        currentPreferences={activePreferences}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        onExecuteCheckout={handleExecuteCheckout}
        loading={checkoutLoading}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={authLoading}
      />
    </div>
  );
}
