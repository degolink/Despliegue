const { z } = require('zod');

// Validación de Registro
const registerSchema = z.object({
  nombre_completo: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  correo_electronico: z.string().email('Formato de correo electrónico inválido').max(100),
  contrasena: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100),
  // El rol Administrador nunca se puede autoasignar en el registro público:
  // solo se otorga directamente en la base de datos.
  rol: z.enum(['Comprador', 'Vendedor']).optional().default('Comprador'),
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

// Validación de alta de producto por Vendedor (CU-09)
// Campos de texto opcionales: '' se normaliza a null.
const optionalText = (max) =>
  z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().trim().max(max, `Máximo ${max} caracteres`).nullable().optional()
  );

const createProductSchema = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(150),
  franquicia: z.string().trim().min(2, 'Indique la franquicia').max(100),
  categoria: z.string().trim().min(2, 'Indique la categoría').max(50),
  decada: z.string().trim().regex(/^\d{4}s$/, 'La década debe tener el formato 1980s'),
  precio: z
    .number({ invalid_type_error: 'El precio debe ser numérico' })
    .positive('El precio debe ser mayor a 0')
    .max(99999999.99, 'Precio fuera de rango'),
  estado_conservacion: z.string().trim().min(2, 'Indique el estado de conservación').max(30),
  stock: z
    .number({ invalid_type_error: 'El stock debe ser numérico' })
    .int('El stock debe ser un número entero')
    .min(1, 'El stock debe ser al menos 1')
    .max(9999),
  imagen_url: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z
      .string()
      .trim()
      .max(255, 'La URL de la imagen no puede superar 255 caracteres')
      .regex(/^https:\/\/\S+$/i, 'La imagen debe ser una URL https://')
      .nullable()
      .optional()
  ),
  // Contexto histórico (CONTEXTO_HISTORICO)
  ano_fabricacion: z
    .number({ invalid_type_error: 'El año debe ser numérico' })
    .int()
    .min(1800, 'Año de fabricación inválido')
    .max(new Date().getFullYear() + 1, 'Año de fabricación inválido'),
  tirada_produccion: optionalText(100),
  procedencia: optionalText(150),
  variantes_diseno: optionalText(4000),
  relevancia_cultural: optionalText(4000),
  nivel_autenticidad: optionalText(50),
});

// Validación de Cuestionario de Preferencias
const questionnaireSchema = z.object({
  franquicia_interes: z.string().max(100).nullable().optional(),
  categoria_preferida: z.string().max(50).nullable().optional(),
  decada_interes: z.string().max(20).nullable().optional(),
  presupuesto_min: z.number().nonnegative().nullable().optional(),
  presupuesto_max: z.number().nonnegative().nullable().optional(),
  respuestas_test: z.record(z.any()).optional(),
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
  createProductSchema,
  questionnaireSchema,
};

