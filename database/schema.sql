-- =====================================================================
-- PROYECTO: MYTHIC SHELF - E-COMMERCE B2C DE COLECCIONABLES
-- SCRIPT DDL: CREACIÓN DE BASE DE DATOS Y TABLAS EN SQL SERVER
-- Motor: Microsoft SQL Server (2019 / 2022 / Azure SQL)
-- =====================================================================

-- 1. CREACIÓN DE LA BASE DE DATOS (Si no existe)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MythicShelfDB')
BEGIN
    CREATE DATABASE MythicShelfDB;
END
GO

USE MythicShelfDB;
GO

-- =====================================================================
-- LIMPIEZA DE TABLAS PREVIAS (DROP ORDENADO POR DEPENDENCIAS)
-- =====================================================================
IF OBJECT_ID(N'dbo.DETALLE_ORDEN', N'U') IS NOT NULL DROP TABLE dbo.DETALLE_ORDEN;
IF OBJECT_ID(N'dbo.ORDENES', N'U') IS NOT NULL DROP TABLE dbo.ORDENES;
IF OBJECT_ID(N'dbo.CARRITO_ITEMS', N'U') IS NOT NULL DROP TABLE dbo.CARRITO_ITEMS;
IF OBJECT_ID(N'dbo.CONTEXTO_HISTORICO', N'U') IS NOT NULL DROP TABLE dbo.CONTEXTO_HISTORICO;
IF OBJECT_ID(N'dbo.PRODUCTOS', N'U') IS NOT NULL DROP TABLE dbo.PRODUCTOS;
IF OBJECT_ID(N'dbo.PREFERENCIAS_USUARIO', N'U') IS NOT NULL DROP TABLE dbo.PREFERENCIAS_USUARIO;
IF OBJECT_ID(N'dbo.USUARIOS', N'U') IS NOT NULL DROP TABLE dbo.USUARIOS;
GO

-- =====================================================================
-- TABLA 1: USUARIOS
-- =====================================================================
CREATE TABLE dbo.USUARIOS (
    usuario_id INT IDENTITY(1,1) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(100) NOT NULL,
    hash_contrasena VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    fecha_registro DATETIME DEFAULT GETDATE(),
    estado_cuenta BIT DEFAULT 1,
    reset_token VARCHAR(255) NULL,
    reset_token_expira DATETIME NULL,
    CONSTRAINT PK_USUARIOS PRIMARY KEY CLUSTERED (usuario_id ASC),
    CONSTRAINT UQ_USUARIOS_correo UNIQUE (correo_electronico),
    CONSTRAINT CK_USUARIOS_rol CHECK (rol IN ('Comprador', 'Vendedor', 'Administrador'))
);
GO

-- =====================================================================
-- TABLA 2: PREFERENCIAS_USUARIO
-- =====================================================================
CREATE TABLE dbo.PREFERENCIAS_USUARIO (
    preferencia_id INT IDENTITY(1,1) NOT NULL,
    usuario_id INT NOT NULL,
    franquicia_interes VARCHAR(100) NULL,
    categoria_preferida VARCHAR(50) NULL,
    decada_interes VARCHAR(20) NULL,
    presupuesto_min DECIMAL(10,2) NULL,
    presupuesto_max DECIMAL(10,2) NULL,
    CONSTRAINT PK_PREFERENCIAS_USUARIO PRIMARY KEY CLUSTERED (preferencia_id ASC),
    CONSTRAINT UQ_PREFERENCIAS_usuario UNIQUE (usuario_id),
    CONSTRAINT FK_PREFERENCIAS_USUARIOS FOREIGN KEY (usuario_id) 
        REFERENCES dbo.USUARIOS(usuario_id) ON DELETE CASCADE,
    CONSTRAINT CK_PREFERENCIAS_presupuesto CHECK (
        (presupuesto_min IS NULL OR presupuesto_min >= 0) AND
        (presupuesto_max IS NULL OR presupuesto_max >= 0) AND
        (presupuesto_min IS NULL OR presupuesto_max IS NULL OR presupuesto_max >= presupuesto_min)
    )
);
GO

-- =====================================================================
-- TABLA 3: PRODUCTOS
-- =====================================================================
CREATE TABLE dbo.PRODUCTOS (
    producto_id INT IDENTITY(1,1) NOT NULL,
    vendedor_id INT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    franquicia VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    decada VARCHAR(20) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    estado_conservacion VARCHAR(30) NOT NULL,
    stock INT NOT NULL DEFAULT 1,
    imagen_url VARCHAR(255) NULL,
    fecha_publicacion DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_PRODUCTOS PRIMARY KEY CLUSTERED (producto_id ASC),
    CONSTRAINT FK_PRODUCTOS_USUARIOS FOREIGN KEY (vendedor_id) 
        REFERENCES dbo.USUARIOS(usuario_id),
    CONSTRAINT CK_PRODUCTOS_precio CHECK (precio >= 0),
    CONSTRAINT CK_PRODUCTOS_stock CHECK (stock >= 0)
);
GO

-- =====================================================================
-- TABLA 4: CONTEXTO_HISTORICO
-- =====================================================================
CREATE TABLE dbo.CONTEXTO_HISTORICO (
    contexto_id INT IDENTITY(1,1) NOT NULL,
    producto_id INT NOT NULL,
    ano_fabricacion INT NOT NULL,
    tirada_produccion VARCHAR(100) NULL,
    procedencia VARCHAR(150) NULL,
    variantes_diseno NVARCHAR(MAX) NULL,
    relevancia_cultural NVARCHAR(MAX) NULL,
    nivel_autenticidad VARCHAR(50) NULL,
    CONSTRAINT PK_CONTEXTO_HISTORICO PRIMARY KEY CLUSTERED (contexto_id ASC),
    CONSTRAINT UQ_CONTEXTO_producto UNIQUE (producto_id),
    CONSTRAINT FK_CONTEXTO_PRODUCTOS FOREIGN KEY (producto_id) 
        REFERENCES dbo.PRODUCTOS(producto_id) ON DELETE CASCADE,
    CONSTRAINT CK_CONTEXTO_ano CHECK (ano_fabricacion >= 1800 AND ano_fabricacion <= YEAR(GETDATE()) + 1)
);
GO

-- =====================================================================
-- TABLA 5: CARRITO_ITEMS
-- =====================================================================
CREATE TABLE dbo.CARRITO_ITEMS (
    item_id INT IDENTITY(1,1) NOT NULL,
    usuario_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_agregado DATETIME DEFAULT GETDATE(),
    CONSTRAINT PK_CARRITO_ITEMS PRIMARY KEY CLUSTERED (item_id ASC),
    CONSTRAINT UQ_CARRITO_usuario_producto UNIQUE (usuario_id, producto_id),
    CONSTRAINT FK_CARRITO_USUARIOS FOREIGN KEY (usuario_id) 
        REFERENCES dbo.USUARIOS(usuario_id) ON DELETE CASCADE,
    CONSTRAINT FK_CARRITO_PRODUCTOS FOREIGN KEY (producto_id) 
        REFERENCES dbo.PRODUCTOS(producto_id),
    CONSTRAINT CK_CARRITO_cantidad CHECK (cantidad > 0)
);
GO

-- =====================================================================
-- TABLA 6: ORDENES
-- =====================================================================
CREATE TABLE dbo.ORDENES (
    orden_id INT IDENTITY(1,1) NOT NULL,
    comprador_id INT NOT NULL,
    fecha_orden DATETIME DEFAULT GETDATE(),
    total DECIMAL(10,2) NOT NULL,
    direccion_envio VARCHAR(255) NOT NULL,
    metodo_envio VARCHAR(50) NOT NULL,
    estado_orden VARCHAR(20) NOT NULL DEFAULT 'Completada',
    CONSTRAINT PK_ORDENES PRIMARY KEY CLUSTERED (orden_id ASC),
    CONSTRAINT FK_ORDENES_USUARIOS FOREIGN KEY (comprador_id) 
        REFERENCES dbo.USUARIOS(usuario_id),
    CONSTRAINT CK_ORDENES_total CHECK (total >= 0),
    CONSTRAINT CK_ORDENES_estado CHECK (estado_orden IN ('Pendiente', 'Procesando', 'Enviada', 'Completada', 'Cancelada'))
);
GO

-- =====================================================================
-- TABLA 7: DETALLE_ORDEN
-- =====================================================================
CREATE TABLE dbo.DETALLE_ORDEN (
    detalle_id INT IDENTITY(1,1) NOT NULL,
    orden_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_DETALLE_ORDEN PRIMARY KEY CLUSTERED (detalle_id ASC),
    CONSTRAINT FK_DETALLE_ORDENES FOREIGN KEY (orden_id) 
        REFERENCES dbo.ORDENES(orden_id) ON DELETE CASCADE,
    CONSTRAINT FK_DETALLE_PRODUCTOS FOREIGN KEY (producto_id) 
        REFERENCES dbo.PRODUCTOS(producto_id),
    CONSTRAINT CK_DETALLE_cantidad CHECK (cantidad > 0),
    CONSTRAINT CK_DETALLE_precio CHECK (precio_unitario >= 0)
);
GO

-- =====================================================================
-- ÍNDICES ESTRATÉGICOS PARA CONSULTAS Y FILTRADO EN TIEMPO REAL
-- =====================================================================
CREATE NONCLUSTERED INDEX IX_PRODUCTOS_franquicia_categoria_precio 
ON dbo.PRODUCTOS (franquicia, categoria, decada, precio)
INCLUDE (nombre, stock, imagen_url);

CREATE NONCLUSTERED INDEX IX_CARRITO_ITEMS_usuario 
ON dbo.CARRITO_ITEMS (usuario_id)
INCLUDE (producto_id, cantidad);

CREATE NONCLUSTERED INDEX IX_ORDENES_comprador 
ON dbo.ORDENES (comprador_id, fecha_orden DESC);
GO

-- =====================================================================
-- DATOS SEMILLA (SEEDS) PARA PRUEBAS INICIALES
-- =====================================================================
-- 1. Usuarios de prueba (contraseña por defecto encriptada: 'Mythic2024!')
-- Hash bcrypt representativo para '$2a$10$wT8hTqL1l18z...':
INSERT INTO dbo.USUARIOS (nombre_completo, correo_electronico, hash_contrasena, rol, estado_cuenta)
VALUES 
('Lord Collector Admin', 'admin@mythicshelf.com', '$2b$10$ep5rF04w8.m25iOwhgZ6mO8mP2tZtJ84h65tX4a/6Y.1rYh23mG5O', 'Administrador', 1),
('Obi-Wan Vintage Seller', 'seller@mythicshelf.com', '$2b$10$ep5rF04w8.m25iOwhgZ6mO8mP2tZtJ84h65tX4a/6Y.1rYh23mG5O', 'Vendedor', 1),
('Luke Skywalker Collector', 'buyer@mythicshelf.com', '$2b$10$ep5rF04w8.m25iOwhgZ6mO8mP2tZtJ84h65tX4a/6Y.1rYh23mG5O', 'Comprador', 1);

-- 2. Preferencias del comprador
INSERT INTO dbo.PREFERENCIAS_USUARIO (usuario_id, franquicia_interes, categoria_preferida, decada_interes, presupuesto_min, presupuesto_max)
VALUES 
(3, 'Star Wars', 'Figuras de Acción', '1970s', 50.00, 1500.00);

-- 3. Catálogo de Coleccionables Emblemáticos
INSERT INTO dbo.PRODUCTOS (vendedor_id, nombre, franquicia, categoria, decada, precio, estado_conservacion, stock, imagen_url)
VALUES 
(2, 'Darth Vader 1977 Kenner Telescoping Lightsaber', 'Star Wars', 'Figuras de Acción', '1970s', 1250.00, 'Mint in Sealed Box (MISB)', 2, 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=800'),
(2, 'Charizard 1st Edition Shadowless Base Set (PSA 9)', 'Pokémon', 'Cartas TCG', '1990s', 2400.00, 'Gem Mint / Graded PSA 9', 1, 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800'),
(2, 'Optimus Prime G1 1984 Original Hasbro/Takara', 'Transformers', 'Figuras de Acción', '1980s', 680.00, 'Near Mint C-9', 3, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800'),
(2, 'Boba Fett Kenner 21 Back-A Vintage 1979', 'Star Wars', 'Figuras de Acción', '1970s', 890.00, 'AFA 85 Graded', 1, 'https://images.unsplash.com/photo-1579566346927-c68383817a25?w=800'),
(2, 'Super Mario Bros. Cartucho Sellado NES 1985', 'Nintendo', 'Videojuegos Retro', '1980s', 1800.00, 'Wata Graded 9.2 A+', 1, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'),
(2, 'Millennium Falcon Vintage Kenner 1979 Complete', 'Star Wars', 'Vehículos y Naves', '1970s', 540.00, 'Excellent Condition C-8', 2, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800');

-- 4. Contexto Histórico de los Coleccionables
INSERT INTO dbo.CONTEXTO_HISTORICO (producto_id, ano_fabricacion, tirada_produccion, procedencia, variantes_diseno, relevancia_cultural, nivel_autenticidad)
VALUES 
(1, 1977, 'Aprox. 5,000 unidades en primer lote con sable doble', 'Cincinnati, Ohio, EE.UU.', 'Sable de luz con mecanismo telescópico doble retráctil, reemplazado rápidamente por el filamento simple debido a su fragilidad.', 'Pieza fundacional del fenómeno del merchandising moderno de Star Wars impulsado por George Lucas.', 'Certificado AFA 85 NM+'),
(2, 1999, 'Tirada limitada Shadowless pre-Unlimited', 'Wizards of the Coast, Washington, EE.UU.', 'Carente de sombra a la derecha del recuadro de la ilustración ("Shadowless") e icono "1st Edition" a la izquierda.', 'El Santo Grial del TCG en occidente; catalizador de la fiebre global de Pokémon a finales de los 90.', 'Certificación PSA Graded #48192837'),
(3, 1984, 'Primera tirada manufacturada en Japón (Diaclone crossover)', 'Takara Corp / Hasbro, Tokio, Japón', 'Versión inicial con remolque azul metalizado y detalles cromados en la cabina antes de las revisiones de plástico abarrotadas.', 'Hito de la ingeniería de juguetes transformables que definió la animación y el coleccionismo ochentero.', 'Inspeccionado por curador Mythic Shelf'),
(4, 1979, 'Primera ola de lanzamiento de El Imperio Contraataca', 'Kenner Products, Hong Kong', 'Reverso de tarjeta con 21 figuras impresas. Mecanismo de disparo de cohete cancelado por normativas de seguridad.', 'El misterioso cazarrecompensas que cautivó al fandom antes de pronunciar una sola palabra en cines.', 'Certificado AFA 85'),
(5, 1985, 'Tirada inicial de lanzamiento en Norteamérica (Hangtab)', 'Nintendo of America, Redmond, WA', 'Caja con pestaña de cartón perforada (Hangtab) anterior al código de barras moderno.', 'El título que rescató la industria de los videojuegos tras el colapso de 1983 e inauguró la era de Shigeru Miyamoto.', 'Graduado Wata 9.2 A+'),
(6, 1979, 'Lanzamiento original Star Wars A New Hope', 'Kenner Products, EE.UU.', 'Cabina funcional para 2 figuras, torreta giratoria y juego de mesa táctico Dejarik holográfico interno.', 'El vehículo más icónico del cine de ciencia ficción; revolucionó la escala de los playsets infantiles.', 'Verificación de autenticidad de plásticos vintage');
GO

PRINT 'Base de datos MythicShelfDB y tablas creadas exitosamente con datos semilla.';
GO

