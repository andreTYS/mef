'use strict';

// ══════════════════════════════════════════════════
//  MEF Perú — Módulo de integración con datos abiertos
//  Fuente: datosabiertos.gob.pe (CKAN API)
// ══════════════════════════════════════════════════

const API = {
  // Base de la API CKAN del portal de datos abiertos del Perú
  CKAN_BASE: 'https://www.datosabiertos.gob.pe/api/3/action',

  // IDs de recursos publicados por el MEF en datosabiertos.gob.pe
  // Para encontrar más: https://www.datosabiertos.gob.pe/organization/mef
  RECURSOS: {
    ejecucion_2024: 'b5d4d51a-a9b3-4e3e-8f1a-9b2c3d4e5f6a', // ejemplo — ver nota abajo
    ejecucion_2023: 'c6e5f62b-b0c4-4f4f-9g2b-0c3d4e5f6g7b',
  },

  // Endpoint SIAF — parámetros que usa el portal Consulta Amigable internamente
  // (puede tener restricciones CORS desde el navegador)
  SIAF_BASE: 'https://apps5.mineco.gob.pe/transparencia/Navegador',
};

// ══════════════════════════════════════════════════
//  1. CKAN API — datosabiertos.gob.pe
//
//  Buscar datasets MEF:
//  https://www.datosabiertos.gob.pe/organization/mef
//
//  Una vez que encuentres el dataset, copia el resource_id
//  de la URL y reemplázalo en API.RECURSOS arriba.
// ══════════════════════════════════════════════════

async function fetchCKAN(resourceId, filters = {}, limit = 100) {
  const params = new URLSearchParams({
    resource_id: resourceId,
    limit,
    ...filters,
  });

  const url = `${API.CKAN_BASE}/datastore_search?${params}`;
  const res  = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
  });

  if (!res.ok) throw new Error(`CKAN error ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'CKAN error');
  return json.result;
}

// Búsqueda de datasets por organización MEF
async function buscarDatasetsMEF() {
  const url = `${API.CKAN_BASE}/package_search?q=presupuesto+ejecucion&fq=organization:mef&rows=20`;
  const res  = await fetch(url, { mode: 'cors' });
  const json = await res.json();
  return json.result?.results || [];
}

// ══════════════════════════════════════════════════
//  2. SIAF — Consulta Amigable (endpoints internos)
//
//  El portal apps5.mineco.gob.pe usa llamadas AJAX
//  que puedes interceptar con DevTools (F12 → Network).
//  El patrón general es:
// ══════════════════════════════════════════════════

async function fetchSIAF({ anio, nivel, region, sector } = {}) {
  // Parámetros que acepta el portal SIAF
  const params = new URLSearchParams({
    y:   anio   || new Date().getFullYear(),
    ap:  'ActProy',           // Actividades y Proyectos
    ...(nivel  && { n: nivel }),
    ...(region && { r: region }),
    ...(sector && { s: sector }),
  });

  // NOTA: Este endpoint puede requerir manejo de sesión o
  // devolver HTML en lugar de JSON. Usar con proxy server-side.
  const url = `${API.SIAF_BASE}/Default.aspx?${params}`;
  const res  = await fetch(url, { mode: 'no-cors' }); // 'no-cors' = respuesta opaca
  return res;
}

// ══════════════════════════════════════════════════
//  3. Proxy propio — solución recomendada para producción
//
//  Como el SIAF tiene restricciones CORS, la arquitectura
//  recomendada es un proxy backend propio:
//
//  Navegador → Tu servidor (Node/Python/etc.) → MEF SIAF
//
//  Ejemplo con Node.js + Express:
// ══════════════════════════════════════════════════

/*
// server.js (Node.js — instalar: npm install express node-fetch)
const express = require('express');
const fetch   = require('node-fetch');
const app     = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/siaf', async (req, res) => {
  const { anio = 2024, nivel, region } = req.query;
  const url = `https://apps5.mineco.gob.pe/transparencia/Navegador/Default.aspx?y=${anio}`;
  const response = await fetch(url);
  // parsear HTML o JSON según respuesta
  const data = await response.text();
  res.json({ data });
});

app.listen(3000, () => console.log('Proxy MEF corriendo en http://localhost:3000'));
*/

// ══════════════════════════════════════════════════
//  4. Normalizar datos CKAN → formato del portal
// ══════════════════════════════════════════════════

function normalizarCKAN(records) {
  // Los campos varían según el dataset — ajustar según el recurso elegido
  return records.map(r => ({
    sector:       r['SECTOR']       || r['sector']       || r['PLIEGO']    || 'Sin nombre',
    pim:          Number(r['PIM']   || r['pim']          || 0),
    devengado:    Number(r['DEVENGADO'] || r['devengado'] || 0),
    girado:       Number(r['GIRADO']    || r['girado']    || 0),
    comprometido: Number(r['COMPROMETIDO'] || r['comprometido'] || 0),
  })).filter(r => r.pim > 0);
}

// ══════════════════════════════════════════════════
//  5. Función principal — intenta API real, fallback a demo
// ══════════════════════════════════════════════════

async function cargarDatosOficiales({ anio, region, nivel } = {}) {
  const resourceId = API.RECURSOS[`ejecucion_${anio}`] || API.RECURSOS.ejecucion_2024;

  try {
    console.info('[MEF API] Intentando CKAN datosabiertos.gob.pe...');
    const result  = await fetchCKAN(resourceId, { anio });
    const records = normalizarCKAN(result.records);

    if (records.length === 0) throw new Error('Sin registros');

    console.info(`[MEF API] ✅ ${records.length} registros obtenidos`);
    return { fuente: 'oficial', datos: records };

  } catch (err) {
    console.warn('[MEF API] No disponible, usando datos demo:', err.message);
    return { fuente: 'demo', datos: null }; // app.js usa DEMO_DATA
  }
}

// ══════════════════════════════════════════════════
//  6. Cómo encontrar el Resource ID correcto
//
//  1. Ve a: https://www.datosabiertos.gob.pe/organization/mef
//  2. Busca el dataset "Ejecución Presupuestal" o "SIAF"
//  3. Click en el dataset → click en el recurso (CSV/JSON)
//  4. La URL tendrá algo como:
//     /dataset/.../resource/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
//  5. Ese UUID es el resource_id para la API
//
//  Ejemplo de llamada directa en el navegador:
//  https://www.datosabiertos.gob.pe/api/3/action/datastore_search
//    ?resource_id=TU_RESOURCE_ID&limit=5
// ══════════════════════════════════════════════════

export { cargarDatosOficiales, fetchCKAN, buscarDatasetsMEF, normalizarCKAN };
