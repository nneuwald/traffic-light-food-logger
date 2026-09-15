// Name-search plumbing, offline. Pins the two things that broke in September
// 2026: the USDA search must be a POST with a JSON body (USDA's proxy answers
// 400 to a GET whose dataType list holds "SR Legacy" or "Survey (FNDDS)"), and
// the Open Food Facts search must ask the US site sorted by popularity and then
// rank records whose name holds every search word first. Also covers the
// built-in quick-add match, which needs no network at all.
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const s2 = src.indexOf('// ---------- quick-add foods');
const e2 = src.indexOf('// ---------- UI: current food');
const grab = (re) => { const m = src.match(re); if (!m) throw new Error('missing ' + re); return m[0]; };
const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
  + src.slice(s2, e2)
  + grab(/const OFF_FIELDS = .*\n/)
  + grab(/async function offSearchOnce[\s\S]*?\n}\n/)
  + grab(/async function fdcSearch[\s\S]*?\n}\n/);

let calls = [];
globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, json: async () => globalThis._reply }; };
(0, eval)(engine + ';globalThis._t = { nameHasAllWords, rankByName, quickMatches, offSearchOnce, fdcSearch, PREFS };');
const t = globalThis._t;

let pass = 0, fail = 0;
const check = (ok, line) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + line); };

(async () => {
  // ---- word matching ----
  check(t.nameHasAllWords('Instant Oatmeal Original', 'oatmeal'), 'oatmeal matches "Instant Oatmeal Original"');
  check(!t.nameHasAllWords('Vitality pépites de chocolat', 'oatmeal'), 'oatmeal does not match a cookie that only lists it as an ingredient');
  check(t.nameHasAllWords('Skim milk', 'skim milk'), 'skim milk matches "Skim milk"');
  check(t.nameHasAllWords('ultrafiltered skim milk lactose free', 'skim milk'), 'skim milk matches a name with extra words');
  check(!t.nameHasAllWords('Hazelnut Spread With Cocoa', 'skim milk'), 'skim milk does not match Nutella');
  check(!t.nameHasAllWords('Low Moisture Part Skim Shredded Mozzarella Cheese', 'skim milk'), 'skim alone is not skim milk');
  check(t.nameHasAllWords('Carrots, raw', 'carrot'), 'plural tolerance: carrot finds Carrots');
  check(!t.nameHasAllWords('Peanuts', 'pea'), 'no substring matches: pea does not find peanuts');
  check(!t.nameHasAllWords('Skim milk', ''), 'an empty query matches nothing');

  // ---- ranking keeps the source order inside each tier ----
  const ranked = t.rankByName([
    { product_name: 'Aussie Bites' },
    { product_name: 'heavenly hunks ORGANIC OATMEAL DARK CHOCOLATE' },
    { product_name: 'Instant Oatmeal Original' },
    { product_name: 'Oatmeal' },
  ], 'oatmeal').map(p => p.product_name);
  check(ranked.join('|') === 'Oatmeal|Instant Oatmeal Original|heavenly hunks ORGANIC OATMEAL DARK CHOCOLATE|Aussie Bites',
    'name matches first, shortest names first, then popularity: ' + ranked.join(' > '));

  const milk = t.rankByName([
    { product_name: 'Ranchero Queso Fresco Part Skim Milk Cheese' },
    { product_name: 'Fat Free Skim Milk' },
    { product_name: 'Skim Milk' },
  ], 'skim milk').map(p => p.product_name);
  check(milk.join('|') === 'Skim Milk|Fat Free Skim Milk|Ranchero Queso Fresco Part Skim Milk Cheese',
    'the plain milk outranks a cheese that contains it: ' + milk.join(' > '));

  // ---- built-in foods ----
  check(t.quickMatches('skim milk').map(f => f.name).join() === 'Skim milk', 'quick-add: skim milk');
  check(t.quickMatches('milk').map(f => f.name).join() === 'Skim milk', 'quick-add: milk');
  check(t.quickMatches('oatmeal').length === 0, 'quick-add: nothing for oatmeal (that comes from USDA)');

  // ---- Open Food Facts request shape ----
  globalThis._reply = { products: [{ product_name: 'Aussie Bites' }, { product_name: 'Oatmeal', brands: 'Millville' }, { brands: 'nameless' }] };
  const off = await t.offSearchOnce('oatmeal');
  const u = calls[0].url;
  check(/^https:\/\/us\.openfoodfacts\.org\/cgi\/search\.pl\?/.test(u), 'OFF search asks the US site');
  check(/sort_by=unique_scans_n/.test(u), 'OFF search sorts by popularity');
  check(/search_terms=oatmeal/.test(u), 'OFF search carries the term');
  check(off.map(p => p.product_name).join('|') === 'Oatmeal|Aussie Bites', 'OFF results drop nameless records and rank name matches first');

  // ---- USDA request shape ----
  calls = [];
  globalThis._reply = { foods: [{ description: 'Oatmeal, NFS', dataType: 'Survey (FNDDS)' }] };
  t.PREFS.usdaKey = 'abc123';
  const foods = await t.fdcSearch('oatmeal', { dataType: 'Foundation,SR Legacy,Survey (FNDDS),Branded', pageSize: 10 });
  const c = calls[0];
  check(c.init && c.init.method === 'POST', 'USDA search is a POST');
  check(c.init && c.init.headers && c.init.headers['Content-Type'] === 'application/json', 'USDA search sends JSON');
  check(/^https:\/\/api\.nal\.usda\.gov\/fdc\/v1\/foods\/search\?api_key=abc123$/.test(c.url), 'USDA key rides in the URL and nothing else does');
  const body = JSON.parse(c.init.body);
  check(body.query === 'oatmeal' && body.pageSize === 10, 'USDA body carries the query and page size');
  check(JSON.stringify(body.dataType) === JSON.stringify(['Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Branded']), 'USDA dataType is a JSON array with the spaced names intact');
  check(foods.length === 1 && foods[0].description === 'Oatmeal, NFS', 'USDA results pass through');
  calls = [];
  await t.fdcSearch('gtinUpc:00016000275287', { dataType: 'Branded', pageSize: 2 });
  check(JSON.stringify(JSON.parse(calls[0].init.body).dataType) === '["Branded"]', 'barcode lookup asks for Branded only');

  console.log('search_test: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
