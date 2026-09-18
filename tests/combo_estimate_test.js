// Reading a USDA ingredient string, offline. USDA publishes ingredients as one
// plain-text string with no percentages, so the app parses the list and
// estimates a percentage per ingredient from the order, which is the one thing a
// US label guarantees (21 CFR 101.4). These are the parsing cases that decide
// whether decomposeCombo() sees a recipe or gives up; how well the estimate
// itself tracks real percentages is measured separately by
// tests/audit_combo_estimate.js, which needs internet.
//
//   node tests/combo_estimate_test.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- search helpers');
const s2 = src.indexOf('// ---------- USDA FoodData Central lookup');
const e2 = src.indexOf('// ---------- quick-add foods');
(0, eval)(src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '') + src.slice(s2, e2) +
  ';globalThis._t={parse:parseUsdaIngredients,est:ingredientsFromFDC,classify,RULES,foodFromFDC};');
const t = globalThis._t;

let pass = 0, fail = 0;
const check = (ok, line) => { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + line); };
const names = (s) => t.parse(s).map(i => i.text).join('|');
const sum = (l) => l.reduce((a, i) => a + i.pct, 0);

// ---- splitting ----
check(names('CRUST (ENRICHED FLOUR, WATER, SOYBEAN OIL), TOMATO SAUCE, MOZZARELLA CHEESE') ===
  'crust|tomato sauce|mozzarella cheese',
  'a parenthetical composition is one ingredient, not four');
check(names('INGREDIENTS: WATER, SUGAR') === 'water|sugar', 'a leading "INGREDIENTS:" is dropped');
check(names('TOMATOES [CALCIUM CHLORIDE, CITRIC ACID], BASIL') === 'tomatoes|basil',
  'square brackets nest the same way as parentheses');
check(names('WATER, SALT.') === 'water|salt', 'a trailing full stop is not part of the last ingredient');
check(names('ORGANIC OATS*, SUGAR') === 'organic oats|sugar', 'footnote markers are stripped');

// ---- the 2% boundary is a declared bound, so it is kept ----
const twoPct = t.parse('SEMOLINA, WATER, CONTAINS 2% OR LESS OF: SALT, YEAST, ENZYMES');
check(twoPct.map(i => i.text).join('|') === 'semolina|water|salt|yeast|enzymes',
  'the "2% or less" marker is removed but the ingredients after it are kept');
check(twoPct.filter(i => i.minor).map(i => i.text).join('|') === 'salt|yeast|enzymes',
  'everything after the marker is marked minor');
check(t.parse('FLOUR, LESS THAN 2% OF SALT, YEAST').filter(i => i.minor).length === 2,
  '"less than 2% of" opens the same group');
const capped = t.est('SEMOLINA, WATER, CONTAINS 2% OR LESS OF: SALT, YEAST, ENZYMES, SPICES');
check(capped.filter((_, k) => k >= 2).every(i => i.pct <= 2 + 1e-9),
  'no ingredient past the marker is estimated above 2%');

// ---- labelling text is not a recipe ----
check(names('WHEAT FLOUR, WATER, CONTAINS: WHEAT, MILK') === 'wheat flour|water',
  'a trailing allergen statement is not an ingredient');
check(names('PEANUTS, SALT, MAY CONTAIN TREE NUTS') === 'peanuts|salt',
  '"may contain" is not an ingredient');
check(names('OATS, HONEY, MANUFACTURED IN A FACILITY THAT PROCESSES SOY') === 'oats|honey',
  'a facility note is not an ingredient');
check(names('') === '' && names(null) === '', 'an empty or missing list yields nothing');

// ---- the estimate ----
const four = t.est('TOMATO SAUCE, CRUST, MOZZARELLA CHEESE, PEPPERONI');
check(Math.abs(sum(four) - 100) < 1e-6, 'the percentages sum to 100');
check(four.every((x, i) => i === 0 || x.pct <= four[i - 1].pct + 1e-9),
  'the percentages never increase down the list, which is what the label guarantees');
check(four[0].pct > four[3].pct, 'the first ingredient outweighs the last');
check(t.est('WATER').length === 1 && Math.abs(t.est('WATER')[0].pct - 100) < 1e-6,
  'a single ingredient takes the whole product');

// ---- end to end through the classifier ----
// A record shaped like USDA Branded really returns them: an ingredients string,
// a gram serving, and no percentage anywhere.
const pizza = t.foodFromFDC({
  description: 'PEPPERONI PIZZA', dataType: 'Branded', foodCategory: 'Pizza',
  servingSize: 146, servingSizeUnit: 'g',
  ingredients: 'CRUST (ENRICHED FLOUR, WATER, SOYBEAN OIL, SUGAR, YEAST, SALT), TOMATO SAUCE, MOZZARELLA CHEESE, PEPPERONI',
  foodNutrients: [{ nutrientId: 1008, value: 268 }],
});
check(Array.isArray(pizza.ingredients) && pizza.ingredients.length === 4,
  'foodFromFDC turns the ingredient string into a list with percentages');
const verdict = t.classify(pizza, t.RULES);
check(verdict.group === 'combo', 'the pizza is still a combination food');
check(verdict.color !== 'review',
  'it is now decided from the estimate instead of asking the clinician');
check(verdict.reasons.some(r => /estimated from the order/i.test(r)),
  'the verdict says the percentages were estimated, so nobody reads them as label data');

// An estimate is still only an estimate, so the two ways of not knowing have to
// survive it. A dish the app does recognise as a combination food, but whose
// ingredients it cannot price, must fall back to the question rather than decide
// on the fraction it happened to recognise.
const opaque = t.foodFromFDC({
  description: 'VEGETABLE LASAGNA', dataType: 'Branded', foodCategory: 'Meals',
  servingSize: 200, servingSizeUnit: 'g',
  ingredients: 'QUORPLE, ZENTHIMER, BLERFAST, GRUNDLE',
  foodNutrients: [{ nutrientId: 1008, value: 200 }],
});
const opaqueVerdict = t.classify(opaque, t.RULES);
check(opaqueVerdict.group === 'combo' && opaqueVerdict.color === 'review',
  'a combination food of unrecognised ingredients asks rather than guessing');

// and a record whose group cannot be worked out at all is never coloured from a guess
const unknown = t.foodFromFDC({
  description: 'QUORPLE ZENTHIMER', dataType: 'Branded', foodCategory: '',
  servingSize: 100, servingSizeUnit: 'g',
  ingredients: 'QUORPLE, ZENTHIMER',
  foodNutrients: [{ nutrientId: 1008, value: 200 }],
});
check(t.classify(unknown, t.RULES).reasons.some(r => /not detected/i.test(r)),
  'an unrecognisable food asks for its group instead of being placed in one');

console.log('combo_estimate_test: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
