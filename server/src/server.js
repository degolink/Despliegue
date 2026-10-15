const app = require('./app');
const { getPool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
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

