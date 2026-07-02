'use strict';

// ══════════════════════════════════════════════════
//  MEF Perú — Portal de Transparencia
//  Lógica de consulta y visualización
// ══════════════════════════════════════════════════

// ── Datos SIAF-MEF (Gobierno Nacional — Año 2024) ──
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
let currentData  = [];
let compareData  = null;   // datos del año anterior (modo comparación)
let compareMode  = false;
let compareYear  = null;
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

// ── Skeleton loaders ──────────────────────────────
function showSkeleton() {
  // Mostrar panel de resultados vacío con esqueletos
  document.getElementById('empty-state').hidden  = true;
  document.getElementById('results-panel').hidden = false;

  // KPIs skeleton
  document.querySelectorAll('.kpi-value').forEach(el => el.classList.add('skel-pulse'));
  document.querySelectorAll('.kpi-note').forEach(el => el.classList.add('skel-pulse'));

  // Tabla skeleton
  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const tr = document.createElement('tr');
    tr.className = 'skeleton-row';
    tr.innerHTML = `
      <td><span class="skel skel--name"></span></td>
      <td><span class="skel skel--num"></span></td>
      <td><span class="skel skel--num"></span></td>
      <td><span class="skel skel--bar"></span></td>
      <td><span class="skel skel--chip"></span></td>
    `;
    tbody.appendChild(tr);
  }
}

function hideSkeleton() {
  document.querySelectorAll('.skel-pulse').forEach(el => el.classList.remove('skel-pulse'));
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
  const tbody  = document.getElementById('table-body');
  const thead  = document.querySelector('.data-table thead tr');
  tbody.innerHTML = '';

  // Sincronizar cabecera con modo comparación
  const extraTh = thead.querySelector('.th-compare');
  if (compareMode && compareData) {
    if (!extraTh) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.className = 'th-compare';
      th.innerHTML = `Dev. ${compareYear} <span class="th-compare-note">(año ant.)</span>`;
      thead.insertBefore(th, thead.querySelector('th[data-col="avance"]'));
    }
  } else if (extraTh) {
    extraTh.remove();
  }

  data.forEach((row, i) => {
    const pct   = fmt.pctNum(row.devengado, row.pim);
    const tr    = document.createElement('tr');
    tr.className = 'data-row';
    tr.setAttribute('tabindex', '0');
    tr.setAttribute('aria-expanded', 'false');
    tr.title = 'Click para ver detalle completo';

    // Columna comparación
    let cmpCell = '';
    if (compareMode && compareData) {
      const cRow = compareData.find(c =>
        c.sector.toLowerCase().slice(0, 8) === row.sector.toLowerCase().slice(0, 8)
      );
      if (cRow) {
        const cPct  = fmt.pctNum(cRow.devengado, cRow.pim);
        const delta = pct - cPct;
        const sign  = delta >= 0 ? '+' : '';
        const cls   = delta >= 0 ? 'cmp-up' : 'cmp-down';
        cmpCell = `<td class="num"><span class="cmp-val">${fmt.currency(cRow.devengado)}</span><span class="cmp-delta ${cls}">${sign}${delta.toFixed(1)}pp</span></td>`;
      } else {
        cmpCell = `<td class="num cmp-na">—</td>`;
      }
    }

    tr.innerHTML = `
      <td><span class="row-expand-icon" aria-hidden="true">▶</span><strong>${row.sector}</strong></td>
      <td class="num">${fmt.currency(row.pim)}</td>
      <td class="num">${fmt.currency(row.devengado)}</td>
      ${cmpCell}
      <td>
        ${miniBar(pct)}
        <span style="font-size:12px;color:var(--text-3);margin-left:6px">${pct}%</span>
      </td>
      <td>${statusChip(pct)}</td>
    `;

    tr.addEventListener('click', () => toggleRowDetail(tr, row));
    tr.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRowDetail(tr, row); }
    });

    tbody.appendChild(tr);
  });
}

// ── Drill-down: expandir fila con detalle completo ──
function toggleRowDetail(tr, row) {
  const isExpanded = tr.getAttribute('aria-expanded') === 'true';

  // Colapsar cualquier otra fila abierta
  document.querySelectorAll('.data-row[aria-expanded="true"]').forEach(r => {
    r.setAttribute('aria-expanded', 'false');
    r.querySelector('.row-expand-icon').textContent = '▶';
    const det = r.nextElementSibling;
    if (det?.classList.contains('row-detail')) det.remove();
  });

  if (isExpanded) return;

  tr.setAttribute('aria-expanded', 'true');
  tr.querySelector('.row-expand-icon').textContent = '▼';

  const pct    = fmt.pctNum(row.devengado, row.pim);
  const detail = document.createElement('tr');
  detail.className = 'row-detail';
  const colSpan = (compareMode && compareData) ? 6 : 5;
  detail.innerHTML = `
    <td colspan="${colSpan}">
      <div class="row-detail-inner">
        <div class="row-detail-grid">
          <div class="row-detail-item">
            <span class="detail-label">PIA</span>
            <strong class="detail-value">${fmt.currency(row.pia || 0)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">PIM</span>
            <strong class="detail-value">${fmt.currency(row.pim)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">Certificación</span>
            <strong class="detail-value">${fmt.currency(row.certificacion || 0)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">Comprometido Anual</span>
            <strong class="detail-value">${fmt.currency(row.comprometido || 0)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">Comprometido Mensual</span>
            <strong class="detail-value">${fmt.currency(row.compromiso_mens || 0)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">Devengado</span>
            <strong class="detail-value">${fmt.currency(row.devengado)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">Girado</span>
            <strong class="detail-value">${fmt.currency(row.girado || 0)}</strong>
          </div>
          <div class="row-detail-item">
            <span class="detail-label">Avance</span>
            <strong class="detail-value" style="color:${pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--gold)' : 'var(--red)'}">${pct}%</strong>
          </div>
        </div>
      </div>
    </td>
  `;
  tr.after(detail);
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

// ── Comparación interanual ─────────────────────────
function initCompare() {
  const btn = document.getElementById('btn-compare');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    compareMode = !compareMode;
    btn.setAttribute('aria-pressed', String(compareMode));
    btn.classList.toggle('btn-compare--active', compareMode);

    if (compareMode && currentData.length) {
      const year = Number(document.getElementById('select-year').value);
      compareYear = year - 1;
      btn.textContent = '';
      btn.disabled = true;
      btn.innerHTML = `<span class="btn-compare-spinner"></span> Cargando ${compareYear}…`;

      try {
        const nivel  = document.getElementById('select-nivel').value;
        const region = document.getElementById('select-region').value;
        const sector = document.getElementById('select-sector').value;
        const res = await cargarDatosOficiales({ anio: compareYear, nivel, region, sector });
        compareData = (res.fuente === 'oficial' && res.datos?.length) ? res.datos : null;
      } catch { compareData = null; }

      btn.disabled = false;
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        ${compareMode ? `Ocultar ${compareYear}` : 'Comparar año anterior'}`;
    } else {
      compareData = null;
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        Comparar año anterior`;
    }

    renderTable(currentData);
    renderChart(currentData);
  });
}

// ── Fuente de datos actual ─────────────────────────
let dataSource = 'siaf'; // 'siaf' | 'oficial'

function setBadgeFuente(fuente) {
  const notice = document.querySelector('.demo-notice');
  if (!notice) return;
  if (fuente === 'oficial') {
    notice.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;margin-top:1px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <span><strong>Datos oficiales en tiempo real</strong> obtenidos directamente desde el <a href="https://apps5.mineco.gob.pe/transparencia/Navegador/Default.aspx" target="_blank" rel="noopener">SIAF-MEF</a>.</span>`;
    notice.style.background  = 'rgba(34,197,94,.08)';
    notice.style.borderColor = 'rgba(34,197,94,.3)';
    notice.style.color       = 'var(--text-2)';
  } else {
    notice.style.background  = '';
    notice.style.borderColor = '';
    notice.style.color       = '';
    notice.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;margin-top:1px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>
    <span><strong>Fuente: SIAF-MEF</strong> · Datos reales del presupuesto público 2024 del Gobierno del Perú. Consulta el detalle oficial en <a href="https://apps5.mineco.gob.pe/transparencia/Navegador/Default.aspx" target="_blank" rel="noopener">apps5.mineco.gob.pe</a>.</span>`;
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

  // Ocultar banner de error previo
  const errBanner = document.getElementById('api-error-banner');
  if (errBanner) errBanner.hidden = true;

  // Mostrar skeleton inmediatamente
  showSkeleton();

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
      dataSource  = 'siaf';
    }

    sortState    = { col: null, asc: true };
    // Resetear comparación al hacer nueva consulta
    compareMode  = false;
    compareData  = null;
    const cmpBtn = document.getElementById('btn-compare');
    if (cmpBtn) {
      cmpBtn.setAttribute('aria-pressed', 'false');
      cmpBtn.classList.remove('btn-compare--active');
      cmpBtn.disabled = false;
      cmpBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> Comparar año anterior`;
    }

    // Subtítulo
    const nivelLabel  = nivel.options[nivel.selectedIndex].text.replace(/^[^\wÀ-ɏ]+/, '');
    const regionLabel = regionEl.value ? ` · ${regionEl.options[regionEl.selectedIndex].text}` : '';
    const sectorLabel = sector.value ? sector.options[sector.selectedIndex].text : 'Todos los sectores';
    document.getElementById('results-subtitle').textContent =
      `Año ${year} · ${nivelLabel || 'Todos los niveles'}${regionLabel} · ${sectorLabel}`;

    // Badge de última actualización
    const badge     = document.getElementById('update-badge');
    const badgeTxt  = document.getElementById('update-badge-text');
    if (badge && badgeTxt && resultado?.ultimaActualizacion) {
      badgeTxt.textContent = `Datos actualizados al: ${resultado.ultimaActualizacion}`;
      badge.hidden = false;
    } else if (badge) {
      badge.hidden = true;
    }

    setBadgeFuente(dataSource);

    // Mostrar banner si los datos son fallback (no oficiales)
    if (dataSource !== 'oficial' && errBanner) {
      document.getElementById('api-error-text').textContent =
        'No se pudo conectar con el SIAF-MEF en tiempo real. Se muestran los últimos datos disponibles.';
      errBanner.hidden = false;
    }

    hideSkeleton();
    if (dataSource === 'oficial' && resultado?.resumen) {
      renderKPIsFromResumen(resultado.resumen);
    } else {
      renderKPIs(currentData);
    }
    renderTable(currentData);
    renderChart(currentData);

    // Resetear tendencia al hacer nueva consulta
    const trendSec = document.getElementById('trend-section');
    if (trendSec) trendSec.hidden = true;
    const btnTrend = document.getElementById('btn-trend');
    if (btnTrend) { btnTrend.classList.remove('btn-trend--active'); btnTrend.textContent = ''; btnTrend.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Ver tendencia`; }

    document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });

  } catch (err) {
    console.error('[consultar]', err);
    hideSkeleton();
    document.getElementById('empty-state').hidden  = false;
    document.getElementById('results-panel').hidden = true;
    if (errBanner) {
      document.getElementById('api-error-text').textContent =
        `Error inesperado: ${err.message}. Intenta de nuevo.`;
      errBanner.hidden = false;
    }
  } finally {
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
    nav.classList.toggle('nav--open', !expanded);
  });

  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      btn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('nav--open');
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
      signal: AbortSignal.timeout(50000),
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

  // Actualizar leyenda según modo comparación
  const legendCmp = document.querySelector('.chart-legend-item--cmp');
  if (compareMode && compareData) {
    if (!legendCmp) {
      const leg = document.querySelector('.chart-legend');
      if (leg) {
        const span = document.createElement('span');
        span.className = 'chart-legend-item chart-legend-item--cmp';
        span.textContent = `Dev. ${compareYear}`;
        leg.appendChild(span);
      }
    }
  } else if (legendCmp) {
    legendCmp.remove();
  }

  const allPIM = data.map(d => d.pim);
  if (compareMode && compareData) compareData.forEach(d => allPIM.push(d.pim));
  const maxPIM = Math.max(...allPIM, 1);
  const HEIGHT = 240;

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

    let cmpBar = '';
    if (compareMode && compareData) {
      const cRow = compareData.find(c =>
        c.sector.toLowerCase().slice(0, 8) === row.sector.toLowerCase().slice(0, 8)
      );
      if (cRow) {
        const hCmp = Math.round((cRow.devengado / maxPIM) * HEIGHT);
        const cPct = fmt.pctNum(cRow.devengado, cRow.pim);
        cmpBar = `<div class="chart-bar chart-bar--cmp" style="height:${hCmp}px"
          data-tip="${row.sector} — Dev. ${compareYear}: ${fmt.currency(cRow.devengado)} (${cPct}%)"></div>`;
      }
    }

    const showPct = hPIM >= 24;
    const group = document.createElement('div');
    group.className = 'chart-bar-group';
    group.innerHTML = `
      ${showPct ? `<span class="chart-bar-pct">${pct}%</span>` : ''}
      <div class="chart-bar-pair">
        <div class="chart-bar chart-bar--pim" style="height:${hPIM}px"
          data-tip="${row.sector} — PIM: ${fmt.currency(row.pim)}"></div>
        <div class="chart-bar chart-bar--dev" style="height:${hDev}px"
          data-tip="${row.sector} — Devengado: ${fmt.currency(row.devengado)} (${pct}%)"></div>
        ${cmpBar}
      </div>
      <span class="chart-bar-label">${label}</span>
    `;
    wrap.appendChild(group);
  });

  container.innerHTML = '';
  container.appendChild(wrap);

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
      signal: AbortSignal.timeout(50000),
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
  // faq-item excluido: usa <details> nativo; animarlo con opacity:0 puede
  // dejarlo invisible si IntersectionObserver no dispara (ej. headless).
  const items = document.querySelectorAll('.step-card, .glosario-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  items.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity .45s ease, transform .45s ease';
    obs.observe(el);
  });
}

// ── Tema claro/oscuro ──────────────────────────────
const ICON_SUN  = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`;
const ICON_MOON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function initThemeToggle() {
  const btn   = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('theme') || 'dark';
  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
    btn.innerHTML = theme === 'light' ? ICON_MOON : ICON_SUN;
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

// ══════════════════════════════════════════════════
//  CHATBOT ROBUSTO — Motor de intents JS (sin API externa)
//  30+ intents, scoring por regex, context-aware, chips de sugerencia
// ══════════════════════════════════════════════════

const CHAT_INTENTS = [
  {
    id: 'greeting',
    rx: [/\b(hola|buenos?\s*d[íi]as?|buenas|hey|saludos|buen\s*d[íi]a|qu[eé]\s*tal)\b/],
    resp: ['¡Hola! Soy el asistente del Portal de Transparencia del MEF Perú.\nPuedo explicarte términos presupuestales, interpretar datos y enseñarte a usar el portal.\n¿Qué deseas saber?'],
    sugs: ['¿Qué es el PIM?', '¿Cómo consultar el presupuesto?', '¿Qué es el SIAF?'],
  },
  {
    id: 'thanks',
    rx: [/\b(gracias|muchas\s*gracias|thanks|genial|perfecto|excelente|buen[íi]simo)\b/],
    resp: ['¡Con gusto! Si tienes más preguntas sobre el presupuesto público, aquí estoy.'],
    sugs: ['¿Qué es el devengado?', '¿Qué significa ejecución baja?'],
  },
  {
    id: 'bye',
    rx: [/\b(adi[oó]s|chau|hasta\s*luego|nos\s*vemos|bye|hasta\s*pronto)\b/],
    resp: ['¡Hasta luego! Recuerda que puedes consultar el presupuesto público cuando quieras. 👋'],
  },
  {
    id: 'who',
    rx: [/qui[eé]n\s*eres|qu[eé]\s*eres|eres\s*(un\s*)?bot|eres\s*(una\s*)?ia|c[oó]mo\s*funciona(s)?|eres\s*humano/],
    resp: ['Soy un asistente virtual del **Portal de Transparencia del MEF Perú**.\nFunciono con un motor de intents basado en reglas JavaScript — analizo tu pregunta, la comparo con patrones y devuelvo la respuesta más relevante.\nNo uso inteligencia artificial externa ni APIs de pago.'],
  },
  {
    id: 'help',
    rx: [/\b(ayuda|help)\b|qu[eé]\s*(puedes|sabes)\s*(hacer|responder)|para\s*qu[eé]\s*sirves|qu[eé]\s*temas/],
    resp: ['Puedo ayudarte con:\n\n**📚 Glosario:** PIM, PIA, devengado, girado, comprometido, certificación, SIAF\n**📊 Interpretación:** ejecución alta/baja, cómo leer el gráfico y la tendencia\n**🏛️ Estructura:** sectores, ministerios, niveles de gobierno, regiones, canon\n**🔧 Portal:** cómo filtrar, comparar años, exportar CSV, imprimir, buscar en tabla\n**💰 Presupuesto:** ciclo presupuestal, fuente de datos, actualización\n\nEscribe tu pregunta con naturalidad o elige una sugerencia.'],
    sugs: ['¿Qué es el PIM?', '¿Qué es el devengado?', '¿Cómo uso el portal?'],
  },
  {
    id: 'pim',
    rx: [/\bpim\b/, /presupuesto\s+(institucional\s+)?modificado/, /presupuesto\s+asignado/],
    resp: ['El **PIM** (Presupuesto Institucional Modificado) es el presupuesto total disponible para cada sector al finalizar el año.\n\nEmpieza como el **PIA** (presupuesto inicial) y se va modificando con:\n• Créditos suplementarios\n• Transferencias entre partidas\n• Incorporación de saldos de años anteriores\n\nEn el portal: la columna **"PIM (S/)"** muestra este monto para cada sector.'],
    sugs: ['¿Cuál es la diferencia entre PIM y PIA?', '¿Qué es el devengado?'],
  },
  {
    id: 'pia',
    rx: [/\bpia\b/, /presupuesto\s+(institucional\s+)?de\s+apertura/, /presupuesto\s+inicial/, /presupuesto\s+aprobado\s+por\s+el\s+congreso/],
    resp: ['El **PIA** (Presupuesto Institucional de Apertura) es el presupuesto aprobado por el Congreso al inicio del año fiscal.\n\nEs la "fotografía inicial" antes de cualquier modificación. Durante el año se convierte en el **PIM**.\n\n💡 Tip: haz clic en cualquier fila de la tabla para ver el PIA exacto de ese sector.'],
    sugs: ['¿Qué es el PIM?', '¿Cuál es la diferencia entre PIM y PIA?'],
  },
  {
    id: 'pim_vs_pia',
    rx: [/diferencia.*(pim|pia)/, /(pim|pia).*(diferencia|versus|vs\.?)/, /pim.*pia|pia.*pim/],
    resp: ['**PIA vs PIM — diferencia clave:**\n\n**PIA** → Presupuesto inicial aprobado por el Congreso (diciembre del año anterior)\n**PIM** → PIA + todas las modificaciones durante el año fiscal\n\nEl PIM siempre es ≥ al PIA porque acumula recursos adicionales. La diferencia muestra cuántos recursos extra recibió el sector.'],
  },
  {
    id: 'devengado',
    rx: [/\bdevengado\b/, /gasto\s+(ejecutado|reconocido)/, /cu[aá]nto\s+se\s+(ha\s+)?ejecutado/, /ejecuci[oó]n\s+real/],
    resp: ['El **devengado** es el gasto que el Estado ya reconoció porque recibió el bien o servicio contratado, aunque aún no haya pagado la factura.\n\n**Ejemplo:** Si el Estado contrató la construcción de una escuela y la obra fue entregada, ese monto es devengado aunque el pago tarde unos días más.\n\nEn el portal: columna **"Devengado (S/)"** y el **% de avance** = Devengado ÷ PIM × 100.'],
    sugs: ['¿Cuál es la diferencia entre devengado y girado?', '¿Qué significa ejecución baja?'],
  },
  {
    id: 'girado',
    rx: [/\bgirado\b/, /pago\s+efectivo/, /dinero\s+(que\s+)?sali[oó]/, /\bpagado\b/],
    resp: ['El **girado** es el pago efectivo ya realizado: el dinero que salió de las cuentas del Estado al proveedor o beneficiario.\n\n**Flujo del gasto:**\nComprometido → Devengado → **Girado** ✓\n\nSiempre: Girado ≤ Devengado. La diferencia son facturas ya reconocidas pero aún en trámite bancario de pago.'],
    sugs: ['¿Qué es el devengado?', '¿Qué es el comprometido?'],
  },
  {
    id: 'dev_vs_girado',
    rx: [/diferencia.*(devengado|girado)/, /(devengado|girado).*(diferencia|versus|vs\.?)/, /devengado.*girado|girado.*devengado/, /por\s*qu[eé].*girado.*menor/],
    resp: ['**Devengado vs Girado:**\n\n• **Devengado:** bien/servicio recibido → la obligación de pago existe\n• **Girado:** el pago fue transferido → el dinero salió del banco del Estado\n\nLa diferencia (Devengado − Girado) son facturas aprobadas aún en proceso de pago. Es normal que el girado sea ligeramente menor al cierre del mes.'],
  },
  {
    id: 'comprometido',
    rx: [/\bcomprometido\b/, /\bcompromiso\s+(anual|mensual)?\b/, /contratos?\s+firmados?/, /[oó]rdenes?\s+de\s+compra/],
    resp: ['El **comprometido** es el monto que el Estado ya reservó mediante contratos u órdenes de compra firmadas, pero todavía no recibió el bien o servicio.\n\n**Flujo completo del gasto público:**\n1. **PIM** — presupuesto disponible\n2. **Comprometido** — contrato firmado\n3. **Devengado** — bien/servicio recibido\n4. **Girado** — pago efectuado\n\n💡 En el detalle de cada fila verás Comprometido Anual y Mensual por separado.'],
  },
  {
    id: 'certificacion',
    rx: [/\bcertificaci[oó]n\b/, /\bcertificado\b/, /antes\s+del\s+compromiso/, /disponibilidad\s+presupuestal/],
    resp: ['La **certificación presupuestal** garantiza que existe disponibilidad de fondos antes de firmar un contrato.\n\n**Orden correcto:**\nPIM → **Certificación** → Comprometido → Devengado → Girado\n\nSin certificación no se puede comprometer gasto. Es el mecanismo de control que evita contratar sin presupuesto real.'],
  },
  {
    id: 'siaf',
    rx: [/\bsiaf\b/, /sistema\s+integrado\s+de\s+administraci[oó]n/, /sistema\s+(inform[aá]tico|del\s+estado)/, /apps5\.mineco/, /transparencia.*mef/],
    resp: ['El **SIAF** (Sistema Integrado de Administración Financiera) es el sistema oficial del Estado peruano para registrar todas las operaciones presupuestales y financieras.\n\nTodos los datos de este portal provienen directamente del SIAF-MEF:\n🔗 apps5.mineco.gob.pe\n\nEs el mismo sistema que usan los funcionarios del Estado para registrar sus gastos diariamente en tiempo real.'],
    sugs: ['¿Con qué frecuencia se actualizan los datos?', '¿Los datos son oficiales?'],
  },
  {
    id: 'ejecucion',
    rx: [/ejecuci[oó]n\s+presupuestal/, /\bavance\s+de\s+ejecuci/, /porcentaje\s+de\s+ejecuci/, /qu[eé]\s+significa.*%\s+de\s+avance/, /c[oó]mo\s+se\s+mide\s+la\s+ejecuci/],
    resp: ['La **ejecución presupuestal** mide qué porcentaje del PIM ya fue devengado (gastado efectivamente).\n\n**Fórmula:** Devengado ÷ PIM × 100\n\n**Escala de colores del portal:**\n🟢 **≥ 80%** — Alto (buena gestión)\n🟡 **60–79%** — Medio (aceptable)\n🔴 **< 60%** — Bajo (requiere atención)\n\nEjemplo: un sector con 85% de ejecución gastó S/ 85 de cada S/ 100 asignados.'],
    sugs: ['¿Qué significa ejecución baja?', '¿Por qué algunos sectores ejecutan menos?'],
  },
  {
    id: 'ejecucion_baja',
    rx: [/ejecuci[oó]n\s+(baja|baj[íi]sima)/, /\bpoco\s+ejecutado\b/, /menos\s+del\s+60/, /por\s*qu[eé]\s+(no\s+)?se\s+ejec/, /baja\s+capacidad\s+de\s+gasto/, /no\s+gast/],
    resp: ['**¿Por qué la ejecución puede ser baja?**\n\n• **Trabas administrativas:** procesos de contratación lentos o complejos\n• **Proyectos complejos:** obras de infraestructura que tardan en iniciarse\n• **Falta de personal:** sin gestores que tramiten el gasto\n• **Problemas legales:** arbitrajes o cuestionamientos a contratos\n• **Estacionalidad:** algunos sectores concentran el gasto en ciertos meses\n\nUna ejecución baja al cierre del año puede implicar devolución de recursos al Tesoro Público.'],
    sugs: ['¿Qué sectores ejecutan mejor?', '¿Cómo se mide la ejecución?'],
  },
  {
    id: 'sectores',
    rx: [/\bsector(es)?\b(?!\s+privado)/, /\bministerio(s)?\b/, /cu[aá]les?\s+son\s+los\s+sector/, /qu[eé]\s+sector(es)?.*presupuesto/],
    resp: ['El presupuesto nacional se divide en **21 sectores** principales:\n\n🎓 Educación · 🏥 Salud · 🛣️ Transportes · 🔐 Interior · ⚔️ Defensa\n💰 Economía · 🏠 Vivienda · 🌾 Agricultura · ⚡ Energía y Minas\nJusticia · Trabajo · Relaciones Exteriores · Comercio Exterior\nAmbiente · Cultura · Mujer · Producción · Desarrollo Social y más.\n\nEn el portal: usa el filtro **"Sector / Ministerio"** para ver cada uno por separado.'],
    sugs: ['¿Cuánto presupuesto tiene Educación?', '¿Cómo filtrar por sector?'],
  },
  {
    id: 'educacion',
    rx: [/\beducaci[oó]n\b/, /\bminedu\b/, /ministerio\s+de\s+educaci/],
    resp: ['El sector **Educación** (MINEDU) es históricamente el de **mayor presupuesto** del Perú.\n\nRepresenta entre el **15–18% del presupuesto nacional**, con montos anuales cercanos a **S/ 38–42 mil millones** (2023–2025).\n\nIncluye sueldos de maestros, infraestructura escolar, materiales educativos y programas como Qali Warma.'],
    sugs: ['¿Cuánto tiene Salud?', '¿Cómo filtrar por sector?'],
  },
  {
    id: 'salud',
    rx: [/\bsalud\b(?!\s+de\s+la\s+economía)/, /\bminsa\b/, /ministerio\s+de\s+salud/, /\bessalud\b/],
    resp: ['El sector **Salud** (MINSA + EsSalud) es uno de los más críticos del Estado peruano.\n\nEl MINSA solo representa alrededor del **9–10% del presupuesto nacional** (~S/ 22–25 mil millones anuales).\n\nIncluye hospitales, centros de salud, medicamentos, personal médico y programas como Seguro Integral de Salud (SIS).'],
    sugs: ['¿Cómo comparar salud vs educación?', '¿Qué es el devengado?'],
  },
  {
    id: 'niveles',
    rx: [/nivel(es)?\s+de\s+gobierno/, /gobierno\s+(nacional|regional|local)/, /\bmunicipalidad\b/, /diferencia.*nacional.*regional/, /\bgobierno\s+sub/],
    resp: ['El presupuesto peruano se ejecuta en **3 niveles de gobierno:**\n\n🏛️ **Nacional** — Ministerios y entidades del gobierno central (Lima)\n🗺️ **Regional** — Los 25 gobiernos regionales del Perú\n🏘️ **Local** — Las 1,874 municipalidades provinciales y distritales\n\nEn el portal: cambia el filtro **"Nivel de gobierno"** para ver cada nivel por separado.'],
    sugs: ['¿Cómo filtrar por región?', '¿Qué sectores tienen los gobiernos regionales?'],
  },
  {
    id: 'regiones',
    rx: [/\bregi[oó]n(es)?\b/, /\bdepartamento(s)?\b/, /gobierno\s+regional/, /\bcusco\b|\bcajamarca\b|\barequipa\b|\bpiura\b|\blima\s+regi/],
    resp: ['El Perú tiene **25 regiones** con presupuesto propio ejecutado por Gobiernos Regionales.\n\n**Para consultar una región:**\n1. Selecciona **"Gobierno Regional"** en el nivel\n2. Aparecerá el filtro **"Región/Departamento"**\n3. Elige la región y presiona Consultar\n\nRegiones con mayor presupuesto: **Lima, Cusco, Piura, Cajamarca** (por tamaño y canon minero).'],
    sugs: ['¿Qué es el canon?', '¿Qué nivel de gobierno debo elegir?'],
  },
  {
    id: 'canon',
    rx: [/\bcanon\b/, /canon\s+(minero|petrolero|gas[íi]fero|forestal|hidroenerg)/, /recursos\s+naturales.*presupuesto/],
    resp: ['El **canon** es la participación que reciben los gobiernos regionales y locales por la explotación de recursos naturales en su territorio.\n\n**Tipos:**\n⛏️ **Minero** — Cajamarca, Áncash, Cusco (principales receptores)\n🛢️ **Petrolero** — Loreto, Ucayali\n🔥 **Gasífero** — Cusco, Ayacucho\n🌊 **Hidroenergético** — Junín, Huánuco\n\nRegiones con alto canon tienen presupuestos significativamente mayores.'],
  },
  {
    id: 'ciclo',
    rx: [/ciclo\s+presupuestal/, /proceso\s+presupuestal/, /c[oó]mo\s+se\s+(aprueba|elabora)\s+el\s+presupuesto/, /ley\s+de\s+presupuesto/, /fases?\s+del\s+presupuesto/],
    resp: ['**Ciclo presupuestal del Perú:**\n\n📝 **Formulación** (abr–ago): Los ministerios proponen su presupuesto al MEF\n🏛️ **Aprobación** (sep–dic): El Congreso aprueba la Ley de Presupuesto\n💼 **Ejecución** (ene–dic): Las entidades gastan → esto es lo que ves en el portal\n🔍 **Evaluación** (durante el año): Contraloría y MEF supervisan el gasto\n\nEl portal muestra en tiempo real la fase de **Ejecución**.'],
  },
  {
    id: 'total',
    rx: [/presupuesto\s+total/, /cu[aá]nto\s+es\s+el\s+presupuesto/, /total\s+del\s+presupuesto/, /presupuesto\s+del\s+per[uú]/],
    resp: ['El presupuesto total del Perú (PIM) varía cada año:\n\n• **2024:** ~S/ 249,000 millones (≈ US$ 67,000 M)\n• **2023:** ~S/ 231,000 millones\n• **2022:** ~S/ 214,000 millones\n\nPara ver el dato exacto: consulta sin filtros de sector con **"Gobierno Nacional"** y verás el total consolidado en los KPIs.'],
    sugs: ['¿Cuánto se ha ejecutado?', '¿Qué sector tiene más presupuesto?'],
  },
  {
    id: 'como_usar',
    rx: [/c[oó]mo\s+(us[ao]r?|consult[ao]r?)\s+(el\s+portal|esto)/, /c[oó]mo\s+hago\s+una\s+consulta/, /pasos\s+para\s+consultar/, /ense[ñn][aá]me\s+a\s+us/, /c[oó]mo\s+funciona\s+el\s+portal/],
    resp: ['**Cómo consultar el presupuesto:**\n\n1️⃣ **Elige el año** — desde 2009 hasta el actual\n2️⃣ **Nivel de gobierno** — Nacional, Regional o Local\n3️⃣ *(Opcional)* **Sector** — un ministerio específico\n4️⃣ *(Si es Regional/Local)* **Región** — elige el departamento\n5️⃣ Presiona **"Consultar ahora"**\n\n📊 Verás: KPIs, barra de progreso, gráfico y tabla detallada.\n💡 **Haz clic en cualquier fila** para ver el detalle completo (PIA, Certificación, Comprometido…)'],
    sugs: ['¿Cómo filtrar por región?', '¿Cómo exportar los datos?'],
  },
  {
    id: 'comparar',
    rx: [/compar[ae]r?\s+(a[ñn]os?|per[íi]odos?)/, /a[ñn]o\s+anterior/, /c[oó]mo\s+compar/, /diferencia\s+entre\s+a[ñn]os?/],
    resp: ['Para **comparar con el año anterior:**\n\n1. Realiza tu consulta normal (ej. 2024)\n2. Haz clic en **"Comparar año anterior"** (arriba de los resultados)\n3. El portal carga 2023 automáticamente\n4. La tabla agrega una columna con el devengado del año anterior\n5. El delta en puntos porcentuales aparece en 🟢 verde (+) o 🔴 rojo (−)\n\nEl gráfico muestra una tercera barra azul para el año de comparación.'],
    sugs: ['¿Cómo leer la tendencia histórica?', '¿Cómo uso los filtros?'],
  },
  {
    id: 'tendencia',
    rx: [/tendencia\s+hist[oó]rica?/, /evoluci[oó]n\s+por\s+a[ñn]os?/, /gr[aá]fico\s+de\s+l[íi]nea/, /ver\s+tendencia/, /c[oó]mo\s+ver\s+la\s+tendencia/, /hist[oó]rico\s+de\s+ejecuci/],
    resp: ['El **gráfico de tendencia histórica** muestra la evolución del % de ejecución desde 2018 hasta hoy.\n\n**Cómo activarlo:**\n1. Realiza una consulta\n2. Haz clic en **"Ver tendencia"** (en la sección del gráfico)\n3. El portal carga todos los años en paralelo\n\n**Cómo leerlo:**\n🟢 Puntos por encima del 80% = buena gestión histórica\n🟡 Entre 60–80% = desempeño medio\n🔴 Debajo del 60% = requiere mejora\n\nEl badge muestra el cambio total en puntos porcentuales (pp).'],
  },
  {
    id: 'exportar',
    rx: [/export[ae]r?\s+(csv|excel|datos?|tabla)/, /descarg[ae]r?\s+(datos?|tabla|informe)/, /\bcsv\b|\bexcel\b/, /guardar\s+datos/],
    resp: ['Para **exportar a CSV:**\n\n1. Realiza una consulta\n2. Haz clic en **"Exportar CSV"** (sobre la tabla)\n3. Se descarga `mef-transparencia-XXXX.csv`\n4. Ábrelo con Excel o Google Sheets\n\nEl CSV incluye: Sector, PIM, Devengado, Girado, Comprometido y Avance %.\n\nPara datos más completos o históricos, visita el portal oficial del MEF.'],
  },
  {
    id: 'imprimir',
    rx: [/\bimprimir\b|\bprint\b/, /informe\s+impreso/, /generar\s+pdf/, /versi[oó]n\s+imprimible/],
    resp: ['Para **imprimir el informe:**\n\n1. Realiza tu consulta\n2. Haz clic en **"Imprimir"** (junto al botón de Exportar CSV)\n3. Se abre el diálogo de impresión del navegador\n\nEl portal aplica formato limpio automáticamente:\n✅ Oculta menú, chatbot, filtros y gráficos\n✅ Optimiza KPIs y tabla para papel A4\n\n💡 Desde el diálogo también puedes guardar como **PDF**.'],
  },
  {
    id: 'buscar',
    rx: [/buscar\s+(en\s+la\s+tabla|sector)/, /filtrar\s+la\s+tabla/, /encontrar\s+un\s+sector/, /caja\s+de\s+b[uú]squeda/, /buscar\s+r[aá]pido/],
    resp: ['La **búsqueda en tabla** filtra sectores al instante:\n\n1. Después de consultar, verás un campo de búsqueda sobre la tabla\n2. Escribe el nombre o parte del sector (ej: "trans", "educ", "salud")\n3. La tabla se filtra **en tiempo real** sin nuevas consultas al servidor\n\nMuy útil cuando hay muchos sectores en pantalla y quieres uno específico.'],
  },
  {
    id: 'detalle',
    rx: [/m[aá]s\s+detalle/, /detalle\s+completo/, /expandir\s+fila/, /clic\s+en\s+(la\s+)?fila/, /ver\s+pia|ver\s+certificaci|ver\s+comprometido/],
    resp: ['Para ver el **detalle completo de un sector:**\n\n1. Consulta normalmente\n2. Haz **clic en cualquier fila** de la tabla (o presiona Enter)\n3. La fila se expande mostrando todos los campos:\n   • PIA, PIM, Certificación\n   • Comprometido Anual y Mensual\n   • Devengado, Girado, Avance %\n\nHaz clic de nuevo para cerrar el detalle.'],
  },
  {
    id: 'actualizacion',
    rx: [/cu[aá]ndo\s+se\s+actualiz/, /frecuencia\s+de\s+actualizaci/, /datos\s+actualizados?/, /[uú]ltima\s+actualizaci/, /cu[aá]ntos?\s+d[íi]as/],
    resp: ['Los datos del SIAF-MEF se actualizan **diariamente** cada noche, procesando las operaciones del día anterior.\n\nEn este portal:\n🟢 Badge **"Datos actualizados al: DD/MM/AAAA"** = datos del SIAF en tiempo real\n⚡ El servidor mantiene **caché de 1 hora** para respuestas rápidas\n⚠️ Si el SIAF no está disponible, se muestran los **últimos datos guardados**'],
    sugs: ['¿Los datos son oficiales?', '¿Qué es el SIAF?'],
  },
  {
    id: 'fuente',
    rx: [/fuente\s+de\s+datos?/, /datos\s+oficiales?/, /son\s+datos\s+reales?/, /datos\s+confiables?/, /de\s+d[oó]nde\s+vienen\s+los\s+datos?/],
    resp: ['**Los datos son 100% oficiales**, provienen directamente del:\n\n🏛️ **SIAF-MEF** — Sistema Integrado de Administración Financiera\nPortal oficial: apps5.mineco.gob.pe\n\nSon los mismos datos que usa el Estado peruano para reportar la ejecución presupuestal. No se modifican ni interpolan: se extraen y presentan tal como los publica el MEF.'],
  },
  {
    id: 'app_pwa',
    rx: [/instalar\s+(la\s+)?app/, /agregar\s+a\s+(pantalla|inicio)/, /app\s+m[oó]vil/, /funciona\s+sin\s+internet/, /\bpwa\b/],
    resp: ['Este portal es una **PWA (Progressive Web App)** — puedes instalarlo como app en tu celular:\n\n**Android (Chrome):**\n1. Abre el portal en Chrome\n2. Toca los 3 puntos → "Agregar a pantalla de inicio"\n\n**iOS (Safari):**\n1. Abre en Safari → icono compartir\n2. "Añadir a pantalla de inicio"\n\nFunciona offline con los últimos datos en caché.'],
  },
];

// ── Motor de detección y respuesta ────────────────
const CHATBOT = {
  lastIntent: null,

  norm(t) {
    return t.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[¿¡]/g, ' ');
  },

  detect(text) {
    const t = this.norm(text);
    let best = null, topScore = 0;
    for (const intent of CHAT_INTENTS) {
      let score = 0;
      for (const rx of intent.rx) { if (rx.test(t)) score += 2; }
      // bonus si la misma intención fue la última (contexto de conversación)
      if (score > 0 && intent.id === this.lastIntent) score += 1;
      if (score > topScore) { best = intent; topScore = score; }
    }
    return topScore > 0 ? best : null;
  },

  respond(text) {
    const intent = this.detect(text);
    if (!intent) {
      return {
        html: this.fmt('No entendí bien tu pregunta. 🤔\nPuedo ayudarte con:\n• Términos: **PIM, PIA, devengado, girado, SIAF**\n• Ejecución presupuestal y cómo interpretarla\n• Cómo filtrar, comparar años, exportar o imprimir\n• Sectores, regiones y niveles de gobierno\n\nEscribe **"ayuda"** para ver todo lo que sé.'),
        sugs: ['¿Qué es el PIM?', '¿Cómo uso el portal?', 'ayuda'],
      };
    }
    this.lastIntent = intent.id;
    const txt = intent.resp[Math.floor(Math.random() * intent.resp.length)];
    return { html: this.fmt(txt), sugs: intent.sugs || [] };
  },

  fmt(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  },
};

// ── Chatbot UI ─────────────────────────────────────
function initChatbot() {
  const fab      = document.getElementById('chat-fab');
  const panel    = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');
  const form     = document.getElementById('chat-form');
  const input    = document.getElementById('chat-input');
  const msgList  = document.getElementById('chat-messages');
  if (!fab || !panel) return;

  function togglePanel(open) {
    panel.hidden = !open;
    fab.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
  }

  fab.addEventListener('click', () => togglePanel(panel.hidden));
  closeBtn.addEventListener('click', () => togglePanel(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !panel.hidden) togglePanel(false);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';

    appendMsg('user', null, text);

    // Pequeño delay para simular "pensando"
    const typing = appendMsg('bot', null, '· · ·', true);
    setTimeout(() => {
      typing.remove();
      const { html, sugs } = CHATBOT.respond(text);
      const msgEl = appendMsg('bot', html);
      if (sugs.length) addSuggestions(msgEl, sugs);
      input.focus();
    }, 320);
  });

  function appendMsg(role, html, text, isTyping = false) {
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg--${role}`;
    if (isTyping) div.classList.add('chat-msg--typing');
    const p = document.createElement('p');
    if (html) { p.innerHTML = html; }
    else       { p.textContent = text || ''; }
    div.appendChild(p);
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
    return div;
  }

  function addSuggestions(afterEl, sugs) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-sugs';
    sugs.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'chat-sug-btn';
      btn.textContent = s;
      btn.type = 'button';
      btn.addEventListener('click', () => {
        input.value = s;
        wrap.remove();
        form.dispatchEvent(new Event('submit'));
      });
      wrap.appendChild(btn);
    });
    afterEl.after(wrap);
    msgList.scrollTop = msgList.scrollHeight;
  }
}

// ── Búsqueda rápida en tabla ───────────────────────
function initTableSearch() {
  const input = document.getElementById('table-search');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!currentData.length) return;
    const filtered = q ? currentData.filter(r => r.sector.toLowerCase().includes(q)) : currentData;
    renderTable(filtered);
  });
}

// ── Tendencia histórica ────────────────────────────
async function renderTrendChart() {
  const container = document.getElementById('trend-chart');
  if (!container) return;
  container.innerHTML = '<p class="trend-loading">Cargando datos históricos…</p>';

  const currentYear = new Date().getFullYear() - 1;
  const years = [];
  for (let y = 2018; y <= currentYear; y++) years.push(y);

  const nivel  = document.getElementById('select-nivel').value;
  const region = document.getElementById('select-region').value;
  const sector = document.getElementById('select-sector').value;

  const results = await Promise.allSettled(
    years.map(y => cargarDatosOficiales({ anio: y, nivel, region, sector }))
  );

  const pts = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.fuente === 'oficial') {
      const d = r.value;
      const pct = d.resumen?.avance_pct != null
        ? d.resumen.avance_pct
        : d.datos?.length
          ? fmt.pctNum(d.datos.reduce((a,b) => a + b.devengado, 0), d.datos.reduce((a,b) => a + b.pim, 0))
          : null;
      if (pct !== null) pts.push({ year: years[i], pct });
    }
  });

  const trendLabel = document.getElementById('trend-years-label');
  const trendBadge = document.getElementById('trend-delta-badge');

  if (pts.length < 2) {
    container.innerHTML = '<p class="trend-empty">No hay suficientes datos históricos disponibles (se necesitan datos del SIAF en tiempo real).</p>';
    if (trendLabel) trendLabel.textContent = '';
    if (trendBadge) trendBadge.textContent = '';
    return;
  }

  if (trendLabel) trendLabel.textContent = `${pts[0].year}–${pts[pts.length - 1].year}`;
  const delta = pts[pts.length - 1].pct - pts[0].pct;
  if (trendBadge) {
    trendBadge.textContent = (delta >= 0 ? '▲ +' : '▼ ') + delta.toFixed(1) + 'pp vs ' + pts[0].year;
    trendBadge.className = 'trend-delta-badge ' + (delta >= 0 ? 'trend-delta--up' : 'trend-delta--down');
  }

  const W = 600, H = 190;
  const PAD = { top: 22, right: 16, bottom: 32, left: 42 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;
  const xS = i => PAD.left + (i / (pts.length - 1)) * cW;
  const yS = v => PAD.top + (1 - v / 100) * cH;

  const gridLines = [0, 25, 50, 75, 100].map(v =>
    `<line x1="${PAD.left}" y1="${yS(v)}" x2="${W - PAD.right}" y2="${yS(v)}" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
     <text x="${PAD.left - 5}" y="${yS(v) + 4}" text-anchor="end" font-size="9.5" fill="rgba(255,255,255,.35)">${v}%</text>`
  ).join('');

  const linePts = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xS(i)},${yS(p.pct)}`).join(' ');
  const areaPts = `${linePts} L${xS(pts.length-1)},${H - PAD.bottom} L${xS(0)},${H - PAD.bottom} Z`;

  const dots = pts.map((p, i) => {
    const col = p.pct >= 80 ? 'var(--green)' : p.pct >= 60 ? 'var(--gold)' : 'var(--red)';
    return `<circle cx="${xS(i)}" cy="${yS(p.pct)}" r="4.5" fill="${col}" stroke="var(--bg-card)" stroke-width="2"><title>${p.year}: ${p.pct}%</title></circle>
            <text x="${xS(i)}" y="${yS(p.pct) - 9}" text-anchor="middle" font-size="9.5" font-weight="600" fill="${col}">${p.pct}%</text>`;
  }).join('');

  const xLabels = pts.map((p, i) =>
    `<text x="${xS(i)}" y="${H - PAD.bottom + 16}" text-anchor="middle" font-size="9.5" fill="rgba(255,255,255,.45)">${p.year}</text>`
  ).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="trend-svg">
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--red)" stop-opacity=".18"/>
          <stop offset="100%" stop-color="var(--red)" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <line x1="${PAD.left}" y1="${yS(80)}" x2="${W-PAD.right}" y2="${yS(80)}" stroke="rgba(34,197,94,.35)" stroke-dasharray="5 3" stroke-width="1"/>
      <line x1="${PAD.left}" y1="${yS(60)}" x2="${W-PAD.right}" y2="${yS(60)}" stroke="rgba(245,158,11,.35)" stroke-dasharray="5 3" stroke-width="1"/>
      <path d="${areaPts}" fill="url(#trendGrad)"/>
      <path d="${linePts}" fill="none" stroke="var(--red)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}${xLabels}
    </svg>`;
}

function initTrend() {
  const btn = document.getElementById('btn-trend');
  const sec = document.getElementById('trend-section');
  if (!btn || !sec) return;
  btn.addEventListener('click', async () => {
    const open = !sec.hidden;
    if (open) {
      sec.hidden = true;
      btn.classList.remove('btn-trend--active');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Ver tendencia`;
    } else {
      sec.hidden = false;
      btn.classList.add('btn-trend--active');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Ocultar tendencia`;
      await renderTrendChart();
    }
  });
}

// ── Imprimir informe ───────────────────────────────
function initPrint() {
  const btn = document.getElementById('btn-print');
  if (!btn) return;
  btn.addEventListener('click', () => window.print());
}

// ── Init ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-consultar').addEventListener('click', consultar);
  document.getElementById('btn-reset').addEventListener('click', resetFilters);
  document.getElementById('btn-export')?.addEventListener('click', exportCSV);
  document.getElementById('select-nivel').addEventListener('change', toggleRegionFilter);

  toggleRegionFilter();
  attachSortListeners();
  initMobileMenu();
  initKeyboardShortcuts();
  initScrollAnimations();
  initThemeToggle();
  initChatbot();
  initCompare();
  initTableSearch();
  initTrend();
  initPrint();

  cargarHeroStats().catch(animateHeroNumbers);
});

// ── Service Worker (PWA) ──────────────────────────
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
