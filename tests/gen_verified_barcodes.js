// Regenerates ../verified_barcodes.csv and .json from the saved Open Food Facts
// responses in ../fixtures/off_products. Runs offline, so the published list can
// never drift from what the classifier actually does. Run after any change to
// classify() or foodFromOFF():
//
//   node tests/gen_verified_barcodes.js
//
// (tests/probe.js is the older network version, kept for discovering new codes.)
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const fieldsLine = src.split('\n').find(l => l.startsWith('const OFF_FIELDS'));
const s2 = src.indexOf('function foodFromOFF');
const e2 = src.indexOf('// ---------- USDA FoodData Central');
const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
  + fieldsLine + '\n' + src.slice(s2, e2);
(0, eval)(engine + ';globalThis._c=classify;globalThis._R=RULES;globalThis._f=foodFromOFF;');

// short human labels, since OFF product names are often abbreviated shelf names
const HINTS = {
  '0075720000814': 'Poland Spring water', '0049000027624': 'Dasani purified water',
  '0012000161155': 'LifeWtr', '0049000028911': 'Diet Coke', '0049000006346': 'Coca-Cola',
  '0052000338775': 'Gatorade lemon-lime', '0020000174808': 'Green Giant peas',
  '0033383666020': 'Baby carrots', '0027000380406': "Hunt's diced tomatoes",
  '0038900004736': 'Dole pineapple chunks', '0024000162865': 'Del Monte cut green beans',
  '0054100000606': 'Vlasic kosher dill spears', '0014800000207': "Mott's applesauce",
  '0072250914765': "Nature's Own honey wheat bread", '0013764027053': "Dave's Killer Bread",
  '0004656700801': 'Quaker old fashioned oats', '0076808006575': 'Barilla spaghetti',
  '0737312008300': 'Mission flour tortillas', '0054800423347': "Ben's Original brown rice",
  '0089544083016': 'FAGE Total 0% plain', '0099482476519': 'Chobani plain nonfat greek',
  '0025293003842': 'Silk unsweetened almondmilk', '0051000121141': 'Swanson chicken broth',
  '0003625341118': 'Cheerios', '7633434018803': "Bush's black beans",
  '0080000221209': 'StarKist chunk light tuna', '0073420516208': 'Daisy cottage cheese',
  '0016000275270': 'Honey Nut Cheerios', '0038000391095': 'Frosted Flakes', '0044000032029': 'Oreo',
  '0034000002405': "Hershey's milk chocolate", '0028400090896': 'Doritos nacho cheese',
  '0076840100354': "Ben & Jerry's Chunky Monkey",
};

const DIR = path.join(__dirname, '..', 'fixtures', 'off_products');
const rows = fs.readdirSync(DIR).filter(n => n.endsWith('.json')).map(n => {
  const p = JSON.parse(fs.readFileSync(path.join(DIR, n), 'utf8'));
  const f = _f(p);
  const r = _c(f, _R);
  return { code: n.replace('.json', ''), name: f.name, brand: f.brand, color: r.color, group: r.groupLabel,
           hint: HINTS[n.replace('.json', '')] || '', reason: r.reasons[0] || '' };
});
const order = { green: 0, yellow: 1, red: 2, free: 3 };
rows.sort((a, b) => order[a.color] - order[b.color] || a.hint.localeCompare(b.hint));

const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
const csv = [['barcode', 'product', 'brand', 'app_color', 'food_group', 'why', 'common_name'].map(q).join(',')]
  .concat(rows.map(r => [r.code, r.name, r.brand, r.color, r.group, r.reason, r.hint].map(q).join(',')))
  .join('\n') + '\n';

fs.writeFileSync(path.join(__dirname, '..', 'verified_barcodes.csv'), csv);
fs.writeFileSync(path.join(__dirname, '..', 'verified_barcodes.json'),
  JSON.stringify(rows.map(r => ({ code: r.code, name: r.name, brand: r.brand, color: r.color, group: r.group, hint: r.hint })), null, 2) + '\n');

const counts = rows.reduce((a, r) => (a[r.color]++, a), { green: 0, yellow: 0, red: 0, free: 0 });
console.log('wrote ' + rows.length + ' barcodes: ' +
  counts.green + ' green, ' + counts.yellow + ' yellow, ' + counts.red + ' red, ' + counts.free + ' no colour');
