// Offline regression gate over the saved random draws. Each tests/audit_*_orig.tsv
// is a captured sample of real Open Food Facts products; this replays every one
// through the current engine and fails if any product lands in a food group its
// Open Food Facts category could not legitimately produce (the oracle in
// audit_analyze.js). No network needed.
//
//   node tests/audit_regression.js
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
(0, eval)(src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '') +
  ';globalThis._c=classify;globalThis._R=RULES;globalThis._bev=tagsLookLikeBeverage;');

// reuse the oracle's category -> allowed groups table
const analyze = fs.readFileSync(path.join(__dirname, 'audit_analyze.js'), 'utf8');
const OK = eval('(' + analyze.slice(analyze.indexOf('const OK = {') + 'const OK = '.length,
  analyze.indexOf('// a per-100 g calorie value')).trim().replace(/;$/, '') + ')');

const files = fs.readdirSync(__dirname).filter(n => /_orig\.tsv$/.test(n)).sort();
if (!files.length) { console.log('no saved draws found, nothing to replay'); process.exit(0); }

const num = v => { const n = Number(v); return v === '' || v == null || !isFinite(n) ? null : n; };
let total = 0, bad = 0;
for (const file of files) {
  const lines = fs.readFileSync(path.join(__dirname, file), 'utf8').trim().split('\n');
  const h = lines[0].split('\t');
  for (const line of lines.slice(1)) {
    const r = Object.fromEntries(line.split('\t').map((v, i) => [h[i], v]));
    const cats = (r.category_tags || '').split(/\s+/).filter(Boolean).map(c => 'en:' + c);
    const res = _c({ name: r.product, cats, isBeverage: _bev(cats),
      per100: { kcal: num(r.kcal_100g), sugars: num(r.sugars_100g) }, serv: {},
      servQtyG: num(r.label_serving_g), sweetened: r.sweetener === 'yes' }, _R);
    total++;
    const allowed = OK[r.sampled_category];
    if (!allowed) continue;
    if (!allowed.includes(res.group || 'none')) {
      bad++;
      console.log('FAIL ' + file + ' | ' + r.sampled_category.padEnd(26) + ' -> ' + String(res.group).padEnd(10) +
        ' ' + String(res.color).padEnd(6) + ' ' + r.product.slice(0, 48));
    }
  }
}
console.log(bad ? '\n' + bad + ' of ' + total + ' saved products landed outside their category\'s groups'
                : 'ALL ' + total + ' SAVED AUDIT PRODUCTS CLASSIFY WITHIN THEIR CATEGORY');
process.exit(bad ? 1 : 0);
