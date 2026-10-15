const { ZodError } = require('zod');

/**
 * Middleware generador para validación con esquemas Zod
 * @param {import('zod').ZodSchema} schema 
 * @param {'body' | 'query' | 'params'} source 
 */
const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorDetails = error.errors.map((err) => ({
          campo: err.path.join('.'),
          mensaje: err.message,
        }));
        return res.status(400).json({
          success: false,
          message: 'Error de validación en los datos proporcionados.',
          errores: errorDetails,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error interno en la validación de la solicitud.',
      });
    }
  };
};

module.exports = { validate };

