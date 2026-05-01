'use strict';

// ══════════════════════════════════════════════════
//  MEF Perú — Portal de Transparencia
//  Lógica de consulta y visualización
// ══════════════════════════════════════════════════

// ── Datos de demo (estructura real del SIAF-MEF) ──
const DEMO_DATA = {
  sectores: [
    { sector: 'Educación',                    pim: 42850000000, devengado: 38764000000, girado: 37900000000, comprometido: 40100000000 },
    { sector: 'Salud',                         pim: 24320000000, devengado: 21458000000, girado: 20980000000, comprometido: 22500000000 },
    { sector: 'Transportes y Comunicaciones', pim: 18750000000, devengado: 14200000000, girado: 13750000000, comprometido: 16000000000 },
    { sector: 'Interior',                      pim: 12400000000, devengado: 11860000000, girado: 11700000000, comprometido: 12000000000 },
    { sector: 'Defensa',                       pim: 11200000000, devengado: 10580000000, girado: 10200000000, comprometido: 10900000000 },
    { sector: 'Economía y Finanzas',           pim: 9850000000,  devengado: 9100000000,  girado: 8960000000,  comprometido: 9400000000  },
    { sector: 'Desarrollo e Inclusión Social', pim: 8760000000,  devengado: 7250000000,  girado: 7100000000,  comprometido: 7800000000  },
    { sector: 'Vivienda',                      pim: 7400000000,  devengado: 4810000000,  girado: 4600000000,  comprometido: 5800000000  },
    { sector: 'Agricultura',                   pim: 5800000000,  devengado: 4350000000,  girado: 4200000000,  comprometido: 4750000000  },
    { sector: 'Energía y Minas',              pim: 4920000000,  devengado: 3690000000,  girado: 3500000000,  comprometido: 4100000000  },
    { sector: 'Justicia',                      pim: 4200000000,  devengado: 3900000000,  girado: 3840000000,  comprometido: 4050000000  },
    { sector: 'Trabajo',                       pim: 3100000000,  devengado: 2820000000,  girado: 2750000000,  comprometido: 2950000000  },
    { sector: 'Mujer y Poblac. Vulnerables',  pim: 2700000000,  devengado: 2430000000,  girado: 2380000000,  comprometido: 2580000000  },
    { sector: 'Ambiente',                      pim: 2400000000,  devengado: 1680000000,  girado: 1620000000,  comprometido: 2000000000  },
    { sector: 'Cultura',                       pim: 1800000000,  devengado: 1440000000,  girado: 1400000000,  comprometido: 1650000000  },
    { sector: 'Relaciones Exteriores',        pim: 1200000000,  devengado: 1104000000,  girado: 1080000000,  comprometido: 1150000000  },
    { sector: 'Comercio Ext. y Turismo',      pim: 980000000,   devengado: 784000000,   girado: 756000000,   comprometido: 860000000   },
    { sector: 'Producción',                    pim: 850000000,   devengado: 680000000,   girado: 654000000,   comprometido: 740000000   },
  ]
};

// ── Helpers ────────────────────────────────────────
const fmt = {
  currency(n) {
    if (n >= 1e9) return `S/ ${(n / 1e9).toFixed(2)} MM`;
    if (n >= 1e6) return `S/ ${(n / 1e6).toFixed(1)} M`;
    return `S/ ${n.toLocaleString('es-PE')}`;
  },
  pct(num, denom) {
    return denom === 0 ? '0.0%' : `${((num / denom) * 100).toFixed(1)}%`;
  },
  pctNum(num, denom) {
    return denom === 0 ? 0 : Math.round((num / denom) * 100 * 10) / 10;
  }
};

function sum(arr, key) { return arr.reduce((a, b) => a + b[key], 0); }

function statusChip(pct) {
  if (pct >= 80) return `<span class="status-chip status-chip--high">✓ Alto (${pct}%)</span>`;
  if (pct >= 60) return `<span class="status-chip status-chip--mid">~ Medio (${pct}%)</span>`;
  return `<span class="status-chip status-chip--low">↓ Bajo (${pct}%)</span>`;
}

function miniBar(pct) {
  const cls = pct >= 80 ? '' : pct >= 60 ? 'mini-bar-fill--mid' : 'mini-bar-fill--low';
  return `<div class="mini-bar-track"><div class="mini-bar-fill ${cls}" style="width:${Math.min(pct,100)}%"></div></div>`;
}

// ── Poblar años ────────────────────────────────────
(function populateYears() {
  const sel = document.getElementById('select-year');
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 2009; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    sel.appendChild(opt);
  }
  sel.value = currentYear - 1; // pre-seleccionar año anterior
})();

// ── Estado de la aplicación ────────────────────────
let currentData = [];
let sortState = { col: null, asc: true };

// ── Filtrar datos según selección ──────────────────
function getFilteredData() {
  const sector = document.getElementById('select-sector').value;
  let data = [...DEMO_DATA.sectores];

  if (sector) {
    const map = {
      educacion: 'Educación',
      salud: 'Salud',
      transportes: 'Transportes y Comunicaciones',
      interior: 'Interior',
      defensa: 'Defensa',
      agricultura: 'Agricultura',
      energia: 'Energía y Minas',
      vivienda: 'Vivienda',
      economia: 'Economía y Finanzas',
      trabajo: 'Trabajo',
      justicia: 'Justicia',
      rree: 'Relaciones Exteriores',
      comercio: 'Comercio Ext. y Turismo',
      ambiente: 'Ambiente',
      cultura: 'Cultura',
      mujer: 'Mujer y Poblac. Vulnerables',
      produce: 'Producción',
      desarrollo: 'Desarrollo e Inclusión Social',
    };
    data = data.filter(d => d.sector.startsWith(map[sector]?.slice(0, 6) || '___'));
    if (!data.length) {
      data = DEMO_DATA.sectores.filter(d =>
        d.sector.toLowerCase().includes(map[sector]?.toLowerCase().slice(0, 5) || '___')
      );
    }
    if (!data.length) data = DEMO_DATA.sectores.slice(0, 5);
  }

  return data;
}

// ── Renderizar KPIs ────────────────────────────────
function renderKPIs(data) {
  const totalPIM        = sum(data, 'pim');
  const totalDevengado  = sum(data, 'devengado');
  const totalGirado     = sum(data, 'girado');
  const totalCompro     = sum(data, 'comprometido');
  const pct             = fmt.pctNum(totalDevengado, totalPIM);

  document.getElementById('kpi-pim').textContent         = fmt.currency(totalPIM);
  document.getElementById('kpi-devengado').textContent   = fmt.currency(totalDevengado);
  document.getElementById('kpi-girado').textContent      = fmt.currency(totalGirado);
  document.getElementById('kpi-comprometido').textContent = fmt.currency(totalCompro);
  document.getElementById('kpi-pct').textContent         = `${fmt.pct(totalDevengado, totalPIM)} del presupuesto asignado`;

  // Barra de ejecución
  const bar   = document.getElementById('exec-bar-fill');
  const track = document.getElementById('exec-bar-track');
  const label = document.getElementById('exec-pct-label');

  label.textContent        = `${pct}%`;
  label.style.color        = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)';
  track.setAttribute('aria-valuenow', pct);
  bar.style.background     = pct >= 80
    ? 'linear-gradient(90deg, var(--green), #4CAF50)'
    : pct >= 60
      ? 'linear-gradient(90deg, var(--gold), #FFC107)'
      : 'linear-gradient(90deg, var(--red), #EF5350)';

  setTimeout(() => { bar.style.width = Math.min(pct, 100) + '%'; }, 80);

  return { totalPIM, totalDevengado };
}

// ── Renderizar tabla ───────────────────────────────
function renderTable(data) {
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  data.forEach(row => {
    const pct = fmt.pctNum(row.devengado, row.pim);
    const tr  = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${row.sector}</strong></td>
      <td class="num">${fmt.currency(row.pim)}</td>
      <td class="num">${fmt.currency(row.devengado)}</td>
      <td>
        ${miniBar(pct)}
        <span style="font-size:12px;color:var(--gray-600);margin-left:6px">${pct}%</span>
      </td>
      <td>${statusChip(pct)}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Ordenar tabla ──────────────────────────────────
function attachSortListeners() {
  document.querySelectorAll('.data-table th.sortable').forEach(th => {
    th.addEventListener('click', () => sortBy(th.dataset.col));
    th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sortBy(th.dataset.col); } });
  });
}

function sortBy(col) {
  if (sortState.col === col) {
    sortState.asc = !sortState.asc;
  } else {
    sortState.col = col;
    sortState.asc = col === 'sector';
  }

  currentData.sort((a, b) => {
    let va, vb;
    if (col === 'sector')    { va = a.sector;    vb = b.sector; }
    else if (col === 'pim')  { va = a.pim;       vb = b.pim; }
    else if (col === 'devengado') { va = a.devengado; vb = b.devengado; }
    else { va = a.devengado / a.pim; vb = b.devengado / b.pim; }

    if (va < vb) return sortState.asc ? -1 : 1;
    if (va > vb) return sortState.asc ? 1 : -1;
    return 0;
  });

  document.querySelectorAll('.data-table th.sortable').forEach(th => {
    th.setAttribute('aria-sort', 'none');
    th.querySelector('.sort-icon').textContent = '↕';
  });
  const activeTh = document.querySelector(`[data-col="${col}"]`);
  if (activeTh) {
    activeTh.setAttribute('aria-sort', sortState.asc ? 'ascending' : 'descending');
    activeTh.querySelector('.sort-icon').textContent = sortState.asc ? '↑' : '↓';
  }

  renderTable(currentData);
}

// ── Consultar ──────────────────────────────────────
function consultar() {
  const year   = document.getElementById('select-year').value;
  const nivel  = document.getElementById('select-nivel');
  const sector = document.getElementById('select-sector');

  if (!year) {
    shakeElement(document.getElementById('select-year'));
    document.getElementById('select-year').focus();
    return;
  }

  const btn = document.getElementById('btn-consultar');
  btn.classList.add('loading');
  btn.textContent = '';

  // Simular latencia de API
  setTimeout(() => {
    currentData = getFilteredData();
    sortState   = { col: null, asc: true };

    // Actualizar subtítulo
    const nivelLabel  = nivel.options[nivel.selectedIndex].text.replace(/^[^\w]+/, '');
    const sectorLabel = sector.value ? sector.options[sector.selectedIndex].text : 'Todos los sectores';
    document.getElementById('results-subtitle').textContent =
      `Año ${year} · ${nivelLabel || 'Todos los niveles'} · ${sectorLabel}`;

    const { totalPIM, totalDevengado } = renderKPIs(currentData);
    renderTable(currentData);

    // Mostrar resultados
    document.getElementById('empty-state').hidden  = true;
    document.getElementById('results-panel').hidden = false;

    // Scroll suave a resultados
    document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });

    btn.classList.remove('loading');
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="2"/>
        <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Consultar ahora`;
  }, 700);
}

// ── Animación de error ─────────────────────────────
function shakeElement(el) {
  el.style.borderColor = 'var(--red)';
  el.style.boxShadow   = '0 0 0 3px rgba(200,16,46,.2)';
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-6px)' },
    { transform: 'translateX(6px)' },
    { transform: 'translateX(-4px)' },
    { transform: 'translateX(4px)' },
    { transform: 'translateX(0)' },
  ], { duration: 400, easing: 'ease-out' });
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow   = '';
  }, 2000);
}

// ── Limpiar filtros ────────────────────────────────
function resetFilters() {
  document.getElementById('select-year').value   = new Date().getFullYear() - 1;
  document.getElementById('select-nivel').value  = '';
  document.getElementById('select-sector').value = '';
  document.getElementById('select-tipo').value   = '';
  document.getElementById('empty-state').hidden  = false;
  document.getElementById('results-panel').hidden = true;
  document.getElementById('exec-bar-fill').style.width = '0%';
}

// ── Exportar CSV ───────────────────────────────────
function exportCSV() {
  if (!currentData.length) return;

  const year   = document.getElementById('select-year').value;
  const header = ['Sector', 'PIM (S/)', 'Devengado (S/)', 'Girado (S/)', 'Comprometido (S/)', 'Avance (%)'];
  const rows   = currentData.map(d => [
    `"${d.sector}"`,
    d.pim,
    d.devengado,
    d.girado,
    d.comprometido,
    fmt.pctNum(d.devengado, d.pim)
  ]);

  const csv  = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `mef-transparencia-${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Menú móvil ─────────────────────────────────────
function initMobileMenu() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.header-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = expanded ? '' : 'flex';
    nav.style.flexDirection = 'column';
    nav.style.position      = 'fixed';
    nav.style.top           = '72px';
    nav.style.left          = '0';
    nav.style.right         = '0';
    nav.style.background    = 'white';
    nav.style.padding       = '12px 16px';
    nav.style.boxShadow     = '0 8px 24px rgba(0,0,0,.12)';
    nav.style.zIndex        = '99';
    if (expanded) nav.removeAttribute('style');
  });

  // Cerrar al hacer click en un enlace
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      nav.removeAttribute('style');
    });
  });
}

// ── Animación de los números del hero ──────────────
function animateHeroNumbers() {
  const el = document.getElementById('stat-ejecucion');
  if (!el) return;
  let current = 0;
  const target = 78.4;
  const step = target / 40;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toFixed(1) + '%';
    if (current >= target) clearInterval(timer);
  }, 30);
}

// ── Enter en filtros lanza consulta ───────────────
function initKeyboardShortcuts() {
  document.querySelectorAll('.filter-select').forEach(sel => {
    sel.addEventListener('keydown', e => {
      if (e.key === 'Enter') consultar();
    });
  });
}

// ── Intersección observer para animaciones ─────────
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;
  const items = document.querySelectorAll('.step-card, .glosario-card, .faq-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .4s ease, transform .4s ease';
    obs.observe(el);
  });
}

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-consultar').addEventListener('click', consultar);
  document.getElementById('btn-reset').addEventListener('click', resetFilters);
  document.getElementById('btn-export')?.addEventListener('click', exportCSV);

  attachSortListeners();
  initMobileMenu();
  initKeyboardShortcuts();
  initScrollAnimations();

  setTimeout(animateHeroNumbers, 600);

  // Consulta inicial automática con el año pre-seleccionado
  setTimeout(consultar, 300);
});
