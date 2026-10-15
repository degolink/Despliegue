const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/db');

/**
 * Middleware para verificar JWT y autenticar usuario
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Token no proporcionado o formato inválido.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_mythic_shelf_jwt_key_2024_secure!');

    const pool = await getPool();
    const result = await pool
      .request()
      .input('usuario_id', sql.Int, decoded.usuario_id)
      .query(`
        SELECT usuario_id, nombre_completo, correo_electronico, rol, estado_cuenta 
        FROM dbo.USUARIOS 
        WHERE usuario_id = @usuario_id
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o sesión inválida.',
      });
    }

    const user = result.recordset[0];
    if (!user.estado_cuenta) {
      return res.status(403).json({
        success: false,
        message: 'Cuenta inactiva o suspendida. Comuníquese con soporte.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'El token ha expirado. Por favor inicie sesión nuevamente.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token inválido o corrupto.',
    });
  }
};

/**
 * Middleware opcional de autenticación (si hay token lo adjunta, si no continúa como invitado)
 */
const optionalJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_mythic_shelf_jwt_key_2024_secure!');
    const pool = await getPool();
    const result = await pool
      .request()
      .input('usuario_id', sql.Int, decoded.usuario_id)
      .query(`
        SELECT usuario_id, nombre_completo, correo_electronico, rol, estado_cuenta 
        FROM dbo.USUARIOS 
        WHERE usuario_id = @usuario_id
      `);
    if (result.recordset.length > 0 && result.recordset[0].estado_cuenta) {
      req.user = result.recordset[0];
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};

/**
 * Middleware para control de acceso basado en roles (RBAC)
 * @param  {...string} allowedRoles Ej: 'Administrador', 'Vendedor', 'Comprador'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida para realizar esta acción.',
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado: El rol '${req.user.rol}' no tiene permisos para este recurso.`,
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  optionalJWT,
  authorizeRoles,
};

