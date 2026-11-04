const app = require('./app');
const { getPool } = require('./config/db');

const PORT = process.env.PORT || 5000;

// Secretos publicados en el repositorio (ejemplos antiguos): nunca deben usarse en producción.
const KNOWN_INSECURE_JWT_SECRETS = ['super_secret_mythic_shelf_jwt_key_2024_secure!'];

/**
 * Verifica la configuración sensible antes de aceptar tráfico.
 * Sin valores por defecto: si falta algo, el servidor no arranca.
 */
const validateEnvironment = () => {
  const missing = ['JWT_SECRET', 'DB_USER', 'DB_PASSWORD'].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`❌ Faltan variables obligatorias en server/.env: ${missing.join(', ')}`);
    console.error('   Copie server/.env.example a server/.env y complete los valores.');
    process.exit(1);
  }

  const secret = process.env.JWT_SECRET;
  const isWeak = KNOWN_INSECURE_JWT_SECRETS.includes(secret) || secret.length < 32;
  if (isWeak) {
    const msg = 'JWT_SECRET es público o tiene menos de 32 caracteres; cualquiera podría falsificar tokens.';
    if (process.env.NODE_ENV === 'production') {
      console.error(`❌ ${msg}`);
      process.exit(1);
    }
    console.warn(`⚠️  ${msg} Genere uno nuevo con:`);
    console.warn(`   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`);
  }
};

const startServer = async () => {
  validateEnvironment();
  try {
    console.log('⏳ Inicializando Mythic Shelf Backend...');
    
    // Probar conexión inicial al pool de SQL Server (sin bloquear el arranque en desarrollo)
    getPool()
      .then(() => console.log('🚀 Base de datos SQL Server lista para recibir transacciones.'))
      .catch((err) => {
        console.warn('⚠️ Nota: No se pudo conectar inmediatamente a SQL Server.');
        console.warn('   Verifique los valores en server/.env y que el servicio de SQL Server esté en ejecución.');
        console.warn(`   Detalle: ${err.message}`);
      });

    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🏛️  MYTHIC SHELF API - SERVIDOR ACTIVO`);
      console.log(`📡 Puerto: http://localhost:${PORT}`);
      console.log(`📖 Health Check: http://localhost:${PORT}/health`);
      console.log(`🛡️  Modo: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

