// How often can the app decide a combination food on its own? Takes every
// product the saved audit draws put in the combination-food group, re-fetches it
// from Open Food Facts with its ingredient list, and reports whether the guide's
// one-red-serving rule (FRG p.8) could be applied. Needs internet.
//
//   node tests/audit_combo.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const fieldsLine = src.split('\n').find(l => l.startsWith('const OFF_FIELDS'));
const s2 = src.indexOf('function foodFromOFF');
const e2 = src.indexOf('// ---------- USDA FoodData Central');
(0, eval)(src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '') +
  fieldsLine + '\n' + src.slice(s2, e2) + ';globalThis._c=classify;globalThis._R=RULES;globalThis._f=foodFromOFF;globalThis._F=OFF_FIELDS;');

const codes = new Map();
for (const f of fs.readdirSync(__dirname).filter(n => /^audit_.*\.tsv$/.test(n) && !/_orig/.test(n))) {
  const lines = fs.readFileSync(path.join(__dirname, f), 'utf8').trim().split('\n');
  const h = lines[0].split('\t');
  for (const l of lines.slice(1)) {
    const r = Object.fromEntries(l.split('\t').map((v, i) => [h[i], v]));
    if (r.app_group === 'combo' && r.barcode) codes.set(r.barcode, r.product);
  }
}
console.log('combination foods found in the saved draws: ' + codes.size + '\n');

const tally = { red: 0, yellow: 0, review: 0, gone: 0 };
for (const [code, name] of codes) {
  let p = null;
  try {
    const out = execSync(`curl -s --max-time 20 "https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${_F}"`,
      { encoding: 'utf8', maxBuffer: 20e6 });
    const j = JSON.parse(out);
    if (j.status === 1 && j.product) p = j.product;
  } catch (e) { /* skip */ }
  if (!p) { tally.gone++; continue; }
  const r = _c(_f(p), _R);
  tally[r.color] = (tally[r.color] || 0) + 1;
  const decided = r.color !== 'review';
  console.log((decided ? r.color.toUpperCase().padEnd(7) : 'ask    ') + name.slice(0, 44).padEnd(45) +
    (decided ? (r.reasons[1] || '').slice(0, 66) : 'no usable ingredient list'));
  execSync('sleep 0.25');
}
const decided = tally.red + tally.yellow, total = decided + tally.review;
console.log('\ndecided automatically: ' + decided + ' of ' + total + ' (' + Math.round(100 * decided / total) + '%)' +
  '  [' + tally.red + ' red, ' + tally.yellow + ' yellow, ' + tally.review + ' need the question' +
  (tally.gone ? ', ' + tally.gone + ' no longer in the database' : '') + ']');
