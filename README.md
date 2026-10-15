# 🏛️ Mythic Shelf — Plataforma E-commerce B2C de Coleccionables

Mythic Shelf es una plataforma de comercio electrónico de grado empresarial especializada en coleccionables de alto valor, figuras vintage, cartas TCG raras y reliquias de la cultura pop con procedencia y autenticidad verificadas.

---

## 🛠️ Stack Tecnológico y Arquitectura

- **Backend:** Node.js con Express.js (Arquitectura modular en capas: Controllers, Services, Middlewares, Validators y Routes).
- **Frontend:** React 18 SPA con Vite, Tailwind CSS y componentes estilizados temáticos para coleccionistas.
- **Base de Datos:** Microsoft SQL Server (Transacciones ACID, bloqueos de fila con `UPDLOCK`, DDL relacional estricto con restricciones CHECK y claves foráneas).
- **Seguridad:** Autenticación con JWT (JSON Web Tokens), cifrado de contraseñas con `bcrypt` (10 rounds de salt), y validación de esquemas con `Zod`.
- **Servicio SMTP:** Nodemailer para correos de bienvenida y tokens temporales de recuperación de credenciales.
- **Motor de Recomendaciones:** Algoritmo Content-Based Matching con scoring dinámico (+3 Franquicia, +2 Categoría, +1 Rango de Presupuesto).

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
│       ├── server.js               # Punto de entrada y conexión a la base de datos
│       ├── config/
│       │   ├── db.js               # Conexión y Pool de Microsoft SQL Server (mssql)
│       │   └── mailer.js           # Servicio SMTP con Nodemailer
│       ├── controllers/
│       │   ├── authController.js   # GUS: Login, registro, perfil y recuperación por correo
│       │   ├── productController.js# CAT / CH: Catálogo, filtros en vivo y detalle histórico
│       │   ├── cartController.js   # CAR: Gestión de carrito y validación de stock en tiempo real
│       │   ├── checkoutController.js # CHK: Checkout transaccional
│       │   └── recommendationController.js # REC: Motor de recomendaciones y cuestionario
│       ├── services/
│       │   ├── checkoutService.js  # Transacción atómica ACID (UPDLOCK, decremento de stock, limpieza de carrito)
│       │   └── recommendationService.js # Content-Based Matching (+3 Franquicia, +2 Categoría, +1 Precio)
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
    ├── vite.config.js
    ├── tailwind.config.js
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

## 🚀 Puesta en Marcha

### 1. Base de Datos (SQL Server)
Ejecuta el script DDL ubicado en `database/schema.sql` en tu instancia de SQL Server Management Studio (SSMS), Azure Data Studio o sqlcmd:
```sql
sqlcmd -S localhost -U sa -P YourStrongPassword123! -i database/schema.sql
```

### 2. Backend
```bash
cd server
npm install
npm run dev
```
El servidor quedará disponible en `http://localhost:5000`. Puedes verificar su estado en `http://localhost:5000/health`.

### 3. Frontend
```bash
cd client
npm install
npm run dev
```
La aplicación web se iniciará en `http://localhost:5173`.

