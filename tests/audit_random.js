// Random audit: draw N US products from Open Food Facts spread across ~40 product
// categories (random page, random products within the page), run each through
// the mapper and classifier, and write a TSV for a human to judge against the
// guide. Needs internet.
//
//   node tests/audit_random.js [count] [seed]      # default 100, seed 1
const { execSync } = require('child_process');
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

const N = parseInt(process.argv[2] || '100', 10);
let seed = parseInt(process.argv[3] || '1', 10);
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

const CATS = ['breakfast-cereals', 'breads', 'crackers', 'pastas', 'rices', 'cereal-bars', 'popcorn', 'tortillas',
  'yogurts', 'cheeses', 'milks', 'plant-based-milk-alternatives', 'ice-creams', 'butters',
  'meats', 'sausages', 'canned-fishes', 'poultry', 'eggs', 'legumes', 'nuts', 'tofu', 'meat-alternatives',
  'frozen-vegetables', 'canned-vegetables', 'fresh-vegetables', 'salads', 'french-fries', 'potatoes',
  'fruits', 'canned-fruits', 'dried-fruits', 'fruit-juices', 'applesauce',
  'sodas', 'waters', 'energy-drinks', 'sports-drinks', 'iced-teas', 'coffees', 'plant-based-beverages',
  'biscuits-and-cakes', 'chocolates', 'candies', 'salty-snacks', 'crisps', 'frozen-desserts', 'puddings', 'spreads', 'jams',
  'soups', 'condiments', 'salad-dressings', 'sauces', 'pizzas', 'prepared-meals', 'sandwiches', 'dips'];

function fetchCat(cat, page) {
  const q = 'categories_tags:"en:' + cat + '" countries_tags:"en:united-states"';
  const url = 'https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q) + '&page=' + page +
    '&page_size=20&fields=code,product_name,brands,serving_size,serving_quantity,nutriments,categories_tags,ingredients_text,additives_tags';
  const out = execSync(`curl -s --max-time 25 "${url}"`, { encoding: 'utf8', maxBuffer: 30e6 });
  const j = JSON.parse(out);
  return (j.hits || []).map(h => ({ ...h, brands: Array.isArray(h.brands) ? h.brands.join(', ') : h.brands }))
    .filter(h => h.product_name && h.product_name.trim().length > 2 && h.nutriments && h.nutriments['energy-kcal_100g'] != null && h.nutriments['energy-kcal_100g'] < 950);
}

const picked = [], seen = new Set();
const perCat = Math.max(1, Math.round(N / CATS.length));   // spread the draw over every category first
outer: for (let round = 0; round < 3 && picked.length < N; round++) {
  for (const cat of CATS) {
    if (picked.length >= N) break outer;
    const page = 1 + Math.floor(rnd() * 6);
    let hits = [];
    try { hits = fetchCat(cat, page); } catch (e) { continue; }
    hits = hits.filter(h => !seen.has(h.code));
    for (let i = 0; i < perCat && hits.length && picked.length < N; i++) {
      const h = hits.splice(Math.floor(rnd() * hits.length), 1)[0];
      seen.add(h.code); picked.push({ cat, p: h });
    }
    execSync('sleep 0.3');
  }
}

const rows = picked.map(({ cat, p }) => {
  const f = _f(p);
  const r = _c(f, _R);
  return { cat, name: f.name, brand: String(f.brand || '').split(',')[0], code: p.code, kcal100: Math.round(f.per100.kcal),
    sugars100: f.per100.sugars == null ? '' : Math.round(f.per100.sugars * 10) / 10, servQty: f.servQtyG || '',
    color: r.color, group: r.group, kcal: r.kcalServ == null ? '' : Math.round(r.kcalServ), servG: r.servG || '',
    reason: r.reasons.join(' | '), cats: (p.categories_tags || []).map(c => c.replace(/^en:/, '')).join(' '), sweetened: f.sweetened ? 'yes' : '' };
});

for (const r of rows) console.log(`${r.cat.padEnd(28)} ${String(r.color).padEnd(6)} ${String(r.group).padEnd(9)} ${String(r.kcal).padStart(4)}@${String(r.servG).padStart(3)}g  ${r.kcal100} kcal/100  ${r.name.slice(0, 55)} [${r.brand}]`);
const tsv = ['sampled_category\tproduct\tbrand\tbarcode\tkcal_100g\tsugars_100g\tlabel_serving_g\tapp_colour\tapp_group\tcal_per_serving\tserving_g\tsweetener\treasons\tcategory_tags']
  .concat(rows.map(r => [r.cat, r.name, r.brand, r.code, r.kcal100, r.sugars100, r.servQty, r.color, r.group, r.kcal, r.servG, r.sweetened, r.reason, r.cats].map(v => String(v == null ? '' : v).replace(/\t/g, ' ')).join('\t'))).join('\n') + '\n';
fs.writeFileSync(path.join(__dirname, process.argv[4] || 'audit_random_results.tsv'), tsv);
console.log('\n' + rows.length + ' products written to tests/audit_random_results.tsv');
