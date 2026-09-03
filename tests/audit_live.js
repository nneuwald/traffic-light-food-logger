// Live audit: search Open Food Facts for a long list of everyday US products,
// run each real record through foodFromOFF() + classify(), and compare with the
// colour and group the Food Reference Guide gives that kind of food. Needs
// internet; the saved-fixture suites are the offline regression tests.
//
//   node tests/audit_live.js            # prints a table and writes audit_live_results.tsv next to this file
//
// Expected values are what the guide prints for the generic food (page in the
// note). A product can legitimately differ from the generic when its label
// calories sit on the other side of the line; those rows are for a human to read.
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
(0, eval)(engine + ';globalThis._c=classify;globalThis._R=RULES;globalThis._f=foodFromOFF;globalThis._F=OFF_FIELDS;');

// [search query, expected colour, expected group, guide note]
const CASES = [
  // vegetables (p.12-17)
  ['fresh baby spinach',                 'green',  'veg',       'spinach raw 7 cal green p.15'],
  ['broccoli florets frozen',            'green',  'veg',       'broccoli 1/2 cup green p.12'],
  ['romaine lettuce hearts',             'green',  'veg',       'lettuce green p.14'],
  ['grape tomatoes',                     'green',  'veg',       'tomato green p.15'],
  ['baby carrots',                       'green',  'veg',       'carrots raw 25 green p.13'],
  ['del monte cut green beans',          'green',  'veg',       'green beans green p.13'],
  ['prego traditional pasta sauce',      'yellow', 'veg',       'pasta sauce 1/4 cup 35-45 yellow p.16'],
  ['v8 original vegetable juice',        'red',    'veg',       'V8 8 oz 50 cal, over 45: red p.17'],
  ['campbells tomato juice 100% juice',   'yellow', 'veg',       'tomato juice yellow p.16'],
  // starchy vegetables (p.18-20)
  ['green giant whole kernel sweet corn can','yellow','starchy',   'corn 1/2 cup 92 yellow p.18'],
  ['birds eye sweet peas',               'yellow', 'starchy',   'peas 1/2 cup 50-67 yellow p.18'],
  ['ore-ida golden tater tots',          'red',    'starchy',   'tater tots 3 oz 150 red p.20'],
  ['ore-ida golden crinkles french fries','yellow', 'starchy',   'golden fries 3 oz 120 yellow p.19'],
  ['libby canned pumpkin',               'yellow', 'starchy',   'pumpkin canned yellow p.18'],
  ['ore-ida hash brown patties',         'red',    'starchy',   'hash brown patty 3 oz ~150, over 120: red like tater tots p.20'],
  // fruit (p.21-25)
  ['dole mandarin oranges in juice',     'yellow', 'fruit',     'canned in juice 1/2 cup yellow p.22'],
  ['del monte sliced peaches heavy syrup','red',   'fruit',     'peaches heavy syrup 1/2 cup 118 red p.23'],
  ['del monte fruit cocktail in 100% juice','yellow','fruit',    'fruit cocktail canned in juice 56 yellow p.22'],
  ['mott natural applesauce unsweetened','yellow', 'fruit',     'applesauce unsweetened 51 yellow p.21'],
  ['sun-maid raisins',                   'red',    'juice',     'dried fruit red p.24'],
  ['ocean spray craisins',               'red',    'juice',     'dried cranberries red p.24'],
  ['tropicana orange juice',             'red',    'juice',     'juice red p.24'],
  ['welch fruit snacks',                 'red',    'sweets',    'fruit snacks red p.62'],
  ['dole pineapple chunks in 100% juice','yellow', 'fruit',     'pineapple canned in juice yellow p.22'],
  // grains (p.26-32)
  ['wonder classic white bread',         'yellow', 'grain',     'bread 1 slice yellow p.26'],
  ['thomas plain bagels',                'yellow', 'grain',     'bagel 1 oz yellow p.26'],
  ['nabisco ritz original crackers',     'red',    'grain',     'Ritz red p.31'],
  ['triscuit original',                  'yellow', 'grain',     'Triscuit 110 yellow p.27'],
  ['rold gold tiny twists original pretzels','yellow','grain',     'hard pretzels 1 oz 108 yellow p.29'],
  ['goldfish cheddar crackers',          'red',    'grain',     'Goldfish red p.31'],
  ['cheez-it original',                  'red',    'grain',     'Cheez-It red p.31'],
  ['eggo homestyle waffles',             'yellow', 'grain',     'Eggo 1 waffle ~95 yellow p.30'],
  ['nature valley crunchy oats n honey', 'red',    'grain',     'granola bar 2 bars 190 red p.31'],
  ['kellogg nutri-grain strawberry bar', 'yellow', 'grain',     'Nutri-Grain 1 bar 90-120 yellow p.27'],
  ['quaker chewy chocolate chip granola bar','yellow','grain',  'chewy bar ~100 yellow p.28'],
  ['orville redenbacher movie theater butter popcorn','red','grain','microwave butter popcorn red p.31'],
  ['skinnypop original popcorn',         'red',    'grain',     'popped popcorn 1 oz ~150, over 120'],
  ['mission corn tortillas',             'yellow', 'grain',     'corn tortilla yellow p.30'],
  ['barilla penne',                      'yellow', 'grain',     'dry pasta 1 oz yellow p.29'],
  ['minute white rice',                  'yellow', 'grain',     'rice yellow p.29'],
  ['quaker instant oatmeal maple brown sugar','red',   'grain', 'flavoured instant oatmeal 1 packet ~160, over 120: red p.31'],
  // cold cereal (p.77-82)
  ['kellogg corn flakes',                'yellow', 'cereal',    'Corn Flakes yellow p.77'],
  ['kellogg froot loops',                'red',    'cereal',    'Froot Loops sugar red p.80'],
  ['kix crispy corn puffs cereal',       'yellow', 'cereal',    'Kix yellow p.78'],
  ['kellogg raisin bran',                'red',    'cereal',    'Raisin Bran red p.82'],
  ['special k original cereal kellogg',  'yellow', 'cereal',    'Special K yellow p.79'],
  ['general mills lucky charms',         'red',    'cereal',    'Lucky Charms red p.81'],
  ['post grape-nuts',                    'red',    'cereal',    'Grape-Nuts 1/4 cup 140 red p.81 (dense cereal)'],
  ['general mills cinnamon toast crunch','red',    'cereal',    'Cinnamon Toast Crunch red p.80'],
  ['rice krispies toasted rice cereal',  'yellow', 'cereal',    'Rice Krispies yellow p.79'],
  ['quaker life cereal original',        'yellow', 'cereal',    'Life original yellow p.78'],
  // dairy (p.33-40)
  ['fairlife 2% reduced fat ultra-filtered milk','yellow','dairy',     '2% milk 122 yellow p.35'],
  ['horizon organic whole milk',         'red',    'dairy',     'whole milk 138 red p.38'],
  ['nesquik chocolate lowfat milk ready to drink','red','dairy',     'chocolate milk red p.38'],
  ['yoplait original strawberry yogurt', 'red',    'dairy',     'Yoplait original 6 oz 150 red p.39'],
  ['dannon light fit vanilla',           'yellow', 'dairy',     'Light & Fit 80 yellow p.36'],
  ['chobani strawberry on the bottom greek yogurt','yellow','dairy',     'Chobani fruit 5.3 oz ~130 yellow p.36 (borderline)'],
  ['kraft singles american cheese',      'red',    'cheese',    'Kraft singles 1 oz 90 red p.37'],
  ['sargento string cheese',             'yellow', 'cheese',    'string cheese 80 yellow p.34'],
  ['philadelphia original cream cheese brick','red', 'cheese',    'cream cheese regular 2 Tbsp 99 red p.37'],
  ['breakstones all natural sour cream', 'red',    'dairy',     'sour cream regular red p.38'],
  ['daisy light sour cream',             'red',    'dairy',     'sour cream light red p.38'],
  ['silk original soymilk',              'yellow', 'dairy',     'Silk original 1 cup 110 yellow p.35'],
  ['oatly oat drink original',           'yellow', 'dairy',     'plant milk 1 cup ~120 yellow p.35'],
  ['daisy cottage cheese 2%',            'red',    'cheese',    'cottage cheese 2% 1/2 cup 97 red p.37'],
  ['good culture cottage cheese 2%',     'red',    'cheese',    'cottage 2% red p.37 (label 1/2 cup)'],
  // protein (p.41-58)
  ['oscar mayer classic beef uncured franks','red', 'meat',      'hot dog regular 3 oz red p.52'],
  ['oscar mayer oven roasted turkey breast deli','yellow','meat','deli turkey 3 oz 88 yellow p.44'],
  ['jennie-o lean ground turkey',        'yellow', 'meat',      'ground turkey lean 3 oz ~150 yellow p.48'],
  ['boca original vegan burger',         'yellow', 'protein',   'Boca 1 patty 100 yellow p.44'],
  ['jif creamy peanut butter',           'red',    'nuts',      'peanut butter 2 Tbsp 188 red p.54'],
  ['blue diamond almonds',               'red',    'nuts',      'almonds 1 oz red p.54'],
  ['goya black beans',                   'yellow', 'protein',   'black beans 1/2 cup 109 yellow p.41'],
  ['bush original baked beans',          'red',    'protein',   'baked beans sweetened 161 red p.49'],
  ['tyson chicken nuggets',              'red',    'meat',      'breaded chicken 3 oz ~240 red p.50'],
  ['oscar mayer naturally hardwood smoked bacon','red','sweets',    'bacon is a fat red p.65'],
  ['jimmy dean pork sausage',            'red',    'meat',      'sausage 3 oz red p.53'],
  ['bumble bee chunk light tuna in water 5 oz can','yellow','meat',      'tuna in water 3 oz 73 yellow p.47'],
  ['hormel canadian bacon',              'yellow', 'meat',      'Canadian bacon yellow p.45'],
  ['eggland best eggs',                  'yellow', 'protein',   'egg 78 yellow p.43'],
  ['nasoya tofu firm',                   'yellow', 'protein',   'tofu 3 oz 60-77 yellow p.45'],
  ['planters dry roasted peanuts',       'red',    'nuts',      'peanuts red p.55'],
  // fats, oils, sweets & others (p.59-66)
  ['pepsi cola',                         'red',    'sweets',    'soda red p.60'],
  ['coca-cola zero sugar',               'red',    'sweets',    'Coke Zero red p.60'],
  ['sprite',                             'red',    'sweets',    'soda red p.60'],
  ['lacroix sparkling water',            'free',   'free',      'plain sparkling water no colour p.7'],
  ['perrier',                            'free',   'free',      'mineral water no colour p.7'],
  ['propel electrolyte water',           'red',    'sweets',    'Propel red p.60'],
  ['vitaminwater zero',                  'red',    'sweets',    'flavoured water, artificially sweetened red p.2, p.60'],
  ['gatorade zero',                      'red',    'sweets',    'sports drink red p.60'],
  ['red bull energy drink',              'red',    'sweets',    'energy drink red p.59'],
  ['pure leaf unsweetened tea',          'free',   'free',      'plain tea no colour p.7'],
  ['arizona sweet tea',                  'red',    'sweets',    'sweetened tea red p.59'],
  ['lipton diet green tea citrus',       'red',    'sweets',    'diet tea drink red p.59'],
  ['minute maid lemonade',               'red',    'sweets',    'lemonade red p.59'],
  ['starbucks frappuccino mocha bottle', 'red',    'sweets',    'coffee drink sweetened red p.59'],
  ['swiss miss hot cocoa mix',           'red',    'sweets',    'hot cocoa red p.60'],
  ['snickers bar',                       'red',    'sweets',    'candy red p.62'],
  ['lays classic potato chips',          'red',    'sweets',    'chips red p.65'],
  ['nutella hazelnut spread',            'red',    'sweets',    'sweet spread red p.66'],
  ['land o lakes salted butter',         'red',    'sweets',    'butter red p.65'],
  ['hellmann real mayonnaise',           'red',    'sweets',    'mayonnaise red p.66'],
  ['smucker strawberry jam',             'red',    'sweets',    'jam red p.75 (listed as red ingredient)'],
  ['splenda no calorie sweetener',       'red',    'sweets',    'artificial sweetener red p.75'],
  ['coffee mate original creamer',       'red',    'sweets',    'creamer red p.65'],
  ['pop-tarts frosted strawberry',       'red',    'sweets',    'Pop Tart red p.64'],
  ['chips ahoy original cookies',        'red',    'sweets',    'cookies red p.63'],
  ['haribo goldbears gummy bears',       'red',    'sweets',    'gummy candy red p.63'],
  ['yasso frozen greek yogurt bars',     'red',    'sweets',    'frozen yogurt red p.62'],
  ['cool whip original',                 'red',    'sweets',    'whipped topping: fat, red p.65'],
  ['planters trail mix',                 'red',    'sweets',    'trail mix red p.65'],
  // soups (p.67-72)
  ['campbell condensed chicken noodle soup','yellow','soupBroth','chicken noodle yellow p.68'],
  ['progresso lentil soup',              'yellow', 'soupChili', 'lentil 160 yellow p.70'],
  ['hormel chili with beans',            'red',    'soupChili', 'chili with beans ~260, over 224 red p.72'],
  ['maruchan ramen chicken',             'red',    'soupBroth', 'Maruchan ramen 190 red p.71'],
  ['campbell condensed tomato soup',     'yellow', 'soupBroth', 'tomato soup yellow p.68'],
  ['swanson beef broth',                 'yellow', 'condiment', 'broth 1 cup 12 yellow p.73 (data often inflated)'],
  // condiments (p.73-76)
  ['heinz tomato ketchup',               'yellow', 'condiment', 'ketchup 1 Tbsp 19 yellow p.73'],
  ['french classic yellow mustard',      'yellow', 'condiment', 'mustard yellow p.73'],
  ['hidden valley original ranch',       'red',    'condiment', 'ranch red p.75'],
  ['sabra classic hummus',               'red',    'condiment', 'hummus red p.75'],
  ['tostitos chunky salsa',              'yellow', 'condiment', 'salsa 1 Tbsp 11 yellow p.73'],
  ['sweet baby ray barbecue sauce',      'red',    'condiment', 'barbecue sauce 29 red p.75'],
  ['kikkoman soy sauce',                 'yellow', 'condiment', 'soy sauce yellow p.73'],
  ['frank redhot original',              'yellow', 'condiment', 'hot sauce yellow p.73'],
  ['reddi-wip original',                 'yellow', 'condiment', 'whipped cream pressurized 1 Tbsp 13 yellow p.73'],
  ['newman own balsamic vinaigrette',    'red',    'condiment', 'regular dressing red p.75'],
  ['heinz homestyle brown gravy',        'red',    'condiment', 'gravy red p.75'],
  // combination foods (p.8)
  ['digiorno pepperoni pizza',           'yellow', 'combo',     'combination food, flagged p.8'],
  ['hot pockets pepperoni pizza',        'yellow', 'combo',     'combination food, flagged p.8'],
  ['smucker uncrustables peanut butter', 'yellow', 'combo',     'sandwich: combination food p.8'],
  ['kraft macaroni and cheese original', 'yellow', 'combo',     'combination food p.8'],
];

function search(q) {
  const url = 'https://search.openfoodfacts.org/search?q=' + encodeURIComponent(q + ' countries_tags:"en:united-states"') +
    '&page_size=8&fields=code,product_name,brands,serving_size,serving_quantity,nutriments,categories_tags,ingredients_text,additives_tags,countries_tags';
  const out = execSync(`curl -s --max-time 20 "${url}"`, { encoding: 'utf8', maxBuffer: 20e6 });
  const j = JSON.parse(out);
  const hits = (j.hits || []).map(h => ({ ...h, brands: Array.isArray(h.brands) ? h.brands.join(', ') : h.brands }));
  // first hit with a name, calories and at least one category tag
  return hits.find(h => h.product_name && h.nutriments && h.nutriments['energy-kcal_100g'] != null && (h.categories_tags || []).length) ||
         hits.find(h => h.product_name && h.nutriments && h.nutriments['energy-kcal_100g'] != null) || null;
}

const rows = [];
let ok = 0, colorOnly = 0, groupOnly = 0, both = 0, miss = 0;
for (const [q, wantColor, wantGroup, note] of CASES) {
  let p = null;
  try { p = search(q); } catch (e) { /* network */ }
  if (!p) { miss++; rows.push({ q, name: '(no usable record)', brand: '', code: '', color: '', group: '', kcal: '', servG: '', wantColor, wantGroup, status: 'NO DATA', note, reason: '' }); continue; }
  const f = _f(p);
  const r = _c(f, _R);
  const cOk = r.color === wantColor, gOk = r.group === wantGroup;
  const status = cOk && gOk ? 'OK' : (!cOk && !gOk ? 'COLOUR+GROUP' : (!cOk ? 'COLOUR' : 'GROUP'));
  if (status === 'OK') ok++; else if (status === 'COLOUR') colorOnly++; else if (status === 'GROUP') groupOnly++; else both++;
  rows.push({ q, name: f.name, brand: String(f.brand || '').split(',')[0], code: p.code, color: r.color, group: r.group,
    kcal: r.kcalServ == null ? '' : Math.round(r.kcalServ), servG: r.servG || '', kcal100: f.per100.kcal, wantColor, wantGroup, status, note,
    reason: r.reasons.join(' | '), cats: (p.categories_tags || []).join(' ') });
  const flag = status === 'OK' ? '  ' : '!!';
  console.log(`${flag} ${status.padEnd(12)} ${q.padEnd(44)} -> ${String(r.color).padEnd(6)} ${String(r.group).padEnd(9)} ${String(rows[rows.length - 1].kcal).padStart(4)} cal @ ${String(r.servG || '-').padStart(3)} g   [${f.name.slice(0, 48)}]`);
  execSync('sleep 0.3');
}

const tsv = ['query\tproduct\tbrand\tbarcode\tapp_colour\tapp_group\tcal_per_serving\tserving_g\tkcal_100g\texpected_colour\texpected_group\tstatus\tguide_note\treasons\tcategory_tags']
  .concat(rows.map(r => [r.q, r.name, r.brand, r.code, r.color, r.group, r.kcal, r.servG, r.kcal100, r.wantColor, r.wantGroup, r.status, r.note, r.reason, r.cats].map(v => String(v == null ? '' : v).replace(/\t/g, ' ')).join('\t')))
  .join('\n') + '\n';
fs.writeFileSync(path.join(__dirname, 'audit_live_results.tsv'), tsv);
console.log(`\n${CASES.length} products: ${ok} match, ${colorOnly} colour differs, ${groupOnly} group differs, ${both} both differ, ${miss} no usable record`);
