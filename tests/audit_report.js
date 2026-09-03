// Turns tests/audit_live_results.tsv (written by audit_live.js) into a readable
// Markdown report, tests/audit_live_results.md: a per-group summary, the misses
// with a human explanation, and every product.
//
//   node tests/audit_report.js
const fs = require('fs');
const path = require('path');

const lines = fs.readFileSync(path.join(__dirname, 'audit_live_results.tsv'), 'utf8').trim().split('\n');
const h = lines[0].split('\t');
const rows = lines.slice(1).map(l => Object.fromEntries(l.split('\t').map((v, i) => [h[i], v])));

const G = { veg: 'Vegetables', starchy: 'Starchy vegetables', fruit: 'Fruit', juice: 'Juice & dried fruit', grain: 'Grains',
  cereal: 'Cold cereal', cheese: 'Cheese', dairy: 'Milk, yogurt & other dairy', meat: 'Meat & seafood', protein: 'Eggs, beans & substitutes',
  nuts: 'Nuts', sweets: 'Fats, oils, sweets & others', soupBroth: 'Soup: broth/chowder', soupChili: 'Soup: chili/bean', condiment: 'Condiments',
  combo: 'Combination foods', free: 'No colour' };
const label = g => G[g] || (g && g !== 'null' ? g : 'no group');

// human reading of the misses left after the 3 Sep 2026 fixes
const NOTE = {
  'campbells tomato juice 100% juice': 'Search returned a Krave cereal, not tomato juice; the app is right for the record it got',
  'ore-ida golden tater tots': 'Record is named only "Ore-ida" with no category tags, so there is nothing to classify on; the app asks the clinician to pick a group',
  'ore-ida golden crinkles french fries': 'Open Food Facts 143 kcal/100 g gives 122 per 3 oz; the label says 120 per 84 g. Sits exactly on the guide line',
  'dole pineapple chunks in 100% juice': 'Search returned pineapple juice, which is correctly red',
  'special k original cereal kellogg': 'Record is a flavoured Special K at 32% of calories from sugar; red is right for that variant',
  'post grape-nuts': 'Known limitation: dense cereal judged at 30 g like flakes, where the guide uses a heavier 1/4 or 1/2 cup and prints red',
  'nesquik chocolate lowfat milk ready to drink': 'Record "Lowfat Chocolate Drink" is tagged as a cocoa drink; red either way, the guide files chocolate milk under dairy (also red)',
  'philadelphia original cream cheese brick': 'Search returned whipped chive cream cheese, which the guide prints yellow (2 Tbsp, 62 cal); the app is right for that product',
  'goya black beans': 'Open Food Facts 107 kcal/100 g gives 133 per 1/2 cup; the guide lists canned black beans at 109. A data value, not a rule',
};

const by = {};
for (const r of rows) { const g = r.expected_group; by[g] = by[g] || { n: 0, ok: 0 }; by[g].n++; if (r.status === 'OK') by[g].ok++; }
const total = rows.length, matched = rows.filter(r => r.status === 'OK').length;

let md = '# Live audit of the classifier against Open Food Facts records\n\n';
md += '3 September 2026. ' + total + ' everyday US products were searched on Open Food Facts; each real record was run through the app\'s mapper and classifier and compared with the colour and group the Food Reference Guide gives that kind of food. Rerun with `node tests/audit_live.js` then `node tests/audit_report.js`.\n\n';
md += '## Summary by food group\n\n| Expected group | Products | Match | Misses |\n|---|---|---|---|\n';
for (const k of Object.keys(G)) { if (!by[k]) continue; md += '| ' + G[k] + ' | ' + by[k].n + ' | ' + by[k].ok + ' | ' + (by[k].n - by[k].ok) + ' |\n'; }
md += '| **Total** | **' + total + '** | **' + matched + '** | **' + (total - matched) + '** |\n\n';

md += '## The misses\n\n| Searched for | Record returned | App | Guide expects | Why |\n|---|---|---|---|---|\n';
for (const r of rows.filter(r => r.status !== 'OK')) {
  md += '| ' + r.query + ' | ' + r.product + ' | ' + r.app_colour + ' / ' + label(r.app_group) +
    (r.cal_per_serving ? ' (' + r.cal_per_serving + ' cal @ ' + r.serving_g + ' g)' : '') + ' | ' + r.expected_colour + ' / ' + label(r.expected_group) + ' | ' + (NOTE[r.query] || '') + ' |\n';
}

md += '\n## Every product\n\n| Searched for | Record returned | Barcode | App colour | App group | Cal per FRG serving | Guide expects | Status |\n|---|---|---|---|---|---|---|---|\n';
for (const r of rows) {
  md += '| ' + r.query + ' | ' + r.product.replace(/\|/g, '/') + ' | ' + r.barcode + ' | ' + r.app_colour + ' | ' + label(r.app_group) + ' | ' +
    (r.cal_per_serving ? r.cal_per_serving + ' @ ' + r.serving_g + ' g' : 'n/a') + ' | ' + r.expected_colour + ' / ' + label(r.expected_group) + ' | ' +
    (r.status === 'OK' ? 'match' : r.status.toLowerCase() + ' differs') + ' |\n';
}
fs.writeFileSync(path.join(__dirname, 'audit_live_results.md'), md);
console.log('wrote audit_live_results.md: ' + matched + ' of ' + total + ' match');
