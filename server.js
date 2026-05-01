'use strict';

require('dotenv').config();

const express   = require('express');
const axios     = require('axios');
const cheerio   = require('cheerio');
const NodeCache = require('node-cache');
const cors      = require('cors');
const path      = require('path');

const app   = express();
const PORT  = process.env.PORT || 3000;

// ── Caché en memoria (evita sobrecargar el servidor MEF) ──
// TTL: 1 hora por defecto (el SIAF actualiza cada noche)
const cache = new NodeCache({
  stdTTL:      Number(process.env.CACHE_TTL_SECONDS) || 3600,
  checkperiod: 600,
});

// ── Configuración del cliente HTTP hacia MEF ───────
const mefClient = axios.create({
  baseURL: 'https://apps5.mineco.gob.pe',
  timeout: Number(process.env.MEF_TIMEOUT_MS) || 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MEF-Portal-Proxy/1.0)',
    'Accept':     'text/html,application/xhtml+xml,application/json,*/*',
    'Accept-Language': 'es-PE,es;q=0.9',
  },
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
  res.json({
    ok:      true,
    version: '1.0.0',
    cache:   cache.getStats(),
    time:    new Date().toISOString(),
  });
});

// ── GET /api/consulta — consulta principal ─────────
// Parámetros:
//   anio  : 2009–2025  (requerido)
//   dim   : dimensión de drill-down
//           'gobierno' | 'funcion' | 'departamento' | 'generica'
app.get('/api/consulta', async (req, res) => {
  const { anio = 2024, dim = '' } = req.query;

  const cacheKey = `consulta_${anio}_${dim}`;
  const cached   = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache hit] ${cacheKey}`);
    return res.json({ fuente: 'siaf-mef', cached: true, ...cached });
  }

  try {
    // URL real del portal SIAF (confirmada desde DevTools)
    const url = `/transparencia/Navegador/Navegar_7.aspx?y=${anio}&ap=ActProy`;
    console.log(`[MEF] GET ${url}`);

    const response = await mefClient.get(url, {
      headers: {
        // Simular navegador real para evitar bloqueo Imperva
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-PE,es;q=0.9',
        'Referer':         `https://apps5.mineco.gob.pe/transparencia/Navegador/default.aspx?y=${anio}&ap=ActProy`,
      },
    });

    const data = parsearSIAF(response.data, anio);

    if (!data.detalle.length) {
      return res.status(502).json({
        error: 'El SIAF no devolvió datos para ese año',
        sugerencia: 'Intenta con otro año o revisa la conexión',
      });
    }

    cache.set(cacheKey, data);
    res.json({ fuente: 'siaf-mef', cached: false, ...data });

  } catch (err) {
    console.error('[MEF] Error:', err.message);
    res.status(502).json({
      error:      'No se pudo conectar con el SIAF-MEF',
      detalle:    err.message,
      sugerencia: 'Verifica tu conexión a internet o intenta más tarde',
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
  console.log('  Presiona Ctrl+C para detener el servidor');
  console.log('');
});
