const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrongPassword123!',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  database: process.env.DB_NAME || 'MythicShelfDB',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
  },
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise = null;

const getPool = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log('✅ [SQL Server] Conexión establecida exitosamente con MythicShelfDB');
        return pool;
      })
      .catch((err) => {
        console.error('❌ [SQL Server] Error crítico de conexión a la base de datos:', err.message);
        poolPromise = null;
        throw err;
      });
  }
  return poolPromise;
};

module.exports = {
  sql,
  getPool,
};

