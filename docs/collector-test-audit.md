# Auditoría y Especificación: Test de Personalidad del Coleccionista

**Proyecto:** Mythic Shelf  
**Documento:** `docs/collector-test-audit.md`  
**Fecha:** 2026-11-04  
**Objetivo:** Auditar el test actual de coleccionismo, analizar la arquitectura MVC existente, proteger la base de datos SQL Server y los datos semilla, y diseñar la integración del nuevo test multidimensional de 20 preguntas sin alteraciones destructivas.

---

## 1. Funcionamiento del Test Actual

Actualmente, el sistema cuenta con un cuestionario elemental de 4 campos lineales (`RF-09` / `CU-06`):
1. **Franquicia de Interés:** Selección única (*Star Wars, Pokémon, Transformers, Nintendo, etc.*).
2. **Categoría Preferida:** Selección única (*Figuras de Acción, Cartas TCG, Videojuegos Retro, etc.*).
3. **Década de Interés:** Selección única (*1970s, 1980s, 1990s, 2000s*).
4. **Rango de Presupuesto:** Monto mínimo y máximo en USD.

### Limitaciones Identificadas:
- **Sesgo cronológico rígido:** Obliga al usuario a elegir una década, asumiendo erróneamente que la nostalgia o edad determina el deseo de compra.
- **Unidimensionalidad:** Reduce el interés del coleccionista a una sola franquicia y categoría, ignorando universos cruzados, arquetipos de personajes, motivaciones de coleccionismo o formatos.
- **Falta de profundidad narrativa:** No contempla momentos icónicos, eventos de sagas, nivel de detalle/rareza ni arquetipos (héroes vs. villanos).

---

## 2. Componentes de Arquitectura Involucrados

El proyecto Mythic Shelf opera bajo una arquitectura desacoplada pero estrictamente alineada a los principios de responsabilidades MVC:

* **Controlador (`Controllers`):**
  - `server/src/controllers/recommendationController.js`: Expone los endpoints `GET /api/recommendations` y `POST /api/recommendations/questionnaire`. Recibe las respuestas, las valida y delega en el servicio.
* **Servicio y Lógica de Negocio (`Services`):**
  - `server/src/services/recommendationService.js`: Contiene el algoritmo de scoring y matching basado en contenido (*Content-Based Matching*), además de la persistencia de preferencias de usuario.
* **Modelo y Persistencia (`Models / Database`):**
  - Tabla SQL Server `dbo.PREFERENCIAS_USUARIO`: Registra `franquicia_interes`, `categoria_preferida`, `decada_interes`, `presupuesto_min`, `presupuesto_max`.
  - Tablas `dbo.PRODUCTOS` y `dbo.CONTEXTO_HISTORICO`: Proveen los datos de los coleccionables sobre los cuales se calcula la afinidad.
* **Vista / Interfaz (`Views / Presentation`):**
  - Componente modal `client/src/components/QuestionnaireModal.jsx`: Encapsula la experiencia visual del cuestionario.
  - Componente banner `client/src/components/RecommendationBanner.jsx`: Despliega el resumen del perfil y el scoring aplicado.
  - Catálogo `client/src/components/Catalog.jsx`: Muestra los productos con badges de puntos de afinidad calculados.

---

## 3. Almacenamiento y Persistencia de Respuestas

- Cuando un usuario está autenticado (`usuario_id`), el backend ejecuta un comando SQL `MERGE` en `dbo.PREFERENCIAS_USUARIO`, insertando o actualizando las columnas fijas.
- Si el usuario es un visitante no autenticado (sesión anónima), las respuestas se evalúan en caliente en memoria durante el ciclo de la solicitud (`customPreferences`), retornando el catálogo ordenado y guardando el estado en el cliente sin requerir persistencia forzada en base de datos.
- **Principio de conservación SQL Server:** Las 5 columnas existentes en `dbo.PREFERENCIAS_USUARIO` (`franquicia_interes`, `categoria_preferida`, `decada_interes`, `presupuesto_min`, `presupuesto_max`) **se mantendrán intactas**. Los atributos multidimensionales del nuevo test de 20 preguntas se derivan a las preferencias primarias para alimentar las columnas existentes y se conservan en memoria/sesión del cliente y del evaluador, evitando cualquier migración destructiva en SQL Server.

---

## 4. Sistema de Scoring Actual vs. Propuesto

### Scoring Actual (Lineal):
$$\text{Score} = (\text{Match Franquicia} \times 3) + (\text{Match Categoría} \times 2) + (\text{Precio en Presupuesto} \times 1)$$

### Scoring Multidimensional Propuesto (Ponderado):
El nuevo perfil calcula afinidad multidimensional evaluando 6 dimensiones ponderadas:

| Dimensión | Ponderación | Factores Evaluados |
| :--- | :---: | :--- |
| **Universos Ficticios** | **25%** | Afinidad hacia Sci-Fi, Fantasía heroica, Superhéroes, Videojuegos clásicos, Anime/Manga. |
| **Categorías de Coleccionismo** | **25%** | Figuras de acción a escala, Cartas TCG, Videojuegos en cartucho/caja, Cómics de época, Objetos de memorabilia. |
| **Personajes y Arquetipos** | **15%** | Héroes legendarios, villanos icónicos, antihéroes, criaturas místicas, droides/robots. |
| **Eventos Narrativos y Escenas** | **15%** | Batallas intergalácticas, debuts en cómics, evoluciones clave, batallas de jefes finales. |
| **Nostalgia y Estilo de Época** | **10%** | Estética vintage, 8-bit/16-bit, era dorada del cómic, lanzamientos fundacionales. |
| **Rareza y Motivación de Compra** | **10%** | Búsqueda del "Santo Grial", empaques sellados (*MISB*), valor de exhibición vs. archivo histórico. |

---

## 5. Asociación de Productos con Respuestas

El catálogo curado de Mythic Shelf contiene 42 coleccionables icónicos (verificados en `server/src/data/collectibles.catalog.js` y `dbo.PRODUCTOS`):
- **Star Wars:** Figuras Kenner 1978 (Luke Skywalker, R2-D2), X-Wing Fighter, Boba Fett 1979, Darth Vader 1977.
- **Transformers / MOTU / G.I. Joe:** Optimus Prime G1 1984, Megatron G1, He-Man 1982, Skeletor, Snake Eyes, Action Soldier 1964.
- **Cómics Históricos:** Action Comics #1 (Superman 1938), Detective Comics #27 (Batman 1939), Amazing Fantasy #15 (Spider-Man 1962), Hulk #181 (Wolverine 1974), Captain America #1 (1941), X-Men #1 (1963).
- **Cartas TCG:** Charizard Holo Base Set 1999, Blastoise, Venusaur, Mewtwo, Pikachu Illustrator, Black Lotus Alpha 1993, Topps Mickey Mantle 1952.
- **Videojuegos Retro:** Super Mario Bros. NES 1985, The Legend of Zelda (cartucho dorado), Game Boy DMG-01, Atari 2600, Sonic the Hedgehog.
- **Líneas Clásicas:** LEGO Space Galaxy Explorer 497, Monorail 6990, Barbie #1 1959, Hot Wheels Redline Camaro 1968, Tamagotchi 1996, Reloj Mickey Mouse Ingersoll 1933.

Las respuestas del nuevo test mapean vectorialmente a las palabras clave, franquicias, categorías y relevancia histórica presentes en `dbo.PRODUCTOS` y `dbo.CONTEXTO_HISTORICO`. Cada recomendación despliega la justificación explícita de por qué fue seleccionada para el perfil del usuario.

---

## 6. Entidades de Base de Datos y Semillas a Reutilizar

1. **`dbo.USUARIOS`**: Cuentas existentes (`admin@mythicshelf.com`, `seller@mythicshelf.com`, `buyer@mythicshelf.com`).
2. **`dbo.PREFERENCIAS_USUARIO`**: Reutilizada directamente sin alterar tipos de datos ni añadir columnas obligatorias.
3. **`dbo.PRODUCTOS`**: Reutilizada completamente con sus 42 registros sembrados.
4. **`dbo.CONTEXTO_HISTORICO`**: Reutilizada para cruce de procedencia y autenticidad.
5. **Semillas protegidas**: `server/src/scripts/seedCatalog.js`, `server/src/data/collectibles.catalog.js`, `database/schema.sql`. Ningún archivo de semillas será alterado ni regenerado.

---

## 7. Tabla Comparativa de Funcionalidad

| Funcionalidad Existente | Mejora Propuesta | Archivos Existentes a Reutilizar | Cambios Requeridos |
| :--- | :--- | :--- | :--- |
| Cuestionario simple de 4 preguntas (`QuestionnaireModal.jsx`) | Test interactivo de 20 preguntas con navegación paso a paso, barra de progreso y preservación de respuestas | `client/src/components/QuestionnaireModal.jsx` | Rediseñar el componente para soportar 20 pantallas interactivas, tarjetas visuales, botón anterior/siguiente y confirmación |
| Puntuación plana (+3, +2, +1) | Motor de recomendación multidimensional con 6 dimensiones configurables y explicación del match | `server/src/services/recommendationService.js`, `server/src/controllers/recommendationController.js` | Extender el evaluador de puntuación para ponderar las dimensiones analizadas |
| Validación Zod rígida de 4 campos | Esquema Zod flexible que acepta tanto las respuestas detalladas del test como las preferencias sintetizadas | `server/src/validators/index.js` | Actualizar `questionnaireSchema` para aceptar `respuestas_test` opcionales sin romper contratos existentes |
| Banco de preguntas y ponderaciones | Módulo declarativo estructurado con 20 preguntas y opciones ricas en español | Nuevo módulo compartido `client/src/data/personalityQuiz.js` y `server/src/data/quizQuestions.js` | Crear catálogo inmutable con las 20 preguntas, opciones, universos, personajes y formatos |

---

## 8. Conclusión sobre Modificaciones a la Base de Datos

**¿Son necesarias modificaciones en la base de datos SQL Server?**  
**NO.** La estructura relacional existente (`dbo.PREFERENCIAS_USUARIO`, `dbo.PRODUCTOS`, `dbo.CONTEXTO_HISTORICO`) es perfectamente capaz de soportar la persistencia de las preferencias principales inferidas del test, mientras que el desglose multidimensional y el cálculo de afinidad se resuelven de forma limpia y eficiente en la capa de servicios de la aplicación. No se ejecutarán scripts destructivos ni migraciones DDL adicionales.
