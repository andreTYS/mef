'use strict';

// ══════════════════════════════════════════════════
//  MEF Perú — Portal de Transparencia
//  Lógica de consulta y visualización
// ══════════════════════════════════════════════════

// ── Datos de demo (estructura real del SIAF-MEF) ──
// NOTA: Datos ilustrativos basados en la estructura del SIAF.
// Los datos reales se obtienen de apps5.mineco.gob.pe
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
  ],

  // Presupuesto por Gobierno Regional — 25 regiones del Perú
  // Fuentes de referencia: SIAF-MEF, INEI (proporcional a población y canon)
  regiones: {
    amazonas:    { nombre: 'Amazonas',          sectores: [
      { sector: 'Educación',        pim: 580000000,  devengado: 498000000,  girado: 487000000,  comprometido: 520000000 },
      { sector: 'Salud',            pim: 320000000,  devengado: 275000000,  girado: 268000000,  comprometido: 298000000 },
      { sector: 'Transportes',      pim: 410000000,  devengado: 280000000,  girado: 270000000,  comprometido: 330000000 },
      { sector: 'Agricultura',      pim: 180000000,  devengado: 134000000,  girado: 129000000,  comprometido: 155000000 },
      { sector: 'Vivienda',         pim: 95000000,   devengado: 58000000,   girado: 55000000,   comprometido: 72000000  },
    ]},
    ancash:      { nombre: 'Áncash',            sectores: [
      { sector: 'Educación',        pim: 1420000000, devengado: 1230000000, girado: 1198000000, comprometido: 1320000000 },
      { sector: 'Salud',            pim: 780000000,  devengado: 668000000,  girado: 651000000,  comprometido: 720000000 },
      { sector: 'Transportes',      pim: 950000000,  devengado: 695000000,  girado: 672000000,  comprometido: 820000000 },
      { sector: 'Agricultura',      pim: 320000000,  devengado: 248000000,  girado: 240000000,  comprometido: 285000000 },
      { sector: 'Vivienda',         pim: 210000000,  devengado: 140000000,  girado: 134000000,  comprometido: 175000000 },
    ]},
    apurimac:    { nombre: 'Apurímac',          sectores: [
      { sector: 'Educación',        pim: 620000000,  devengado: 527000000,  girado: 514000000,  comprometido: 565000000 },
      { sector: 'Salud',            pim: 340000000,  devengado: 285000000,  girado: 278000000,  comprometido: 312000000 },
      { sector: 'Transportes',      pim: 480000000,  devengado: 312000000,  girado: 300000000,  comprometido: 385000000 },
      { sector: 'Agricultura',      pim: 195000000,  devengado: 145000000,  girado: 140000000,  comprometido: 168000000 },
      { sector: 'Vivienda',         pim: 110000000,  devengado: 65000000,   girado: 62000000,   comprometido: 82000000  },
    ]},
    arequipa:    { nombre: 'Arequipa',          sectores: [
      { sector: 'Educación',        pim: 1680000000, devengado: 1478000000, girado: 1442000000, comprometido: 1580000000 },
      { sector: 'Salud',            pim: 920000000,  devengado: 802000000,  girado: 782000000,  comprometido: 865000000 },
      { sector: 'Transportes',      pim: 1250000000, devengado: 950000000,  girado: 920000000,  comprometido: 1080000000 },
      { sector: 'Agricultura',      pim: 380000000,  devengado: 295000000,  girado: 286000000,  comprometido: 340000000 },
      { sector: 'Vivienda',         pim: 280000000,  devengado: 198000000,  girado: 191000000,  comprometido: 235000000 },
    ]},
    ayacucho:    { nombre: 'Ayacucho',          sectores: [
      { sector: 'Educación',        pim: 750000000,  devengado: 630000000,  girado: 614000000,  comprometido: 692000000 },
      { sector: 'Salud',            pim: 420000000,  devengado: 348000000,  girado: 339000000,  comprometido: 385000000 },
      { sector: 'Transportes',      pim: 590000000,  devengado: 388000000,  girado: 374000000,  comprometido: 470000000 },
      { sector: 'Agricultura',      pim: 220000000,  devengado: 162000000,  girado: 157000000,  comprometido: 190000000 },
      { sector: 'Vivienda',         pim: 128000000,  devengado: 78000000,   girado: 75000000,   comprometido: 98000000  },
    ]},
    cajamarca:   { nombre: 'Cajamarca',         sectores: [
      { sector: 'Educación',        pim: 1320000000, devengado: 1098000000, girado: 1071000000, comprometido: 1210000000 },
      { sector: 'Salud',            pim: 720000000,  devengado: 590000000,  girado: 575000000,  comprometido: 660000000 },
      { sector: 'Transportes',      pim: 880000000,  devengado: 598000000,  girado: 578000000,  comprometido: 720000000 },
      { sector: 'Agricultura',      pim: 295000000,  devengado: 218000000,  girado: 211000000,  comprometido: 256000000 },
      { sector: 'Vivienda',         pim: 195000000,  devengado: 118000000,  girado: 113000000,  comprometido: 148000000 },
    ]},
    callao:      { nombre: 'Callao',            sectores: [
      { sector: 'Educación',        pim: 980000000,  devengado: 882000000,  girado: 860000000,  comprometido: 930000000 },
      { sector: 'Salud',            pim: 540000000,  devengado: 475000000,  girado: 463000000,  comprometido: 510000000 },
      { sector: 'Transportes',      pim: 680000000,  devengado: 530000000,  girado: 512000000,  comprometido: 610000000 },
      { sector: 'Vivienda',         pim: 245000000,  devengado: 178000000,  girado: 172000000,  comprometido: 208000000 },
      { sector: 'Desarrollo Social',pim: 165000000,  devengado: 138000000,  girado: 134000000,  comprometido: 151000000 },
    ]},
    cusco:       { nombre: 'Cusco',             sectores: [
      { sector: 'Educación',        pim: 1580000000, devengado: 1340000000, girado: 1307000000, comprometido: 1468000000 },
      { sector: 'Salud',            pim: 860000000,  devengado: 722000000,  girado: 704000000,  comprometido: 800000000 },
      { sector: 'Transportes',      pim: 1980000000, devengado: 1385000000, girado: 1340000000, comprometido: 1680000000 },
      { sector: 'Agricultura',      pim: 450000000,  devengado: 342000000,  girado: 331000000,  comprometido: 395000000 },
      { sector: 'Cultura / Turismo',pim: 185000000,  devengado: 142000000,  girado: 137000000,  comprometido: 162000000 },
    ]},
    huancavelica:{ nombre: 'Huancavelica',      sectores: [
      { sector: 'Educación',        pim: 480000000,  devengado: 398000000,  girado: 388000000,  comprometido: 440000000 },
      { sector: 'Salud',            pim: 265000000,  devengado: 218000000,  girado: 212000000,  comprometido: 242000000 },
      { sector: 'Transportes',      pim: 380000000,  devengado: 240000000,  girado: 232000000,  comprometido: 298000000 },
      { sector: 'Agricultura',      pim: 165000000,  devengado: 120000000,  girado: 116000000,  comprometido: 142000000 },
      { sector: 'Vivienda',         pim: 88000000,   devengado: 51000000,   girado: 49000000,   comprometido: 65000000  },
    ]},
    huanuco:     { nombre: 'Huánuco',           sectores: [
      { sector: 'Educación',        pim: 720000000,  devengado: 605000000,  girado: 590000000,  comprometido: 665000000 },
      { sector: 'Salud',            pim: 395000000,  devengado: 325000000,  girado: 317000000,  comprometido: 362000000 },
      { sector: 'Transportes',      pim: 545000000,  devengado: 360000000,  girado: 348000000,  comprometido: 435000000 },
      { sector: 'Agricultura',      pim: 205000000,  devengado: 152000000,  girado: 147000000,  comprometido: 178000000 },
      { sector: 'Vivienda',         pim: 118000000,  devengado: 71000000,   girado: 68000000,   comprometido: 90000000  },
    ]},
    ica:         { nombre: 'Ica',               sectores: [
      { sector: 'Educación',        pim: 820000000,  devengado: 730000000,  girado: 712000000,  comprometido: 775000000 },
      { sector: 'Salud',            pim: 450000000,  devengado: 392000000,  girado: 382000000,  comprometido: 420000000 },
      { sector: 'Transportes',      pim: 620000000,  devengado: 480000000,  girado: 464000000,  comprometido: 548000000 },
      { sector: 'Agricultura',      pim: 240000000,  devengado: 185000000,  girado: 179000000,  comprometido: 210000000 },
      { sector: 'Vivienda',         pim: 158000000,  devengado: 105000000,  girado: 101000000,  comprometido: 128000000 },
    ]},
    junin:       { nombre: 'Junín',             sectores: [
      { sector: 'Educación',        pim: 1180000000, devengado: 1002000000, girado: 977000000,  comprometido: 1090000000 },
      { sector: 'Salud',            pim: 645000000,  devengado: 548000000,  girado: 534000000,  comprometido: 598000000 },
      { sector: 'Transportes',      pim: 820000000,  devengado: 574000000,  girado: 555000000,  comprometido: 675000000 },
      { sector: 'Agricultura',      pim: 275000000,  devengado: 207000000,  girado: 200000000,  comprometido: 240000000 },
      { sector: 'Vivienda',         pim: 182000000,  devengado: 115000000,  girado: 111000000,  comprometido: 142000000 },
    ]},
    lalibertad:  { nombre: 'La Libertad',       sectores: [
      { sector: 'Educación',        pim: 1650000000, devengado: 1418000000, girado: 1383000000, comprometido: 1540000000 },
      { sector: 'Salud',            pim: 905000000,  devengado: 778000000,  girado: 759000000,  comprometido: 850000000 },
      { sector: 'Transportes',      pim: 1120000000, devengado: 806000000,  girado: 780000000,  comprometido: 950000000 },
      { sector: 'Agricultura',      pim: 360000000,  devengado: 274000000,  girado: 265000000,  comprometido: 318000000 },
      { sector: 'Vivienda',         pim: 230000000,  devengado: 152000000,  girado: 147000000,  comprometido: 185000000 },
    ]},
    lambayeque:  { nombre: 'Lambayeque',        sectores: [
      { sector: 'Educación',        pim: 1020000000, devengado: 878000000,  girado: 857000000,  comprometido: 950000000 },
      { sector: 'Salud',            pim: 560000000,  devengado: 478000000,  girado: 466000000,  comprometido: 520000000 },
      { sector: 'Transportes',      pim: 720000000,  devengado: 518000000,  girado: 501000000,  comprometido: 615000000 },
      { sector: 'Agricultura',      pim: 245000000,  devengado: 185000000,  girado: 179000000,  comprometido: 215000000 },
      { sector: 'Vivienda',         pim: 165000000,  devengado: 108000000,  girado: 104000000,  comprometido: 132000000 },
    ]},
    lima:        { nombre: 'Lima Metropolitana',sectores: [
      { sector: 'Educación',        pim: 8200000000, devengado: 7462000000, girado: 7280000000, comprometido: 7850000000 },
      { sector: 'Salud',            pim: 4500000000, devengado: 4005000000, girado: 3905000000, comprometido: 4250000000 },
      { sector: 'Transportes',      pim: 5800000000, devengado: 4524000000, girado: 4374000000, comprometido: 5100000000 },
      { sector: 'Vivienda',         pim: 1850000000, devengado: 1295000000, girado: 1252000000, comprometido: 1580000000 },
      { sector: 'Desarrollo Social',pim: 980000000,  devengado: 843000000,  girado: 822000000,  comprometido: 912000000 },
    ]},
    limaregion:  { nombre: 'Lima Región',       sectores: [
      { sector: 'Educación',        pim: 680000000,  devengado: 578000000,  girado: 564000000,  comprometido: 630000000 },
      { sector: 'Salud',            pim: 375000000,  devengado: 318000000,  girado: 310000000,  comprometido: 348000000 },
      { sector: 'Transportes',      pim: 520000000,  devengado: 364000000,  girado: 352000000,  comprometido: 420000000 },
      { sector: 'Agricultura',      pim: 188000000,  devengado: 141000000,  girado: 136000000,  comprometido: 162000000 },
      { sector: 'Vivienda',         pim: 120000000,  devengado: 78000000,   girado: 75000000,   comprometido: 94000000  },
    ]},
    loreto:      { nombre: 'Loreto',            sectores: [
      { sector: 'Educación',        pim: 980000000,  devengado: 794000000,  girado: 774000000,  comprometido: 880000000 },
      { sector: 'Salud',            pim: 540000000,  devengado: 432000000,  girado: 421000000,  comprometido: 490000000 },
      { sector: 'Transportes',      pim: 680000000,  devengado: 428000000,  girado: 414000000,  comprometido: 548000000 },
      { sector: 'Agricultura',      pim: 235000000,  devengado: 169000000,  girado: 163000000,  comprometido: 198000000 },
      { sector: 'Vivienda',         pim: 145000000,  devengado: 84000000,   girado: 81000000,   comprometido: 108000000 },
    ]},
    madrededios: { nombre: 'Madre de Dios',     sectores: [
      { sector: 'Educación',        pim: 245000000,  devengado: 210000000,  girado: 205000000,  comprometido: 228000000 },
      { sector: 'Salud',            pim: 135000000,  devengado: 114000000,  girado: 111000000,  comprometido: 125000000 },
      { sector: 'Transportes',      pim: 290000000,  devengado: 188000000,  girado: 182000000,  comprometido: 235000000 },
      { sector: 'Agricultura',      pim: 98000000,   devengado: 71000000,   girado: 68000000,   comprometido: 84000000  },
      { sector: 'Ambiente',         pim: 68000000,   devengado: 47000000,   girado: 45000000,   comprometido: 56000000  },
    ]},
    moquegua:    { nombre: 'Moquegua',          sectores: [
      { sector: 'Educación',        pim: 380000000,  devengado: 336000000,  girado: 328000000,  comprometido: 358000000 },
      { sector: 'Salud',            pim: 208000000,  devengado: 181000000,  girado: 177000000,  comprometido: 195000000 },
      { sector: 'Transportes',      pim: 420000000,  devengado: 319000000,  girado: 308000000,  comprometido: 368000000 },
      { sector: 'Agricultura',      pim: 145000000,  devengado: 110000000,  girado: 106000000,  comprometido: 128000000 },
      { sector: 'Vivienda',         pim: 98000000,   devengado: 68000000,   girado: 65000000,   comprometido: 80000000  },
    ]},
    pasco:       { nombre: 'Pasco',             sectores: [
      { sector: 'Educación',        pim: 410000000,  devengado: 344000000,  girado: 335000000,  comprometido: 378000000 },
      { sector: 'Salud',            pim: 225000000,  devengado: 185000000,  girado: 180000000,  comprometido: 208000000 },
      { sector: 'Transportes',      pim: 348000000,  devengado: 226000000,  girado: 218000000,  comprometido: 278000000 },
      { sector: 'Agricultura',      pim: 138000000,  devengado: 101000000,  girado: 97000000,   comprometido: 118000000 },
      { sector: 'Vivienda',         pim: 82000000,   devengado: 49000000,   girado: 47000000,   comprometido: 62000000  },
    ]},
    piura:       { nombre: 'Piura',             sectores: [
      { sector: 'Educación',        pim: 1820000000, devengado: 1548000000, girado: 1510000000, comprometido: 1692000000 },
      { sector: 'Salud',            pim: 998000000,  devengado: 848000000,  girado: 827000000,  comprometido: 928000000 },
      { sector: 'Transportes',      pim: 1280000000, devengado: 896000000,  girado: 867000000,  comprometido: 1075000000 },
      { sector: 'Agricultura',      pim: 395000000,  devengado: 300000000,  girado: 290000000,  comprometido: 348000000 },
      { sector: 'Vivienda',         pim: 248000000,  devengado: 164000000,  girado: 158000000,  comprometido: 198000000 },
    ]},
    puno:        { nombre: 'Puno',              sectores: [
      { sector: 'Educación',        pim: 1250000000, devengado: 1050000000, girado: 1024000000, comprometido: 1158000000 },
      { sector: 'Salud',            pim: 685000000,  devengado: 575000000,  girado: 561000000,  comprometido: 635000000 },
      { sector: 'Transportes',      pim: 980000000,  devengado: 676000000,  girado: 654000000,  comprometido: 808000000 },
      { sector: 'Agricultura',      pim: 318000000,  devengado: 238000000,  girado: 230000000,  comprometido: 275000000 },
      { sector: 'Vivienda',         pim: 198000000,  devengado: 126000000,  girado: 122000000,  comprometido: 158000000 },
    ]},
    sanmartin:   { nombre: 'San Martín',        sectores: [
      { sector: 'Educación',        pim: 720000000,  devengado: 612000000,  girado: 597000000,  comprometido: 668000000 },
      { sector: 'Salud',            pim: 395000000,  devengado: 332000000,  girado: 324000000,  comprometido: 365000000 },
      { sector: 'Transportes',      pim: 545000000,  devengado: 381000000,  girado: 368000000,  comprometido: 445000000 },
      { sector: 'Agricultura',      pim: 205000000,  devengado: 154000000,  girado: 149000000,  comprometido: 178000000 },
      { sector: 'Vivienda',         pim: 118000000,  devengado: 74000000,   girado: 71000000,   comprometido: 92000000  },
    ]},
    tacna:       { nombre: 'Tacna',             sectores: [
      { sector: 'Educación',        pim: 465000000,  devengado: 411000000,  girado: 401000000,  comprometido: 440000000 },
      { sector: 'Salud',            pim: 255000000,  devengado: 221000000,  girado: 216000000,  comprometido: 240000000 },
      { sector: 'Transportes',      pim: 380000000,  devengado: 289000000,  girado: 279000000,  comprometido: 330000000 },
      { sector: 'Agricultura',      pim: 158000000,  devengado: 119000000,  girado: 115000000,  comprometido: 138000000 },
      { sector: 'Vivienda',         pim: 105000000,  devengado: 72000000,   girado: 69000000,   comprometido: 86000000  },
    ]},
    tumbes:      { nombre: 'Tumbes',            sectores: [
      { sector: 'Educación',        pim: 298000000,  devengado: 256000000,  girado: 250000000,  comprometido: 278000000 },
      { sector: 'Salud',            pim: 165000000,  devengado: 140000000,  girado: 137000000,  comprometido: 154000000 },
      { sector: 'Transportes',      pim: 225000000,  devengado: 158000000,  girado: 152000000,  comprometido: 185000000 },
      { sector: 'Agricultura',      pim: 88000000,   devengado: 66000000,   girado: 64000000,   comprometido: 76000000  },
      { sector: 'Vivienda',         pim: 68000000,   devengado: 42000000,   girado: 40000000,   comprometido: 52000000  },
    ]},
    ucayali:     { nombre: 'Ucayali',           sectores: [
      { sector: 'Educación',        pim: 565000000,  devengado: 468000000,  girado: 456000000,  comprometido: 520000000 },
      { sector: 'Salud',            pim: 310000000,  devengado: 255000000,  girado: 249000000,  comprometido: 285000000 },
      { sector: 'Transportes',      pim: 420000000,  devengado: 285000000,  girado: 276000000,  comprometido: 340000000 },
      { sector: 'Agricultura',      pim: 158000000,  devengado: 116000000,  girado: 112000000,  comprometido: 136000000 },
      { sector: 'Vivienda',         pim: 98000000,   devengado: 60000000,   girado: 58000000,   comprometido: 76000000  },
    ]},
  }
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

// ── Mostrar/ocultar filtro de región ────────────────
function toggleRegionFilter() {
  const nivel  = document.getElementById('select-nivel').value;
  const group  = document.getElementById('group-region');
  const select = document.getElementById('select-region');
  const show   = nivel === 'regional' || nivel === 'local';

  if (show) {
    group.hidden = false;
    // Pequeña animación de entrada
    group.style.opacity   = '0';
    group.style.transform = 'translateY(-6px)';
    requestAnimationFrame(() => {
      group.style.transition = 'opacity .25s ease, transform .25s ease';
      group.style.opacity    = '1';
      group.style.transform  = 'translateY(0)';
    });
  } else {
    group.hidden  = true;
    select.value  = '';
    group.style.transition = '';
  }
}

// ── Filtrar datos según selección ──────────────────
function getFilteredData() {
  const nivel  = document.getElementById('select-nivel').value;
  const region = document.getElementById('select-region').value;
  const sector = document.getElementById('select-sector').value;

  // Vista por región
  if ((nivel === 'regional' || nivel === 'local') && region && DEMO_DATA.regiones[region]) {
    let data = DEMO_DATA.regiones[region].sectores.map(s => ({ ...s }));
    if (sector) {
      const sectorNombre = {
        educacion: 'Educ', salud: 'Salud', transportes: 'Trans',
        agricultura: 'Agri', vivienda: 'Vivie', ambiente: 'Ambi',
        cultura: 'Cultu', desarrollo: 'Desar',
      }[sector] || sector.slice(0, 5);
      const filtered = data.filter(d => d.sector.toLowerCase().includes(sectorNombre.toLowerCase()));
      if (filtered.length) data = filtered;
    }
    return data;
  }

  // Vista nacional (todos los sectores)
  let data = [...DEMO_DATA.sectores];
  if (sector) {
    const map = {
      educacion: 'Educación', salud: 'Salud',
      transportes: 'Transportes', interior: 'Interior',
      defensa: 'Defensa', agricultura: 'Agricultura',
      energia: 'Energía', vivienda: 'Vivienda',
      economia: 'Economía', trabajo: 'Trabajo',
      justicia: 'Justicia', rree: 'Relaciones',
      comercio: 'Comercio', ambiente: 'Ambiente',
      cultura: 'Cultura', mujer: 'Mujer',
      produce: 'Producción', desarrollo: 'Desarrollo',
    };
    const kw = map[sector]?.toLowerCase().slice(0, 5) || '___';
    const filtered = data.filter(d => d.sector.toLowerCase().includes(kw));
    if (filtered.length) data = filtered;
  }
  return data;
}

// ── Renderizar KPIs desde resumen oficial SIAF ─────
function renderKPIsFromResumen(resumen) {
  actualizarKPIs(
    resumen.pim,
    resumen.devengado,
    resumen.girado,
    resumen.comprometido,
    resumen.avance_pct,
  );
}

// ── Renderizar KPIs calculados desde filas ──────────
function renderKPIs(data) {
  const totalPIM        = sum(data, 'pim');
  const totalDevengado  = sum(data, 'devengado');
  const totalGirado     = sum(data, 'girado');
  const totalCompro     = sum(data, 'comprometido');
  const pct             = fmt.pctNum(totalDevengado, totalPIM);
  actualizarKPIs(totalPIM, totalDevengado, totalGirado, totalCompro, pct);
}

function actualizarKPIs(pim, devengado, girado, comprometido, pct) {

  document.getElementById('kpi-pim').textContent          = fmt.currency(pim);
  document.getElementById('kpi-devengado').textContent    = fmt.currency(devengado);
  document.getElementById('kpi-girado').textContent       = fmt.currency(girado);
  document.getElementById('kpi-comprometido').textContent = fmt.currency(comprometido);
  document.getElementById('kpi-pct').textContent          = `${pct}% del presupuesto asignado`;

  const bar   = document.getElementById('exec-bar-fill');
  const track = document.getElementById('exec-bar-track');
  const label = document.getElementById('exec-pct-label');

  label.textContent    = `${pct}%`;
  label.style.color    = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)';
  track.setAttribute('aria-valuenow', pct);
  bar.style.background = pct >= 80
    ? 'linear-gradient(90deg, var(--green), #4CAF50)'
    : pct >= 60
      ? 'linear-gradient(90deg, var(--gold), #FFC107)'
      : 'linear-gradient(90deg, var(--red), #EF5350)';

  setTimeout(() => { bar.style.width = Math.min(pct, 100) + '%'; }, 80);
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

// ── Fuente de datos actual ─────────────────────────
let dataSource = 'demo'; // 'demo' | 'oficial'

function setBadgeFuente(fuente) {
  const notice = document.querySelector('.demo-notice');
  if (!notice) return;
  if (fuente === 'oficial') {
    notice.style.background  = '#E8F5E9';
    notice.style.borderColor = '#81C784';
    notice.style.color       = '#1B5E20';
    notice.innerHTML = '✅ <span><strong>Datos oficiales</strong> obtenidos en tiempo real desde <a href="https://www.datosabiertos.gob.pe" target="_blank" rel="noopener">datosabiertos.gob.pe</a></span>';
  } else {
    notice.style.background  = '';
    notice.style.borderColor = '';
    notice.style.color       = '';
    notice.innerHTML = '⚠️ <span><strong>Datos ilustrativos:</strong> Esta demo muestra la estructura real del SIAF-MEF pero con valores de referencia. Para datos oficiales visita <a href="https://apps5.mineco.gob.pe/transparencia/Navegador/Default.aspx" target="_blank" rel="noopener">apps5.mineco.gob.pe</a>.</span>';
  }
}

// ── Consultar ──────────────────────────────────────
async function consultar() {
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
  btn.disabled = true;
  btn.textContent = '';

  const btnRestore = () => {
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="2"/>
        <path d="M12.5 12.5L16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      Consultar ahora`;
  };

  let resultado = null;

  try {
    const regionEl = document.getElementById('select-region');
    resultado = await cargarDatosOficiales({
      anio:   year,
      nivel:  nivel.value,
      region: regionEl.value,
      sector: sector.value,
    });

    if (resultado.fuente === 'oficial' && resultado.datos?.length) {
      currentData = resultado.datos;
      dataSource  = 'oficial';
    } else {
      currentData = getFilteredData();
      dataSource  = 'demo';
    }

    sortState = { col: null, asc: true };

    // Subtítulo
    const nivelLabel  = nivel.options[nivel.selectedIndex].text.replace(/^[^\wÀ-ɏ]+/, '');
    const regionLabel = regionEl.value ? ` · ${regionEl.options[regionEl.selectedIndex].text}` : '';
    const sectorLabel = sector.value ? sector.options[sector.selectedIndex].text : 'Todos los sectores';
    let subtitulo = `Año ${year} · ${nivelLabel || 'Todos los niveles'}${regionLabel} · ${sectorLabel}`;
    if (resultado?.ultimaActualizacion) subtitulo += ` · Act: ${resultado.ultimaActualizacion}`;
    document.getElementById('results-subtitle').textContent = subtitulo;

    setBadgeFuente(dataSource);

    if (dataSource === 'oficial' && resultado?.resumen) {
      renderKPIsFromResumen(resultado.resumen);
    } else {
      renderKPIs(currentData);
    }
    renderTable(currentData);
    renderChart(currentData);

    document.getElementById('empty-state').hidden  = true;
    document.getElementById('results-panel').hidden = false;
    document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    console.error('[consultar]', err);
  } finally {
    // El botón SIEMPRE se restaura, pase lo que pase
    btnRestore();
  }
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
  document.getElementById('select-nivel').value  = 'nacional'; // vuelve al default
  document.getElementById('select-region').value = '';
  document.getElementById('select-sector').value = '';
  document.getElementById('select-tipo').value   = '';
  toggleRegionFilter(); // oculta región porque nacional no la necesita
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

// ── API oficial — servidor Node proxy ──────────────
const API_BASE = window.location.port === '3000' ? '' : null;

// ── Mapa región selector → palabra clave SIAF ──────
const REGION_SIAF = {
  amazonas: 'AMAZONAS', ancash: 'ANCASH', apurimac: 'APURIMAC',
  arequipa: 'AREQUIPA', ayacucho: 'AYACUCHO', cajamarca: 'CAJAMARCA',
  callao: 'CALLAO', cusco: 'CUSCO', huancavelica: 'HUANCAVELICA',
  huanuco: 'HUANUCO', ica: 'ICA', junin: 'JUNIN',
  lalibertad: 'LA LIBERTAD', lambayeque: 'LAMBAYEQUE',
  lima: 'LIMA', limaregion: 'LIMA', loreto: 'LORETO',
  madrededios: 'MADRE DE DIOS', moquegua: 'MOQUEGUA', pasco: 'PASCO',
  piura: 'PIURA', puno: 'PUNO', sanmartin: 'SAN MARTIN',
  tacna: 'TACNA', tumbes: 'TUMBES', ucayali: 'UCAYALI',
};

// Limpia prefijos del SIAF: "E: GOBIERNO NACIONAL" → "Gobierno Nacional"
function limpiarNombre(nombre) {
  return nombre
    .replace(/^[A-Z0-9]+:\s*/, '')
    .replace(/GOBIERNOS?\s+/gi, 'Gob. ')
    .replace(/\b(\w+)/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .replace(/\bDe\b/g, 'de').replace(/\bY\b/g, 'y').replace(/\bDel\b/g, 'del')
    .trim();
}

// Elige dimensión según filtros
function elegirDimension(nivel, region, sector) {
  if (region)  return 'departamento';
  if (sector)  return 'funcion';
  return 'gobierno';
}

// Filtra por nivel de gobierno
function filtrarPorNivel(detalle, nivel) {
  if (!nivel) return detalle;
  const mapa = { nacional: 'NACIONAL', regional: 'REGIONAL', local: 'LOCAL' };
  const kw = mapa[nivel];
  return kw ? detalle.filter(d => d.sector.toUpperCase().includes(kw)) : detalle;
}

// Filtra por región (departamento)
function filtrarPorRegion(detalle, region) {
  if (!region || !REGION_SIAF[region]) return detalle;
  const kw = REGION_SIAF[region];
  return detalle.filter(d => d.sector.toUpperCase().includes(kw));
}

async function cargarDatosOficiales({ anio, nivel, region, sector } = {}) {
  if (API_BASE === null) return { fuente: 'demo', datos: null };

  try {
    const dim    = elegirDimension(nivel, region, sector);
    const params = new URLSearchParams({ anio, dim });
    const res    = await fetch(`${API_BASE}/api/consulta?${params}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    if (!json.detalle?.length) throw new Error('Sin registros');

    let detalle = json.detalle;
    if (region) detalle = filtrarPorRegion(detalle, region);
    else        detalle = filtrarPorNivel(detalle, nivel);

    detalle = detalle.map(d => ({ ...d, sector: limpiarNombre(d.sector) }));

    return {
      fuente:              'oficial',
      datos:               detalle,
      resumen:             json.resumen,
      ultimaActualizacion: json.ultima_actualizacion,
    };
  } catch (err) {
    console.warn('[API] Fallback a demo:', err.message);
    return { fuente: 'demo', datos: null };
  }
}

// ── Gráfico de barras ──────────────────────────────
function renderChart(data) {
  const container = document.getElementById('bar-chart');
  if (!container) return;

  const maxPIM = Math.max(...data.map(d => d.pim), 1);
  const HEIGHT = 180; // px altura máxima de barras

  const tooltip = document.getElementById('chart-tooltip');

  const wrap = document.createElement('div');
  wrap.className = 'chart-bars';

  data.forEach(row => {
    const pct    = fmt.pctNum(row.devengado, row.pim);
    const hPIM   = Math.round((row.pim       / maxPIM) * HEIGHT);
    const hDev   = Math.round((row.devengado / maxPIM) * HEIGHT);
    const label  = row.sector.length > 14
      ? row.sector.slice(0, 13) + '…'
      : row.sector;

    const group = document.createElement('div');
    group.className = 'chart-bar-group';
    group.innerHTML = `
      <span class="chart-bar-pct">${pct}%</span>
      <div class="chart-bar-pair">
        <div class="chart-bar chart-bar--pim" style="height:${hPIM}px"
          data-tip="${row.sector} — PIM: ${fmt.currency(row.pim)}"></div>
        <div class="chart-bar chart-bar--dev" style="height:${hDev}px"
          data-tip="${row.sector} — Devengado: ${fmt.currency(row.devengado)} (${pct}%)"></div>
      </div>
      <span class="chart-bar-label">${label}</span>
    `;
    wrap.appendChild(group);
  });

  container.innerHTML = '';
  container.appendChild(wrap);

  // Tooltip hover
  container.querySelectorAll('.chart-bar').forEach(bar => {
    bar.addEventListener('mousemove', e => {
      tooltip.textContent = bar.dataset.tip;
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top  = (e.clientY - 32) + 'px';
    });
    bar.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
  });
}

// ── Hero stats dinámicos ───────────────────────────
async function cargarHeroStats() {
  if (API_BASE === null) return; // solo si hay servidor Node
  try {
    const anio = new Date().getFullYear() - 1;
    const res  = await fetch(`${API_BASE}/api/consulta?anio=${anio}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return;
    const json = await res.json();
    if (!json.resumen) return;

    const { pim, avance_pct } = json.resumen;
    const elPIM  = document.getElementById('stat-pim');
    const elAvance = document.getElementById('stat-ejecucion');

    if (elPIM) elPIM.textContent = fmt.currency(pim);
    if (elAvance) {
      // Animar hacia el valor real
      const target = avance_pct;
      let current  = 0;
      const step   = target / 40;
      const timer  = setInterval(() => {
        current = Math.min(current + step, target);
        elAvance.textContent = current.toFixed(1) + '%';
        if (current >= target) clearInterval(timer);
      }, 30);
    }

    // Actualizar año en el stat
    const elAnio = document.querySelector('.hero-stat span');
    if (elAnio && elAnio.textContent.includes('Presupuesto')) {
      elAnio.textContent = `Presupuesto ${anio}`;
    }
  } catch { /* silencioso — el hero se queda con valores por defecto */ }
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

// ── Tema claro/oscuro ──────────────────────────────
function initThemeToggle() {
  const btn   = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('theme') || 'dark';
  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    btn.textContent = theme === 'light' ? '🌙' : '☀️';
    btn.setAttribute('aria-label', theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
  };
  apply(saved);
  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    apply(next);
    localStorage.setItem('theme', next);
  });
}

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-consultar').addEventListener('click', consultar);
  document.getElementById('btn-reset').addEventListener('click', resetFilters);
  document.getElementById('btn-export')?.addEventListener('click', exportCSV);
  document.getElementById('select-nivel').addEventListener('change', toggleRegionFilter);

  toggleRegionFilter(); // ocultar región al inicio (Nacional preseleccionado)
  attachSortListeners();
  initMobileMenu();
  initKeyboardShortcuts();
  initScrollAnimations();
  initThemeToggle();

  // Hero stats: datos reales si hay servidor, animación si no
  cargarHeroStats().catch(() => setTimeout(animateHeroNumbers, 600));
  setTimeout(animateHeroNumbers, 600);
});
