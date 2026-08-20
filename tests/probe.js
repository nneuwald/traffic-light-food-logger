const { execSync } = require('child_process');
const fs = require('fs');
// pull the classification engine + OFF mapper out of the app
const src = fs.readFileSync('app.js', 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- Open Food Facts lookup');
const fieldsLine = src.split('\n').find(l => l.startsWith('const OFF_FIELDS'));
const s2 = src.indexOf('function foodFromOFF');
const e2 = src.indexOf('// ---------- USDA FoodData Central');
const engine = src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
             + fieldsLine + '\n' + src.slice(s2, e2);
(0, eval)(engine + '; globalThis._classify = classify; globalThis._RULES = RULES; globalThis._fromOFF = foodFromOFF; globalThis._FIELDS = OFF_FIELDS;');

const candidates = [
  ['049000006346', 'Coca-Cola 12oz can'], ['049000028911', 'Diet Coke'], ['012000161155', 'Pepsi'],
  ['052000338775', 'Gatorade'], ['048500018367', 'Tropicana OJ'], ['0016000275270', 'Honey Nut Cheerios'],
  ['016000487694', 'Cheerios'], ['030000063200', 'Quaker Oats'], ['038000391095', 'Froot Loops'],
  ['028400064057', "Lay's Classic"], ['044000032029', 'Oreo'], ['028400090896', 'Doritos'],
  ['024100106851', 'Cheez-It'], ['014100085478', 'Goldfish'], ['040000424315', 'Snickers'],
  ['034000002405', "Hershey's"], ['040000017092', 'Peanut M&Ms'], ['0894700010137', 'Chobani Greek nonfat'],
  ['070470003008', 'Yoplait'], ['051500255162', 'Jif peanut butter'], ['037600105002', 'Skippy'],
  ['009800895007', 'Nutella US'], ['722252100900', 'Clif Bar'], ['051000012616', "Campbell's chicken noodle"],
  ['013000006408', 'Heinz ketchup'], ['025293001718', 'Silk almond milk'], ['076840100354', "Ben & Jerry's"],
  ['018000428434', 'Pillsbury'], ['015400841122', 'store brand?'], ['041196010152', 'V8'],
];
const found = [];
for (const [code, hint] of candidates) {
  try {
    const out = execSync(`curl -s --max-time 12 "https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${globalThis._FIELDS}"`, { encoding: 'utf8' });
    const j = JSON.parse(out);
    if (j.status === 1 && j.product && j.product.nutriments && j.product.nutriments['energy-kcal_100g'] != null) {
      const f = globalThis._fromOFF(j.product);
      const c = globalThis._classify(f, globalThis._RULES);
      found.push({ code: j.code, name: f.name, brand: f.brand.split(',')[0], color: c.color, hint });
    } else {
      console.error('MISS', code, hint, j.status === 1 ? '(no kcal data)' : '');
    }
  } catch (e) { console.error('ERR ', code, hint); }
  execSync('sleep 0.4');
}
console.log('\nFOUND ' + found.length + ':');
for (const f of found) console.log([f.code, f.color.toUpperCase().padEnd(6), (f.name || '').slice(0, 44), f.brand].join(' | '));
fs.writeFileSync('verified_barcodes.json', JSON.stringify(found, null, 2));
