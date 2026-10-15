const { z } = require('zod');

// Validación de Registro
const registerSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  correo_electronico: z.string().email('Formato de correo electrónico inválido').max(100),
  contrasena: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100),
  rol: z.enum(['Comprador', 'Vendedor', 'Administrador']).optional().default('Comprador'),
});

// Validación de Login
const loginSchema = z.object({
  correo_electronico: z.string().email('Formato de correo electrónico inválido'),
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
});

// Validación de Recuperación de Contraseña
const forgotPasswordSchema = z.object({
  correo_electronico: z.string().email('Formato de correo electrónico inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10, 'El token es requerido'),
  nueva_contrasena: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
});

// Validación de Carrito
const addToCartSchema = z.object({
  producto_id: z.number().int().positive('ID de producto inválido'),
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0').default(1),
});

const updateCartSchema = z.object({
  cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
});

// Validación de Checkout
const checkoutSchema = z.object({
  direccion_envio: z.string().min(5, 'La dirección de envío debe tener al menos 5 caracteres').max(255),
  metodo_envio: z.string().min(2, 'Debe especificar un método de envío').max(50).default('Estándar Asegurado'),
});

// Validación de Cuestionario de Preferencias
const questionnaireSchema = z.object({
  franquicia_interes: z.string().max(100).nullable().optional(),
  categoria_preferida: z.string().max(50).nullable().optional(),
  decada_interes: z.string().max(20).nullable().optional(),
  presupuesto_min: z.number().nonnegative().nullable().optional(),
  presupuesto_max: z.number().nonnegative().nullable().optional(),
  persistir: z.boolean().optional().default(true),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  addToCartSchema,
  updateCartSchema,
  checkoutSchema,
  questionnaireSchema,
};

