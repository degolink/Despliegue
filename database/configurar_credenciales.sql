-- =====================================================================
-- EJECUTAR EN SQL SERVER MANAGEMENT STUDIO (SSMS)
-- Conéctate como OSO\soyun (Windows Authentication) y corre este script
-- =====================================================================

USE master;
GO

-- 1. Habilitar el usuario 'sa' y definirle una contraseña segura
ALTER LOGIN sa WITH PASSWORD = 'YourStrongPassword123!', CHECK_POLICY = OFF;
ALTER LOGIN sa ENABLE;
GO

-- 2. Crear un usuario dedicado para Mythic Shelf (opcional pero recomendado)
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'mythic_user')
BEGIN
    CREATE LOGIN mythic_user WITH PASSWORD = 'YourStrongPassword123!', CHECK_POLICY = OFF;
END
ELSE
BEGIN
    ALTER LOGIN mythic_user WITH PASSWORD = 'YourStrongPassword123!', CHECK_POLICY = OFF;
END
ALTER LOGIN mythic_user ENABLE;
GO

-- 3. Otorgar permisos de sysadmin / dueño a mythic_user y sa sobre MythicShelfDB
ALTER SERVER ROLE sysadmin ADD MEMBER mythic_user;
GO

USE MythicShelfDB;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'mythic_user')
BEGIN
    CREATE USER mythic_user FOR LOGIN mythic_user;
END
ALTER ROLE db_owner ADD MEMBER mythic_user;
GO

PRINT 'Credenciales configuradas exitosamente para sa y mythic_user en MythicShelfDB.';
GO

