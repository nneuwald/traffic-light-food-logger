// Does estimating ingredient percentages from list order reach the same verdict
// as having them? (needs internet)
//
// USDA publishes ingredients as plain text with no percentages, so the app now
// estimates them from the order the ingredients are listed in. Open Food Facts
// publishes both: the same raw text, and its own percent_estimate per
// ingredient. That makes it the one place the estimate can be marked. For each
// real combination food this pulls, the product is classified twice, once from
// Open Food Facts' percentages and once from ours computed off the text alone,
// and the two colours are compared.
//
// Open Food Facts is no longer a data source for the app. It is used here as a
// measuring stick, the same way audit_live.js uses it.
//
//   node tests/audit_combo_estimate.js [count]
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- search helpers');
const s2 = src.indexOf('// ---------- USDA FoodData Central lookup');
const e2 = src.indexOf('// ---------- quick-add foods');
(0, eval)(src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '') + src.slice(s2, e2) +
  ';globalThis._c=classify;globalThis._R=RULES;globalThis._est=ingredientsFromFDC;globalThis._dec=decomposeCombo;');

const WANT = parseInt(process.argv[2] || '60', 10);
const FIELDS = 'code,product_name,brands,serving_size,serving_quantity,nutriments,categories_tags,ingredients_text,ingredients';
const CATS = ['pizzas', 'sandwiches', 'lasagna', 'burritos', 'prepared-salads', 'meals', 'quiches', 'pot-pies', 'macaroni-and-cheese'];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchCat(cat, page) {
  const url = 'https://us.openfoodfacts.org/cgi/search.pl?action=process&json=1&page_size=20&page=' + page +
    '&sort_by=unique_scans_n&tagtype_0=categories&tag_contains_0=contains&tag_0=' + encodeURIComponent(cat) +
    '&fields=' + FIELDS;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt) await sleep(1500 * attempt);
    try {
      const r = await fetch(url, { headers: { 'User-Agent': 'traffic-light-logger/audit' } });
      if (!r.ok) continue;
      const j = await r.json();
      return j.products || [];
    } catch (e) { /* throttled; retry */ }
  }
  return [];
}

// the food shape the app builds, but with whichever ingredient list we are testing
function foodWith(p, ingredients) {
  const n = p.nutriments || {};
  const num = (k) => { const v = n[k]; return typeof v === 'number' ? v : (v != null && v !== '' ? parseFloat(v) : null); };
  const servQty = typeof p.serving_quantity === 'number' ? p.serving_quantity : parseFloat(p.serving_quantity);
  return {
    name: p.product_name || '', cats: (p.categories_tags || []).map(c => String(c).toLowerCase()),
    per100: { kcal: num('energy-kcal_100g'), sugars: num('sugars_100g') }, serv: {},
    servQtyG: servQty > 0 ? servQty : null, ingredients,
  };
}

// The draw is cached so the curve can be calibrated offline, and so a rule
// change can be replayed against the same products without hitting the API again.
const CACHE = path.join(__dirname, 'audit_combo_estimate_products.json');

(async () => {
  if (fs.existsSync(CACHE) && process.argv.indexOf('--refetch') === -1) {
    const rows = JSON.parse(fs.readFileSync(CACHE, 'utf8'));
    console.log('replaying ' + rows.length + ' cached products (pass --refetch to draw again)');
    return report(rows);
  }
  const seen = new Set(), rows = [];
  for (let page = 1; page <= 3 && rows.length < WANT; page++) {
    for (const cat of CATS) {
      if (rows.length >= WANT) break;
      for (const p of await fetchCat(cat, page)) {
        if (rows.length >= WANT) break;
        if (!p.code || seen.has(p.code)) continue;
        seen.add(p.code);
        const offIng = (p.ingredients || []).map(i => ({
          text: i.text, pct: typeof i.percent === 'number' ? i.percent : i.percent_estimate,
        })).filter(i => i.text && typeof i.pct === 'number');
        if (offIng.length < 2 || !p.ingredients_text) continue;
        const food = foodWith(p, offIng);
        if (_dec(food, _R) === null) continue;          // OFF's own numbers do not decide it either
        rows.push({ p, offIng });
      }
      await sleep(900);
    }
  }

  // store only what the replay and the exponent sweep read, so the cache stays
  // a few hundred KB rather than the few MB a raw API dump would be
  const num = (n, k) => { const v = (n || {})[k]; return typeof v === 'number' ? v : (v != null && v !== '' ? parseFloat(v) : null); };
  fs.writeFileSync(CACHE, JSON.stringify(rows.map(({ p, offIng }) => ({
    p: { code: p.code, product_name: p.product_name, serving_quantity: p.serving_quantity,
         categories_tags: p.categories_tags, ingredients_text: p.ingredients_text,
         nutriments: { 'energy-kcal_100g': num(p.nutriments, 'energy-kcal_100g'), 'sugars_100g': num(p.nutriments, 'sugars_100g') } },
    offIng,
  }))));
  console.log('cached ' + rows.length + ' products to ' + path.basename(CACHE));
  report(rows);
})();

function report(rows) {
  let same = 0, diff = 0, refused = 0;
  const misses = [];
  for (const { p, offIng } of rows) {
    const withOff = _c(foodWith(p, offIng), _R);
    const mine = _est(p.ingredients_text);
    const withMine = _c(foodWith(p, mine), _R);
    if (withMine.color === 'review') { refused++; misses.push(['REFUSED', p.product_name, withOff.color, 'review']); continue; }
    if (withMine.color === withOff.color) same++;
    else { diff++; misses.push(['DIFFER ', p.product_name, withOff.color, withMine.color]); }
  }

  console.log('\ncombination foods compared: ' + rows.length);
  console.log('  same verdict as having the percentages: ' + same);
  console.log('  different verdict:                      ' + diff);
  console.log('  our estimate refused to decide:         ' + refused);
  if (rows.length) console.log('  agreement where we decided: ' +
    (same + diff ? (100 * same / (same + diff)).toFixed(0) + '%' : 'n/a'));
  if (misses.length) {
    console.log('\n' + 'result'.padEnd(8) + '  ' + 'product'.padEnd(44) + 'with pct   estimated');
    for (const [k, name, a, b] of misses.slice(0, 40))
      console.log(k + '  ' + String(name).slice(0, 42).padEnd(44) + String(a).padEnd(11) + b);
  }
}
