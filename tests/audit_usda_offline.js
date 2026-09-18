// Everyday foods through foodFromFDC() and classify(), offline.
//
// The same idea as audit_usda_foods.js, but the records are written out here
// instead of searched for, so it runs with no key and no network. Each record is
// shaped exactly as USDA returns one: the description in USDA's own house style,
// the foodCategory string that drives group detection, a gram serving where USDA
// publishes one, and nutrients per 100 g from USDA's published values. That
// exercises the whole shipping path apart from the HTTP call:
// fdcCatsToTags -> detectGroup -> classify.
//
// USDA's house style is the point. It writes names inverted ("Beans, snap,
// green"), names colour variants ("Grapes, red or green"), and calls dried
// legumes "mature seeds". The group rules were written against Open Food Facts
// product names, so those conventions are where they break, and five real bugs
// came out of the first sixty foods here.
//
// A food marked borderline sits within a few calories of a line, or in a group
// the guide does not settle plainly. Those are printed but never counted wrong:
// they turn on the record's numbers rather than on a rule.
//
//   node tests/audit_usda_offline.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const s1 = src.indexOf('const DEFAULT_RULES');
const e1 = src.indexOf('// ---------- search helpers');
const s2 = src.indexOf('// ---------- USDA FoodData Central lookup');
const e2 = src.indexOf('// ---------- quick-add foods');
(0, eval)(src.slice(s1, e1).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '') + src.slice(s2, e2) +
  ';globalThis._t={classify,RULES,foodFromFDC};');
const t = globalThis._t;

const VEG = 'Vegetables and Vegetable Products', FRU = 'Fruits and Fruit Juices';
const GRA = 'Cereal Grains and Pasta', BAK = 'Baked Products', BRK = 'Breakfast Cereals';
const DAI = 'Dairy and Egg Products', POU = 'Poultry Products', BEE = 'Beef Products';
const PRK = 'Pork Products', FIS = 'Finfish and Shellfish Products', SAU = 'Sausages and Luncheon Meats';
const LEG = 'Legumes and Legume Products', NUT = 'Nut and Seed Products';
const FAT = 'Fats and Oils', SWE = 'Sweets', SNK = 'Snacks', BEV = 'Beverages';
const SOU = 'Soups, Sauces, and Gravies', MIX = 'Mixed Dishes', SPI = 'Spices and Herbs';
const B = 'borderline';

// description, foodCategory, kcal/100g, sugars/100g, serving g (null = USDA
// publishes none), expected group, expected colour, [borderline]
const F = [
  // --- vegetables, including every way USDA can put a colour word in a name ---
  ['Broccoli, raw', VEG, 34, 1.7, null, 'veg', 'green'],
  ['Carrots, raw', VEG, 41, 4.7, null, 'veg', 'green'],
  ['Spinach, raw', VEG, 23, 0.4, null, 'veg', 'green'],
  ['Tomatoes, red, ripe, raw', VEG, 18, 2.6, null, 'veg', 'green'],
  ['Cucumber, with peel, raw', VEG, 15, 1.7, null, 'veg', 'green'],
  ['Peppers, sweet, green, raw', VEG, 20, 2.4, null, 'veg', 'green'],
  ['Cabbage, red, raw', VEG, 31, 3.8, null, 'veg', 'green'],
  ['Lettuce, green leaf, raw', VEG, 15, 0.8, null, 'veg', 'green'],
  ['Onions, raw', VEG, 40, 4.2, null, 'veg', 'green'],
  ['Mushrooms, white, raw', VEG, 22, 2.0, null, 'veg', 'green'],
  ['Cauliflower, raw', VEG, 25, 1.9, null, 'veg', 'green'],
  ['Celery, raw', VEG, 16, 1.3, null, 'veg', 'green'],
  ['Squash, summer, zucchini, raw', VEG, 17, 2.5, null, 'veg', 'green'],
  ['Asparagus, cooked, boiled, drained', VEG, 22, 1.3, null, 'veg', 'green'],
  ['Brussels sprouts, cooked, boiled', VEG, 36, 2.2, null, 'veg', 'green'],
  ['Beans, snap, green, canned', VEG, 15, 1.1, null, 'veg', 'green'],
  ['Vegetable juice cocktail, canned', VEG, 17, 3.2, null, 'veg', 'yellow'],
  // --- starchy vegetables ---
  ['Corn, sweet, yellow, cooked', VEG, 96, 4.5, null, 'starchy', 'yellow'],
  ['Potatoes, baked, flesh and skin', VEG, 93, 1.2, null, 'starchy', 'yellow'],
  ['Potatoes, french fried, frozen, oven-heated', VEG, 312, 0.3, null, 'starchy', 'red'],
  ['Potatoes, hash brown, frozen, prepared', VEG, 265, 0.3, null, 'starchy', 'red'],
  ['Peas, green, frozen, cooked', VEG, 77, 3.0, null, 'starchy', 'yellow'],
  ['Beets, cooked, boiled, drained', VEG, 44, 7.9, null, 'starchy', 'yellow'],
  ['Sweet potato, cooked, baked in skin', VEG, 90, 6.5, null, 'starchy', 'yellow'],
  ['Squash, winter, butternut, cooked', VEG, 40, 2.2, null, 'starchy', 'yellow'],
  ['Plantains, cooked', VEG, 116, 14.0, null, 'starchy', 'yellow'],
  // --- fruit, which can never be green ---
  ['Apples, raw, with skin', FRU, 52, 10.4, null, 'fruit', 'yellow'],
  ['Bananas, raw', FRU, 89, 12.2, null, 'fruit', 'yellow'],
  ['Strawberries, raw', FRU, 32, 4.9, null, 'fruit', 'yellow'],
  ['Grapes, red or green, raw', FRU, 69, 15.5, null, 'fruit', 'yellow'],
  ['Blueberries, raw', FRU, 57, 10.0, null, 'fruit', 'yellow'],
  ['Oranges, raw, all commercial varieties', FRU, 47, 9.4, null, 'fruit', 'yellow'],
  ['Watermelon, raw', FRU, 30, 6.2, null, 'fruit', 'yellow'],
  ['Applesauce, canned, unsweetened', FRU, 42, 8.8, null, 'fruit', 'yellow'],
  ['Peaches, canned, heavy syrup pack', FRU, 74, 16.4, null, 'fruit', 'red'],
  ['Dates, medjool', FRU, 277, 66.5, null, 'fruit', 'yellow'],
  ['Avocados, raw, all commercial varieties', FRU, 160, 0.7, null, 'fruit', 'red', B],
  // --- juice and dried fruit, always red ---
  ['Orange juice, raw', FRU, 45, 8.4, null, 'juice', 'red'],
  ['Apple juice, canned or bottled', FRU, 46, 9.6, null, 'juice', 'red'],
  ['Grape juice, canned or bottled', FRU, 60, 14.2, null, 'juice', 'red'],
  ['Raisins, seedless', FRU, 299, 59.2, null, 'juice', 'red'],
  ['Apricots, dried, sulfured', FRU, 241, 53.4, null, 'juice', 'red'],
  ['Plums, dried (prunes), uncooked', FRU, 240, 38.1, null, 'juice', 'red'],
  // --- grains ---
  ['Bread, white, commercially prepared', BAK, 266, 5.7, 28, 'grain', 'yellow'],
  ['Bread, whole-wheat, commercially prepared', BAK, 247, 5.6, 28, 'grain', 'yellow'],
  ['Bagels, plain, enriched', BAK, 257, 5.3, 28, 'grain', 'yellow'],
  ['Rice, brown, long-grain, cooked', GRA, 123, 0.4, null, 'grain', 'yellow'],
  ['Rice, white, long-grain, cooked', GRA, 130, 0.1, null, 'grain', 'yellow'],
  ['Spaghetti, cooked, enriched', GRA, 158, 0.6, null, 'grain', 'yellow'],
  ['Noodles, egg, cooked, enriched', GRA, 138, 0.4, null, 'grain', 'yellow'],
  ['Quinoa, cooked', GRA, 120, 0.9, null, 'grain', 'yellow'],
  ['Couscous, cooked', GRA, 112, 0.1, null, 'grain', 'yellow'],
  ['Cereals, oats, regular and quick, cooked with water', GRA, 71, 0.3, null, 'grain', 'yellow'],
  ['Tortillas, ready-to-bake or -fry, flour', BAK, 306, 2.9, 45, 'grain', 'yellow'],
  ['Crackers, saltines', BAK, 418, 1.4, 28, 'grain', 'yellow'],
  ['Pretzels, hard, plain, salted', SNK, 384, 2.2, 28, 'grain', 'yellow'],
  ['Snacks, popcorn, air-popped', SNK, 387, 0.9, 28, 'grain', 'yellow'],
  ['Pancakes, plain, prepared from recipe', BAK, 227, 5.0, 28, 'grain', 'yellow'],
  ['Waffles, plain, frozen, toasted', BAK, 291, 5.5, 28, 'grain', 'yellow'],
  ['Muffins, blueberry, commercially prepared', BAK, 377, 30.0, 28, 'grain', 'yellow', B],
  // --- cold cereal, the one group with a nutrient rule ---
  ['Cereals ready-to-eat, toasted oat cereal', BRK, 375, 15.0, 28, 'cereal', 'yellow'],
  ['Cereals ready-to-eat, frosted flakes', BRK, 375, 37.0, 30, 'cereal', 'red'],
  ['Cereals ready-to-eat, raisin bran', BRK, 316, 27.8, 30, 'cereal', 'red'],
  ['Cereals ready-to-eat, granola, homemade', BRK, 489, 20.0, 30, 'cereal', 'red'],
  // --- cheese, judged at 1 oz ---
  ['Cheese, cheddar', DAI, 403, 0.5, 28, 'cheese', 'red'],
  ['Cheese, swiss', DAI, 380, 1.4, 28, 'cheese', 'red'],
  ['Cheese, parmesan, grated', DAI, 420, 0.9, 28, 'cheese', 'red'],
  ['Cheese, mozzarella, part skim milk', DAI, 254, 1.1, 28, 'cheese', 'yellow'],
  ['Cheese, cottage, lowfat, 1% milkfat', DAI, 72, 2.7, null, 'cheese', 'yellow'],
  ['Cheese, cream', DAI, 342, 3.2, null, 'cheese', 'red'],
  // --- milk, yogurt and the rest of dairy ---
  ['Milk, whole, 3.25% milkfat', DAI, 61, 5.1, null, 'dairy', 'red'],
  ['Milk, lowfat, fluid, 1% milkfat', DAI, 42, 5.0, null, 'dairy', 'yellow'],
  ['Milk, nonfat, fluid', DAI, 34, 5.0, null, 'dairy', 'yellow'],
  ['Milk, chocolate, lowfat', DAI, 63, 10.3, null, 'dairy', 'red'],
  ['Yogurt, Greek, plain, nonfat', DAI, 59, 3.2, null, 'dairy', 'yellow'],
  ['Yogurt, fruit variety, lowfat', DAI, 99, 18.6, null, 'dairy', 'red'],
  ['Cream, sour, cultured', DAI, 198, 3.5, null, 'dairy', 'red'],
  ['Cream, fluid, heavy whipping', DAI, 340, 2.9, null, 'dairy', 'red', B],
  // --- meat and seafood, judged at 3 oz ---
  ['Chicken, breast, roasted, meat only', POU, 165, 0, null, 'meat', 'yellow'],
  ['Chicken, thigh, roasted, meat only', POU, 209, 0, null, 'meat', 'red'],
  ['Turkey, breast, roasted, meat only', POU, 135, 0, null, 'meat', 'yellow'],
  ['Beef, ground, 80% lean meat, cooked', BEE, 254, 0, null, 'meat', 'red'],
  ['Beef, ground, 93% lean meat, cooked', BEE, 152, 0, null, 'meat', 'yellow'],
  ['Pork, loin, roasted', PRK, 242, 0, null, 'meat', 'red'],
  ['Ham, sliced, regular', PRK, 145, 1.5, null, 'meat', 'yellow'],
  ['Frankfurter, beef', SAU, 290, 3.0, null, 'meat', 'red'],
  ['Bologna, beef', SAU, 310, 2.5, null, 'meat', 'red'],
  ['Salami, dry or hard', SAU, 407, 1.6, null, 'meat', 'red'],
  ['Fish, tuna, light, canned in water, drained', FIS, 86, 0, null, 'meat', 'yellow'],
  ['Fish, cod, Atlantic, cooked, dry heat', FIS, 105, 0, null, 'meat', 'yellow'],
  ['Fish, salmon, Atlantic, farmed, cooked', FIS, 206, 0, null, 'meat', 'red'],
  ['Fish, sardine, canned in oil, drained', FIS, 208, 0, null, 'meat', 'red'],
  ['Crustaceans, shrimp, cooked', FIS, 99, 0, null, 'meat', 'yellow'],
  // --- eggs, beans and meat substitutes ---
  ['Egg, whole, cooked, hard-boiled', DAI, 155, 1.1, null, 'protein', 'yellow'],
  ['Beans, black, mature seeds, cooked, boiled', LEG, 132, 0.3, null, 'protein', 'yellow'],
  ['Beans, pinto, mature seeds, cooked, boiled', LEG, 143, 0.3, null, 'protein', 'red', B],
  ['Lentils, mature seeds, cooked, boiled', LEG, 116, 1.8, null, 'protein', 'yellow'],
  ['Chickpeas (garbanzo beans), mature seeds, cooked', LEG, 164, 4.8, null, 'protein', 'red', B],
  ['Beans, baked, canned, plain or vegetarian', LEG, 94, 8.2, null, 'protein', 'yellow'],
  ['Edamame, frozen, prepared', LEG, 121, 2.2, null, 'protein', 'yellow'],
  ['Tofu, raw, firm, prepared with calcium sulfate', LEG, 144, 0.6, null, 'protein', 'yellow', B],
  // --- nuts and seeds, nearly all red ---
  ['Nuts, almonds, raw', NUT, 579, 4.4, 28, 'nuts', 'red'],
  ['Nuts, walnuts, english', NUT, 654, 2.6, 28, 'nuts', 'red'],
  ['Peanuts, all types, dry-roasted', NUT, 587, 4.2, 28, 'nuts', 'red'],
  ['Peanut butter, smooth style', NUT, 588, 9.2, 32, 'nuts', 'red'],
  ['Seeds, sunflower seed kernels, dry roasted', NUT, 582, 2.6, 28, 'nuts', 'red'],
  // --- fats, oils, sweets and others, always red ---
  ['Butter, salted', FAT, 717, 0.1, null, 'sweets', 'red'],
  ['Margarine, regular, hard', FAT, 717, 0.4, null, 'sweets', 'red'],
  ['Oil, olive, salad or cooking', FAT, 884, 0, null, 'sweets', 'red'],
  ['Mayonnaise, regular', FAT, 680, 0.6, null, 'sweets', 'red'],
  ['Bacon, cooked', SAU, 541, 1.4, null, 'sweets', 'red'],
  ['Snacks, potato chips, plain, salted', SNK, 536, 0.3, 28, 'sweets', 'red'],
  ['Snacks, tortilla chips, plain', SNK, 489, 1.3, 28, 'sweets', 'red'],
  ['Candies, milk chocolate', SWE, 535, 51.5, 43, 'sweets', 'red'],
  ['Candies, gumdrops, starch jelly pieces', SWE, 396, 68.0, 40, 'sweets', 'red'],
  ['Ice creams, vanilla', SWE, 207, 21.2, 66, 'sweets', 'red'],
  ['Cookies, chocolate chip, commercially prepared', BAK, 474, 30.0, 30, 'sweets', 'red'],
  ['Doughnuts, cake-type, plain', BAK, 421, 22.0, 50, 'sweets', 'red'],
  ['Cake, chocolate, commercially prepared with frosting', BAK, 371, 38.0, 64, 'sweets', 'red'],
  ['Jams and preserves', SWE, 278, 48.5, null, 'sweets', 'red'],
  ['Honey', SWE, 304, 82.1, null, 'sweets', 'red'],
  ['Syrups, maple', SWE, 260, 60.5, null, 'sweets', 'red'],
  ['Puddings, chocolate, ready-to-eat', SWE, 130, 17.0, 113, 'sweets', 'red'],
  // --- drinks ---
  ['Beverages, carbonated, cola, regular', BEV, 37, 9.6, null, 'sweets', 'red'],
  ['Beverages, carbonated, cola, diet, with aspartame', BEV, 0, 0, null, 'sweets', 'red'],
  ['Beverages, energy drink', BEV, 45, 11.0, null, 'sweets', 'red'],
  ['Beverages, fruit punch drink, canned', BEV, 47, 11.4, null, 'sweets', 'red'],
  ['Alcoholic beverage, beer, regular, all', BEV, 43, 0, null, 'sweets', 'red'],
  ['Alcoholic beverage, wine, table, red', BEV, 85, 0.6, null, 'sweets', 'red'],
  ['Beverages, almond milk, unsweetened', BEV, 15, 0, null, 'dairy', 'yellow', B],
  ['Beverages, soymilk, original, unsweetened', BEV, 43, 1.0, null, 'dairy', 'yellow', B],
  ['Beverages, water, bottled, plain', BEV, 0, 0, null, 'free', 'free'],
  ['Beverages, coffee, brewed, prepared with tap water', BEV, 1, 0, null, 'free', 'free'],
  ['Beverages, tea, brewed, prepared with tap water', BEV, 1, 0, null, 'free', 'free'],
  ['Beverages, carbonated, club soda', BEV, 0, 0, null, 'free', 'free'],
  // --- condiments, dressings and cooking ingredients, judged at 1 Tbsp ---
  ['Catsup', SOU, 101, 21.8, null, 'condiment', 'yellow'],
  ['Mustard, prepared, yellow', SOU, 66, 0.9, null, 'condiment', 'yellow'],
  ['Salad dressing, ranch dressing, regular', SOU, 430, 4.0, null, 'condiment', 'red'],
  ['Soy sauce made from soy and wheat', SOU, 53, 0.4, null, 'condiment', 'yellow'],
  ['Sauce, salsa, ready-to-serve', SOU, 29, 3.3, null, 'condiment', 'yellow'],
  ['Pickles, cucumber, dill', VEG, 12, 1.2, null, 'veg', 'green', B],
  ['Lemon juice, raw', FRU, 22, 2.5, null, 'condiment', 'yellow'],
  ['Gravy, beef, canned, ready-to-serve', SOU, 45, 0.9, null, 'condiment', 'red', B],
  ['Spices, cinnamon, ground', SPI, 247, 2.2, null, 'free', 'free'],
  ['Salt, table', SPI, 0, 0, null, 'free', 'free'],
  // --- soups ---
  ['Soup, chicken noodle, canned, prepared with water', SOU, 25, 0.5, null, 'soupBroth', 'yellow'],
  ['Soup, tomato, canned, prepared with water', SOU, 33, 4.0, null, 'soupBroth', 'yellow'],
  ['Soup, cream of mushroom, canned, prepared with water', SOU, 54, 0.5, null, 'soupBroth', 'yellow'],
  ['Soup, chili with beans, canned', SOU, 91, 1.4, null, 'soupChili', 'yellow'],
  ['Soup, lentil with ham, canned', SOU, 56, 1.0, null, 'soupChili', 'yellow'],
  ['Broth, chicken, canned, prepared with water', SOU, 7, 0.3, null, 'condiment', 'yellow', B],
  // --- mixed dishes: no ingredient text, so the app must ask rather than guess ---
  ['Pizza, cheese topping, regular crust, frozen', MIX, 268, 3.6, 146, 'combo', 'review'],
  ['Macaroni and cheese, canned entree', MIX, 79, 1.9, 244, 'combo', 'review'],
  ['Lasagna with meat sauce, frozen entree', MIX, 125, 3.2, 297, 'combo', 'review'],
  ['Burrito, bean and cheese, frozen', MIX, 212, 2.1, 110, 'combo', 'review'],
];

const COL = { green: 'GREEN ', yellow: 'YELLOW', red: 'RED   ', free: 'NONE  ', review: 'ASK   ' };
let ok = 0, bad = 0, border = 0;
const rows = [];
for (const [desc, cat, kcal, sugars, servG, wantGroup, wantColor, flag] of F) {
  const rec = {
    description: desc, dataType: 'SR Legacy', foodCategory: cat,
    servingSize: servG, servingSizeUnit: servG ? 'g' : undefined,
    foodNutrients: [{ nutrientId: 1008, value: kcal }, { nutrientId: 2000, value: sugars }],
  };
  const res = t.classify(t.foodFromFDC(rec), t.RULES);
  const good = res.group === wantGroup && res.color === wantColor;
  let mark = '  ';
  if (good) ok++;
  else if (flag === B) { border++; mark = '~ '; }
  else { bad++; mark = '->'; }
  rows.push([mark, desc, COL[res.color] || res.color, res.group || 'none',
    res.kcalServ == null ? '' : Math.round(res.kcalServ) + ' cal @ ' + res.servG + ' g',
    good ? '' : (flag === B ? 'near a line, guide reads ' : 'expected ') + wantColor + '/' + wantGroup]);
}

console.log('food'.padEnd(48) + 'colour  group       calories per FRG serving');
console.log('-'.repeat(116));
for (const [mark, desc, col, grp, cal, note] of rows)
  console.log(mark + ' ' + desc.slice(0, 46).padEnd(47) + col + '  ' + grp.padEnd(12) + cal.padEnd(22) + note);
console.log('-'.repeat(116));
console.log(ok + ' of ' + F.length + ' match the guide, ' + bad + ' do not, ' + border + ' are borderline and not counted');
process.exitCode = bad ? 1 : 0;
