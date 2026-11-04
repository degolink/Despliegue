-- =====================================================================
-- ROTAR LA CONTRASEÑA DE mythic_user Y RETIRAR PRIVILEGIOS EXCESIVOS
-- Ejecutar en SSMS con una cuenta administradora, en modo SQLCMD
-- (menú Consulta > Modo SQLCMD).
--
-- Escriba la nueva contraseña en :setvar (no la suba al repositorio) y
-- actualice DB_PASSWORD en server/.env con el mismo valor.
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

-- 1. Nueva contraseña con política de contraseñas activada
ALTER LOGIN [mythic_user] WITH PASSWORD = N'$(MYTHIC_PASSWORD)', CHECK_POLICY = ON;
ALTER LOGIN [mythic_user] ENABLE;
GO

-- 2. Quitar sysadmin (otorgado por versiones anteriores de los scripts)
IF IS_SRVROLEMEMBER('sysadmin', 'mythic_user') = 1
    ALTER SERVER ROLE sysadmin DROP MEMBER [mythic_user];
GO

-- 3. Mantener únicamente permisos de dueño dentro de MythicShelfDB
USE MythicShelfDB;
GO

ALTER ROLE db_owner ADD MEMBER [mythic_user];
GO

SET NOEXEC OFF;
GO

PRINT 'mythic_user actualizado: contraseña rotada y sin privilegios sysadmin.';
GO
