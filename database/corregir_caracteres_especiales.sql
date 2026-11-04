-- =====================================================================
-- CORRECCIÓN DE ENCODING / MOJIBAKE EN MythicShelfDB
-- Ejecutar en SQL Server Management Studio (SSMS) conectándote a localhost
-- =====================================================================

USE MythicShelfDB;
GO

-- 1. Corregir franquicia en la tabla PRODUCTOS
UPDATE dbo.PRODUCTOS
SET franquicia = N'Pokémon'
WHERE franquicia LIKE '%Pok%mon%' OR franquicia LIKE '%PokÃ©mon%';

-- 2. Corregir nombre en la tabla PRODUCTOS
UPDATE dbo.PRODUCTOS
SET nombre = N'Charizard 1st Edition Shadowless Base Set (PSA 9)'
WHERE producto_id = 2;

-- 3. Corregir textos con tildes en CONTEXTO_HISTORICO
UPDATE dbo.CONTEXTO_HISTORICO
SET 
  variantes_diseno = REPLACE(REPLACE(variantes_diseno, 'telescpico', 'telescópico'), 'rpidamente', 'rápidamente'),
  relevancia_cultural = REPLACE(REPLACE(relevancia_cultural, 'fenmeno', 'fenómeno'), 'Pokmon', 'Pokémon')
WHERE relevancia_cultural LIKE '%Pok%' OR variantes_diseno LIKE '%%';

UPDATE dbo.CONTEXTO_HISTORICO
SET 
  relevancia_cultural = N'El Santo Grial del TCG en occidente; catalizador de la fiebre global de Pokémon a finales de los 90.'
WHERE producto_id = 2;

-- 4. Corregir PREFERENCIAS_USUARIO si existieran
UPDATE dbo.PREFERENCIAS_USUARIO
SET franquicia_interes = N'Pokémon'
WHERE franquicia_interes LIKE '%Pok%mon%' OR franquicia_interes LIKE '%PokÃ©mon%';

GO

-- Verificación de resultados
SELECT producto_id, nombre, franquicia FROM dbo.PRODUCTOS WHERE franquicia = N'Pokémon';
SELECT DISTINCT franquicia FROM dbo.PRODUCTOS;
GO

PRINT 'Caracteres especiales corregidos exitosamente en MythicShelfDB.';
GO

