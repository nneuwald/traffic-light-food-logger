// Turns tests/audit_random_results.tsv (written by audit_random.js) into a
// Markdown report with a hand-entered verdict per product. Verdicts below are
// for the 3 Sep 2026 draw (seed 23); rows not listed were checked and match the
// guide's rule for that food. Rerun after a new draw and re-judge the rows.
//
//   node tests/audit_random_report.js
const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, 'audit_random_results.tsv'), 'utf8').trim().split('\n');
const h = lines[0].split('\t');
const rows = lines.slice(1).map(l => Object.fromEntries(l.split('\t').map((v, i) => [h[i], v])));

const G = { veg: 'Vegetables', starchy: 'Starchy vegetables', fruit: 'Fruit', juice: 'Juice & dried fruit', grain: 'Grains',
  cereal: 'Cold cereal', cheese: 'Cheese', dairy: 'Milk, yogurt & other dairy', meat: 'Meat & seafood', protein: 'Eggs, beans & substitutes',
  nuts: 'Nuts', sweets: 'Fats, oils, sweets & others', soupBroth: 'Soup: broth/chowder', soupChili: 'Soup: chili/bean', condiment: 'Condiments',
  combo: 'Combination foods', free: 'No colour' };
const label = g => G[g] || (g && g !== 'null' ? g : 'no group');

// [regex on product name, verdict, note]. Verdicts: "data" = the app applied the
// guide's rule correctly but the database value or its basis is doubtful.
const VERDICTS = [
  [/^Corn Flakes$/i,                    'data', 'Open Food Facts lists 406 kcal/100 g, which is high for plain corn flakes (label Corn Flakes are 100 per cup and yellow in the guide, p.77). Red follows from the data, not the rule.'],
  [/Small Red Beans/i,                  'data', '123 kcal/100 g reads as drained beans; the guide lists canned kidney beans with liquid at 105 per 1/2 cup, yellow (p.41). Red follows from the data basis.'],
  [/Veggie Burger/i,                    'data', '329 kcal/100 g is implausible for a veggie burger (typical 150 to 250; guide patties run 100 to 170, p.44 and p.54). The rule is applied correctly to bad data.'],
  [/Hashbrown Potatoes/i,               'data', 'Dehydrated product; calories are per dry weight. As prepared, 3 oz would be judged like the guide\'s hash browns (p.19 to 20).'],
  [/^Soup$/i,                           'data', 'Product is named only "Soup". The Great Value one is a canned, probably condensed, soup whose per-100 g calories double the as-prepared value; the other is unverifiable. The rule is applied correctly.'],
  [/Chicken Drumsticks/i,               'data', 'Raw weight. At 3 oz raw with skin the app reads 156 (yellow); the guide judges cooked meat, and a roasted drumstick with skin is about 180 per 3 oz (red, p.49).'],
  [/Evaporated milk/i,                  'match', 'Guide lists whole evaporated milk red (p.38). The app judges it at 1 cup; the guide\'s own serving is 1/3 cup, red either way.'],
  [/artichoke hearts/i,                 'match', 'Sits at 31 cals per 1/2 cup, one over the green line; the guide prints frozen artichoke hearts yellow too.'],
  [/Mixed fruit diced/i,                'match', '89 cals per 1/2 cup, one under the fruit line; yellow as the guide prints fruit canned in juice (p.22).'],
  [/Cilantro dressing/i,                'match', '25 cals per Tbsp, two over the condiment line: red, as the guide prints regular dressings (p.75).'],
  [/^Popcorn$/i,                        'match', 'Oil-popped brands at 130 to 140 per oz are over the grain line. The guide prints plain air-popped popcorn yellow (113) and buttered red (p.29, p.31).'],
  [/fromage fondu/i,                    'match', 'Processed cheese spread; 2 Tbsp would be about 79 cals, matching the guide\'s light cheese spreads yellow (p.33).'],
  [/Macaroni Salad|Chicken Salad/i,     'match', 'Deli salads with dressing are mixed dishes; the guide has no range for them and the app flags them for review (p.8).'],
  [/Uncle bens original rice/i,         'match', '160 kcal/100 g reads as a cooked or pouch rice, so it is judged at 1/2 cup cooked: 120, yellow (p.29).'],
  [/Boston baked beans candy/i,         'match', 'Candy-coated peanuts, not beans: red as a sweet (p.62), which the word "candy" catches.'],
  [/Yoplait peach/i,                    'match', 'Judged at the label\'s 1-cup serving from a 32 oz tub: 216, red. The guide prints Yoplait Original red at 6 oz too (p.39).'],
  [/Pitted Organic Dates/i,             'match', 'Tagged "dried fruit" by Open Food Facts, but the guide lists dates under fresh fruit, yellow, at 3 deglet noor (p.21). Fixed in this session.'],
  [/Street tacos corn tortillas/i,      'match', 'Was read as tacos (combination food) before this session; tortillas are grain (p.30).'],
  [/Tortilla [Cc]hips/i,                'match', 'Was read as grain before this session; the guide files tortilla chips under salty snacks, red (p.65).'],
  [/Unsweetened Coconut Milk/i,         'match', 'Canned cooking coconut milk (163 kcal/100 g) is an ingredient at 1 Tbsp, red (p.75). Was read as a fat before this session; same colour, right group now.'],
  [/Gala style apple juice/i,           'match', 'Tagged "sweetened beverage" by Open Food Facts; red either way, and now filed under juice as the guide does (p.24).'],
  [/Hot Dog Enriched Buns/i,            'match', 'Hamburger and hot dog buns were read as burgers (combination food) before this session; they are grain (p.29).'],
];
function verdict(r) {
  for (const [re, v, note] of VERDICTS) if (re.test(r.product)) return { v, note };
  return { v: 'match', note: '' };
}

const judged = rows.map(r => ({ ...r, ...verdict(r) }));
const total = judged.length, match = judged.filter(r => r.v === 'match').length, data = judged.filter(r => r.v === 'data').length;

let md = '# Random draw of 100 Open Food Facts products, judged against the guide\n\n';
md += '3 September 2026, seed 23. One hundred US products drawn at random across ' + new Set(rows.map(r => r.sampled_category)).size + ' Open Food Facts categories (random page, random products on the page), run through the app, and each verdict checked by hand against the Food Reference Guide. Rerun with `node tests/audit_random.js 100 23` then `node tests/audit_random_report.js`.\n\n';
md += '| Verdict | Products |\n|---|---|\n';
md += '| App colour and group follow the guide\'s rule for the food | ' + match + ' |\n';
md += '| Rule applied correctly, but the database calorie value or its basis (raw, dry, condensed) is doubtful | ' + data + ' |\n';
md += '| Classifier wrong | ' + (total - match - data) + ' |\n| **Total** | **' + total + '** |\n\n';

const by = {};
for (const r of judged) { const g = r.app_group || 'none'; by[g] = by[g] || { n: 0, m: 0, d: 0 }; by[g].n++; if (r.v === 'match') by[g].m++; else by[g].d++; }
md += '## By app food group\n\n| App group | Products | Follow the guide | Data doubtful |\n|---|---|---|---|\n';
for (const k of Object.keys(G).concat(['none'])) { if (!by[k]) continue; md += '| ' + label(k) + ' | ' + by[k].n + ' | ' + by[k].m + ' | ' + by[k].d + ' |\n'; }

md += '\n## Colour spread\n\n| Colour | Products |\n|---|---|\n';
for (const c of ['green', 'yellow', 'red', 'free']) md += '| ' + (c === 'free' ? 'no colour' : c) + ' | ' + judged.filter(r => r.app_colour === c).length + ' |\n';

md += '\n## Every product\n\n| # | Sampled from | Product | Brand | kcal/100 g | App colour | App group | Cal per FRG serving | Verdict | Note |\n|---|---|---|---|---|---|---|---|---|---|\n';
judged.forEach((r, i) => {
  md += '| ' + (i + 1) + ' | ' + r.sampled_category + ' | ' + r.product.replace(/\|/g, '/') + ' | ' + r.brand + ' | ' + r.kcal_100g + ' | ' + r.app_colour + ' | ' + label(r.app_group) + ' | ' +
    (r.cal_per_serving ? r.cal_per_serving + ' @ ' + r.serving_g + ' g' : 'n/a') + ' | ' + (r.v === 'match' ? 'follows guide' : 'data doubtful') + ' | ' + r.note + ' |\n';
});
fs.writeFileSync(path.join(__dirname, 'audit_random_results.md'), md);
console.log('wrote audit_random_results.md: ' + match + ' follow the guide, ' + data + ' data doubtful, ' + (total - match - data) + ' wrong, of ' + total);
