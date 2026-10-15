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

## 🧩 Módulos Funcionales y Casos de Uso

### 1. Gestión de Usuarios y Autenticación (GUS)
- **CU-01 (Registro):** Creación de cuenta con rol, validación Zod y envío de correo de bienvenida vía SMTP.
- **CU-02 (Login/Logout):** Autenticación mediante JWT y verificación de hash con bcrypt.
- **CU-03 (Perfil):** Consulta y edición de datos del coleccionista y sus preferencias.
- **RF-03 (Recuperación):** Generación de token temporal con expiración de 1 hora enviado por correo.

### 2. Catálogo y Contexto Histórico (CAT / CH)
- **CU-04 (Catálogo):** Filtros dinámicos combinables en tiempo real por franquicia, categoría, década y precio máximo.
- **CU-05 (Detalle de Coleccionable):** Despliegue de atributos patrimoniales:
  - Año de fabricación original
  - Tirada de producción estimada
  - Procedencia / línea de custodia
  - Nivel y certificado de autenticidad (AFA, PSA, Wata, Mythic Vault)
  - Variantes de diseño e impacto cultural

### 3. Motor de Recomendaciones (REC)
- **RF-09 & CU-06 (Cuestionario Interactivo y Preferencias):** El usuario responde preguntas breves sobre su pasión coleccionista.
- **RF-10 (Cálculo de Afinidad - Content-Based Matching):**
  $$\text{Score} = (\text{Match Franquicia} \times 3) + (\text{Match Categoría} \times 2) + (\text{Precio en Presupuesto} \times 1)$$
  El feed prioriza descendientemente las piezas según este puntaje, mostrando badges explicativos en cada tarjeta.

### 4. Carrito de Compras en Vivo (CAR)
- **CU-07:** Agregar productos, ajustar cantidades, eliminar o vaciar carrito.
- **CU-07.5:** Validación estricta de existencias en SQL Server en tiempo real antes de registrar adiciones o modificaciones.

### 5. Checkout Transaccional (CHK)
- **CU-08 (Checkout Atómico ACID):**
  1. Adquisición de bloqueo de fila (`WITH (UPDLOCK, ROWLOCK)`) sobre cada producto para prevenir condiciones de carrera (*race conditions*).
  2. Validación final de stock disponible.
  3. Inserción de cabecera en `ORDENES` y captura de `orden_id`.
  4. Inserción de líneas en `DETALLE_ORDEN`.
  5. Descuento atómico de existencias en `PRODUCTOS` (`stock = stock - cantidad`).
  6. Vaciado de los ítems adquiridos en `CARRITO_ITEMS`.
  7. Confirmación con `COMMIT TRANSACTION` o reversión completa con `ROLLBACK TRANSACTION`.

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
