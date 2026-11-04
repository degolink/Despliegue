-- =====================================================================
-- CONFIGURACIÓN DEL LOGIN DE LA APLICACIÓN (mythic_user)
-- Ejecutar en SSMS con una cuenta administradora (Windows Authentication).
--
-- IMPORTANTE: active el modo SQLCMD antes de ejecutar
--   (menú Consulta > Modo SQLCMD). Sin él, la línea :setvar da error y
--   el script no se ejecuta, lo cual es intencional.
--
-- 1. Escriba una contraseña robusta en :setvar (no la suba al repositorio).
-- 2. Use la misma contraseña en DB_PASSWORD de server/.env.
--
-- Principio de mínimo privilegio: mythic_user es db_owner SOLO de
-- MythicShelfDB. NO es sysadmin del servidor y no se habilita la cuenta 'sa'.
-- Requisito: la base MythicShelfDB ya debe existir (créela una vez como
-- administrador o ejecute schema.sql con una cuenta administradora).
-- =====================================================================

:setvar MYTHIC_PASSWORD ""

USE master;
GO

IF N'$(MYTHIC_PASSWORD)' = N''
BEGIN
    RAISERROR('Defina MYTHIC_PASSWORD con :setvar antes de ejecutar este script.', 16, 1);
    SET NOEXEC ON;
END
GO

-- 1. Crear o actualizar el login con la política de contraseñas de Windows activada
IF NOT EXISTS (SELECT name FROM sys.server_principals WHERE name = 'mythic_user')
BEGIN
    CREATE LOGIN mythic_user WITH PASSWORD = N'$(MYTHIC_PASSWORD)', CHECK_POLICY = ON;
END
ELSE
BEGIN
    ALTER LOGIN mythic_user WITH PASSWORD = N'$(MYTHIC_PASSWORD)', CHECK_POLICY = ON;
END
ALTER LOGIN mythic_user ENABLE;
GO

-- 2. Retirar privilegios de servidor si una versión anterior de este script los otorgó
IF IS_SRVROLEMEMBER('sysadmin', 'mythic_user') = 1
    ALTER SERVER ROLE sysadmin DROP MEMBER mythic_user;
GO

-- 3. Permisos de dueño únicamente dentro de MythicShelfDB
USE MythicShelfDB;
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'mythic_user')
BEGIN
    CREATE USER mythic_user FOR LOGIN mythic_user;
END
ALTER ROLE db_owner ADD MEMBER mythic_user;
GO

SET NOEXEC OFF;
GO

PRINT 'mythic_user configurado como db_owner de MythicShelfDB (sin sysadmin).';
GO
