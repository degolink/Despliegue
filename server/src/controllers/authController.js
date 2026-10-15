const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool, sql } = require('../config/db');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../config/mailer');

/**
 * CU-01: Registro de nuevo usuario
 */
const register = async (req, res, next) => {
  try {
    const { nombre_completo, correo_electronico, contrasena, rol = 'Comprador' } = req.body;
    const pool = await getPool();

    // Validar si el correo ya existe
    const existing = await pool
      .request()
      .input('correo', sql.VarChar(100), correo_electronico)
      .query('SELECT usuario_id FROM dbo.USUARIOS WHERE correo_electronico = @correo');

    if (existing.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado en Mythic Shelf.',
      });
    }

    // Hashear contraseña con bcrypt (factor de costo 10)
    const salt = await bcrypt.genSalt(10);
    const hash_contrasena = await bcrypt.hash(contrasena, salt);

    // Insertar usuario
    const insertResult = await pool
      .request()
      .input('nombre_completo', sql.VarChar(150), nombre_completo)
      .input('correo_electronico', sql.VarChar(100), correo_electronico)
      .input('hash_contrasena', sql.VarChar(255), hash_contrasena)
      .input('rol', sql.VarChar(20), rol)
      .query(`
        INSERT INTO dbo.USUARIOS (nombre_completo, correo_electronico, hash_contrasena, rol, estado_cuenta)
        OUTPUT INSERTED.usuario_id, INSERTED.nombre_completo, INSERTED.correo_electronico, INSERTED.rol, INSERTED.fecha_registro
        VALUES (@nombre_completo, @correo_electronico, @hash_contrasena, @rol, 1);
      `);

    const newUser = insertResult.recordset[0];

    // Enviar correo de bienvenida asincrónico (no bloqueante)
    sendWelcomeEmail(newUser.correo_electronico, newUser.nombre_completo).catch((err) =>
      console.warn('Fallo envío email de bienvenida:', err.message)
    );

    // Generar JWT
    const token = jwt.sign(
      { usuario_id: newUser.usuario_id, rol: newUser.rol },
      process.env.JWT_SECRET || 'super_secret_mythic_shelf_jwt_key_2024_secure!',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        usuario: newUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CU-02: Inicio de Sesión
 */
const login = async (req, res, next) => {
  try {
    const { correo_electronico, contrasena } = req.body;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('correo', sql.VarChar(100), correo_electronico)
      .query(`
        SELECT usuario_id, nombre_completo, correo_electronico, hash_contrasena, rol, estado_cuenta
        FROM dbo.USUARIOS 
        WHERE correo_electronico = @correo
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Por favor verifique su correo y contraseña.',
      });
    }

    const user = result.recordset[0];

    if (!user.estado_cuenta) {
      return res.status(403).json({
        success: false,
        message: 'Esta cuenta ha sido desactivada. Comuníquese con soporte.',
      });
    }

    const isMatch = await bcrypt.compare(contrasena, user.hash_contrasena);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Por favor verifique su correo y contraseña.',
      });
    }

    const token = jwt.sign(
      { usuario_id: user.usuario_id, rol: user.rol },
      process.env.JWT_SECRET || 'super_secret_mythic_shelf_jwt_key_2024_secure!',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    delete user.hash_contrasena;

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso.',
      data: {
        usuario: user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CU-03: Visualizar y editar perfil
 */
const getProfile = async (req, res, next) => {
  try {
    const usuarioId = req.user.usuario_id;
    const pool = await getPool();

    const result = await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .query(`
        SELECT 
          u.usuario_id, 
          u.nombre_completo, 
          u.correo_electronico, 
          u.rol, 
          u.fecha_registro,
          p.franquicia_interes, 
          p.categoria_preferida, 
          p.decada_interes, 
          p.presupuesto_min, 
          p.presupuesto_max
        FROM dbo.USUARIOS u
        LEFT JOIN dbo.PREFERENCIAS_USUARIO p ON u.usuario_id = p.usuario_id
        WHERE u.usuario_id = @usuario_id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RF-03: Solicitar recuperación de contraseña (envío de token temporal por SMTP)
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { correo_electronico } = req.body;
    const pool = await getPool();

    const userResult = await pool
      .request()
      .input('correo', sql.VarChar(100), correo_electronico)
      .query('SELECT usuario_id FROM dbo.USUARIOS WHERE correo_electronico = @correo');

    // Por seguridad, se responde ok aun si no existe para evitar enumeración de correos
    if (userResult.recordset.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Si el correo está registrado, se ha enviado un enlace para restablecer la contraseña.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await pool
      .request()
      .input('correo', sql.VarChar(100), correo_electronico)
      .input('token', sql.VarChar(255), resetToken)
      .input('expira', sql.DateTime, resetExpires)
      .query(`
        UPDATE dbo.USUARIOS 
        SET reset_token = @token, reset_token_expira = @expira 
        WHERE correo_electronico = @correo
      `);

    await sendPasswordResetEmail(correo_electronico, resetToken);

    res.status(200).json({
      success: true,
      message: 'Si el correo está registrado, se ha enviado un enlace para restablecer la contraseña.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * RF-03: Restablecer contraseña con token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, nueva_contrasena } = req.body;
    const pool = await getPool();

    const userResult = await pool
      .request()
      .input('token', sql.VarChar(255), token)
      .query(`
        SELECT usuario_id, reset_token_expira 
        FROM dbo.USUARIOS 
        WHERE reset_token = @token AND reset_token_expira > GETDATE()
      `);

    if (userResult.recordset.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El enlace de recuperación es inválido o ha expirado.',
      });
    }

    const usuarioId = userResult.recordset[0].usuario_id;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(nueva_contrasena, salt);

    await pool
      .request()
      .input('usuario_id', sql.Int, usuarioId)
      .input('hash', sql.VarChar(255), hash)
      .query(`
        UPDATE dbo.USUARIOS 
        SET hash_contrasena = @hash, reset_token = NULL, reset_token_expira = NULL 
        WHERE usuario_id = @usuario_id
      `);

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada con éxito. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
};

