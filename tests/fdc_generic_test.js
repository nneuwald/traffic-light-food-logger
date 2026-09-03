// Regression suite for USDA generic (non-branded) foods under the FRG rule.
//
// Survey (FNDDS) records set foodCategory to the food's own WWEIA name -
// "Bananas", "Carrots" - not the "Fruits and Fruit Juices" wording Foundation
// and SR Legacy use, and Survey results are ranked first in every name search.
// The real fixtures below are saved USDA responses; the synthetic cases guard
// the word matching against false positives.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const s2 = src.indexOf('const FDC_NUTR');
const e2 = src.indexOf('// ---------- quick-add foods');
const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
  + src.slice(s2, e2).replace(/async function fdcSearch[\s\S]*?\n}\n/, '').replace(/async function fdcByBarcode[\s\S]*?\n}\n/, '');
(0, eval)(engine + ';globalThis._c=classify;globalThis._R=RULES;globalThis._ff=foodFromFDC;');

const DIR = path.join(__dirname, '..', 'fixtures', 'fdc_generic');
let pass = 0, fail = 0;
const check = (ok, line) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + line); };

// ---- real USDA responses: [fixture, description, expected colour, expected group] ----
const REAL = [
  ['banana_raw.json',       'Banana, raw',        'yellow', 'fruit'],   // Survey, foodCategory "Bananas"; FRG banana 90 yellow
  ['banana_raw.json',       'Bananas, raw',       'yellow', 'fruit'],   // SR Legacy wording
  ['carrots_raw.json',      'Carrots, raw',       'green',  'veg'],     // Survey, "Carrots"; FRG 25 green
  ['spinach_raw.json',      'Spinach, raw',       'green',  'veg'],     // Survey, "Spinach"; FRG 7 green
  ['strawberries_raw.json', 'Strawberries, raw',  'yellow', 'fruit'],   // Survey; fruit is never green
];
console.log('-- real USDA records --');
for (const [file, desc, wantColor, wantGroup] of REAL) {
  const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')).foods.find(x => x.description === desc);
  if (!raw) { check(false, desc + ' -> fixture entry missing from ' + file); continue; }
  const r = _c(_ff(raw), _R);
  check(r.color === wantColor && r.group === wantGroup,
    (raw.dataType || '').padEnd(15) + ' ' + desc.padEnd(22) + ' -> ' + r.color.padEnd(6) + ' ' + String(r.group).padEnd(8) +
    (r.kcalServ != null ? Math.round(r.kcalServ) + ' cal @ ' + r.servG + ' g' : '') +
    (r.color === wantColor && r.group === wantGroup ? '' : ' | EXPECTED ' + wantColor + ' ' + wantGroup));
}

// ---- word matching must not over-reach ----
const mk = (desc, cat, nutr) => _ff({
  description: desc, foodCategory: cat,
  foodNutrients: Object.entries(nutr).map(([id, v]) => ({ nutrientId: +id, value: v })),
});
// [description, USDA category, nutrients, expected colour, expected group]
const GUARDS = [
  ['Apple pie',              'Baked Products',          { 1008: 237, 2000: 16 },  'red',    'sweets'],
  ['Banana bread',           'Baked Products',          { 1008: 326, 2000: 30 },  'yellow', 'grain'],    // FRG banana bread 98 yellow
  ['Orange juice, raw',      'Fruits and Fruit Juices', { 1008: 45,  2000: 8.4 }, 'red',    'juice'],
  ['Peanuts, raw',           'Nut and Seed Products',   { 1008: 567 },            'red',    'nuts'],
  ['Potato, baked',          'Potatoes',                { 1008: 93 },             'yellow', 'starchy'],
  ['Strawberry ice cream',   'Sweets',                  { 1008: 192 },            'red',    'sweets'],
  ['Milk, nonfat, fluid',    'Dairy and Egg Products',  { 1008: 34 },             'yellow', 'dairy'],    // FRG skim milk 91 yellow
  ['Egg, whole, hard-boiled','Dairy and Egg Products',  { 1008: 155 },            'yellow', 'protein'],  // FRG 78 yellow
  ['Almonds, dry roasted',   'Nut and Seed Products',   { 1008: 598 },            'red',    'nuts'],     // FRG 169 red
  ['Chicken, breast, roasted','Poultry Products',       { 1008: 165 },            'yellow', 'meat'],     // FRG 140 yellow
  ['Salad dressing, ranch',  'Soups, Sauces, and Gravies', { 1008: 430 },         'red',    'condiment'],// FRG 72 red
  ['Soup, chicken noodle, canned, prepared', 'Soups, Sauces, and Gravies', { 1008: 25 }, 'yellow', 'soupBroth'],
];
console.log('');
console.log('-- word-matching guards --');
for (const [desc, cat, nutr, wantColor, wantGroup] of GUARDS) {
  const r = _c(mk(desc, cat, nutr), _R);
  check(r.color === wantColor && r.group === wantGroup,
    desc.padEnd(40) + ' -> ' + r.color.padEnd(6) + ' ' + String(r.group).padEnd(9) +
    (r.color === wantColor && r.group === wantGroup ? '' : ' | EXPECTED ' + wantColor + ' ' + wantGroup + ' | ' + r.reasons.join('; ')));
}

console.log('');
console.log(fail ? fail + ' FAILED, ' + pass + ' passed' : 'ALL ' + pass + ' FDC GENERIC TESTS PASS');
process.exit(fail ? 1 : 0);
