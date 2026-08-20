// unit-test foodFromFDC + fdcCatsToTags + classify together, using the real API fixtures
const fs = require('fs');
const src = fs.readFileSync('app.js', 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const s2 = src.indexOf('const FDC_NUTR');
const e2 = src.indexOf('// ---------- quick-add foods');
const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
  + src.slice(s2, e2).replace(/async function fdcSearch[\s\S]*?\n}\n/, '').replace(/async function fdcByBarcode[\s\S]*?\n}\n/, '');
fs.writeFileSync('fdc_combined.js', "const fs = require('fs');\n" + engine + `
const j = JSON.parse(fs.readFileSync('../fixtures/fdc_search.json','utf8'));
const broc = foodFromFDC(j.foods[0]);
console.log('SURVEY broccoli:', broc.name, '| bev:', broc.isBeverage, '| cats:', broc.cats.join(','), '| per100 kcal:', broc.per100.kcal, '| base:', broc.baseLabel);
console.log('  classify ->', JSON.stringify(classify(broc, RULES)));
const u = JSON.parse(fs.readFileSync('../fixtures/fdc_upc.json','utf8'));
const hnc = foodFromFDC(u.foods[0]);
console.log('BRANDED Honey Nut Cheerios:', hnc.name, '| serving:', hnc.servingLabel, '| serv kcal:', hnc.serv.kcal && hnc.serv.kcal.toFixed(0));
console.log('  classify ->', JSON.stringify(classify(hnc, RULES)));
// synthetic FDC shapes for category mapping
const mk = (desc, cat, nutr) => foodFromFDC({description: desc, foodCategory: cat, foodNutrients: Object.entries(nutr).map(([id,v]) => ({nutrientId:+id, value:v}))});
const cases = [
  [mk('Orange juice, raw', 'Fruits and Fruit Juices', {1008:45, 2000:8.4}), 'red'],
  [mk('MILK, NONFAT, FLUID', 'Dairy and Egg Products', {1008:34, 1004:0.1, 2000:5, 1003:3.4}), 'green'],
  [mk('Milk, chocolate, lowfat', 'Dairy and Egg Products', {1008:83, 1004:2.1, 2000:9.9, 1003:3.2}), 'red'],
  [mk('Carrots, raw', 'Vegetables and Vegetable Products', {1008:41, 1004:0.2, 2000:4.7, 1003:0.9}), 'green'],
  [mk('CANDY, MILK CHOCOLATE BAR', 'Sweets', {1008:535, 1004:30, 1258:19, 2000:52, 1003:8}), 'red'],
  [mk('Almonds, dry roasted', 'Nut and Seed Products', {1008:598, 1004:53, 1258:4, 2000:4.9, 1003:21}), 'yellow'],
  [mk('Yogurt, Greek, plain, nonfat', 'Dairy and Egg Products', {1008:59, 1004:0.4, 2000:3.2, 1003:10.2}), 'green'],
  [mk('COLA SOFT DRINK', 'Beverages', {1008:39, 2000:10.6}), 'red'],
  [mk('Chicken, broiler, breast, grilled', 'Poultry Products', {1008:165, 1004:3.6, 1258:1, 2000:0, 1003:31}), 'yellow'],
  [mk('Doughnut, cake type', 'Baked Products', {1008:417, 1004:23, 1258:6, 2000:22, 1003:5}), 'red'],
];
let ok = true;
for (const [f, exp] of cases) {
  const r = classify(f, RULES);
  const pass = r.color === exp; ok = ok && pass;
  console.log((pass?'PASS':'FAIL'), f.name, '->', r.color, '(exp', exp + ')', '|', r.reasons[0]);
}
console.log(ok ? 'ALL FDC TESTS PASS' : 'FAILURES PRESENT');
`);
