import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroEditorial from './components/HeroEditorial';
import FeaturedCarousel from './components/FeaturedCarousel';
import RecommendationBanner from './components/RecommendationBanner';
import Catalog from './components/Catalog';
import ProductModal from './components/ProductModal';
import QuestionnaireModal from './components/QuestionnaireModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import SellerDashboard from './components/SellerDashboard';
import api from './services/api';
import { ShieldCheck, Lock, Sparkles, Award } from 'lucide-react';

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
    franquicias: ['Star Wars', 'Pokémon', 'Transformers', 'Nintendo', 'DC Comics', 'Marvel Comics', 'LEGO'],
    categorias: ['Figuras de Acción', 'Cartas TCG', 'Videojuegos Retro', 'Vehículos y Naves', 'Cómics Vintage'],
    decadas: ['1970s', '1980s', '1990s', '2000s'],
  });

  // Estado de Recomendaciones (REC)
  const [activePreferences, setActivePreferences] = useState(null);
  const [profileAnalysis, setProfileAnalysis] = useState(null);
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

  // Estado de Panel de Ventas de Vendedor
  const [sellerDashboardOpen, setSellerDashboardOpen] = useState(false);

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
      .catch(() => console.warn('Usando metadatos de filtro predeterminados.'));
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
        const res = await api.get('/recommendations');
        setProducts(res.data.data.recommendations);
        if (res.data.data.preferences_applied) {
          setActivePreferences(res.data.data.preferences_applied);
        }
        if (res.data.data.profile_analysis) {
          setProfileAnalysis(res.data.data.profile_analysis);
        }
      }
    } catch (error) {
      console.error('Error al cargar catálogo:', error);
      showToast('Error de sincronización con la base de datos.', 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCatalogOrRecommendations();
  }, [filters, user]);

  // 5. Detalle de Producto & Contexto Histórico (CU-05)
  const handleSelectProduct = async (id) => {
    try {
      setSelectedProductId(id);
      const res = await api.get(`/products/${id}`);
      setSelectedProductData(res.data.data);
    } catch (err) {
      showToast('No se pudo cargar el dossier histórico de la pieza.', 'error');
    }
  };

  // 6. Carrito de Compras (CU-07)
  const handleAddToCart = async (productoId, cantidad = 1) => {
    if (!user) {
      setAuthModalOpen(true);
      showToast('Inicia sesión para resguardar piezas en tu bóveda personal.', 'info');
      return;
    }

    try {
      const res = await api.post('/cart', { producto_id: productoId, cantidad });
      setCart(res.data.data);
      showToast('Pieza resguardada en tu bóveda con éxito.', 'success');
      if (selectedProductData) {
        setSelectedProductData(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al verificar existencias en tiempo real.', 'error');
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
      showToast('Pieza retirada de la bóveda.', 'info');
    } catch (err) {
      showToast('Error al eliminar artículo.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await api.delete('/cart');
      setCart(res.data.data);
      showToast('Bóveda vaciada.', 'info');
    } catch (err) {
      showToast('Error al vaciar bóveda.', 'error');
    }
  };

  // 7. Cuestionario de Recomendación (RF-09 / CU-06)
  const handleQuestionnaireSubmit = async (prefData) => {
    try {
      const res = await api.post('/recommendations/questionnaire', prefData);
      setActivePreferences(res.data.data.preferences_applied);
      setProducts(res.data.data.recommendations);
      if (res.data.data.profile_analysis) {
        setProfileAnalysis(res.data.data.profile_analysis);
      }
      setQuestionnaireOpen(false);
      showToast('¡Calibración exitosa! Archivo ordenado por afinidad arqueológica.', 'success');
    } catch (err) {
      showToast('Error al procesar parámetros del concierge.', 'error');
    }
  };

  // 8. Checkout Transaccional (CU-08)
  const handleExecuteCheckout = async (checkoutData) => {
    setCheckoutLoading(true);
    try {
      const res = await api.post('/checkout', checkoutData);
      fetchCart();
      fetchCatalogOrRecommendations();
      showToast('¡Adquisición asentada en base de datos con éxito!', 'success');
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
      showToast(`¡Bienvenido al santuario, ${res.data.data.usuario.nombre_completo}!`, 'success');
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
      showToast('Cuenta de custodia creada exitosamente.', 'success');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mythic_token');
    setUser(null);
    setCart({ items: [], total: 0, count: 0 });
    setActivePreferences(null);
    showToast('Sesión cerrada con seguridad.', 'info');
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-noir-950 text-neutral-100 flex flex-col justify-between selection:bg-gold-500 selection:text-noir-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl border shadow-2xl text-xs font-mono tracking-wide flex items-center space-x-2.5 backdrop-blur-xl ${
              toastMessage.type === 'error'
                ? 'bg-crimson-600/90 border-crimson-500 text-white'
                : toastMessage.type === 'success'
                ? 'bg-noir-900/95 border-gold-400 text-gold-300 shadow-gold-glow'
                : 'bg-noir-900/95 border-white/20 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Main Navigation with Mega Menu */}
      <Navbar
        cartCount={cart.count}
        onOpenCart={() => setCartOpen(true)}
        onOpenQuestionnaire={() => setQuestionnaireOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSellerDashboard={() => setSellerDashboardOpen(true)}
        user={user}
        onLogout={handleLogout}
        onSelectFranchiseFilter={(f) => {
          setFilters((prev) => ({ ...prev, franquicia: f }));
          scrollToCatalog();
        }}
        onSelectCategoryFilter={(c) => {
          setFilters((prev) => ({ ...prev, categoria: c }));
          scrollToCatalog();
        }}
        franchises={filterMeta.franquicias}
        categories={filterMeta.categorias}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Full-Width Editorial Hero Section */}
        <HeroEditorial
          onOpenQuestionnaire={() => setQuestionnaireOpen(true)}
          onExploreCatalog={scrollToCatalog}
          featuredCount={products.length || 42}
        />

        {/* Horizontal Featured Collectibles Carousel */}
        <FeaturedCarousel
          products={products}
          onSelectProduct={handleSelectProduct}
          onAddToCart={(id) => handleAddToCart(id, 1)}
        />

        {/* Predictive Recommendation Scoring Banner */}
        <RecommendationBanner
          preferences={activePreferences}
          profileAnalysis={profileAnalysis}
          onRetakeQuiz={() => setQuestionnaireOpen(true)}
        />

        {/* Master Catalog with Real-Time Filters */}
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

      {/* Luxury Footer */}
      <footer className="border-t border-white/[0.08] bg-noir-900/60 py-12 text-xs text-platinum-500 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <span className="font-serif text-white font-bold tracking-[0.2em] text-sm">MYTHIC SHELF</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-[11px] text-platinum-400">High-End Collectibles & Archival Vault</span>
          </div>
          <div className="text-[11px] font-mono text-platinum-400 tracking-wider">
            Curated Architecture: Node.js • Microsoft SQL Server • React • Tailwind CSS
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
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

      <SellerDashboard
        isOpen={sellerDashboardOpen}
        onClose={() => setSellerDashboardOpen(false)}
        user={user}
      />
    </div>
  );
}
