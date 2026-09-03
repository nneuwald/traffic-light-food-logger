// Automatic oracle for the random audits. Every Open Food Facts category the
// sampler draws from implies a small set of FRG food groups a product from it
// could legitimately land in ("cheeses" can be cheese, or a sweet if it is a
// cheese-flavoured snack; it can never be a soup). Any row outside that set is
// printed for human review, so a 400-product draw can be checked without
// reading 400 rows by eye.
//
//   node tests/audit_analyze.js [results.tsv]
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || 'audit_random_results.tsv';
const lines = fs.readFileSync(path.join(__dirname, file), 'utf8').trim().split('\n');
const h = lines[0].split('\t');
const rows = lines.slice(1).map(l => Object.fromEntries(l.split('\t').map((v, i) => [h[i], v])));

// category -> groups a product from it may legitimately take
const OK = {
  'breakfast-cereals': ['cereal', 'grain'],
  breads: ['grain', 'combo'],
  crackers: ['grain', 'sweets'],
  pastas: ['grain', 'combo'],
  rices: ['grain', 'combo'],
  'cereal-bars': ['grain', 'sweets'],
  popcorn: ['grain', 'sweets'],
  tortillas: ['grain'],
  yogurts: ['dairy', 'sweets'],
  cheeses: ['cheese', 'dairy', 'condiment', 'sweets'],
  milks: ['dairy', 'sweets', 'condiment'],
  'plant-based-milk-alternatives': ['dairy', 'condiment', 'sweets'],
  'ice-creams': ['sweets'],
  butters: ['sweets', 'nuts'],
  meats: ['meat', 'sweets', 'combo'],
  sausages: ['meat', 'combo'],
  'canned-fishes': ['meat', 'combo'],
  poultry: ['meat', 'combo'],
  eggs: ['protein', 'combo'],
  legumes: ['protein', 'nuts', 'sweets', 'veg', 'soupChili', 'condiment'],
  nuts: ['nuts', 'sweets'],
  tofu: ['protein', 'sweets'],
  'meat-alternatives': ['protein', 'meat', 'combo'],
  'frozen-vegetables': ['veg', 'starchy', 'combo', 'protein'],
  'canned-vegetables': ['veg', 'starchy', 'soupBroth', 'condiment'],
  'fresh-vegetables': ['veg', 'starchy', 'fruit'],
  salads: ['veg', 'combo', 'condiment', 'protein', 'grain'],
  'french-fries': ['starchy'],
  potatoes: ['starchy', 'combo', 'sweets', 'veg'],
  fruits: ['fruit', 'juice', 'veg', 'dairy', 'condiment'],
  'canned-fruits': ['fruit'],
  'dried-fruits': ['juice', 'fruit', 'sweets'],
  'fruit-juices': ['juice', 'veg', 'condiment', 'sweets'],
  applesauce: ['fruit'],
  sodas: ['sweets', 'free'],
  waters: ['free', 'sweets'],
  'energy-drinks': ['sweets'],
  'sports-drinks': ['sweets'],
  'iced-teas': ['sweets', 'free'],
  coffees: ['free', 'sweets', 'dairy'],
  'plant-based-beverages': ['dairy', 'juice', 'sweets', 'free', 'veg', 'condiment'],
  'biscuits-and-cakes': ['sweets', 'grain'],
  chocolates: ['sweets'],
  candies: ['sweets'],
  'salty-snacks': ['sweets', 'grain', 'nuts'],
  crisps: ['sweets', 'grain'],
  'frozen-desserts': ['sweets'],
  puddings: ['sweets'],
  spreads: ['sweets', 'nuts', 'condiment', 'cheese'],
  jams: ['sweets', 'condiment'],
  soups: ['soupBroth', 'soupChili', 'condiment', 'combo', 'grain'],
  condiments: ['condiment', 'veg', 'sweets', 'free'],
  'salad-dressings': ['condiment'],
  sauces: ['condiment', 'veg', 'sweets'],
  pizzas: ['combo'],
  'prepared-meals': ['combo', 'soupBroth', 'soupChili', 'meat', 'grain', 'protein', 'veg'],
  sandwiches: ['combo'],
  dips: ['condiment', 'veg'],
};

// a per-100 g calorie value outside this band for the group is suspect: the
// record is probably dry, condensed, mis-keyed, or the wrong food entirely
const PLAUSIBLE = {
  veg: [0, 200], starchy: [10, 250], fruit: [0, 200], juice: [0, 400], grain: [40, 600],
  cereal: [200, 500], cheese: [30, 500], dairy: [0, 400], meat: [30, 600], protein: [20, 400],
  nuts: [300, 750], sweets: [0, 950], soupBroth: [0, 200], soupChili: [10, 250], condiment: [0, 900],
  combo: [30, 500], free: [0, 30],
};

let flagged = 0, suspect = 0;
const groupOf = r => r.app_group || 'none';
console.log('-- group outside what the sampled category allows --');
for (const r of rows) {
  const allowed = OK[r.sampled_category];
  if (!allowed) continue;
  if (!allowed.includes(groupOf(r))) {
    flagged++;
    console.log('GROUP  ' + r.sampled_category.padEnd(30) + ' -> ' + groupOf(r).padEnd(10) + ' ' + String(r.app_colour).padEnd(6) +
      ' ' + r.kcal_100g + ' kcal/100  ' + r.product.slice(0, 52) + '  [' + r.barcode + ']');
  }
}
console.log('\n-- calories per 100 g implausible for the group the app chose --');
for (const r of rows) {
  const band = PLAUSIBLE[groupOf(r)];
  const k = Number(r.kcal_100g);
  if (!band || !isFinite(k)) continue;
  if (k < band[0] || k > band[1]) {
    suspect++;
    console.log('DATA   ' + groupOf(r).padEnd(10) + ' ' + String(k).padStart(4) + ' kcal/100 (band ' + band[0] + '-' + band[1] + ')  ' +
      String(r.app_colour).padEnd(6) + ' ' + r.product.slice(0, 52) + '  [' + r.barcode + ']');
  }
}
console.log('\n' + rows.length + ' products: ' + flagged + ' group flags, ' + suspect + ' data flags');
