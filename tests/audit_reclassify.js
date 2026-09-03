// Re-runs the classifier over a saved audit TSV without touching the network.
// The TSV keeps everything the engine reads (name, category tags, calories,
// sugars, label serving, sweetener flag), so a draw captured once can be
// re-judged after every rule change.
//
//   node tests/audit_reclassify.js audit_big.tsv [out.tsv]
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '');
(0, eval)(engine + ';globalThis._c=classify;globalThis._R=RULES;globalThis._bev=tagsLookLikeBeverage;');

const inFile = process.argv[2] || 'audit_big.tsv';
const outFile = process.argv[3] || inFile;
const lines = fs.readFileSync(path.join(__dirname, inFile), 'utf8').trim().split('\n');
const h = lines[0].split('\t');
const rows = lines.slice(1).map(l => Object.fromEntries(l.split('\t').map((v, i) => [h[i], v])));

const num = v => { const n = Number(v); return v === '' || v == null || !isFinite(n) ? null : n; };
let changed = 0;
const out = rows.map(r => {
  const cats = (r.category_tags || '').split(/\s+/).filter(Boolean).map(c => 'en:' + c);
  const f = {
    name: r.product, cats, isBeverage: _bev(cats),
    per100: { kcal: num(r.kcal_100g), sugars: num(r.sugars_100g) },
    serv: {}, servQtyG: num(r.label_serving_g), sweetened: r.sweetener === 'yes',
  };
  const res = _c(f, _R);
  if (res.color !== r.app_colour || String(res.group) !== r.app_group) changed++;
  return { ...r, app_colour: res.color, app_group: res.group == null ? '' : res.group,
    cal_per_serving: res.kcalServ == null ? '' : Math.round(res.kcalServ), serving_g: res.servG || '',
    reasons: res.reasons.join(' | ') };
});

fs.writeFileSync(path.join(__dirname, outFile),
  [h.join('\t')].concat(out.map(r => h.map(k => String(r[k] == null ? '' : r[k]).replace(/\t/g, ' ')).join('\t'))).join('\n') + '\n');
console.log('re-classified ' + out.length + ' rows from ' + inFile + ' -> ' + outFile + '; ' + changed + ' verdicts changed');
