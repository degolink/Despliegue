const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middlewares/errorHandler');

// Rutas modulares
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');

const app = express();

// Middlewares globales de seguridad y auditoría
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de comprobación de salud (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Mythic Shelf Backend API',
  });
});

// Registro de Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Recurso no encontrado: ${req.method} ${req.originalUrl}`,
  });
});

// Middleware centralizado de errores
app.use(errorHandler);

module.exports = app;

