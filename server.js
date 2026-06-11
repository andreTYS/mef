'use strict';

require('dotenv').config();

const express   = require('express');
const axios     = require('axios');
const cheerio   = require('cheerio');
const NodeCache   = require('node-cache');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const path        = require('path');
const fs          = require('fs');

const app      = express();
const PORT     = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// ── Caché en memoria (evita sobrecargar el servidor MEF) ──
// TTL: 1 hora por defecto (el SIAF actualiza cada noche)
const cache = new NodeCache({
  stdTTL:      Number(process.env.CACHE_TTL_SECONDS) || 3600,
  checkperiod: 600,
});

// ── Configuración del cliente HTTP hacia MEF ───────
const https = require('https');
const mefClient = axios.create({
  baseURL:    'https://apps5.mineco.gob.pe',
  timeout:    Number(process.env.MEF_TIMEOUT_MS) || 15000,
  // apps5.mineco.gob.pe usa certificado de CA no estándar — se omite validación TLS
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':     'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'es-PE,es;q=0.9',
  },
});

// ── Rate limiters ─────────────────────────────────
const limiterConsulta = rateLimit({
  windowMs: 60_000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiadas consultas. Espera un minuto.' },
});
const limiterChat = rateLimit({
  windowMs: 60_000, max: 10,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Demasiadas preguntas al asistente. Espera un minuto.' },
});

// ── Middlewares ────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));  // sirve index.html y assets

// ── Log de requests ────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, req.query);
  }
  next();
});

// ══════════════════════════════════════════════════
//  RUTAS API
// ══════════════════════════════════════════════════

// ── GET /api/status — healthcheck ─────────────────
app.get('/api/status', (req, res) => {
  const dataFiles = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter(f => f.startsWith('siaf_') && f.endsWith('.json')).map(f => {
        const stat = fs.statSync(path.join(DATA_DIR, f));
        return { archivo: f, modificado: stat.mtime.toISOString() };
      })
    : [];
  res.json({
    ok:       true,
    version:  '1.1.0',
    uptime_s: Math.floor(process.uptime()),
    cache:    cache.getStats(),
    datos:    dataFiles,
    time:     new Date().toISOString(),
  });
});

// Botones de drill-down del portal SIAF
const DIMENSIONES = {
  gobierno:    'ctl00$CPH1$BtnTipoGobierno',
  funcion:     'ctl00$CPH1$BtnFuncion',
  departamento:'ctl00$CPH1$BtnDepartamentoMeta',
  generica:    'ctl00$CPH1$BtnGenerica',
  fuente:      'ctl00$CPH1$BtnFuenteAgregada',
  categoria:   'ctl00$CPH1$BtnProgramaPpto',
};

// Headers completos de navegador real (necesarios para pasar bot-detection del MEF)
function headersNavegador(anio) {
  return {
    'Accept':                    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language':           'es-PE,es;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding':           'gzip, deflate, br',
    'Cache-Control':             'no-cache',
    'Connection':                'keep-alive',
    'Pragma':                    'no-cache',
    'Referer':                   `https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx?y=${anio}&ap=ActProy`,
    'Sec-Fetch-Dest':            'document',
    'Sec-Fetch-Mode':            'navigate',
    'Sec-Fetch-Site':            'same-origin',
    'Sec-Fetch-User':            '?1',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  };
}

// Extrae ViewState y EventValidation del HTML (necesarios para el POST)
function extraerTokensASP(html) {
  const $ = cheerio.load(html);
  return {
    viewstate:       $('#__VIEWSTATE').val()       || '',
    eventvalidation: $('#__EVENTVALIDATION').val() || '',
    cookieHeader:    '',
  };
}

// ── Scraper Playwright — navegador real contra SIAF ─
// Playwright maneja cookies, JS y fingerprinting correctamente,
// evitando los bloqueos 403 que afectan a solicitudes HTTP simples.
async function scraperPlaywright(anio, dim) {
  let pw;
  try { pw = require('playwright'); }
  catch (e) {
    console.warn('[PW] Playwright no disponible:', e.message);
    return null;
  }

  const browser = await pw.chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      userAgent:         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale:            'es-PE',
      timezoneId:        'America/Lima',
      ignoreHTTPSErrors: true,   // apps5.mineco.gob.pe usa cert de CA no estándar
      extraHTTPHeaders:  { 'Accept-Language': 'es-PE,es;q=0.9,en;q=0.8' },
    });
    const page = await ctx.newPage();

    const url = `https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx?y=${anio}&ap=ActProy`;
    console.log(`[PW] ↗ ${url}${dim ? '  dim:' + dim : ''}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForSelector('table.Data', { timeout: 12000 }).catch(() => {});

    // Drill-down: simular click en el botón de dimensión
    if (dim && DIMENSIONES[dim]) {
      const btn = await page.$(`input[name="${DIMENSIONES[dim]}"]`);
      if (btn) {
        console.log(`[PW] click drill-down: ${dim}`);
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
          btn.click(),
        ]);
        await page.waitForSelector('table.Data', { timeout: 12000 }).catch(() => {});
      }
    }

    const html = await page.content();
    const data  = parsearSIAF(html, anio);

    if (data.total_registros > 0) {
      console.log(`[PW] ✓ ${data.total_registros} registros`);
    } else {
      console.warn('[PW] ⚠ 0 registros — posible bloqueo o sesión inválida');
    }
    return data;
  } catch (e) {
    console.error('[PW] ✗', e.message.split('\n')[0]);
    return null;
  } finally {
    await browser.close();
  }
}

// ── GET /api/consulta — consulta principal ─────────
// Parámetros:
//   anio  : 2009–2025  (requerido)
//   dim   : 'gobierno' | 'funcion' | 'departamento' | 'generica' | 'fuente' | 'categoria'
//           Si se omite, devuelve el TOTAL general
app.get('/api/consulta', limiterConsulta, async (req, res) => {
  const { anio = 2024, dim = '' } = req.query;

  const cacheKey = `consulta_${anio}_${dim}`;
  const cached   = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache hit] ${cacheKey}`);
    return res.json({ fuente: 'siaf-mef', cached: true, ...cached });
  }

  // ═══════════════════════════════════════════════════
  //  MÉTODO 1: Playwright — navegador Chromium real
  //  Supera bot-detection (403) mejor que axios puro
  // ═══════════════════════════════════════════════════
  try {
    const pwData = await scraperPlaywright(anio, dim || null);
    if (pwData && pwData.total_registros > 0) {
      if (dim) pwData.dimension = dim;
      cache.set(cacheKey, pwData);
      return res.json({ fuente: 'siaf-mef', cached: false, ...pwData });
    }
  } catch (pwErr) {
    console.warn('[PW] falló, intentando axios:', pwErr.message.split('\n')[0]);
  }

  // ═══════════════════════════════════════════════════
  //  MÉTODO 2: axios con headers completos de navegador
  //  (fallback si Playwright no está disponible)
  // ═══════════════════════════════════════════════════
  const siafUrl = `/transparencia/Navegador/Navegar_7.aspx?y=${anio}&ap=ActProy`;

  try {
    // Paso 1: establecer sesión en default.aspx (obtiene cookies ASP.NET)
    const defaultUrl = `/transparencia/Navegador/default.aspx?y=${anio}&ap=ActProy`;
    console.log(`[axios] sesión en ${defaultUrl}`);
    const sesionResp = await mefClient.get(defaultUrl, {
      headers: { ...headersNavegador(anio), 'Sec-Fetch-Site': 'none' },
    });
    const sessionCookies = (sesionResp.headers['set-cookie'] || []).join('; ');

    // Paso 2: GET Navegar_7 con cookies de sesión
    console.log(`[axios] GET ${siafUrl}`);
    const getResp = await mefClient.get(siafUrl, {
      headers: { ...headersNavegador(anio), 'Cookie': sessionCookies },
    });

    if (!dim || !DIMENSIONES[dim]) {
      const data = parsearSIAF(getResp.data, anio);
      cache.set(cacheKey, data);
      return res.json({ fuente: 'siaf-mef', cached: false, ...data });
    }

    // Paso 3: POST drill-down (simula click en botón de dimensión)
    const tokens = extraerTokensASP(getResp.data);
    const allCookies = [
      sessionCookies,
      ...(getResp.headers['set-cookie'] || []),
    ].join('; ');
    const boton = DIMENSIONES[dim];

    console.log(`[axios] POST drill-down: ${dim} → ${boton}`);

    const formData = new URLSearchParams({
      '__EVENTTARGET':    '',
      '__EVENTARGUMENT':  '',
      '__VIEWSTATE':      tokens.viewstate,
      '__EVENTVALIDATION':tokens.eventvalidation,
      [boton]: boton.includes('BtnTipoGobierno') ? 'Nivel de Gobierno'
             : boton.includes('BtnFuncion')      ? 'Función'
             : boton.includes('BtnDepartamento') ? 'Departamento'
             : boton.includes('BtnGenerica')     ? 'Genérica'
             : boton.includes('BtnFuente')       ? 'Fuente'
             : 'Categoría Presupuestal',
    });

    const postResp = await mefClient.post(siafUrl, formData.toString(), {
      headers: {
        ...headersNavegador(anio),
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie':       allCookies,
      },
    });

    const data = parsearSIAF(postResp.data, anio);
    data.dimension = dim;

    if (!data.detalle.length) {
      return res.status(502).json({
        error: 'El SIAF no devolvió registros de detalle',
        sugerencia: 'Prueba sin el parámetro dim= para ver el TOTAL',
      });
    }

    cache.set(cacheKey, data);
    res.json({ fuente: 'siaf-mef', cached: false, ...data });

  } catch (err) {
    console.error('[axios] Error:', err.message);
    res.status(502).json({
      error:      'No se pudo conectar con el SIAF-MEF',
      detalle:    err.message,
      sugerencia: 'El servidor MEF puede estar bloqueando acceso externo. Intenta más tarde.',
    });
  }
});

// ── GET /api/sectores — lista de sectores con códigos reales
app.get('/api/sectores', (req, res) => {
  res.json({
    sectores: SECTORES_MEF,
    total: SECTORES_MEF.length,
  });
});

// ── GET /api/regiones — lista de regiones con ubigeos
app.get('/api/regiones', (req, res) => {
  res.json({
    regiones: REGIONES_MEF,
    total: REGIONES_MEF.length,
  });
});

// ── DELETE /api/cache — limpiar caché manualmente
app.delete('/api/cache', (req, res) => {
  cache.flushAll();
  res.json({ ok: true, mensaje: 'Caché limpiada' });
});

// ── POST /api/chat — asistente virtual MEF ────────
const CHAT_SYSTEM = `Eres el asistente virtual del Portal de Transparencia Económica del MEF Perú.
Ayudas a ciudadanos a entender el presupuesto público, los términos del SIAF-MEF, y cómo interpretar los datos de ejecución presupuestal.
Responde siempre en español, de forma clara, concisa y sin tecnicismos innecesarios.
Máximo 3 párrafos cortos. Si no sabes algo, indícalo con honestidad.`;

function chatFallback(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('pim'))        return 'El PIM (Presupuesto Institucional Modificado) es el presupuesto total disponible al final del año, incluyendo todas las modificaciones sobre el PIA inicial.';
  if (m.includes('pia'))        return 'El PIA (Presupuesto Institucional de Apertura) es el presupuesto aprobado al inicio del año fiscal, antes de cualquier modificación.';
  if (m.includes('devengado'))  return 'El devengado es el gasto reconocido cuando se recibe el bien o servicio, aunque aún no se haya pagado. Indica cuánto se ha ejecutado realmente.';
  if (m.includes('girado'))     return 'El girado es el pago efectivo realizado: el dinero que ya salió de las arcas del Estado a manos del proveedor o beneficiario.';
  if (m.includes('comprometido')) return 'El comprometido es el monto que ya fue reservado mediante contratos u órdenes de compra firmadas, aunque aún no se haya recibido el bien o servicio.';
  if (m.includes('siaf'))       return 'El SIAF (Sistema Integrado de Administración Financiera) es el sistema informático del Estado peruano que registra y controla todas las operaciones presupuestales y financieras del sector público.';
  if (m.includes('ejecuci'))    return 'La ejecución presupuestal mide el porcentaje del PIM que ya fue devengado. Un 80% o más se considera alto; menos del 60% indica baja capacidad de gasto.';
  if (m.includes('sector'))     return 'Los sectores son los ministerios y entidades del Estado agrupados por función: Educación, Salud, Transportes, etc. Cada uno tiene su propio presupuesto asignado.';
  return 'Puedo ayudarte a entender el presupuesto público del Perú. Pregúntame sobre términos como PIM, PIA, devengado, girado, SIAF, o cómo interpretar los indicadores de ejecución presupuestal.';
}

app.post('/api/chat', limiterChat, async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'messages requerido' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    return res.json({ reply: chatFallback(lastMsg) });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: CHAT_SYSTEM,
      messages,
    });
    res.json({ reply: response.content[0].text });
  } catch (err) {
    console.error('[chat] Error:', err.message);
    const lastMsg = messages[messages.length - 1]?.content || '';
    res.json({ reply: chatFallback(lastMsg) });
  }
});

// ══════════════════════════════════════════════════
//  PARSER HTML DEL SIAF
//
//  Estructura confirmada del HTML real (Navegar_7.aspx):
//
//  <table class="Data">
//    <tr id="tr0">
//      <td>  ← radio button con aria-label que contiene todos los valores
//        <input type="radio" name="grp1"
//          aria-label="TOTAL,
//            PIA: 214,790,274,052,
//            PIM: 249,947,413,952,
//            CERTIFICACION: 235,745,027,380,
//            COMPROMISO ANUAL: 228,519,173,098,
//            COMPROMISO MENSUAL: 225,800,663,054
//            DEVENGADO: 222,984,118,825
//            GIRADO: 222,586,906,762
//            PORCENTAJE AVANCE: 89.2"
//        />
//      </td>
//      <td>TOTAL</td>       ← concepto (nombre)
//      <td>214,790,274,052  ← PIA
//      <td>249,947,413,952  ← PIM
//      <td>235,745,027,380  ← Certificación
//      <td>228,519,173,098  ← Compromiso Anual
//      <td>225,800,663,054  ← Compromiso Mensual
//      <td>222,984,118,825  ← Devengado
//      <td>222,586,906,762  ← Girado
//      <td>89.2             ← Avance %
//    </tr>
//  </table>
// ══════════════════════════════════════════════════

function parsearSIAF(html, anio) {
  const $     = cheerio.load(html);
  const filas = [];

  // Función auxiliar: limpia texto con comas y espacios → número
  const num = (txt) => {
    const clean = String(txt).trim().replace(/,/g, '').replace(/\s/g, '');
    return parseFloat(clean) || 0;
  };

  // Extrae metadatos útiles del HTML
  const lastUpdate = $('#ctl00_CPH1_LblLastUpdate').text().trim();

  // Itera sobre las filas de la tabla de datos (class="Data")
  $('table.Data tr').each((i, tr) => {
    const celdas = $(tr).find('td');
    if (celdas.length < 8) return;

    // El nombre del concepto está en la segunda celda (índice 1)
    const concepto = $(celdas[1]).text().trim();
    if (!concepto) return;

    // Los valores numéricos están en las celdas 2-9
    filas.push({
      sector:           concepto,
      pia:              num($(celdas[2]).text()),
      pim:              num($(celdas[3]).text()),
      certificacion:    num($(celdas[4]).text()),
      comprometido:     num($(celdas[5]).text()),
      compromiso_mens:  num($(celdas[6]).text()),
      devengado:        num($(celdas[7]).text()),
      girado:           num($(celdas[8]).text()),
      avance_pct:       num($(celdas[9]).text()),
    });
  });

  return {
    anio,
    ultima_actualizacion: lastUpdate,
    total_registros: filas.length,
    resumen: calcularResumen(filas),
    detalle: filas,
  };
}

function calcularResumen(filas) {
  const sum = (key) => filas.reduce((acc, f) => acc + (f[key] || 0), 0);
  const pim       = sum('pim');
  const devengado = sum('devengado');
  return {
    pia:          sum('pia'),
    pim,
    certificacion: sum('certificacion'),
    comprometido: sum('comprometido'),
    devengado,
    girado:       sum('girado'),
    avance_pct:   pim > 0 ? Math.round((devengado / pim) * 1000) / 10 : 0,
  };
}

// ══════════════════════════════════════════════════
//  DATOS DE REFERENCIA — Códigos oficiales MEF
// ══════════════════════════════════════════════════

const SECTORES_MEF = [
  { codigo: '01',  nombre: 'Presidencia del Consejo de Ministros' },
  { codigo: '02',  nombre: 'Poder Legislativo' },
  { codigo: '03',  nombre: 'Poder Judicial' },
  { codigo: '07',  nombre: 'Economía y Finanzas' },
  { codigo: '08',  nombre: 'Educación' },
  { codigo: '09',  nombre: 'Salud' },
  { codigo: '10',  nombre: 'Interior' },
  { codigo: '11',  nombre: 'Relaciones Exteriores' },
  { codigo: '12',  nombre: 'Defensa' },
  { codigo: '13',  nombre: 'Trabajo y Promoción del Empleo' },
  { codigo: '14',  nombre: 'Agricultura y Riego' },
  { codigo: '15',  nombre: 'Energía y Minas' },
  { codigo: '16',  nombre: 'Justicia y Derechos Humanos' },
  { codigo: '17',  nombre: 'Comercio Exterior y Turismo' },
  { codigo: '18',  nombre: 'Transportes y Comunicaciones' },
  { codigo: '19',  nombre: 'Vivienda, Construcción y Saneamiento' },
  { codigo: '22',  nombre: 'Producción' },
  { codigo: '26',  nombre: 'Cultura' },
  { codigo: '29',  nombre: 'Mujer y Poblaciones Vulnerables' },
  { codigo: '36',  nombre: 'Ambiente' },
  { codigo: '37',  nombre: 'Desarrollo e Inclusión Social' },
];

const REGIONES_MEF = [
  { ubigeo: '010000', nombre: 'Amazonas' },
  { ubigeo: '020000', nombre: 'Áncash' },
  { ubigeo: '030000', nombre: 'Apurímac' },
  { ubigeo: '040000', nombre: 'Arequipa' },
  { ubigeo: '050000', nombre: 'Ayacucho' },
  { ubigeo: '060000', nombre: 'Cajamarca' },
  { ubigeo: '070000', nombre: 'Callao' },
  { ubigeo: '080000', nombre: 'Cusco' },
  { ubigeo: '090000', nombre: 'Huancavelica' },
  { ubigeo: '100000', nombre: 'Huánuco' },
  { ubigeo: '110000', nombre: 'Ica' },
  { ubigeo: '120000', nombre: 'Junín' },
  { ubigeo: '130000', nombre: 'La Libertad' },
  { ubigeo: '140000', nombre: 'Lambayeque' },
  { ubigeo: '150000', nombre: 'Lima Metropolitana' },
  { ubigeo: '160000', nombre: 'Loreto' },
  { ubigeo: '170000', nombre: 'Madre de Dios' },
  { ubigeo: '180000', nombre: 'Moquegua' },
  { ubigeo: '190000', nombre: 'Pasco' },
  { ubigeo: '200000', nombre: 'Piura' },
  { ubigeo: '210000', nombre: 'Puno' },
  { ubigeo: '220000', nombre: 'San Martín' },
  { ubigeo: '230000', nombre: 'Tacna' },
  { ubigeo: '240000', nombre: 'Tumbes' },
  { ubigeo: '250000', nombre: 'Ucayali' },
  { ubigeo: '260000', nombre: 'Lima Región' },
];

// ── POST /api/feed — recibir datos desde PC peruana ──
// El feeder.js que corre en la PC de Perú scraping SIAF y envía aquí.
// Protegido por FEED_SECRET en .env
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Cargar datos persistidos al iniciar el servidor
(function cargarDatosPersistidos() {
  try {
    const archivos = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('siaf_') && f.endsWith('.json'));
    archivos.forEach(f => {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      const key  = `consulta_${data.anio}_${data.dim || ''}`;
      cache.set(key, data);
      console.log(`[feed] Cargado desde disco: ${key} (${data.total_registros} reg.)`);
    });
  } catch (e) {
    console.warn('[feed] Sin datos persistidos:', e.message);
  }
})();

app.post('/api/feed', (req, res) => {
  const secret = req.headers['x-feed-secret'] || req.body?.secret;
  if (!process.env.FEED_SECRET || secret !== process.env.FEED_SECRET) {
    return res.status(403).json({ error: 'Clave incorrecta — configura FEED_SECRET en .env' });
  }

  const data = req.body?.data;
  if (!data || !data.anio) {
    return res.status(400).json({ error: 'Falta data.anio' });
  }

  const dim = data.dim || '';
  const key = `consulta_${data.anio}_${dim}`;
  cache.set(key, data);

  // Persistir en disco para sobrevivir reinicios
  const archivo = path.join(DATA_DIR, `siaf_${data.anio}_${dim || 'total'}.json`);
  fs.writeFileSync(archivo, JSON.stringify(data));

  console.log(`[feed] ✓ ${key} — ${data.total_registros} registros guardados`);
  res.json({ ok: true, key, registros: data.total_registros });
});

// ── Iniciar servidor ───────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════╗');
  console.log('  ║   MEF Perú — Portal de Transparencia  ║');
  console.log('  ╠═══════════════════════════════════════╣');
  console.log(`  ║  Portal:  http://localhost:${PORT}        ║`);
  console.log(`  ║  API:     http://localhost:${PORT}/api    ║`);
  console.log(`  ║  Status:  http://localhost:${PORT}/api/status ║`);
  console.log('  ╚═══════════════════════════════════════╝');
  console.log('');

  // Cache warming: pre-carga el año corriente en background
  // para que el primer usuario no espere 15–30s de Playwright
  const warmYear = new Date().getFullYear() - 1;
  if (!cache.get(`consulta_${warmYear}_`)) {
    console.log(`[cache] Calentando caché para ${warmYear}…`);
    scraperPlaywright(warmYear, null)
      .then(data => {
        if (data?.total_registros > 0) {
          cache.set(`consulta_${warmYear}_`, data);
          console.log(`[cache] ✓ Caché lista — ${warmYear}: ${data.total_registros} registros`);
        }
      })
      .catch(e => console.warn('[cache] Warming falló (no crítico):', e.message.split('\n')[0]));
  }
});
