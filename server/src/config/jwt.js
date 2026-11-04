/**
 * Secreto de firma JWT.
 * No existe valor por defecto: si JWT_SECRET falta, cualquiera podría firmar tokens
 * con un secreto público, así que se falla de forma explícita.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en server/.env');
  }
  return secret;
};

module.exports = { getJwtSecret };
