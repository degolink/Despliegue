-- =====================================================================
-- EJECUTAR EN SSMS (ACTUALIZAR CONTRASEÑA Y PERMISOS EXISTENTES)
-- =====================================================================

USE master;
GO

-- 1. Actualizar contraseña y activar el login 'mythic_user'
ALTER LOGIN [mythic_user] WITH PASSWORD = 'YourStrongPassword123!', CHECK_POLICY = OFF;
ALTER LOGIN [mythic_user] ENABLE;
ALTER SERVER ROLE sysadmin ADD MEMBER [mythic_user];
GO

-- 2. Asegurar permisos de dueño dentro de MythicShelfDB
USE MythicShelfDB;
GO

ALTER ROLE db_owner ADD MEMBER [mythic_user];
GO

PRINT 'Usuario mythic_user actualizado con la contrasena YourStrongPassword123! y permisos completos.';
GO

