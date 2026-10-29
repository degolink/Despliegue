-- =====================================================================
-- MIGRACIÓN ADITIVA 001: IMAGENES_PRODUCTO
-- Registra la procedencia, atribución y licencia de cada imagen de un
-- coleccionable. NO modifica ni elimina tablas existentes y es idempotente
-- (se puede ejecutar varias veces). A diferencia de schema.sql, NO borra datos.
-- =====================================================================
USE MythicShelfDB;
GO

IF OBJECT_ID(N'dbo.IMAGENES_PRODUCTO', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.IMAGENES_PRODUCTO (
        imagen_id INT IDENTITY(1,1) NOT NULL,
        producto_id INT NOT NULL,
        url VARCHAR(500) NOT NULL,
        es_principal BIT NOT NULL CONSTRAINT DF_IMAGENES_principal DEFAULT 1,
        fuente VARCHAR(50) NOT NULL,
        pagina_fuente VARCHAR(500) NULL,
        atribucion NVARCHAR(500) NULL,
        licencia VARCHAR(100) NULL,
        restricciones NVARCHAR(500) NULL,
        fecha_verificacion DATETIME NOT NULL CONSTRAINT DF_IMAGENES_fecha DEFAULT GETDATE(),
        CONSTRAINT PK_IMAGENES_PRODUCTO PRIMARY KEY CLUSTERED (imagen_id ASC),
        CONSTRAINT UQ_IMAGENES_producto_url UNIQUE (producto_id, url),
        CONSTRAINT FK_IMAGENES_PRODUCTOS FOREIGN KEY (producto_id)
            REFERENCES dbo.PRODUCTOS(producto_id) ON DELETE CASCADE
    );
END
GO
