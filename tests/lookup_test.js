// The lookup flow, offline. USDA is the only source now, so this suite pins the
// behaviour that used to be shared with a second database: a barcode miss has
// to say what to do next rather than blame the network, a name search has to
// put generic USDA foods above Branded ones, and a USDA outage has to be named
// as a USDA outage even when built-in foods still fill the list.
//
//   node tests/lookup_test.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- UI: current food');
const grab = (re) => { const m = src.match(re); if (!m) throw new Error('missing ' + re); return m[0]; };

// the DOM the lookup flow touches, and showFood(), which belongs to the UI
const hints = [];
const el = () => ({ value: '', innerHTML: '', textContent: '', appendChild() {}, addEventListener() {} });
const nodes = { lookupInput: el(), lookupHint: el(), searchResults: el() };
Object.defineProperty(nodes.lookupHint, 'textContent', {
  get() { return this._t || ''; }, set(v) { this._t = v; hints.push(v); },
});
globalThis.document = { createElement: () => ({ innerHTML: '', set onclick(f) {} }) };
let shown = null;
globalThis.showFood = (food) => { shown = food; };
globalThis.esc = (s) => String(s);

const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
  + grab(/async function lookup\(\)[\s\S]*?\n}\n/);
// PREFS is declared inside the slice, so it never lands on globalThis by itself
(0, eval)(engine + ';globalThis._lookup = lookup;globalThis._P = PREFS;globalThis.$ = (id) => globalThis._nodes[id];');
globalThis._nodes = nodes;
globalThis._P.usdaKey = 'k';

let pass = 0, fail = 0;
const check = (ok, line) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + line); };
const lastHint = () => hints[hints.length - 1];
const run = async (query, reply) => {
  hints.length = 0; shown = null;
  globalThis.fetch = reply;
  nodes.lookupInput.value = query;
  nodes.searchResults.innerHTML = '';
  await globalThis._lookup();
};
const ok = (foods) => async () => ({ ok: true, json: async () => ({ foods }) });
const status = (code) => async () => ({ ok: false, status: code, json: async () => ({}) });

const CHEERIOS = {
  description: 'CHEERIOS', dataType: 'Branded', gtinUpc: '00016000275287', brandOwner: 'General Mills',
  foodCategory: 'Breakfast Cereals', servingSize: 28, servingSizeUnit: 'g',
  foodNutrients: [{ nutrientId: 1008, value: 375 }, { nutrientId: 2000, value: 3.6 }],
};

(async () => {
  // ---- barcode found ----
  await run('016000275287', ok([CHEERIOS]));
  check(shown && shown.source.startsWith('USDA'), 'a found barcode is shown and is marked as coming from USDA');
  check(/Found via USDA FoodData Central/.test(lastHint()), 'a found barcode names USDA');

  // ---- barcode missing ----
  // USDA Branded carries manufacturer submissions, not every package on a shelf,
  // so this is the common case now and the wording is the whole point of it.
  await run('016000275287', ok([]));
  check(shown === null, 'a missing barcode shows nothing');
  check(/not in USDA Branded/.test(lastHint()), 'a missing barcode says which database was asked');
  check(/Custom food/.test(lastHint()) && /name/.test(lastHint()), 'a missing barcode offers name search and manual entry');
  check(!/Open Food Facts/.test(lastHint()), 'a missing barcode does not mention a database the app no longer uses');

  // ---- name search orders generic above branded ----
  const results = [];
  globalThis.document = { createElement: () => { const n = { innerHTML: '', set onclick(f) {} }; results.push(n); return n; } };
  nodes.searchResults.appendChild = () => {};
  results.length = 0;
  await run('cheerios', ok([
    CHEERIOS,
    { description: 'Cereals ready-to-eat, GENERAL MILLS, Cheerios', dataType: 'SR Legacy', foodCategory: 'Breakfast Cereals', foodNutrients: [{ nutrientId: 1008, value: 375 }] },
  ]));
  check(results.length === 2, 'both USDA records are offered');
  check(/SR Legacy/.test(results[0].innerHTML), 'the generic USDA record leads');
  check(/USDA Branded/.test(results[1].innerHTML), 'the branded USDA record follows');
  check(/Pick a match/.test(lastHint()), 'a successful search asks the clinician to pick');

  // ---- USDA rate-limited, built-in foods still match ----
  results.length = 0;
  await run('skim milk', status(429));
  check(results.length === 1, 'a built-in food still matches while USDA is down');
  check(/rate-limited/.test(lastHint()) && /free key/.test(lastHint()),
    'a rate-limited USDA is named, with the fix, even though the list is not empty');

  // ---- USDA rate-limited, nothing matches ----
  results.length = 0;
  await run('cheerios', status(429));
  check(results.length === 0 && /rate-limited/.test(lastHint()), 'a rate-limited USDA with no matches says so');
  check(!/Both databases/.test(lastHint()), 'the outage message no longer speaks of two databases');

  // ---- USDA down for another reason ----
  await run('cheerios', status(503));
  check(/USDA is unavailable/.test(lastHint()), 'a non-429 USDA failure reads as unavailable, not rate-limited');

  console.log('lookup_test: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
