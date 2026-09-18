// Everyday foods through the real USDA path, checked against the guide.
// (needs internet, and realistically needs your own USDA key)
//
// Every other suite either feeds the classifier tidy input or measures it against
// Open Food Facts. This one runs the path the clinic actually uses: search USDA
// by name, take the record it would have shown, map it with foodFromFDC(), and
// classify it. Expected colours and groups are read off Epstein's Food & Activity
// Reference Guide (2012).
//
//   FDC_KEY=your-key node tests/audit_usda_foods.js
//
// Results accumulate in tests/audit_usda_foods_results.json, so a run that stops
// on the demo key's hourly limit can be continued later without losing what it
// already checked. Pass --restart to throw that away and begin again.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- search helpers');
const s2 = src.indexOf('// ---------- USDA FoodData Central lookup');
const e2 = src.indexOf('// ---------- quick-add foods');
(0, eval)(src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '') + src.slice(s2, e2) +
  ';globalThis._t={classify,RULES,foodFromFDC,rankByName,PREFS};');
const t = globalThis._t;
t.PREFS.usdaKey = process.env.FDC_KEY || 'DEMO_KEY';

// group and colour as the guide prints them. "borderline" marks a food that sits
// within a few calories of a line, where the answer turns on the record's own
// numbers rather than on the rule; those are reported but never counted as wrong.
const FOODS = [
  ['broccoli, raw', 'veg', 'green'],
  ['carrots, raw', 'veg', 'green'],
  ['spinach, raw', 'veg', 'green'],
  ['tomatoes, raw', 'veg', 'green'],
  ['cucumber, raw', 'veg', 'green'],
  ['green beans, canned', 'veg', 'green'],
  ['corn, sweet, yellow', 'starchy', 'yellow'],
  ['potato, baked, flesh and skin', 'starchy', 'yellow'],
  ['french fried potatoes', 'starchy', 'red'],
  ['green peas, frozen', 'starchy', 'yellow'],
  ['apple, raw, with skin', 'fruit', 'yellow'],
  ['banana, raw', 'fruit', 'yellow'],
  ['strawberries, raw', 'fruit', 'yellow'],
  ['grapes, raw', 'fruit', 'yellow'],
  ['orange juice, raw', 'juice', 'red'],
  ['apple juice, canned', 'juice', 'red'],
  ['raisins, seedless', 'juice', 'red'],
  ['bread, white, commercially prepared', 'grain', 'yellow'],
  ['bread, whole wheat', 'grain', 'yellow'],
  ['rice, brown, long-grain, cooked', 'grain', 'yellow'],
  ['spaghetti, cooked', 'grain', 'yellow'],
  ['oatmeal, cooked', 'grain', 'yellow'],
  ['tortilla, flour', 'grain', 'yellow'],
  ['crackers, saltine', 'grain', 'yellow'],
  ['cheese, cheddar', 'cheese', 'red'],
  ['cheese, cottage, lowfat, 1% milkfat', 'cheese', 'yellow'],
  ['cheese, mozzarella, part skim', 'cheese', 'red', 'borderline'],
  ['milk, whole', 'dairy', 'red'],
  ['milk, nonfat, fluid', 'dairy', 'yellow'],
  ['yogurt, greek, plain, nonfat', 'dairy', 'yellow'],
  ['sour cream, regular', 'dairy', 'red'],
  ['chicken, breast, roasted', 'meat', 'yellow'],
  ['ground beef, 80% lean, cooked', 'meat', 'red'],
  ['bacon, cooked', 'sweets', 'red'],
  ['frankfurter, beef', 'meat', 'red'],
  ['tuna, light, canned in water', 'meat', 'yellow'],
  ['shrimp, cooked', 'meat', 'yellow'],
  ['egg, whole, cooked, hard-boiled', 'protein', 'yellow'],
  ['beans, black, mature seeds, cooked', 'protein', 'yellow'],
  ['tofu, firm', 'protein', 'yellow'],
  ['almonds, raw', 'nuts', 'red'],
  ['peanut butter, smooth', 'nuts', 'red'],
  ['walnuts, english', 'nuts', 'red'],
  ['butter, salted', 'sweets', 'red'],
  ['olive oil', 'sweets', 'red'],
  ['mayonnaise, regular', 'sweets', 'red'],
  ['potato chips, plain, salted', 'sweets', 'red'],
  ['chocolate, milk', 'sweets', 'red'],
  ['ice cream, vanilla', 'sweets', 'red'],
  ['cookies, chocolate chip', 'sweets', 'red'],
  ['cola, carbonated', 'sweets', 'red'],
  ['ketchup', 'condiment', 'yellow'],
  ['salad dressing, ranch', 'condiment', 'red'],
  ['mustard, yellow', 'condiment', 'yellow'],
  ['soup, chicken noodle, canned, prepared', 'soupBroth', 'yellow'],
  ['soup, chili with beans, canned', 'soupChili', 'yellow', 'borderline'],
  ['water, bottled, plain', 'free', 'free'],
  ['coffee, brewed', 'free', 'free'],
  ['tea, brewed, prepared with tap water', 'free', 'free'],
];

const OUT = path.join(__dirname, 'audit_usda_foods_results.json');
const done = (fs.existsSync(OUT) && process.argv.indexOf('--restart') === -1)
  ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function search(term) {
  const body = { query: term, pageSize: 5, dataType: ['Foundation', 'SR Legacy', 'Survey (FNDDS)'] };
  const r = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=' + encodeURIComponent(t.PREFS.usdaKey),
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (r.status === 429) { const e = new Error('rate limited'); e.throttled = true; throw e; }
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return (await r.json()).foods || [];
}

(async () => {
  let throttled = false;
  for (const [term] of FOODS) {
    if (done[term]) continue;
    try {
      const foods = await search(term);
      const hit = t.rankByName(foods, term, f => f.description)[0];
      if (!hit) { done[term] = { missing: true }; continue; }
      const food = t.foodFromFDC(hit);
      const res = t.classify(food, t.RULES);
      done[term] = { desc: hit.description, dataType: hit.dataType, group: res.group, color: res.color,
                     kcalServ: res.kcalServ == null ? null : Math.round(res.kcalServ), servG: res.servG,
                     reason: res.reasons[0] || '' };
    } catch (e) {
      if (e.throttled) { throttled = true; break; }
      done[term] = { error: String(e.message) };
    }
    await sleep(350);
  }
  fs.writeFileSync(OUT, JSON.stringify(done, null, 1));

  let ok = 0, wrongColor = 0, wrongGroup = 0, borderline = 0, missing = 0, unchecked = 0;
  const lines = [];
  for (const [term, wantGroup, wantColor, flag] of FOODS) {
    const r = done[term];
    if (!r) { unchecked++; continue; }
    if (r.missing || r.error) { missing++; lines.push(['NOFOOD', term, '', wantColor, r.error || 'no match']); continue; }
    const gOk = r.group === wantGroup, cOk = r.color === wantColor;
    if (gOk && cOk) { ok++; continue; }
    if (flag === 'borderline') { borderline++; lines.push(['BORDER', term, r.desc, wantGroup + '/' + wantColor, r.group + '/' + r.color + '  ' + r.kcalServ + ' cal @ ' + r.servG + ' g']); continue; }
    if (!gOk) wrongGroup++; else wrongColor++;
    lines.push([gOk ? 'COLOUR' : 'GROUP ', term, r.desc, wantGroup + '/' + wantColor, r.group + '/' + r.color + '  ' + r.kcalServ + ' cal @ ' + r.servG + ' g']);
  }

  const checked = ok + wrongColor + wrongGroup + borderline + missing;
  console.log('\nchecked ' + checked + ' of ' + FOODS.length + (throttled ? '  (stopped: USDA rate limit)' : ''));
  console.log('  matched the guide:   ' + ok);
  console.log('  wrong food group:    ' + wrongGroup);
  console.log('  right group, wrong colour: ' + wrongColor);
  console.log('  borderline, not counted:   ' + borderline);
  console.log('  no usable USDA record:     ' + missing);
  if (unchecked) console.log('  not yet checked:           ' + unchecked + '  (run again to continue)');
  if (lines.length) {
    console.log('\n' + 'what'.padEnd(8) + 'searched'.padEnd(34) + 'USDA record'.padEnd(38) + 'expected'.padEnd(18) + 'got');
    for (const [k, term, desc, want, got] of lines)
      console.log(k + '  ' + term.slice(0, 32).padEnd(34) + String(desc).slice(0, 36).padEnd(38) + want.padEnd(18) + got);
  }
  if (throttled) console.log('\nThe shared DEMO_KEY allows about 10 searches an hour. Re-run with FDC_KEY=<your key> to finish in one go.');
})();
