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
import ResetPasswordModal from './components/ResetPasswordModal';
import api from './services/api';
import { ShieldCheck, Lock, Sparkles, Award } from 'lucide-react';

// Piezas por página del catálogo (múltiplo de 3 para la grilla).
const PAGE_SIZE = 12;

// Lee el token del enlace de recuperación enviado por correo (/reset-password?token=...).
const readResetTokenFromUrl = () => {
  if (window.location.pathname !== '/reset-password') return null;
  return new URLSearchParams(window.location.search).get('token');
};

export default function App() {
  // Estado de Usuario & Auth (GUS)
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Estado de Catálogo & Filtros (CAT)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
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
  // Último cuestionario enviado en esta sesión: permite paginar con el mismo ranking
  // (para visitantes no se persiste, y el perfil multidimensional no se guarda en BD).
  const [quizPayload, setQuizPayload] = useState(null);

  // Recuperación de contraseña (RF-03)
  const [resetToken, setResetToken] = useState(readResetTokenFromUrl);

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
  const fetchFilterMeta = () => {
    api
      .get('/products/meta/filters')
      .then((res) => {
        if (res.data.success) {
          setFilterMeta(res.data.data);
        }
      })
      .catch(() => console.warn('Usando metadatos de filtro predeterminados.'));
  };

  useEffect(() => {
    fetchFilterMeta();
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
  const applyRecommendationResult = (data) => {
    setProducts(data.recommendations);
    setPagination(data.pagination);
    if (data.preferences_applied) {
      setActivePreferences(data.preferences_applied);
    }
    if (data.profile_analysis) {
      setProfileAnalysis(data.profile_analysis);
    }
  };

  const fetchCatalogOrRecommendations = async () => {
    setLoadingProducts(true);
    try {
      const hasDirectFilters =
        filters.search ||
        filters.franquicia ||
        filters.categoria ||
        filters.decada ||
        filters.precio_max;

      const pageParams = { page, limit: PAGE_SIZE };

      if (hasDirectFilters) {
        const params = { ...pageParams };
        if (filters.search) params.search = filters.search;
        if (filters.franquicia) params.franquicia = filters.franquicia;
        if (filters.categoria) params.categoria = filters.categoria;
        if (filters.decada) params.decada = filters.decada;
        if (filters.precio_max) params.precio_max = filters.precio_max;

        const res = await api.get('/products', { params });
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      } else if (quizPayload) {
        // Re-evalúa el mismo cuestionario sin volver a guardarlo, para paginar el mismo ranking.
        const res = await api.post(
          '/recommendations/questionnaire',
          { ...quizPayload, persistir: false },
          { params: pageParams }
        );
        applyRecommendationResult(res.data.data);
      } else {
        const res = await api.get('/recommendations', { params: pageParams });
        applyRecommendationResult(res.data.data);
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
  }, [filters, user, page]);

  // Cualquier cambio de filtros vuelve a la primera página.
  const updateFilters = (updater) => {
    setFilters(updater);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    scrollToCatalog();
  };

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
      const res = await api.post('/recommendations/questionnaire', prefData, {
        params: { page: 1, limit: PAGE_SIZE },
      });
      const { persistir, ...payload } = prefData;
      setQuizPayload(payload);
      applyRecommendationResult(res.data.data);
      setActivePreferences(res.data.data.preferences_applied);
      setPage(1);
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
    setProfileAnalysis(null);
    setQuizPayload(null);
    setPage(1);
    showToast('Sesión cerrada con seguridad.', 'info');
  };

  // 11. Alta de producto por Vendedor (CU-09): refrescar catálogo y filtros
  const handleProductCreated = (product) => {
    fetchFilterMeta();
    fetchCatalogOrRecommendations();
    showToast(`«${product.nombre}» publicada en el catálogo.`, 'success');
  };

  // 10. Recuperación de contraseña (RF-03)
  const handleForgotPassword = async (correo_electronico) => {
    const res = await api.post('/auth/forgot-password', { correo_electronico });
    return res.data.message;
  };

  const handleResetPassword = async (nueva_contrasena) => {
    const res = await api.post('/auth/reset-password', { token: resetToken, nueva_contrasena });
    return res.data.message;
  };

  const closeResetPassword = (openLogin = false) => {
    setResetToken(null);
    // Quita el token de la barra de direcciones para que no quede en el historial.
    window.history.replaceState(null, '', '/');
    if (openLogin) setAuthModalOpen(true);
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
          updateFilters((prev) => ({ ...prev, franquicia: f }));
          scrollToCatalog();
        }}
        onSelectCategoryFilter={(c) => {
          updateFilters((prev) => ({ ...prev, categoria: c }));
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
          featuredCount={pagination.total || 42}
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
          onFilterChange={(key, val) => updateFilters((prev) => ({ ...prev, [key]: val }))}
          pagination={pagination}
          onPageChange={handlePageChange}
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
        onForgotPassword={handleForgotPassword}
        loading={authLoading}
      />

      <ResetPasswordModal
        isOpen={!!resetToken}
        onClose={closeResetPassword}
        onSubmit={handleResetPassword}
      />

      <SellerDashboard
        isOpen={sellerDashboardOpen}
        onClose={() => setSellerDashboardOpen(false)}
        user={user}
        filterMeta={filterMeta}
        onProductCreated={handleProductCreated}
      />
    </div>
  );
}
