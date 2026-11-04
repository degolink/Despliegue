# 🏛️ Auditoría Técnica y Arquitectónica — Seller Analytics & Customer Intelligence
**Proyecto:** Mythic Shelf — E-Commerce B2C de Coleccionables  
**Documento:** `docs/seller-analytics-audit.md`  
**Fecha:** Noviembre 2026  
**Objetivo:** Evaluar la arquitectura actual, el modelo relacional en Microsoft SQL Server, el control de acceso basado en roles (RBAC) y la viabilidad de implementar el *Panel de Ventas e Inteligencia de Compradores* sin modificaciones destructivas a la base de datos ni a los datos semilla existentes.

---

## 1. Representación de Vendedores en la Aplicación

En Mythic Shelf, los vendedores se encuentran modelados dentro de la tabla principal de usuarios:
* **Tabla:** `dbo.USUARIOS`
* **Identificador:** `usuario_id` (INT, Clave Primaria)
* **Discriminador de Rol:** Columna `rol VARCHAR(20)` restringida por `CONSTRAINT CK_USUARIOS_rol CHECK (rol IN ('Comprador', 'Vendedor', 'Administrador'))`.
* **Vendedor Inicial del Sistema:**
  * `usuario_id`: `2`
  * `nombre_completo`: `"Obi-Wan Vintage Seller"`
  * `correo_electronico`: `"seller@mythicshelf.com"`
  * `rol`: `"Vendedor"`
  * `estado_cuenta`: `1` (Activo)

### Mecanismos de Autenticación y Autorización (RBAC)
* La autenticación opera mediante tokens **JWT stateless** firmados por el backend (`authenticateJWT`).
* La protección de rutas de vendedor se aplica mediante el middleware:
  ```javascript
  authorizeRoles('Vendedor', 'Administrador')
  ```
* **Principio de Aislamiento de Vendedor:** Las consultas analíticas NUNCA deben confiar en un `vendedor_id` enviado en el cuerpo (`body`) o parámetros (`params`) de la petición web. El identificador del vendedor debe extraerse rigurosamente del token verificado:
  ```javascript
  const vendedorId = req.user.usuario_id;
  ```

---

## 2. Asociación de Productos al Vendedor

Los productos pertenecientes a un vendedor están vinculados directamente en el catálogo:
* **Tabla:** `dbo.PRODUCTOS`
* **Clave Foránea:** `vendedor_id INT NOT NULL` con restricción:
  ```sql
  CONSTRAINT FK_PRODUCTOS_USUARIOS FOREIGN KEY (vendedor_id) REFERENCES dbo.USUARIOS(usuario_id)
  ```
* **Atributos de Producto Reutilizables para Analítica:**
  * `producto_id`: Clave primaria del artículo.
  * `nombre`: Título oficial de la pieza coleccionable.
  * `franquicia`: Universo temático (*Star Wars, Pokémon, Transformers, etc.*).
  * `categoria`: Formato de vitrina (*Figuras de Acción, Cartas TCG, Videojuegos Retro, etc.*).
  * `decada`: Período histórico (*1970s, 1980s, 1990s, etc.*).
  * `precio`: Precio actual de lista.
  * `stock`: Existencias en inventario en tiempo real.
  * `estado_conservacion`: Grado de preservación (*AFA 85, PSA 9 Mint, Sellado de Fábrica*).

---

## 3. Almacenamiento de Órdenes y Ventas

Las transacciones de compraventa se encuentran normalizadas en dos tablas vinculadas:

### A. Cabecera de la Transacción (`dbo.ORDENES`)
* `orden_id`: Clave primaria autoincremental.
* `comprador_id`: Clave foránea que referencia a `dbo.USUARIOS(usuario_id)`.
* `fecha_orden`: Marca de tiempo (`DATETIME DEFAULT GETDATE()`) para agrupaciones temporales (día, semana, mes).
* `total`: Monto global de la orden.
* `direccion_envio`: Ubicación de destino.
* `metodo_envio`: Modalidad logística de transporte.
* `estado_orden`: Estado del ciclo de vida del pedido con restricción:
  ```sql
  CONSTRAINT CK_ORDENES_estado CHECK (estado_orden IN ('Pendiente', 'Procesando', 'Enviada', 'Completada', 'Cancelada'))
  ```

### B. Líneas de Detalle (`dbo.DETALLE_ORDEN`)
* `detalle_id`: Clave primaria.
* `orden_id`: Clave foránea a `dbo.ORDENES`.
* `producto_id`: Clave foránea a `dbo.PRODUCTOS`.
* `cantidad`: Unidades adquiridas ($> 0$).
* `precio_unitario`: Precio congelado al momento exacto de la compra.

### Regla Crítica de Reconocimiento de Ingresos:
* **Ventas Completadas / Válidas:** `estado_orden IN ('Completada', 'Enviada', 'Procesando')`.
* **Ventas Excluidas:** Las órdenes con estado `'Cancelada'` o `'Pendiente'` (pendiente de pago) **NO** se computan como ingresos netos devengados.

---

## 4. Cruce Relacional: Ventas e Inteligencia de Clientes

Para aislar las estadísticas de un vendedor específico y analizar el comportamiento de sus clientes, se ejecuta el siguiente cruce relacional nativo en SQL Server:

```sql
SELECT 
    o.orden_id,
    o.fecha_orden,
    o.estado_orden,
    o.comprador_id,
    u.nombre_completo AS comprador_nombre,
    u.correo_electronico AS comprador_correo,
    d.producto_id,
    p.nombre AS producto_nombre,
    p.franquicia,
    p.categoria,
    p.decada,
    d.cantidad,
    d.precio_unitario,
    (d.cantidad * d.precio_unitario) AS subtotal_linea,
    pref.franquicia_interes,
    pref.categoria_preferida,
    pref.decada_interes,
    pref.presupuesto_min,
    pref.presupuesto_max
FROM dbo.DETALLE_ORDEN d
INNER JOIN dbo.PRODUCTOS p ON d.producto_id = p.producto_id
INNER JOIN dbo.ORDENES o ON d.orden_id = o.orden_id
INNER JOIN dbo.USUARIOS u ON o.comprador_id = u.usuario_id
LEFT JOIN dbo.PREFERENCIAS_USUARIO pref ON u.usuario_id = pref.usuario_id
WHERE p.vendedor_id = @vendedor_id
  AND o.estado_orden != 'Cancelada';
```

---

## 5. Matriz de Métricas y Factibilidad sin Cambios de Esquema

| Requerimiento del Dashboard | Fuente de Datos Existente | Fórmula / Mecanismo de Agregación | ¿Requiere cambios en BD? |
|:---|:---|:---|:---:|
| **Ingresos Totales (Revenue)** | `dbo.DETALLE_ORDEN` + `dbo.PRODUCTOS` | `SUM(d.cantidad * d.precio_unitario)` donde `p.vendedor_id = @vendedor_id` | ❌ **No** |
| **Órdenes Completadas** | `dbo.ORDENES` + `dbo.DETALLE_ORDEN` | `COUNT(DISTINCT o.orden_id)` con estado válido | ❌ **No** |
| **Compradores Únicos** | `dbo.ORDENES` + `dbo.DETALLE_ORDEN` | `COUNT(DISTINCT o.comprador_id)` | ❌ **No** |
| **Ticket Promedio** | Ingresos / Órdenes | `Ingresos Totales / Órdenes Completadas` | ❌ **No** |
| **Productos Vendidos** | `dbo.DETALLE_ORDEN` | `SUM(d.cantidad)` | ❌ **No** |
| **Tendencias Temporales** | `o.fecha_orden` | Agrupación SQL `CAST(fecha_orden AS DATE)`, semana `DATEPART(wk)`, o mes `FORMAT(fecha_orden, 'yyyy-MM')` | ❌ **No** |
| **Productos Más Vendidos** | `p.nombre`, `p.producto_id` | `SUM(d.cantidad)` agrupado por `p.producto_id`, orden descendente | ❌ **No** |
| **Productos de Baja Rotación** | `dbo.PRODUCTOS` LEFT JOIN ventas | Productos del vendedor con stock activo pero cero o mínimas unidades vendidas | ❌ **No** |
| **Inventario Disponible** | `dbo.PRODUCTOS.stock` | `SUM(p.stock)` y listado de existencias actuales | ❌ **No** |
| **Clientes Nuevos vs Recurrentes** | `o.comprador_id` | Conteo de órdenes del comprador con este vendedor ($= 1$: Nuevo; $> 1$: Recurrente) | ❌ **No** |
| **Perfilado por Comportamiento** | `p.categoria`, `p.franquicia` | Análisis de frecuencia de compra real de cada comprador (*ej. 80% en Cartas TCG*) | ❌ **No** |
| **Cruce con Preferencias Declaradas** | `dbo.PREFERENCIAS_USUARIO` | `franquicia_interes`, `categoria_preferida` resultantes del test de coleccionista | ❌ **No** |
| **Segmentación de Clientes** | Datos agregados en memoria/SQL | Reglas de negocio: VIP (alto gasto), Cartas, Figuras, Recurrentes | ❌ **No** |
| **Oportunidades Comerciales** | Cruce de inventario + ventas | Detección de productos de alta demanda agotándose, o categorías con mayor ticket | ❌ **No** |

---

## 6. Privacidad y Seguridad de Datos del Comprador

De acuerdo con las directrices de seguridad y normativas de privacidad:
1. **Datos Autorizados para el Vendedor:**
   * Identificador de cliente (`comprador_id`).
   * Nombre público de exhibición (`nombre_completo`).
   * Correo de contacto comercial (`correo_electronico`).
   * Dirección de envío provista para la entrega física (`direccion_envio`).
   * Comportamiento de compra e historial agregado dentro de la tienda del vendedor.
   * Preferencias declaradas no sensibles (*franquicia de interés, categoría preferida*).
2. **Datos Estrictamente Vetados y Protegidos:**
   * Hashes de contraseñas (`hash_contrasena`).
   * Tokens de autenticación y de reinicio (`reset_token`).
   * Compras realizadas por el cliente con **otros vendedores** ajenos al autenticado.
   * Respuestas crudas paso a paso de encuestas privadas no públicas.

---

## 7. Plan de Extensión de Componentes MVC

Para respetar la arquitectura existente y las convenciones del repositorio:

* **Backend:**
  1. `server/src/services/sellerAnalyticsService.js`: Lógica de agregación SQL, cálculo de métricas, segmentación y oportunidades.
  2. `server/src/controllers/sellerAnalyticsController.js`: Controlador que recibe peticiones, valida fechas y aplica seguridad de vendedor.
  3. `server/src/routes/sellerAnalyticsRoutes.js`: Definición de endpoints protegidos por `authenticateJWT` y `authorizeRoles('Vendedor', 'Administrador')`.
  4. Registro en `server/src/app.js` bajo `/api/seller/analytics`.
* **Frontend:**
  1. `client/src/components/SellerDashboard.jsx`: Vista del panel «Panel de ventas» con subtítulo, tarjetas KPI, gráficos de tendencia nativos, ranking de productos, matriz de compradores y oportunidades comerciales.
  2. Integración en `client/src/components/Navbar.jsx`: Botón de acceso directo visible exclusivamente para usuarios con rol `Vendedor` o `Administrador`.
  3. Integración de control de apertura en `client/src/App.jsx`.

---

## 8. Conclusión de la Auditoría

El modelo relacional existente en Microsoft SQL Server (`MythicShelfDB`) es **100% suficiente y robusto** para satisfacer la totalidad de requerimientos del panel de ventas, segmentación y perfilado de clientes. **No se requiere ninguna modificación de tablas, columnas, índices ni constraints en la base de datos.**
