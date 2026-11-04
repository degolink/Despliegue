const { getPool, sql } = require('../config/db');

/**
 * CU-04: Catálogo y filtros dinámicos en tiempo real
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      franquicia,
      categoria,
      decada,
      precio_min,
      precio_max,
      search,
      page = 1,
      limit = 12,
      sort_by = 'fecha_publicacion',
      order = 'DESC',
    } = req.query;

    const pool = await getPool();
    const request = pool.request();

    let whereClauses = ['p.stock > 0'];

    if (franquicia) {
      request.input('franquicia', sql.VarChar(100), franquicia);
      whereClauses.push('p.franquicia = @franquicia');
    }

    if (categoria) {
      request.input('categoria', sql.VarChar(50), categoria);
      whereClauses.push('p.categoria = @categoria');
    }

    if (decada) {
      request.input('decada', sql.VarChar(20), decada);
      whereClauses.push('p.decada = @decada');
    }

    if (precio_min) {
      request.input('precio_min', sql.Decimal(10, 2), Number(precio_min));
      whereClauses.push('p.precio >= @precio_min');
    }

    if (precio_max) {
      request.input('precio_max', sql.Decimal(10, 2), Number(precio_max));
      whereClauses.push('p.precio <= @precio_max');
    }

    if (search) {
      request.input('search', sql.VarChar(150), `%${search}%`);
      whereClauses.push('(p.nombre LIKE @search OR p.franquicia LIKE @search)');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const allowedSort = ['fecha_publicacion', 'precio', 'nombre'];
    const sortField = allowedSort.includes(sort_by) ? `p.${sort_by}` : 'p.fecha_publicacion';
    const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    request.input('offset', sql.Int, offset);
    request.input('limitNum', sql.Int, limitNum);

    const countQuery = `SELECT COUNT(*) AS total FROM dbo.PRODUCTOS p ${whereSql};`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    const dataQuery = `
      SELECT 
        p.producto_id,
        p.vendedor_id,
        p.nombre,
        p.franquicia,
        p.categoria,
        p.decada,
        p.precio,
        p.estado_conservacion,
        p.stock,
        p.imagen_url,
        p.fecha_publicacion,
        u.nombre_completo AS vendedor_nombre,
        ch.ano_fabricacion,
        ch.tirada_produccion,
        ch.procedencia,
        ch.nivel_autenticidad
      FROM dbo.PRODUCTOS p
      INNER JOIN dbo.USUARIOS u ON p.vendedor_id = u.usuario_id
      LEFT JOIN dbo.CONTEXTO_HISTORICO ch ON p.producto_id = ch.producto_id
      ${whereSql}
      ORDER BY CASE WHEN p.imagen_url IS NULL OR p.imagen_url = '' THEN 1 ELSE 0 END, ${sortField} ${sortDirection}
      OFFSET @offset ROWS FETCH NEXT @limitNum ROWS ONLY;
    `;

    const dataResult = await request.query(dataQuery);

    res.status(200).json({
      success: true,
      data: dataResult.recordset,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CU-05: Detalle de producto y contexto histórico
 * GET /api/products/:id
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id, 10))
      .query(`
        SELECT 
          p.producto_id,
          p.vendedor_id,
          p.nombre,
          p.franquicia,
          p.categoria,
          p.decada,
          p.precio,
          p.estado_conservacion,
          p.stock,
          p.imagen_url,
          p.fecha_publicacion,
          u.nombre_completo AS vendedor_nombre,
          u.correo_electronico AS vendedor_correo,
          ch.contexto_id,
          ch.ano_fabricacion,
          ch.tirada_produccion,
          ch.procedencia,
          ch.variantes_diseno,
          ch.relevancia_cultural,
          ch.nivel_autenticidad
        FROM dbo.PRODUCTOS p
        INNER JOIN dbo.USUARIOS u ON p.vendedor_id = u.usuario_id
        LEFT JOIN dbo.CONTEXTO_HISTORICO ch ON p.producto_id = ch.producto_id
        WHERE p.producto_id = @id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El coleccionable solicitado no fue encontrado.',
      });
    }

    const product = result.recordset[0];

    // Atribución/licencia de imágenes (tabla opcional: IMAGENES_PRODUCTO se crea con la migración 001).
    // Si aún no existe, el detalle sigue funcionando sin ese bloque.
    let imagenes = [];
    try {
      const imgs = await pool
        .request()
        .input('id', sql.Int, parseInt(id, 10))
        .query(`
          SELECT url, es_principal, fuente, pagina_fuente, atribucion, licencia, restricciones
          FROM dbo.IMAGENES_PRODUCTO
          WHERE producto_id = @id
          ORDER BY es_principal DESC, imagen_id ASC;
        `);
      imagenes = imgs.recordset;
    } catch (imgErr) {
      imagenes = [];
    }

    res.status(200).json({
      success: true,
      data: { ...product, imagenes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener metadatos únicos para poblar filtros de frontend
 * GET /api/products/meta/filters
 */
const getFilterMetadata = async (req, res, next) => {
  try {
    const pool = await getPool();
    const franquicias = await pool.request().query('SELECT DISTINCT franquicia FROM dbo.PRODUCTOS');
    const categorias = await pool.request().query('SELECT DISTINCT categoria FROM dbo.PRODUCTOS');
    const decadas = await pool.request().query('SELECT DISTINCT decada FROM dbo.PRODUCTOS');

    res.status(200).json({
      success: true,
      data: {
        franquicias: franquicias.recordset.map((r) => r.franquicia),
        categorias: categorias.recordset.map((r) => r.categoria),
        decadas: decadas.recordset.map((r) => r.decada),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CU-09: Alta de producto por un Vendedor (o Administrador)
 * POST /api/products
 *
 * Inserta PRODUCTOS y CONTEXTO_HISTORICO en una sola transacción: o se crean ambos o ninguno.
 * El vendedor_id se toma SIEMPRE del token verificado, nunca del cuerpo de la petición.
 */
const createProduct = async (req, res, next) => {
  const vendedorId = req.user.usuario_id;
  const {
    nombre,
    franquicia,
    categoria,
    decada,
    precio,
    estado_conservacion,
    stock,
    imagen_url,
    ano_fabricacion,
    tirada_produccion,
    procedencia,
    variantes_diseno,
    relevancia_cultural,
    nivel_autenticidad,
  } = req.body;

  let transaction;
  try {
    const pool = await getPool();

    // Evitar duplicados del mismo vendedor (misma clave que usa el seed del catálogo)
    const duplicate = await pool
      .request()
      .input('nombre', sql.NVarChar(150), nombre)
      .input('vendedor_id', sql.Int, vendedorId)
      .query('SELECT producto_id FROM dbo.PRODUCTOS WHERE nombre = @nombre AND vendedor_id = @vendedor_id');

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Ya tienes publicada una pieza con el nombre "${nombre}".`,
      });
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const productResult = await new sql.Request(transaction)
      .input('vendedor_id', sql.Int, vendedorId)
      .input('nombre', sql.NVarChar(150), nombre)
      .input('franquicia', sql.NVarChar(100), franquicia)
      .input('categoria', sql.NVarChar(50), categoria)
      .input('decada', sql.VarChar(20), decada)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('estado_conservacion', sql.NVarChar(30), estado_conservacion)
      .input('stock', sql.Int, stock)
      .input('imagen_url', sql.VarChar(255), imagen_url || null)
      .query(`
        INSERT INTO dbo.PRODUCTOS
          (vendedor_id, nombre, franquicia, categoria, decada, precio, estado_conservacion, stock, imagen_url)
        OUTPUT INSERTED.producto_id, INSERTED.fecha_publicacion
        VALUES
          (@vendedor_id, @nombre, @franquicia, @categoria, @decada, @precio, @estado_conservacion, @stock, @imagen_url);
      `);

    const { producto_id, fecha_publicacion } = productResult.recordset[0];

    await new sql.Request(transaction)
      .input('producto_id', sql.Int, producto_id)
      .input('ano_fabricacion', sql.Int, ano_fabricacion)
      .input('tirada_produccion', sql.NVarChar(100), tirada_produccion || null)
      .input('procedencia', sql.NVarChar(150), procedencia || null)
      .input('variantes_diseno', sql.NVarChar(sql.MAX), variantes_diseno || null)
      .input('relevancia_cultural', sql.NVarChar(sql.MAX), relevancia_cultural || null)
      .input('nivel_autenticidad', sql.NVarChar(50), nivel_autenticidad || null)
      .query(`
        INSERT INTO dbo.CONTEXTO_HISTORICO
          (producto_id, ano_fabricacion, tirada_produccion, procedencia, variantes_diseno, relevancia_cultural, nivel_autenticidad)
        VALUES
          (@producto_id, @ano_fabricacion, @tirada_produccion, @procedencia, @variantes_diseno, @relevancia_cultural, @nivel_autenticidad);
      `);

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Pieza publicada en el catálogo con éxito.',
      data: {
        producto_id,
        fecha_publicacion,
        vendedor_id: vendedorId,
        nombre,
        franquicia,
        categoria,
        decada,
        precio,
        estado_conservacion,
        stock,
        imagen_url: imagen_url || null,
        ano_fabricacion,
        tirada_produccion: tirada_produccion || null,
        procedencia: procedencia || null,
        variantes_diseno: variantes_diseno || null,
        relevancia_cultural: relevancia_cultural || null,
        nivel_autenticidad: nivel_autenticidad || null,
      },
    });
  } catch (error) {
    if (transaction) {
      await transaction.rollback().catch(() => {});
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFilterMetadata,
  createProduct,
};

