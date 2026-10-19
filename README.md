# 🏛️ Mythic Shelf — Plataforma E-commerce B2C de Coleccionables

Mythic Shelf es una plataforma web B2C de comercio electrónico especializada en coleccionables de alto valor, figuras de acción vintage, cartas TCG históricas y reliquias de la cultura pop con procedencia curada y autenticidad verificada.

---

## 🛠️ Stack Tecnológico y Arquitectura

- **Backend:** Node.js con Express.js (Arquitectura modular en capas: Controllers, Services, Middlewares, Validators y Routes).
- **Frontend:** React 18 SPA con Vite, Tailwind CSS y componentes estilizados con temática retro-vintage para coleccionistas.
- **Base de Datos:** Microsoft SQL Server (Transacciones ACID, bloqueos de concurrencia `UPDLOCK, ROWLOCK`, DDL relacional estricto con restricciones `CHECK` y claves foráneas).
- **Seguridad:** Autenticación stateless con JWT (JSON Web Tokens), contraseñas cifradas con `bcryptjs` (salt rounds = 10) y validación de esquemas con `Zod`.
- **Servicio SMTP:** Nodemailer para correos de bienvenida tras el registro y emisión de tokens temporales de recuperación de credenciales.
- **Motor de Recomendaciones:** Algoritmo Content-Based Matching con scoring dinámico (+3 Franquicia, +2 Categoría, +1 Rango de Presupuesto).

---

## 🗄️ Modelo Relacional de Base de Datos (SQL Server)

La base de datos `MythicShelfDB` implementa el siguiente modelo estructurado:

| Tabla | Clave Primaria | Claves Foráneas | Propósito |
| :--- | :--- | :--- | :--- |
| **`USUARIOS`** | `usuario_id` | — | Cuentas, roles (`Comprador`, `Vendedor`, `Administrador`) y hashes de contraseña. |
| **`PREFERENCIAS_USUARIO`**| `preferencia_id` | `usuario_id` -> `USUARIOS` | Perfil de coleccionista (franquicia, categoría, década y rango de presupuesto). |
| **`PRODUCTOS`** | `producto_id` | `vendedor_id` -> `USUARIOS` | Catálogo con precio, década, conservación y stock en tiempo real. |
| **`CONTEXTO_HISTORICO`** | `contexto_id` | `producto_id` -> `PRODUCTOS` | Año de fabricación, tirada, procedencia, variantes y autenticidad. |
| **`CARRITO_ITEMS`** | `item_id` | `usuario_id`, `producto_id` | Carrito persistente en base de datos vinculado al usuario autenticado. |
| **`ORDENES`** | `orden_id` | `comprador_id` -> `USUARIOS` | Cabecera de compra con total, dirección de envío y método de transporte. |
| **`DETALLE_ORDEN`** | `detalle_id` | `orden_id`, `producto_id` | Líneas de pedido con cantidad y precio unitario congelado al comprar. |

---

## 🧩 Módulos Funcionales y Casos de Uso del Sistema

La plataforma Mythic Shelf está arquitecturada en 9 módulos modulares que cubren el ciclo completo de la experiencia B2C para coleccionables:

### 1. Módulo de Gestión de Usuarios y Autenticación (GUS)
Gestiona la identidad, seguridad y ciclo de vida de las cuentas de usuario en la plataforma.
- **CU-01 (Registro de Usuario):** Registro de compradores y vendedores. Valida unicidad de correo, aplica hash bcrypt (costo 10), persiste en `USUARIOS` y dispara email de bienvenida SMTP.
- **CU-02 (Inicio y Cierre de Sesión):** Autenticación mediante credenciales. Genera y retorna un token JWT firmado (`usuario_id`, `rol`, expiración de 7 días). Cierre de sesión mediante invalidación en cliente.
- **CU-03 (Visualizar y Editar Perfil):** Consulta de datos personales del coleccionista y sus preferencias históricas vinculadas en `PREFERENCIAS_USUARIO`.
- **RF-03 (Recuperación de Contraseña vía SMTP):** Generación de token criptográfico temporal con ventana de expiración de 1 hora, enviado por correo electrónico para restablecer la contraseña de forma segura.
- **Roles y Permisos:**
  - **Visitante:** Navegación por el catálogo público y prueba en memoria del cuestionario de afinidad.
  - **Comprador:** Acceso a perfil, guardado de preferencias, gestión de carrito persistente y checkout transaccional.
  - **Vendedor:** Capacidad de registrar coleccionables y describir su contexto histórico.
  - **Administrador:** Control y supervisión global de la plataforma y auditoría de transacciones.
- **Archivos Clave:** `server/src/controllers/authController.js`, `server/src/routes/authRoutes.js`, `client/src/components/AuthModal.jsx`.

---

### 2. Módulo de Catálogo y Contexto Histórico (CAT / CH)
Exhibe las piezas coleccionables enriquecidas con información histórica, arqueológica y cultural de cada pieza.
- **CU-04 (Catálogo y Filtrado Dinámico en Tiempo Real):** Exploración paginada del inventario disponible con filtros combinables simultáneamente por:
  - Franquicia (*Star Wars, Pokémon, Transformers, Nintendo, etc.*)
  - Categoría (*Figuras de Acción, Cartas TCG, Videojuegos Retro, Vehículos y Naves*)
  - Década (*1970s, 1980s, 1990s, 2000s*)
  - Presupuesto máximo
  - Búsqueda textual por nombre o personaje
- **CU-05 (Detalle de Producto y Contexto Histórico):** Vista profunda que expone la ficha técnica de la pieza con procedencia y autenticidad:
  - **Año de fabricación original:** Datación de la pieza.
  - **Tirada de producción:** Tirada estimada o indicativo de lote limitado.
  - **Procedencia:** Trazabilidad de origen y cadena de custodia.
  - **Variantes de diseño:** Detalles particulares de manufactura, empaque o errores de tirada que elevan su rareza.
  - **Relevancia cultural:** Narrativa contextual de su época e impacto en la cultura pop.
  - **Nivel de autenticidad:** Certificación oficial (AFA Graded, PSA, Wata, inspección curatorial Mythic Shelf).
- **Archivos Clave:** `server/src/controllers/productController.js`, `server/src/routes/productRoutes.js`, `client/src/components/Catalog.jsx`, `client/src/components/ProductModal.jsx`.

---

### 3. Módulo de Preferencias y Motor de Recomendaciones (REC)
Personaliza la experiencia del comprador calculando afinidad de coleccionismo mediante un algoritmo de emparejamiento basado en contenido (*Content-Based Matching*).
- **RF-09 (Cuestionario Interactivo Opcional):** Encuesta interactiva donde el coleccionista define su franquicia favorita, categoría de predilección, década nostálgica y rango presupuestario.
- **CU-06 (Captura y Persistencia de Preferencias):** Almacenamiento y actualización transaccional mediante `MERGE` en `PREFERENCIAS_USUARIO`.
- **RF-10 (Cálculo de Afinidad - Content-Based Matching):**
  Cada coleccionable en stock es evaluado dinámicamente con la fórmula:
  $$\text{Score} = (\text{Match Franquicia} \times 3) + (\text{Match Categoría} \times 2) + (\text{Precio en Presupuesto} \times 1)$$
  - **Franquicia coincidente:** $+3$ puntos.
  - **Categoría coincidente:** $+2$ puntos.
  - **Precio en rango $[min, max]$:** $+1$ punto.
  Los productos son ordenados descendentemente por su puntaje, acompañados de un banner explicativo y chips de puntaje visual en cada tarjeta.
- **Archivos Clave:** `server/src/services/recommendationService.js`, `server/src/controllers/recommendationController.js`, `client/src/components/QuestionnaireModal.jsx`, `client/src/components/RecommendationBanner.jsx`.

---

### 4. Módulo de Carrito de Compras en Tiempo Real (CAR)
Garantiza la gestión fluida y la persistencia de las piezas seleccionadas antes del proceso de compra.
- **CU-07.1 (Agregar Producto):** Inserta un ítem en `CARRITO_ITEMS` o incrementa su cantidad si ya existía.
- **CU-07.2 (Modificar Cantidades):** Ajuste de unidades en el carrito con verificación de topes.
- **CU-07.3 (Eliminar Producto):** Retiro selectivo de una pieza del carrito.
- **CU-07.4 (Vaciar Carrito):** Eliminación en bloque de todos los ítems del usuario.
- **CU-07.5 (Validación de Stock en Tiempo Real):** Antes de cualquier adición o actualización, se consulta el stock vivo en SQL Server para evitar sobrepasar las existencias reales del almacén.
- **Persistencia Vinculada:** El carrito se almacena en la tabla `CARRITO_ITEMS` asociado al `usuario_id`, manteniéndose accesible entre diferentes sesiones o dispositivos.
- **Archivos Clave:** `server/src/controllers/cartController.js`, `server/src/routes/cartRoutes.js`, `client/src/components/CartDrawer.jsx`.

---

### 5. Módulo de Checkout y Pedidos Transaccionales (CHK)
Ejecuta la compra garantizando la consistencia absoluta del inventario mediante transacciones ACID en Microsoft SQL Server.
- **CU-08 (Checkout con Datos de Envío y Confirmación Atómica):**
  Flujo transaccional ejecutado dentro de un bloque `sql.Transaction`:
  1. **Bloqueo exclusivo de filas (`WITH (UPDLOCK, ROWLOCK)`):** Bloquea los registros de `PRODUCTOS` de los ítems en el carrito para prevenir condiciones de carrera (*race conditions*).
  2. **Validación final de existencias:** Comprueba que `stock >= cantidad_solicitada` para cada ítem. Si falla alguno, aborta y lanza error 409 detallado.
  3. **Cálculo de total con precios reales:** Obtiene los precios directamente de la base de datos para evitar manipulaciones desde el frontend.
  4. **Inserción de cabecera en `ORDENES`:** Registra total, dirección y método de envío capturando el `orden_id`.
  5. **Inserción de líneas en `DETALLE_ORDEN`:** Registra cada producto con su precio unitario congelado al momento de compra.
  6. **Descuento atómico de existencias:** Ejecuta `UPDATE PRODUCTOS SET stock = stock - cantidad`.
  7. **Vaciado de `CARRITO_ITEMS`:** Elimina los ítems adquiridos del carrito del usuario.
  8. **Confirmación con `COMMIT`:** Asienta los cambios de manera irrevocable en la base de datos. En caso de cualquier error intermedio, ejecuta `ROLLBACK` automático.
  9. **Emisión de Comprobante:** Genera recibo digital con código de orden, desglose de coleccionables, fecha y garantías de custodia.
- **Archivos Clave:** `server/src/services/checkoutService.js`, `server/src/controllers/checkoutController.js`, `client/src/components/CheckoutModal.jsx`.

---

### 6. Módulo de Seguridad, Autorización y Validación (SEC / RBAC)
Establece las defensas perimetrales y de datos de la API REST.
- **Autenticación Stateless JWT:** Verificación del token Bearer en cabeceras `Authorization` en cada solicitud protegida.
- **Control de Acceso Basado en Roles (RBAC):** Middleware `authorizeRoles('Comprador', 'Vendedor', 'Administrador')` para restringir endpoints según privilegios.
- **Cifrado de Contraseñas:** Algoritmo `bcryptjs` con factor de coste (*salt*) de 10 rondas.
- **Validación de Esquemas Zod:** Validación estricta de todos los payloads entrantes (`body`, `params`, `query`), rechazando datos malformados con respuestas 400 detalladas.
- **Cabeceras HTTP y CORS:** Protección con `Helmet` y configuración de políticas de origen cruzado (`cors`) para limitar solicitudes únicamente al origen del frontend.
- **Archivos Clave:** `server/src/middlewares/auth.js`, `server/src/middlewares/validate.js`, `server/src/validators/index.js`, `server/src/middlewares/errorHandler.js`.

---

### 7. Módulo de Notificaciones y Mensajería SMTP (NOT / SMTP)
Canal de comunicación automatizado con los usuarios mediante correo electrónico.
- **Envío de Bienvenida:** Disparo automático de correo con diseño HTML estilizado tras completar el registro (CU-01).
- **Recuperación de Credenciales:** Emisión de correo con enlace seguro y token criptográfico temporal para restablecer la contraseña (RF-03).
- **Configuración SMTP Flexible:** Compatible con servicios de producción (SendGrid, Mailgun, Amazon SES) y entornos de prueba (Ethereal Email, Mailtrap).
- **Archivos Clave:** `server/src/config/mailer.js`.

---

### 8. Módulo de Migraciones y Persistencia de Base de Datos (MIG / DDL)
Administra la estructura del esquema relacional y el aprovisionamiento de datos iniciales.
- **Scripts DDL Declarativos:** Definición completa de tablas, restricciones de clave primaria `CLUSTERED`, claves foráneas con integridad referencial, restricciones `CHECK` para rangos y estados, e índices no agrupados optimizados para filtrado dinámico.
- **Carga de Datos Semilla (Seeds):** Inserción automatizada de usuarios de prueba para cada rol y catálogo inicial de coleccionables legendarios con su respectivo contexto histórico.
- **Ejecutor de Migraciones CLI:** Script `server/src/scripts/migrate.js` que se conecta a SQL Server y ejecuta secuencialmente los lotes delimitados por `GO`.
- **Archivos Clave:** `database/schema.sql`, `server/src/scripts/migrate.js`.

---

### 9. Módulo de Interfaz de Usuario y Experiencia SPA (UI / UX)
Presentación visual moderna orientada a coleccionistas de alta gama.
- **Single Page Application (SPA):** Desarrollada con React 18, Vite y arquitectura de componentes funcionales con React Hooks.
- **Tema Visual Mítico (Collector Theme):** Paleta oscura con contrastes ámbar y oro (`#F59E0B`, `#0B0F19`), tipografía *Cinzel* para ambientación de reliquias y *Inter* para lectura técnica.
- **Interactividad Reactiva:** Drawer lateral deslizable para el carrito, modales para login, checkout y detalle histórico, cálculo dinámico de recomendaciones en tiempo real y notificaciones toast flotantes.
- **Archivos Clave:** `client/src/App.jsx`, `client/src/components/*`, `client/src/index.css`, `client/tailwind.config.js`.

---

## 📁 Estructura del Proyecto

```text
mytichshelf/
├── database/
│   └── schema.sql                  # Script DDL completo para SQL Server con tablas, constraints, índices y seeds
├── server/
│   ├── .env.example                # Variables de entorno de referencia
│   ├── .env                        # Variables de configuración local
│   ├── package.json
│   └── src/
│       ├── app.js                  # Configuración de Express, CORS, Helmet y middlewares
│       ├── server.js               # Punto de entrada y pool de conexiones a SQL Server
│       ├── config/
│       │   ├── db.js               # Pool singleton con mssql para Microsoft SQL Server
│       │   └── mailer.js           # Servicio SMTP con Nodemailer
│       ├── controllers/
│       │   ├── authController.js   # GUS: Login, registro, perfil y recuperación por correo
│       │   ├── productController.js# CAT / CH: Catálogo, filtros en vivo y detalle histórico
│       │   ├── cartController.js   # CAR: Carrito y validación de stock en tiempo real
│       │   ├── checkoutController.js # CHK: Checkout transaccional
│       │   └── recommendationController.js # REC: Motor de recomendaciones y cuestionario
│       ├── services/
│       │   ├── checkoutService.js  # Transacción atómica ACID (UPDLOCK, decremento de stock, limpieza de carrito)
│       │   └── recommendationService.js # Content-Based Matching (+3 Franquicia, +2 Categoría, +1 Precio)
│       ├── scripts/
│       │   └── migrate.js          # Ejecutor automático de migraciones DDL por Node.js
│       ├── middlewares/
│       │   ├── auth.js             # Verificación de JWT y RBAC (Roles)
│       │   ├── validate.js         # Validador de esquemas Zod
│       │   └── errorHandler.js     # Manejador centralizado de errores
│       ├── validators/
│       │   └── index.js            # Esquemas de validación Zod
│       └── routes/
│           ├── authRoutes.js
│           ├── productRoutes.js
│           ├── cartRoutes.js
│           ├── checkoutRoutes.js
│           └── recommendationRoutes.js
└── client/
    ├── index.html
    ├── vite.config.js              # Proxy reverso a http://localhost:5000/api
    ├── tailwind.config.js          # Paleta temática de coleccionistas (oro mítico, ámbar, slate profundo)
    ├── postcss.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Orquestación de vistas, filtros, modales y estado global
        ├── index.css               # Estilos globales y fuentes coleccionables
        ├── services/
        │   └── api.js              # Cliente Axios con interceptor Bearer JWT
        └── components/
            ├── Navbar.jsx          # Navegación, buscador, carrito y usuario
            ├── RecommendationBanner.jsx # Despliegue de puntuaciones y afinidad
            ├── Catalog.jsx         # Grilla de coleccionables con filtros dinámicos
            ├── ProductModal.jsx    # Detalle con procedencia, año, variantes y autenticidad
            ├── QuestionnaireModal.jsx # Cuestionario de afinidad interactivo (RF-09)
            ├── CartDrawer.jsx      # Drawer lateral con validación de stock en vivo
            ├── CheckoutModal.jsx   # Formulario y recibo de compra transaccional (CU-08)
            └── AuthModal.jsx       # Modal de Login y Registro con accesos rápidos demo
```

---

## 🚀 Configuración y Puesta en Marcha

### 1. Configuración de SQL Server

#### A. Abrir SQL Server Configuration Manager
Para verificar que el protocolo **TCP/IP** esté activo y reiniciar el servicio:
- Presiona `Win + R` y escribe según tu versión instalada:
  - **SQL Server 2025:** `SQLServerManager17.msc`
  - **SQL Server 2022:** `SQLServerManager16.msc`
  - **SQL Server 2019:** `SQLServerManager15.msc`
- O abre los servicios de Windows con `Win + R` > `services.msc` y localiza **SQL Server (MSSQLSERVER)**.

#### B. Ejecutar la Migración DDL de la Base de Datos

Tienes dos formas de aplicar el script `database/schema.sql`:

* **Opción 1: Por línea de comandos con sqlcmd (Recomendada):**
  ```powershell
  sqlcmd -S localhost -E -C -i database/schema.sql
  ```
  *(El parámetro `-E` usa Windows Authentication y `-C` aprueba el certificado SSL local).*

* **Opción 2: Mediante el script automatizado de Node.js:**
  ```powershell
  cd server
  npm.cmd run migrate
  ```

* **Opción 3: En SQL Server Management Studio (SSMS):**
  1. Conéctate a tu servidor (`localhost` con Windows Authentication).
  2. Abre el archivo `database/schema.sql` (`Ctrl + O`).
  3. Presiona **`F5`** (Ejecutar).

---

### 2. Iniciar el Backend (API REST Express)

1. Ingresa a la carpeta `server/`:
   ```powershell
   cd server
   npm.cmd install
   ```
2. Revisa o ajusta las variables en `server/.env` según tus credenciales locales.
3. Inicia el servidor en modo desarrollo:
   ```powershell
   npm.cmd run dev
   ```
   * La API quedará escuchando en `http://localhost:5000`.
   * Verifica la salud del servicio en `http://localhost:5000/health`.

---

### 3. Iniciar el Frontend (React + Vite + Tailwind CSS)

1. Ingresa a la carpeta `client/`:
   ```powershell
   cd client
   npm.cmd install
   ```
2. Inicia el servidor de desarrollo:
   ```powershell
   npm.cmd run dev
   ```
   * La aplicación se abrirá en `http://localhost:5173`.
   * Para compilar a producción: `npm.cmd run build`.

---

## 👥 Cuentas Semilla Preconfiguradas para Pruebas

El script DDL precarga tres usuarios listos para iniciar sesión inmediatamente desde el botón **Ingresar** de la interfaz:

| Rol | Correo Electrónico | Contraseña | Capacidades |
| :--- | :--- | :--- | :--- |
| **Comprador** | `buyer@mythicshelf.com` | `Mythic2024!` | Catálogo, test de afinidad, carrito de compras, checkout transaccional e historial. |
| **Vendedor** | `seller@mythicshelf.com` | `Mythic2024!` | Publicación de piezas y contexto histórico en la bóveda. |
| **Administrador** | `admin@mythicshelf.com` | `Mythic2024!` | Gestión global y auditoría de la plataforma. |

*(La ventana de Login incluye botones de acceso rápido de un clic para "Comprador Demo" y "Vendedor Demo").*

---

## 📡 Endpoints de la API REST

### Autenticación (`/api/auth`)
- `POST /api/auth/register` — Registro de nuevo coleccionista o vendedor (Zod).
- `POST /api/auth/login` — Autenticación y obtención de JWT.
- `GET /api/auth/profile` — Consulta de perfil y preferencias asociadas (Bearer Token).
- `POST /api/auth/forgot-password` — Solicitud de token temporal SMTP (1h de vigencia).
- `POST /api/auth/reset-password` — Restablecimiento de contraseña con token.

### Catálogo y Contexto Histórico (`/api/products`)
- `GET /api/products` — Consulta de catálogo con filtros (`search`, `franquicia`, `categoria`, `decada`, `precio_max`).
- `GET /api/products/meta/filters` — Metadatos únicos para poblar filtros selectores.
- `GET /api/products/:id` — Ficha técnica con contexto histórico, procedencia y certificación.

### Recomendaciones Inteligentes (`/api/recommendations`)
- `GET /api/recommendations` — Feed ordenado según afinidad del perfil autenticado.
- `POST /api/recommendations/questionnaire` — Procesamiento del cuestionario interactivo (scoring +3, +2, +1).

### Carrito de Compras (`/api/cart`)
- `GET /api/cart` — Listado de artículos y validación de stock en vivo.
- `POST /api/cart` — Adición de artículo con validación en base de datos.
- `PUT /api/cart/:itemId` — Modificación de cantidad con control de límites.
- `DELETE /api/cart/:itemId` — Retiro de un artículo del carrito.
- `DELETE /api/cart` — Vaciado completo del carrito.

### Checkout Transaccional (`/api/checkout`)
- `POST /api/checkout` — Ejecución transaccional atómica ACID con bloqueo de existencias.
- `GET /api/checkout/orders` — Historial de pedidos del comprador.
