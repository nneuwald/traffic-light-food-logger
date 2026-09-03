// Regression suite over REAL Open Food Facts responses, judged by the FRG rule.
// Hand-written cases pass tidy tag arrays straight to classify(); this suite
// runs saved API responses through foodFromOFF() and the group detector, which
// is where category-vocabulary bugs actually live. Expected colours come from
// Epstein's Food & Activity Reference Guide (2012); a null colour means the
// saved nutrition data is known to be off and only the group is asserted.
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

const DIR = path.join(__dirname, '..', 'fixtures', 'off_products');
const load = code => _f(JSON.parse(fs.readFileSync(path.join(DIR, code + '.json'), 'utf8')));

// [barcode, label, expected colour, expected FRG group]
const CASES = [
  // --- no colour: water; always red: soda including diet (FRG p.7, p.59-60) ---
  ['0075720000814', 'Poland Spring water',        'free',   'free'],
  ['0049000027624', 'Dasani purified water',      'free',   'free'],
  ['0012000161155', 'LifeWtr',                    'free',   'free'],
  ['0049000028911', 'Diet Coke',                  'red',    'sweets'],
  ['0049000006346', 'Coca-Cola',                  'red',    'sweets'],
  ['0052000338775', 'Gatorade lemon-lime',        'red',    'sweets'],
  // --- vegetables: the only green; peas are starchy (p.12-19) ---
  ['0033383666020', 'Baby carrots',               'green',  'veg'],
  ['0027000380406', "Hunt's diced tomatoes",      'green',  'veg'],
  ['0024000162865', 'Del Monte cut green beans',  'green',  'veg'],
  ['0020000174808', 'Green Giant peas',           'yellow', 'starchy'],
  // --- fruit is yellow at most (p.21-23) ---
  ['0038900004736', 'Dole pineapple chunks',      'yellow', 'fruit'],
  // applesauce is 1/2 cup in the FRG (sweetened 84 cal, yellow; p.21). OFF lists Mott's Original at
  // 86 kcal/100 g, which is 107 per 1/2 cup: over the 90-cal fruit line, so red by the guide's own rule
  ['0014800000207', "Mott's Original applesauce", 'red',    'fruit'],
  // --- grains at 1 oz, cooked rice at 1/2 cup (p.26-32) ---
  ['0072250914765', "Nature's Own honey wheat",   'yellow', 'grain'],
  ['0013764027053', "Dave's Killer Bread",        'yellow', 'grain'],
  ['0004656700801', 'Quaker old fashioned oats',  'yellow', 'grain'],
  ['0076808006575', 'Barilla spaghetti',          'yellow', 'grain'],
  ['0737312008300', 'Mission flour tortillas',    'yellow', 'grain'],
  ['0054800423347', "Ben's Original brown rice",  'yellow', 'grain'],
  // --- cold cereal and the 25% sugar rule (p.77-82) ---
  ['0003625341118', 'Cheerios',                   'yellow', 'cereal'],
  ['0016000275270', 'Honey Nut Cheerios',         'red',    'cereal'],
  ['0038000391095', 'Frosted Flakes',             'red',    'cereal'],
  // --- dairy at 1 cup / 6 oz; cheese at 1 oz (cottage cheese 1/2 cup) (p.33-40) ---
  ['0099482476519', 'Chobani plain nonfat greek', 'yellow', 'dairy'],
  ['0089544083016', 'FAGE Total 0% (untagged)',   'yellow', 'dairy'],
  ['0025293003842', 'Silk unsweetened almondmilk','yellow', 'dairy'],
  ['0073420516208', 'Daisy cottage cheese (4%)',  'red',    'cheese'],
  // --- protein (p.41-58) ---
  ['0080000221209', 'StarKist chunk light tuna',  'yellow', 'meat'],
  ['7633434018803', "Bush's black beans",         'yellow', 'protein'],
  // --- condiments and ingredients (p.73-76) ---
  ['0054100000606', 'Vlasic kosher dill spears',  'yellow', 'condiment'],
  // OFF lists Swanson broth at 10 kcal/100 g (label: 10 per cup), which tips it
  // over the 23-cal ingredient line; the FRG lists broth yellow. Group only.
  ['0051000121141', 'Swanson chicken broth',      null,     'condiment'],
  // --- fats, oils, sweets & others: always red (p.59-66) ---
  ['0044000032029', 'Oreo',                       'red',    'sweets'],
  ['0034000002405', "Hershey's milk chocolate",   'red',    'sweets'],
  ['0028400090896', 'Doritos nacho cheese',       'red',    'sweets'],
  ['0076840100354', "Ben & Jerry's Chunky Monkey",'red',    'sweets'],
];

let pass = 0, fail = 0;
console.log('-- colour and group --');
for (const [code, label, wantColor, wantGroup] of CASES) {
  const r = _c(load(code), _R);
  const ok = (wantColor === null || r.color === wantColor) && r.group === wantGroup;
  ok ? pass++ : fail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + label.padEnd(32) + ' -> ' + r.color.padEnd(6) + ' ' + String(r.group).padEnd(9) +
    (r.kcalServ != null ? ' ' + Math.round(r.kcalServ) + ' cal @ ' + r.servG + ' g' : '') +
    (ok ? '' : ' | EXPECTED ' + (wantColor || 'any') + ' ' + wantGroup + ' | ' + r.reasons.join('; ')));
}

// the reason text is what the clinician reads, so the wrong rule reaching the
// right colour still counts as a failure
const REASONS = [
  ['0020000174808', 'Green Giant peas',       /starchy/i,    true],
  ['0075720000814', 'Poland Spring water',    /no traffic light colour/i, true],
  ['0016000275270', 'Honey Nut Cheerios',     /sugar/i,      true],
  ['0049000028911', 'Diet Coke',              /diet/i,       true],
  ['0054800423347', "Ben's Original brown rice", /nut/i,     false],
  ['0013764027053', "Dave's Killer Bread",    /nut/i,        false],
];
console.log('');
console.log('-- reasons --');
for (const [code, label, re, want] of REASONS) {
  const txt = _c(load(code), _R).reasons.join('; ');
  const ok = re.test(txt) === want;
  ok ? pass++ : fail++;
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + label.padEnd(32) + ' ' + (want ? 'matches ' : 'avoids ') + re + (ok ? '' : ' | ' + txt));
}

console.log('');
console.log(fail ? fail + ' FAILED, ' + pass + ' passed' : 'ALL ' + pass + ' OFF FIXTURE TESTS PASS');
process.exit(fail ? 1 : 0);
