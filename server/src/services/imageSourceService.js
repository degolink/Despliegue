/**
 * Servicio de resolución y validación de imágenes de coleccionables.
 *
 * Fuentes soportadas (en orden de preferencia del proyecto):
 *   - 'commons'     → Wikimedia Commons (licencia documentada por imagen; solo se aceptan
 *                      dominio público, CC0, CC BY y CC BY-SA; se rechazan NC/ND/fair use).
 *   - 'pokemontcg'  → Pokémon TCG API (imagen enlazada como referencia; NO es licencia abierta).
 *   - 'none'        → sin imagen reutilizable; solo se registra la página de referencia.
 *
 * Reglas: no se descargan binarios, no se evaden restricciones, se respetan los límites de
 * tasa (pausas entre peticiones) y se usa un User-Agent identificable, como exige Wikimedia.
 * Sin dependencias nuevas: usa `fetch` nativo (Node >= 18).
 */

const MAX_IMAGE_URL_LENGTH = 255; // PRODUCTOS.imagen_url es VARCHAR(255)
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 20000;

const USER_AGENT =
  process.env.WIKIMEDIA_USER_AGENT ||
  'MythicShelfCatalogSeed/1.0 (configura WIKIMEDIA_USER_AGENT con un contacto real)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const clip = (value, max) => {
  if (value == null) return null;
  const s = String(value);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/** fetch con timeout y reintentos con backoff ante 429 / 5xx / errores de red. */
const fetchWithRetry = async (url, options = {}, tries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json,image/*;q=0.8', ...(options.headers || {}) },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get('retry-after')) || attempt * 2;
        lastError = new Error(`HTTP ${res.status} en ${url}`);
        if (attempt < tries) await sleep(retryAfter * 1000);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < tries) await sleep(attempt * 1500);
    }
  }
  throw lastError;
};

/**
 * Verifica que la URL responda 200 con Content-Type image/* y un tamaño razonable.
 * Prueba HEAD y, si el servidor no lo permite, un GET con Range de 1 byte.
 */
const validateImageUrl = async (url) => {
  if (!url || typeof url !== 'string' || !/^https:\/\//i.test(url)) {
    return { ok: false, reason: 'URL no https' };
  }
  // La longitud no se valida aquí: si la imagen se descarga, la URL remota no se guarda en
  // PRODUCTOS.imagen_url (VARCHAR 255); el seed aplica MAX_IMAGE_URL_LENGTH al guardar enlaces remotos.
  try {
    let res = await fetchWithRetry(url, { method: 'HEAD' }, 2);
    if (res.status === 405 || res.status === 403 || res.status === 501) {
      res = await fetchWithRetry(url, { method: 'GET', headers: { Range: 'bytes=0-0' } }, 2);
    }
    if (!(res.status === 200 || res.status === 206)) return { ok: false, reason: `HTTP ${res.status}` };
    const type = (res.headers.get('content-type') || '').toLowerCase();
    if (!type.startsWith('image/')) return { ok: false, reason: `Content-Type no es imagen (${type || 'vacío'})` };
    const length = Number(res.headers.get('content-length'));
    if (res.status === 200 && length && length > MAX_IMAGE_BYTES) {
      return { ok: false, reason: `Imagen demasiado pesada (${length} bytes)` };
    }
    return { ok: true, contentType: type };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
};

// ---------------------------------------------------------------------------
// Pokémon TCG API
// ---------------------------------------------------------------------------
const POKEMON_API = 'https://api.pokemontcg.io/v2';

const resolvePokemonTcg = async (spec) => {
  const headers = process.env.POKEMONTCG_API_KEY ? { 'X-Api-Key': process.env.POKEMONTCG_API_KEY } : {};
  let card = null;

  if (spec.id) {
    const res = await fetchWithRetry(`${POKEMON_API}/cards/${encodeURIComponent(spec.id)}`, { headers });
    if (res.ok) card = (await res.json()).data || null;
  }
  if (!card && spec.query) {
    const url = `${POKEMON_API}/cards?q=${encodeURIComponent(spec.query)}&pageSize=1&select=id,name,images,set,number,rarity`;
    const res = await fetchWithRetry(url, { headers });
    if (res.ok) card = ((await res.json()).data || [])[0] || null;
  }
  if (!card) return { error: 'Carta no encontrada en Pokémon TCG API' };

  const url = card.images && (card.images.large || card.images.small);
  if (!url) return { error: 'La carta no trae imagen' };

  return {
    fuente: 'pokemontcg',
    url,
    pagina_fuente: `${POKEMON_API}/cards/${card.id}`,
    atribucion: '© Nintendo / Creatures Inc. / GAME FREAK inc. / The Pokémon Company. Imagen vía Pokémon TCG API (pokemontcg.io).',
    licencia: 'Propietaria (enlace de referencia)',
    restricciones:
      'Imagen enlazada, no descargada ni redistribuida. No es una licencia abierta: confirmar los términos de The Pokémon Company y de pokemontcg.io antes de uso comercial.',
    meta: { cardId: card.id, nombre: card.name, set: card.set && card.set.name, fechaSet: card.set && card.set.releaseDate, rareza: card.rarity },
  };
};

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const ACCEPTED_LICENSE = /^(public domain|pd\b|cc0|cc[ -]by(?:[ -]sa)? \d)/i;
const REJECTED_LICENSE = /(^|[\s-])(nc|nd)([\s-]|$)|fair use|non-?free/i;

// La búsqueda de Commons exige TODAS las palabras: las consultas largas suelen dar 0 resultados.
// Si eso ocurre, se reintenta sin años ni palabras genéricas (mustMatch/exclude siguen filtrando).
const GENERIC_WORDS = /\b(\d{4}|vintage|original|first|toy|figure|action|doll|console|cartridge|cover|comic|card|inch|12)\b/gi;

const commonsQueries = (query) => {
  const reduced = query.replace(GENERIC_WORDS, ' ').replace(/\s+/g, ' ').trim();
  return [...new Set([query, reduced].filter((q) => q.length > 2))];
};

const IMAGEINFO_PARAMS = {
  action: 'query',
  format: 'json',
  prop: 'imageinfo',
  iiprop: 'url|mime|size|extmetadata',
  iiurlwidth: '800',
  iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|NonFree|Restrictions|AttributionRequired',
};

const queryCommons = async (params) => {
  const res = await fetchWithRetry(`${COMMONS_API}?${new URLSearchParams({ ...IMAGEINFO_PARAMS, ...params })}`);
  if (!res.ok) throw new Error(`Commons respondió HTTP ${res.status}`);
  return Object.values(((await res.json()).query || {}).pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
};

const searchCommons = (query) =>
  queryCommons({ generator: 'search', gsrsearch: `${query} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '20' });

/** Archivo concreto de Commons elegido a mano (p. ej. una imagen similar). Se validan licencia y URL igual. */
const resolveCommonsFile = async (spec) => {
  const rejected = [];
  const pages = (await queryCommons({ titles: spec.title })).filter((p) => !('missing' in p));
  const found = await pickCommonsCandidate({}, pages, rejected);
  if (found.image) return found.image;
  return { error: pages.length ? 'El archivo no cumplió licencia/validación' : `No existe en Commons: ${spec.title}`, rejected };
};

const resolveCommons = async (spec) => {
  const rejected = [];
  let seenAny = false;

  for (const query of commonsQueries(spec.query)) {
    const found = await pickCommonsCandidate(spec, await searchCommons(query), rejected);
    if (found.image) return found.image;
    seenAny = seenAny || found.seen;
    await sleep(300);
  }
  return { error: seenAny ? 'Ningún candidato cumplió licencia/título/validación' : 'Sin resultados en Commons', rejected };
};

const pickCommonsCandidate = async (spec, pages, rejected) => {
  for (const page of pages) {
    const title = page.title || '';
    const info = (page.imageinfo || [])[0];
    if (!info) continue;
    const md = info.extmetadata || {};
    const license = (md.LicenseShortName && md.LicenseShortName.value) || '';

    if (spec.mustMatch && !spec.mustMatch.test(title)) { rejected.push(`${title}: no coincide con el título esperado`); continue; }
    if (spec.exclude && spec.exclude.test(title)) { rejected.push(`${title}: excluido por patrón`); continue; }
    if (!/^image\/(jpeg|png|webp)$/.test(info.mime || '')) { rejected.push(`${title}: mime ${info.mime}`); continue; }
    if ((info.width || 0) < 400) { rejected.push(`${title}: resolución baja`); continue; }
    if (md.NonFree && String(md.NonFree.value).toLowerCase() === 'true') { rejected.push(`${title}: no libre`); continue; }
    if (!ACCEPTED_LICENSE.test(license) || REJECTED_LICENSE.test(license)) { rejected.push(`${title}: licencia no aceptada (${license || 'sin dato'})`); continue; }

    // Commons añade parámetros de seguimiento (?utm_...) que solo alargan la URL.
    const url = (info.thumburl || info.url).replace(/\?utm_[^#]*$/, '');
    const check = await validateImageUrl(url);
    if (!check.ok) { rejected.push(`${title}: ${check.reason}`); continue; }

    const author = clip(stripHtml(md.Artist && md.Artist.value) || stripHtml(md.Credit && md.Credit.value) || 'Autor no indicado', 200);
    const restricciones = [
      /cc[ -]by/i.test(license) ? 'Requiere atribución.' : null,
      /-sa|\bsa\b/i.test(license) ? 'Compartir igual (share-alike) aplicable a la imagen.' : null,
      md.Restrictions && stripHtml(md.Restrictions.value) ? `Restricciones declaradas: ${stripHtml(md.Restrictions.value)}.` : null,
      'La licencia cubre la fotografía/escaneo; el diseño del producto representado puede estar protegido por marcas o derechos de autor.',
    ].filter(Boolean).join(' ');

    return {
      image: {
        fuente: 'commons',
        url,
        pagina_fuente: info.descriptionurl,
        atribucion: `${author} — ${license}, vía Wikimedia Commons`,
        licencia: clip(license, 100),
        restricciones: clip(restricciones, 500),
        meta: { titulo: title, licenciaUrl: md.LicenseUrl && md.LicenseUrl.value, original: info.url },
      },
    };
  }
  return { seen: pages.length > 0 };
};

/**
 * Resuelve la imagen de un producto. Nunca lanza: devuelve { image } o { error, sourcePage }.
 */
const resolveImage = async (spec) => {
  if (!spec || spec.provider === 'none') {
    return { error: 'Sin imagen reutilizable', sourcePage: spec && spec.sourcePage };
  }
  try {
    const resolvers = { pokemontcg: resolvePokemonTcg, commonsFile: resolveCommonsFile, commons: resolveCommons };
    const result = await (resolvers[spec.provider] || resolveCommons)(spec);
    if (result.error) return { error: result.error, rejected: result.rejected };

    const check = await validateImageUrl(result.url);
    if (!check.ok) return { error: `Imagen no válida: ${check.reason}` };
    return { image: result };
  } catch (err) {
    return { error: `Fallo de red/API: ${err.message}` };
  }
};

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/**
 * Descarga una imagen ya validada a `destDir/<baseName>.<ext>` (solo para licencias abiertas que
 * permiten redistribución). Devuelve el nombre de archivo escrito.
 */
const downloadImage = async (url, destDir, baseName) => {
  const fs = require('fs');
  const path = require('path');
  const res = await fetchWithRetry(url, { headers: { Accept: 'image/*' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  const ext = EXTENSIONS[(res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()];
  if (!ext) throw new Error(`Tipo no soportado al descargar ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error(`Imagen demasiado pesada (${buffer.length} bytes)`);
  fs.mkdirSync(destDir, { recursive: true });
  const fileName = `${baseName}.${ext}`;
  fs.writeFileSync(path.join(destDir, fileName), buffer);
  return fileName;
};

module.exports = { resolveImage, validateImageUrl, downloadImage, sleep, clip, MAX_IMAGE_URL_LENGTH, USER_AGENT };
