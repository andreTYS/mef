'use strict';

/**
 * feeder.js — Corre en tu PC de Windows (IP peruana)
 *
 * Scraping el SIAF-MEF y envía los datos al VPS en Brasil.
 * Ejecutar: node feeder.js
 * Automatizar: Programador de tareas de Windows cada 30 min
 *
 * Variables de entorno (en .env o en el sistema):
 *   VPS_URL     = https://masredespro.com
 *   FEED_SECRET = clave-secreta-que-pusiste-en-el-vps
 */

require('dotenv').config();

const https    = require('https');
const cheerio  = require('cheerio');

const VPS_URL     = process.env.VPS_URL     || 'https://masredespro.com';
const FEED_SECRET = process.env.FEED_SECRET || '';
// Años a enviar: desde 2020 hasta el año actual
const YEAR_START = parseInt(process.env.YEAR_START || '2020');
const YEAR_END   = new Date().getFullYear();
const ANIOS      = Array.from({ length: YEAR_END - YEAR_START + 1 }, (_, i) => YEAR_END - i);

// ── Scraping SIAF via Playwright ────────────────────
async function scrapearSIAF(anio, dim) {
  const { chromium } = require('playwright');

  const browser = await chromium.launch({ headless: true });
  try {
    const ctx = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'es-PE',
      timezoneId: 'America/Lima',
      ignoreHTTPSErrors: true,
    });
    const page = await ctx.newPage();

    const url = `https://apps5.mineco.gob.pe/transparencia/Navegador/Navegar_7.aspx?y=${anio}&ap=ActProy`;
    console.log(`[scraper] → ${url}${dim ? '  dim:' + dim : ''}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 });
    await page.waitForSelector('table.Data', { timeout: 15000 }).catch(() => {});

    const BOTONES = {
      gobierno:     'ctl00$CPH1$BtnTipoGobierno',
      funcion:      'ctl00$CPH1$BtnFuncion',
      departamento: 'ctl00$CPH1$BtnDepartamentoMeta',
      generica:     'ctl00$CPH1$BtnGenerica',
      fuente:       'ctl00$CPH1$BtnFuenteAgregada',
      categoria:    'ctl00$CPH1$BtnProgramaPpto',
    };

    if (dim && BOTONES[dim]) {
      const btn = await page.$(`input[name="${BOTONES[dim]}"]`);
      if (btn) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {}),
          btn.click(),
        ]);
        await page.waitForSelector('table.Data', { timeout: 12000 }).catch(() => {});
      }
    }

    const html  = await page.content();
    const data  = parsearHTML(html, anio, dim);
    console.log(`[scraper] ✓ ${data.total_registros} registros`);
    return data;
  } finally {
    await browser.close();
  }
}

// ── Parser HTML del SIAF ────────────────────────────
function parsearHTML(html, anio, dim) {
  const $ = cheerio.load(html);
  const num = t => parseFloat(String(t).trim().replace(/,/g, '').replace(/\s/g, '')) || 0;
  const lastUpdate = $('#ctl00_CPH1_LblLastUpdate').text().trim();
  const filas = [];

  $('table.Data tr').each((i, tr) => {
    const celdas = $(tr).find('td');
    if (celdas.length < 8) return;
    const concepto = $(celdas[1]).text().trim();
    if (!concepto) return;
    filas.push({
      sector:          concepto,
      pia:             num($(celdas[2]).text()),
      pim:             num($(celdas[3]).text()),
      certificacion:   num($(celdas[4]).text()),
      comprometido:    num($(celdas[5]).text()),
      compromiso_mens: num($(celdas[6]).text()),
      devengado:       num($(celdas[7]).text()),
      girado:          num($(celdas[8]).text()),
      avance_pct:      num($(celdas[9]).text()),
    });
  });

  const sum = key => filas.reduce((a, f) => a + (f[key] || 0), 0);
  const pim = sum('pim');
  const dev = sum('devengado');

  return {
    anio,
    dim: dim || '',
    ultima_actualizacion: lastUpdate,
    total_registros: filas.length,
    resumen: {
      pia: sum('pia'), pim, certificacion: sum('certificacion'),
      comprometido: sum('comprometido'), devengado: dev,
      girado: sum('girado'),
      avance_pct: pim > 0 ? Math.round((dev / pim) * 1000) / 10 : 0,
    },
    detalle: filas,
  };
}

// ── Enviar datos al VPS ─────────────────────────────
async function enviarAlVPS(data) {
  const body = JSON.stringify({ secret: FEED_SECRET, data });
  const url  = new URL('/api/feed', VPS_URL);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: url.hostname,
      port:     443,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'Content-Type':    'application/json',
        'Content-Length':  Buffer.byteLength(body),
        'x-feed-secret':   FEED_SECRET,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`[feed] VPS respondió ${res.statusCode}:`, d.slice(0, 120));
        resolve(res.statusCode);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Main ────────────────────────────────────────────
(async () => {
  if (!FEED_SECRET) {
    console.error('ERROR: Falta FEED_SECRET en .env');
    process.exit(1);
  }

  const dims = ['', 'gobierno', 'funcion', 'departamento'];
  let ok = 0, fail = 0;

  for (const anio of ANIOS) {
    for (const dim of dims) {
      try {
        const data = await scrapearSIAF(anio, dim);
        if (data.total_registros > 0) {
          await enviarAlVPS(data);
          ok++;
        } else {
          console.warn(`[skip] ${anio}/${dim || 'total'} — 0 registros`);
          fail++;
        }
      } catch (e) {
        console.error(`[error] ${anio}/${dim || 'total'}:`, e.message);
        fail++;
      }
    }
  }

  console.log(`\nFinalizado: ${ok} enviados, ${fail} fallidos`);
  process.exit(fail > 0 ? 1 : 0);
})();
