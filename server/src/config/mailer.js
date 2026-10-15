const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Enviar correo de bienvenida / activación de cuenta
 */
const sendWelcomeEmail = async (toEmail, userName) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Mythic Shelf" <noreply@mythicshelf.com>',
    to: toEmail,
    subject: '¡Bienvenido a Mythic Shelf! - Tu santuario de coleccionables',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 8px;">
        <h1 style="color: #f59e0b; margin-bottom: 10px;">¡Bienvenido a Mythic Shelf, ${userName}!</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          Tu cuenta ha sido activada con éxito. Ya puedes explorar piezas históricas, figuras raras y tesoros del coleccionismo con procedencia verificada.
        </p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/catalog" 
             style="background-color: #d97706; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
             Explorar Catálogo Mítico
          </a>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Mythic Shelf B2C • Preservando la historia de la cultura pop y coleccionables.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ [SMTP] Correo de bienvenida enviado a: ${toEmail} (ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.warn(`⚠️ [SMTP Fallback] No se pudo enviar email de bienvenida: ${error.message}`);
    return null;
  }
};

/**
 * Enviar token de recuperación de contraseña
 */
const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Mythic Shelf Soporte" <soporte@mythicshelf.com>',
    to: toEmail,
    subject: 'Recuperación de Contraseña - Mythic Shelf',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 30px; border-radius: 8px;">
        <h2 style="color: #f59e0b;">Recuperación de Contraseña</h2>
        <p style="font-size: 15px; color: #cbd5e1;">
          Hemos recibido una solicitud para restablecer tu contraseña en Mythic Shelf.
        </p>
        <p style="font-size: 15px; color: #cbd5e1;">
          Haz clic en el siguiente enlace para continuar (válido por 1 hora):
        </p>
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" 
             style="background-color: #f59e0b; color: #0f172a; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
             Restablecer Contraseña
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8;">
          O copia y pega el siguiente enlace en tu navegador:<br/>
          <span style="color: #38bdf8;">${resetUrl}</span>
        </p>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
          Si no realizaste esta solicitud, puedes ignorar este mensaje con total seguridad.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ [SMTP] Correo de recuperación enviado a: ${toEmail}`);
    return info;
  } catch (error) {
    console.warn(`⚠️ [SMTP Fallback] No se pudo enviar email de recuperación: ${error.message}`);
    return null;
  }
};

module.exports = {
  transporter,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};

