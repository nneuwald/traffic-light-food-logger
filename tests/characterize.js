// A characterization net for refactors of detectGroup().
//
// It makes no claim about what is correct. It records what the engine does
// today for a wide spread of USDA-shaped records, and fails if any of that
// changes. That is what you want when deleting code: the guide checks in
// audit_usda_offline.js say whether the answers are right, and this says
// whether a change moved anything you did not mean to move.
//
// Each food in the audit is run at its real calories and at four other levels,
// so the group lines themselves are crossed rather than only the typical value.
//
//   node tests/characterize.js --save     write the baseline
//   node tests/characterize.js            compare against it
const fs = require('fs');
const path = require('path');
const { F, BRANCH, t } = require('./audit_usda_offline.js');
const ALL = F.concat(BRANCH);

const BASE = path.join(__dirname, 'characterize_baseline.json');
const FACTORS = [0.25, 0.6, 1, 1.8, 3.2];

const cases = [];
for (const [desc, cat, kcal, sugars, servG] of ALL) {
  for (const f of FACTORS) {
    const k = Math.round(kcal * f * 10) / 10;
    const rec = {
      description: desc, dataType: 'SR Legacy', foodCategory: cat,
      servingSize: servG, servingSizeUnit: servG ? 'g' : undefined,
      foodNutrients: [{ nutrientId: 1008, value: k }, { nutrientId: 2000, value: sugars }],
    };
    const r = t.classify(t.foodFromFDC(rec), t.RULES);
    cases.push({
      id: desc + ' @' + f,
      group: r.group, color: r.color,
      servG: r.servG == null ? null : Math.round(r.servG),
      kcal: r.kcalServ == null ? null : Math.round(r.kcalServ),
    });
  }
}

if (process.argv.indexOf('--save') !== -1) {
  fs.writeFileSync(BASE, JSON.stringify(cases, null, 1));
  console.log('baseline saved: ' + cases.length + ' cases over ' + ALL.length + ' foods');
  process.exit(0);
}

if (!fs.existsSync(BASE)) {
  console.log('no baseline yet. Run: node tests/characterize.js --save');
  process.exit(1);
}
const base = JSON.parse(fs.readFileSync(BASE, 'utf8'));
const byId = new Map(base.map(c => [c.id, c]));
let same = 0;
const diffs = [];
for (const c of cases) {
  const b = byId.get(c.id);
  if (!b) { diffs.push([c.id, 'new case', JSON.stringify(c)]); continue; }
  byId.delete(c.id);
  if (b.group === c.group && b.color === c.color && b.servG === c.servG && b.kcal === c.kcal) { same++; continue; }
  diffs.push([c.id,
    b.group + '/' + b.color + ' ' + b.kcal + ' cal @ ' + b.servG + ' g',
    c.group + '/' + c.color + ' ' + c.kcal + ' cal @ ' + c.servG + ' g']);
}
for (const [id] of byId) diffs.push([id, 'was present', 'case gone']);

console.log('characterize: ' + same + ' of ' + cases.length + ' unchanged, ' + diffs.length + ' changed');
if (diffs.length) {
  console.log('\n' + 'case'.padEnd(46) + 'was'.padEnd(34) + 'now');
  for (const [id, was, now] of diffs.slice(0, 60))
    console.log(String(id).slice(0, 44).padEnd(46) + String(was).padEnd(34) + now);
  if (diffs.length > 60) console.log('... and ' + (diffs.length - 60) + ' more');
  console.log('\nIf every change above is intended, re-save the baseline.');
}
process.exitCode = diffs.length ? 1 : 0;
