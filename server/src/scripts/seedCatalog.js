/**
 * Seed idempotente del catálogo de coleccionables icónicos con imágenes verificadas.
 *
 * Uso (desde /server):
 *   npm run seed:catalog                       # siembra BD + resuelve imágenes
 *   npm run seed:catalog -- --dry-run          # NO toca la BD; solo resuelve imágenes y genera reporte
 *   npm run seed:catalog -- --no-images        # siembra metadatos sin imágenes
 *   npm run seed:catalog -- --only=Charizard   # filtra por texto en el nombre
 *   npm run seed:catalog -- --refresh-images   # reemplaza imagen_url ya existente
 *   npm run seed:catalog -- --update-context   # actualiza CONTEXTO_HISTORICO ya existente
 *   npm run seed:catalog -- --no-download      # guarda enlaces remotos en lugar de copiar a client/public/catalog
 *
 * Garantías:
 *   - NO borra ni recrea tablas (a diferencia de `npm run migrate`).
 *   - Re-ejecutarlo no duplica productos (clave: nombre + vendedor), contexto ni imágenes.
 *   - No toca precio ni stock de productos que ya existen (para no pisar ventas reales).
 *   - Solo guarda imágenes cuya licencia/fuente fue verificada y cuya URL responde como imagen.
 *   - Cada producto se procesa en su propia transacción.
 */

const fs = require('fs');
const path = require('path');
try {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
} catch (e) {
  // dotenv es opcional en --dry-run; para escribir en la BD las dependencias del servidor deben estar instaladas.
}

const { catalog } = require('../data/collectibles.catalog');
const { resolveImage, downloadImage, sleep, clip, MAX_IMAGE_URL_LENGTH, USER_AGENT } = require('../services/imageSourceService');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : null;
};

const DRY_RUN = flag('dry-run');
const NO_IMAGES = flag('no-images');
const REFRESH_IMAGES = flag('refresh-images');
const UPDATE_CONTEXT = flag('update-context');
const ONLY = option('only');
const SELLER_EMAIL = option('seller') || process.env.SEED_SELLER_EMAIL || 'seller@mythicshelf.com';
const NO_DOWNLOAD = flag('no-download');
const REPORT_PATH = path.resolve(__dirname, '../data/image-report.json');
const CATALOG_DIR = path.resolve(__dirname, '../../../client/public/catalog');

const slugify = (text) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
const MIGRATION_PATH = path.resolve(__dirname, '../../../database/migrations/001_imagenes_producto.sql');

const ensureSchema = async (pool) => {
  const content = fs.readFileSync(MIGRATION_PATH, 'utf-8');
  const batches = content.split(/\r?\n\s*GO\s*\r?\n?/i).map((b) => b.trim()).filter(Boolean);
  for (const batch of batches) {
    await pool.request().query(batch);
  }
};

const upsertProduct = async (sql, pool, sellerId, item, image) => {
  const tx = new sql.Transaction(pool);
  await tx.begin();
  try {
    const q = () => new sql.Request(tx);
    const mainUrl = image && image.url.length <= MAX_IMAGE_URL_LENGTH ? image.url : null;

    const existing = await q()
      .input('nombre', sql.VarChar(150), item.nombre)
      .input('vendedor', sql.Int, sellerId)
      .query('SELECT producto_id, imagen_url FROM dbo.PRODUCTOS WHERE nombre = @nombre AND vendedor_id = @vendedor');

    let productId;
    let action;
    if (existing.recordset.length === 0) {
      const inserted = await q()
        .input('vendedor', sql.Int, sellerId)
        .input('nombre', sql.VarChar(150), item.nombre)
        .input('franquicia', sql.VarChar(100), item.franquicia)
        .input('categoria', sql.VarChar(50), item.categoria)
        .input('decada', sql.VarChar(20), item.decada)
        .input('precio', sql.Decimal(10, 2), item.precio)
        .input('estado', sql.VarChar(30), item.estado)
        .input('stock', sql.Int, item.stock)
        .input('imagen', sql.VarChar(255), mainUrl)
        .query(`
          INSERT INTO dbo.PRODUCTOS (vendedor_id, nombre, franquicia, categoria, decada, precio, estado_conservacion, stock, imagen_url)
          OUTPUT INSERTED.producto_id
          VALUES (@vendedor, @nombre, @franquicia, @categoria, @decada, @precio, @estado, @stock, @imagen);
        `);
      productId = inserted.recordset[0].producto_id;
      action = 'creado';
    } else {
      productId = existing.recordset[0].producto_id;
      const currentImage = existing.recordset[0].imagen_url;
      const shouldSetImage = mainUrl && (!currentImage || REFRESH_IMAGES);
      // Precio y stock NO se tocan: pueden haber cambiado por ventas o por el vendedor.
      await q()
        .input('id', sql.Int, productId)
        .input('franquicia', sql.VarChar(100), item.franquicia)
        .input('categoria', sql.VarChar(50), item.categoria)
        .input('decada', sql.VarChar(20), item.decada)
        .input('estado', sql.VarChar(30), item.estado)
        .input('imagen', sql.VarChar(255), shouldSetImage ? mainUrl : currentImage)
        .query(`
          UPDATE dbo.PRODUCTOS
          SET franquicia = @franquicia, categoria = @categoria, decada = @decada,
              estado_conservacion = @estado, imagen_url = @imagen
          WHERE producto_id = @id;
        `);
      action = 'existente';
    }

    // Contexto histórico (1:1 con el producto)
    const ctxInputs = (req) =>
      req
        .input('id', sql.Int, productId)
        .input('anio', sql.Int, item.anio)
        .input('tirada', sql.VarChar(100), clip(item.tirada, 100))
        .input('procedencia', sql.VarChar(150), clip(item.procedencia, 150))
        .input('variantes', sql.NVarChar(sql.MAX), item.variantes)
        .input('relevancia', sql.NVarChar(sql.MAX), item.relevancia)
        .input('autenticidad', sql.VarChar(50), clip(item.autenticidad, 50));

    const ctx = await q().input('id', sql.Int, productId).query('SELECT 1 AS ok FROM dbo.CONTEXTO_HISTORICO WHERE producto_id = @id');
    if (ctx.recordset.length === 0) {
      await ctxInputs(q()).query(`
        INSERT INTO dbo.CONTEXTO_HISTORICO (producto_id, ano_fabricacion, tirada_produccion, procedencia, variantes_diseno, relevancia_cultural, nivel_autenticidad)
        VALUES (@id, @anio, @tirada, @procedencia, @variantes, @relevancia, @autenticidad);
      `);
    } else if (UPDATE_CONTEXT) {
      await ctxInputs(q()).query(`
        UPDATE dbo.CONTEXTO_HISTORICO
        SET ano_fabricacion = @anio, tirada_produccion = @tirada, procedencia = @procedencia,
            variantes_diseno = @variantes, relevancia_cultural = @relevancia, nivel_autenticidad = @autenticidad
        WHERE producto_id = @id;
      `);
    }

    // Registro de imagen con atribución/licencia (sin duplicados por producto + url)
    let imageAction = 'sin imagen';
    if (image && REFRESH_IMAGES) {
      // La imagen recién resuelta pasa a ser la principal, para que el crédito coincida con imagen_url.
      await q()
        .input('id', sql.Int, productId)
        .input('url', sql.VarChar(500), image.url)
        .query('UPDATE dbo.IMAGENES_PRODUCTO SET es_principal = CASE WHEN url = @url THEN 1 ELSE 0 END WHERE producto_id = @id');
    }
    if (image) {
      const dup = await q()
        .input('id', sql.Int, productId)
        .input('url', sql.VarChar(500), image.url)
        .query('SELECT 1 AS ok FROM dbo.IMAGENES_PRODUCTO WHERE producto_id = @id AND url = @url');
      if (dup.recordset.length === 0) {
        const hasPrimary = await q()
          .input('id', sql.Int, productId)
          .query('SELECT 1 AS ok FROM dbo.IMAGENES_PRODUCTO WHERE producto_id = @id AND es_principal = 1');
        await q()
          .input('id', sql.Int, productId)
          .input('url', sql.VarChar(500), image.url)
          .input('principal', sql.Bit, hasPrimary.recordset.length === 0)
          .input('fuente', sql.VarChar(50), image.fuente)
          .input('pagina', sql.VarChar(500), clip(image.pagina_fuente, 500))
          .input('atribucion', sql.NVarChar(500), clip(image.atribucion, 500))
          .input('licencia', sql.VarChar(100), clip(image.licencia, 100))
          .input('restricciones', sql.NVarChar(500), clip(image.restricciones, 500))
          .query(`
            INSERT INTO dbo.IMAGENES_PRODUCTO (producto_id, url, es_principal, fuente, pagina_fuente, atribucion, licencia, restricciones)
            VALUES (@id, @url, @principal, @fuente, @pagina, @atribucion, @licencia, @restricciones);
          `);
        imageAction = 'imagen registrada';
      } else {
        imageAction = 'imagen ya registrada';
      }
    }

    await tx.commit();
    return { productId, action, imageAction };
  } catch (err) {
    await tx.rollback().catch(() => {});
    throw err;
  }
};

const run = async () => {
  if (USER_AGENT.includes('configura WIKIMEDIA_USER_AGENT') && !NO_IMAGES) {
    console.warn('⚠️  WIKIMEDIA_USER_AGENT no está definido. Wikimedia pide un User-Agent con contacto real; define uno en server/.env.');
  }

  const items = catalog.filter((c) => !ONLY || c.nombre.toLowerCase().includes(ONLY.toLowerCase()));
  console.log(`🌱 [Seed] ${items.length} productos${DRY_RUN ? ' (DRY RUN: no se escribe en la BD)' : ''}${NO_IMAGES ? ' (sin imágenes)' : ''}`);

  let sql, pool, sellerId;
  if (!DRY_RUN) {
    ({ sql } = require('../config/db'));
    const { getPool } = require('../config/db');
    pool = await getPool();
    await ensureSchema(pool);
    const seller = await pool
      .request()
      .input('correo', sql.VarChar(100), SELLER_EMAIL)
      .query("SELECT usuario_id FROM dbo.USUARIOS WHERE correo_electronico = @correo AND rol IN ('Vendedor','Administrador') AND estado_cuenta = 1");
    if (seller.recordset.length === 0) {
      console.error(`❌ No existe un usuario Vendedor/Administrador activo con correo ${SELLER_EMAIL}. Use --seller=correo o SEED_SELLER_EMAIL.`);
      process.exit(1);
    }
    sellerId = seller.recordset[0].usuario_id;
  }

  const report = [];
  const totals = { creado: 0, existente: 0, conImagen: 0, similares: 0, sinImagen: 0, errores: 0 };

  for (const item of items) {
    let resolved = { error: 'Imágenes desactivadas (--no-images)' };
    if (!NO_IMAGES) {
      resolved = await resolveImage({ ...item.imagen, sourcePage: item.sourcePage || (item.imagen && item.imagen.sourcePage) });
      if (item.imagen && item.imagen.provider === 'commons') await sleep(400); // cortesía con Commons
      if (!resolved.image && item.similar) {
        const fallback = await resolveImage(item.similar);
        if (fallback.image) {
          fallback.image.similar = true;
          fallback.image.atribucion = clip(`Imagen referencial similar (no es el ejemplar exacto). ${fallback.image.atribucion}`, 500);
          fallback.image.restricciones = clip(`Imagen de una pieza parecida, usada como referencia visual. ${fallback.image.restricciones || ''}`, 500);
          resolved = { image: fallback.image, motivoPrincipal: resolved.error };
        } else {
          resolved.error = `${resolved.error}; similar: ${fallback.error}`;
        }
      }
    }
    const image = resolved.image || null;

    // Migración local: las imágenes de Commons (licencias abiertas) se copian a client/public/catalog.
    // Las de Pokémon TCG NO se descargan: no tienen licencia abierta y se quedan como enlace.
    if (image && image.fuente === 'commons' && !DRY_RUN && !NO_DOWNLOAD) {
      const subdir = image.similar ? 'similares' : '';
      try {
        const fileName = await downloadImage(image.url, path.join(CATALOG_DIR, subdir), slugify(item.nombre));
        image.url = `/catalog/${subdir ? `${subdir}/` : ''}${fileName}`;
      } catch (err) {
        console.warn(`⚠️  ${item.nombre}: no se pudo descargar (${err.message}); se guarda el enlace remoto.`);
      }
    }

    const entry = {
      nombre: item.nombre,
      categoria: item.categoria,
      anio: item.anio,
      fabricante: item.fabricante,
      imagen: image
        ? { fuente: image.fuente, similar: !!image.similar, url: image.url, pagina_fuente: image.pagina_fuente, atribucion: image.atribucion, licencia: image.licencia, restricciones: image.restricciones }
        : { motivo: resolved.error, paginaReferencia: item.sourcePage || null, descartados: resolved.rejected || undefined },
    };

    try {
      if (!DRY_RUN) {
        const result = await upsertProduct(sql, pool, sellerId, item, image);
        entry.resultado = result;
        totals[result.action === 'creado' ? 'creado' : 'existente'] += 1;
      }
      totals[image ? 'conImagen' : 'sinImagen'] += 1;
      if (image && image.similar) totals.similares += 1;
      console.log(`${image ? '🖼️ ' : '⬜'} ${item.nombre}${image ? ` ← ${image.fuente}${image.similar ? ' [similar]' : ''} (${image.licencia}) ${image.url.startsWith('/') ? image.url : ''}` : ` — sin imagen: ${resolved.error}`}`);
    } catch (err) {
      totals.errores += 1;
      entry.error = err.message;
      console.error(`❌ ${item.nombre}: ${err.message}`);
    }
    report.push(entry);
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify({ generado: new Date().toISOString(), dryRun: DRY_RUN, totals, productos: report }, null, 2));
  console.log(`\n📄 Reporte de fuentes/licencias: ${REPORT_PATH}`);
  console.log(`✅ Resumen: ${JSON.stringify(totals)}`);
  if (totals.sinImagen > 0) console.log('ℹ️  Los productos sin imagen usan el placeholder del frontend; revise el motivo en el reporte.');

  if (pool) await pool.close();
  process.exit(totals.errores > 0 ? 1 : 0);
};

run().catch((err) => {
  console.error('❌ Error fatal en el seed:', err.message);
  process.exit(1);
});
