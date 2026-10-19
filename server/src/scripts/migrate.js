const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

const runMigration = async () => {
  const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
  console.log(`⏳ [Migración] Leyendo script DDL desde: ${schemaPath}`);

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ No se encontró el archivo database/schema.sql');
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf-8');

  // Configuración de conexión inicial al servidor (usando base de datos 'master' para poder crear MythicShelfDB)
  const masterConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrongPassword123!',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 1433,
    database: 'master',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
      enableArithAbort: true,
    },
  };

  let pool;
  try {
    console.log(`🔌 Conectando a SQL Server en ${masterConfig.server}:${masterConfig.port}...`);
    pool = await new sql.ConnectionPool(masterConfig).connect();
    console.log('✅ Conectado a SQL Server (master).');

    // Dividir el script por bloques 'GO'
    const batches = sqlContent
      .split(/\r?\n\s*GO\s*\r?\n/i)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    console.log(`🚀 Ejecutando ${batches.length} bloques de migración...`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        await pool.request().query(batch);
      } catch (batchErr) {
        // Si el error es por USE MythicShelfDB o similar, reportar bloque
        console.error(`❌ Error en bloque ${i + 1}:`, batchErr.message);
        throw batchErr;
      }
    }

    console.log('🎉 [Migración Completada] Tablas, restricciones y datos semilla creados en MythicShelfDB con éxito.');
  } catch (error) {
    console.error('❌ Error durante la ejecución de migraciones:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

runMigration();

