// Hand-written cases against the FRG rule: food group -> calories per Traffic
// Light serving -> colour. Every expected colour below can be checked against a
// page of Epstein's Food & Activity Reference Guide (2012); page numbers are the
// guide's own. Expected groups are asserted too, because a right colour reached
// through the wrong group is still a bug.
// A food described as USDA describes it: a name and a USDA category. U() sends it
// through fdcCatsToTags(), the mapper every searched record goes through, so these
// cases exercise the path the app really uses.
const U = (f) => {
  const { tags, isBeverage } = fdcCatsToTags({ description: f.name, foodCategory: f.category });
  const out = Object.assign({}, f, { cats: tags, usdaCategory: f.category, isBeverage });
  delete out.category;
  return out;
};
const T = (name, f, expect, group, override) => {
  const r = classify(U(f), RULES, override);
  const ok = r.color === expect && (group === undefined || r.group === group);
  console.log((ok ? 'PASS' : 'FAIL'), name, '->', r.color, '(' + r.group + ')', '| expected', expect, group === undefined ? '' : '(' + group + ')',
    ok ? '' : '| ' + r.reasons.join('; '));
  return ok;
};
let all = true;

// --- vegetables: the only group that can be green (FRG p.12-17) ---
all &= T('Broccoli, cooked',              {name:'Broccoli, cooked', category:'Vegetables and Vegetable Products', per100:{kcal:35}}, 'green', 'veg');
all &= T('Carrots, raw',                  {name:'Carrots, raw', category:'Vegetables and Vegetable Products', per100:{kcal:41}}, 'green', 'veg');
all &= T('Kale, raw (leafy = light)',     {name:'Kale, raw', category:'Vegetables and Vegetable Products', per100:{kcal:49}}, 'green', 'veg');
all &= T('Artichoke hearts in oil',       {name:'Artichoke hearts in oil', category:'Vegetables and Vegetable Products', per100:{kcal:150}}, 'red', 'veg');
all &= T('Marinara sauce (1/4 cup)',      {name:'Marinara sauce', category:'Soups, Sauces, and Gravies', per100:{kcal:55}}, 'yellow', 'veg');
all &= T('Tomato juice (8 fl oz)',        {name:'Tomato juice', category:'Vegetables and Vegetable Products', per100:{kcal:17}}, 'yellow', 'veg');

// --- starchy vegetables: never green (FRG p.18-20) ---
all &= T('Potato, baked',                 {name:'Potato, baked', category:'Vegetables and Vegetable Products', per100:{kcal:93}}, 'yellow', 'starchy');
all &= T('Green peas (starchy, not green)', {name:'Green peas', category:'Vegetables and Vegetable Products', per100:{kcal:66}}, 'yellow', 'starchy');
all &= T('Corn, canned',                  {name:'Corn, sweet, canned', category:'Vegetables and Vegetable Products', per100:{kcal:81}}, 'yellow', 'starchy');
all &= T('French fries, oven baked',      {name:'French fries, frozen, oven baked', category:'Vegetables and Vegetable Products', per100:{kcal:164}}, 'red', 'starchy');

// --- fruit: yellow at most; juice and dried fruit are always red (FRG p.21-25) ---
all &= T('Apple',                         {name:'Apple, raw', category:'Fruits and Fruit Juices', per100:{kcal:52}}, 'yellow', 'fruit');
all &= T('Banana',                        {name:'Banana, raw', category:'Fruits and Fruit Juices', per100:{kcal:89}}, 'yellow', 'fruit');
all &= T('Avocado',                       {name:'Avocado, raw', category:'Fruits and Fruit Juices', per100:{kcal:160}}, 'red', 'fruit');
all &= T('Orange juice, 100%',            {name:'Orange juice', category:'Fruits and Fruit Juices', per100:{kcal:45}}, 'red', 'juice');
all &= T('Apple juice, 100% juice',       {name:'Apple juice, 100% juice', category:'Fruits and Fruit Juices', per100:{kcal:46}}, 'red', 'juice');
all &= T('Cranberry juice cocktail',      {name:'Cranberry juice cocktail', category:'Beverages', per100:{kcal:46}}, 'red', 'sweets');
all &= T('Raisins',                       {name:'Raisins', category:'Fruits and Fruit Juices', per100:{kcal:299}}, 'red', 'juice');
all &= T('Dates are fresh fruit, yellow (1 medjool, p.21)', {name:'Medjool dates', category:'Fruits and Fruit Juices', per100:{kcal:277}}, 'yellow', 'fruit');
all &= T('Dates, deglet noor (3 pieces, 60 cal)', {name:'Dates, deglet noor', category:'Fruits and Fruit Juices', per100:{kcal:282}}, 'yellow', 'fruit');
all &= T('Peaches in heavy syrup (1/2 cup, red p.23)', {name:'Peaches in heavy syrup', category:'Fruits and Fruit Juices', per100:{kcal:74}}, 'red', 'fruit');
all &= T('Pineapple chunks in juice (1/2 cup)', {name:'Pineapple chunks in 100% juice', category:'Fruits and Fruit Juices', per100:{kcal:60}}, 'yellow', 'fruit');
all &= T('USDA: Peaches, canned, juice pack', {name:'Peaches, canned, juice pack, solids and liquids', category:'', usdaCategory:'Fruits and Fruit Juices', per100:{kcal:44}}, 'yellow', 'fruit');
all &= T('Fruit cocktail is canned fruit, not a drink', {name:'Fruit cocktail in light syrup', category:'Fruits and Fruit Juices', per100:{kcal:57}}, 'yellow', 'fruit');
all &= T('Fruit cocktail "in 100% fruit juice" is canned fruit', {name:'Del monte quality, fruit cocktail in 100% fruit juice', category:'Fruits and Fruit Juices', per100:{kcal:48}}, 'yellow', 'fruit');
all &= T('Peanut butter, filed by USDA with legumes, is still a nut (p.54)', {name:'Jif Creamy Peanut butter', category:'Legumes and Legume Products', per100:{kcal:588}}, 'red', 'nuts');
all &= T('Unsweetened applesauce (1/2 cup)', {name:'Applesauce, unsweetened', category:'Fruits and Fruit Juices', per100:{kcal:42}}, 'yellow', 'fruit');

// --- grains (FRG p.26-32) ---
all &= T('Whole wheat bread',             {name:'Whole wheat bread', category:'Baked Products', per100:{kcal:247}}, 'yellow', 'grain');
all &= T('Honey wheat bread (honey is not a sweet here)', {name:'Honey wheat bread', category:'Baked Products', per100:{kcal:233}}, 'yellow', 'grain');
all &= T('Bread with seeds (seeds are not nuts here)', {name:'21 whole grains and seeds bread', category:'Baked Products', per100:{kcal:244}}, 'yellow', 'grain');
all &= T('Brown rice, cooked (1/2 cup)',  {name:'Brown rice, cooked', category:'Cereal Grains and Pasta', per100:{kcal:112}}, 'yellow', 'grain');
all &= T('Spaghetti, dry (1 oz)',         {name:'Spaghetti', category:'Cereal Grains and Pasta', per100:{kcal:357}}, 'yellow', 'grain');
all &= T('Cheez-It crackers',             {name:'Cheez-It original crackers', category:'Baked Products', per100:{kcal:503}}, 'red', 'grain');
all &= T('Granola bar',                   {name:'Oats and honey granola bar', category:'Snacks', per100:{kcal:450}}, 'red', 'grain');
all &= T('Granola bar judged as 1 bar (label 24 g, 108 cal)', {name:'Chewy granola bar', category:'Snacks', per100:{kcal:450}, servQtyG:24}, 'yellow', 'grain');
all &= T('Granola bar judged as 1 bar (label 42 g, 189 cal)', {name:'Oats and honey granola bar', category:'Snacks', per100:{kcal:450}, servQtyG:42}, 'red', 'grain');
all &= T('Bar with an absurd label serving falls back to 1 oz', {name:'Cereal bar', category:'Snacks', per100:{kcal:400}, servQtyG:1}, 'yellow', 'grain');
all &= T('Banana bread is a grain',       {name:'Banana bread', category:'', per100:{kcal:326}}, 'yellow', 'grain');
// --- cases found by auditing real packaged products, 3 Sep 2026 ---
all &= T('Triscuit: 120.4 cal rounds to 120, yellow', {name:'Triscuit Original', category:'Baked Products', per100:{kcal:428.6}}, 'yellow', 'grain');
all &= T('Cheddar pretzels are grain, not cheese', {name:'Rold Gold Tiny Twists Cheddar Flavored Pretzels', category:'Snacks', per100:{kcal:393}}, 'yellow', 'grain');
all &= T('Eggo waffles are a grain', {name:'Eggo homestyle waffles', category:'Baked Products', per100:{kcal:257}}, 'yellow', 'grain');
all &= T('Butter microwave popcorn is grain (red p.31)', {name:'Orville Redenbachers Movie Theater Butter Popcorn', category:'Snacks', per100:{kcal:455}}, 'red', 'grain');
all &= T('Oatmeal cookies are still a sweet', {name:'Oatmeal raisin cookies', category:'Sweets', per100:{kcal:440}}, 'red', 'sweets');
all &= T('Instant oatmeal packet is grain, 1 packet', {name:'Quaker Instant Oatmeal Maple & Brown Sugar', category:'Breakfast Cereals', per100:{kcal:375, sugars:29}, servQtyG:43}, 'red', 'grain');
all &= T('Plain instant oatmeal packet (28 g, 100 cal)', {name:'Quaker Instant Oatmeal Original', category:'Breakfast Cereals', per100:{kcal:357, sugars:1}, servQtyG:28}, 'yellow', 'grain');
all &= T('Cooked oatmeal at 1/2 cup',      {name:'Oatmeal, cooked with water', category:'', usdaCategory:'Breakfast Cereals', per100:{kcal:68}}, 'yellow', 'grain');
all &= T('Raisin Bran is a cereal, not dried fruit (red p.82)', {name:"Kellogg's Raisin Bran", category:'Breakfast Cereals', per100:{kcal:322, sugars:30}}, 'red', 'cereal');
all &= T('Tuna in vegetable oil is meat',  {name:'Bumble bee, chunk light tuna in vegetable oil', category:'Finfish and Shellfish Products', per100:{kcal:198}}, 'red', 'meat');
all &= T('Olive oil itself is a fat',      {name:'Extra virgin olive oil', category:'Fats and Oils', per100:{kcal:884}}, 'red', 'sweets');
all &= T('Peaches in heavy syrup are fruit, red on calories (p.23)', {name:'Del monte, sliced peaches in heavy syrup', category:'Fruits and Fruit Juices', per100:{kcal:78}}, 'red', 'fruit');

// --- cold cereal: calories and the 25% sugar rule (FRG p.77) ---
all &= T('Cheerios',                      {name:'Cheerios', category:'Breakfast Cereals', per100:{kcal:367, sugars:4.8}}, 'yellow', 'cereal');
all &= T('Honey Nut Cheerios (33% sugar)', {name:'Honey Nut Cheerios', category:'Breakfast Cereals', per100:{kcal:393, sugars:32.1}}, 'red', 'cereal');
all &= T('Dense granola (>120 cal)',      {name:'Granola', category:'Breakfast Cereals', per100:{kcal:489, sugars:20}}, 'red', 'cereal');

// --- cheese (1 oz) and other dairy (1 cup; yogurt 6 oz) (FRG p.33-40) ---
all &= T('Cheddar cheese',                {name:'Cheddar cheese', category:'Dairy and Egg Products', per100:{kcal:403}}, 'red', 'cheese');
all &= T('Mozzarella, part skim',         {name:'Mozzarella, part skim', category:'Dairy and Egg Products', per100:{kcal:254}}, 'yellow', 'cheese');
all &= T('Cottage cheese 1% (1/2 cup)',   {name:'Cottage cheese, 1% fat', category:'Dairy and Egg Products', per100:{kcal:72}}, 'yellow', 'cheese');
all &= T('Skim milk (yellow, not green)', {name:'Skim milk', category:'Dairy and Egg Products', per100:{kcal:34}}, 'yellow', 'dairy');
all &= T('Whole milk',                    {name:'Whole milk', category:'Dairy and Egg Products', per100:{kcal:61}}, 'red', 'dairy');
all &= T('Chocolate milk, 1%',            {name:'Chocolate milk, lowfat', category:'Dairy and Egg Products', per100:{kcal:71}}, 'red', 'dairy');
all &= T('Plain nonfat Greek yogurt',     {name:'Plain nonfat greek yogurt', category:'Dairy and Egg Products', per100:{kcal:59}}, 'yellow', 'dairy');
all &= T('Strawberry yogurt',             {name:'Strawberry yogurt', category:'Dairy and Egg Products', per100:{kcal:100}}, 'red', 'dairy');
all &= T('Yogurt judged as the cup sold (5.3 oz = 150 g)', {name:'Vanilla greek yogurt', category:'Dairy and Egg Products', per100:{kcal:85}, servQtyG:150}, 'yellow', 'dairy');
all &= T('Yogurt with a bogus label serving uses 6 oz', {name:'Vanilla yogurt', category:'Dairy and Egg Products', per100:{kcal:85}, servQtyG:1000}, 'red', 'dairy');
all &= T('Kefir is a drink, 1 cup',       {name:'Plain lowfat kefir', category:'Dairy and Egg Products', per100:{kcal:41}}, 'yellow', 'dairy');
all &= T('Sour cream, regular (red p.38)', {name:'Sour cream', category:'Dairy and Egg Products', per100:{kcal:198}}, 'red', 'dairy');
all &= T('Sour cream, light (red p.38)',  {name:'Light sour cream', category:'Dairy and Egg Products', per100:{kcal:136}}, 'red', 'dairy');
all &= T('Sour cream, fat free (yellow p.35)', {name:'Fat free sour cream', category:'Dairy and Egg Products', per100:{kcal:74}}, 'yellow', 'dairy');
all &= T('Sour cream is dairy', {name:'All natural sour cream', category:'Dairy and Egg Products', per100:{kcal:190}}, 'red', 'dairy');
all &= T('Cottage cheese 4% (1/2 cup, red p.37)', {name:'Cottage cheese, 4% milkfat', category:'Dairy and Egg Products', per100:{kcal:98}}, 'red', 'cheese');
all &= T('Frozen yogurt is a sweet (p.62)', {name:'Vanilla frozen yogurt', category:'Sweets', per100:{kcal:127}}, 'red', 'sweets');
all &= T('Unsweetened almond milk',       {name:'Unsweetened almondmilk', category:'', per100:{kcal:5}}, 'yellow', 'dairy');

// --- protein (FRG p.41-58) ---
all &= T('Chicken breast, roasted',       {name:'Chicken breast, roasted', category:'Sausages and Luncheon Meats', per100:{kcal:165}}, 'yellow', 'meat');
all &= T('Ground beef 80/20',             {name:'Ground beef, 80% lean, broiled', category:'Sausages and Luncheon Meats', per100:{kcal:270}}, 'red', 'meat');
all &= T('Tuna in water',                 {name:'Chunk light tuna in water', category:'Finfish and Shellfish Products', per100:{kcal:86}}, 'yellow', 'meat');
all &= T('Hot dog, beef (3 oz, red p.52)', {name:'Beef hot dogs', category:'Sausages and Luncheon Meats', per100:{kcal:290}}, 'red', 'meat');
all &= T('Hot dog, fat free (3 oz, yellow p.44)', {name:'Fat free beef franks', category:'Sausages and Luncheon Meats', per100:{kcal:147}}, 'yellow', 'meat');
all &= T('Canadian bacon is meat (yellow p.45)', {name:'Canadian bacon', category:'Sausages and Luncheon Meats', per100:{kcal:146}}, 'yellow', 'meat');
all &= T('Bacon is a fat (red p.65)',     {name:'Bacon', category:'Pork Products', per100:{kcal:541}}, 'red', 'sweets');
all &= T('Turkey bacon is a fat too (p.65)', {name:'Turkey bacon', category:'', usdaCategory:'Poultry Products', per100:{kcal:382}}, 'red', 'sweets');
all &= T('Veggie burger judged as 1 patty (label 71 g)', {name:'Veggie burgers, grillers', category:'Legumes and Legume Products', per100:{kcal:180}, servQtyG:71}, 'red', 'protein');
all &= T('Black beans described as "seeds" are protein, not nuts', {name:'Goya black beans', category:'Legumes and Legume Products', per100:{kcal:84}}, 'yellow', 'protein');
all &= T('Canned baked beans are protein (red p.49)', {name:"Bush's original baked beans", category:'Legumes and Legume Products', per100:{kcal:115}}, 'red', 'protein');
all &= T('Egg, hard boiled',              {name:'Egg, hard boiled', category:'Dairy and Egg Products', per100:{kcal:155}}, 'yellow', 'protein');
all &= T('Black beans, canned',           {name:'Black beans, canned', category:'Legumes and Legume Products', per100:{kcal:87}}, 'yellow', 'protein');
all &= T('Green beans are vegetables',    {name:'Cut green beans', category:'Legumes and Legume Products', per100:{kcal:17}}, 'green', 'veg');
all &= T('Almonds',                       {name:'Almonds, raw', category:'Nut and Seed Products', per100:{kcal:579}}, 'red', 'nuts');
all &= T('Peanut butter (2 Tbsp)',        {name:'Peanut butter, smooth', category:'Legumes and Legume Products', per100:{kcal:588}}, 'red', 'nuts');
all &= T('Chestnuts, roasted',            {name:'Chestnuts, roasted', category:'Nut and Seed Products', per100:{kcal:240}}, 'yellow', 'nuts');
all &= T('Rice is a grain', {name:'Ready rice', category:'Nut and Seed Products', per100:{kcal:160}}, 'yellow', 'grain');

// --- fats, oils, sweets & others: always red, diet drinks included (FRG p.59-66) ---
all &= T('Cola',                          {name:'Cola', category:'Beverages', per100:{kcal:39}}, 'red', 'sweets');
all &= T('Diet cola (red, not yellow)',   {name:'Diet cola', category:'Beverages', per100:{kcal:0}}, 'red', 'sweets');
all &= T('Sports drink',                  {name:'Lemon-lime thirst quencher', category:'Beverages', per100:{kcal:25}}, 'red', 'sweets');
all &= T('Sweetened iced tea',            {name:'Iced tea, sweetened', category:'Beverages', per100:{kcal:35}}, 'red', 'sweets');
all &= T('Diet iced tea (red, p.59)',     {name:'Diet peach iced tea', category:'Beverages', per100:{kcal:1}}, 'red', 'sweets');
all &= T('Zero-cal water with sucralose (red, p.2)', {name:'Berry flavored water beverage', category:'Beverages', per100:{kcal:0}, sweetened:true}, 'red', 'sweets');
all &= T('Propel (red, p.60)',            {name:'Propel Grape', category:'', per100:{kcal:0}}, 'red', 'sweets');
all &= T('Slim Fast shake (red, p.60)',   {name:'Slim Fast creamy milk chocolate shake', category:'', per100:{kcal:57}}, 'red', 'sweets');
all &= T('Artificial sweetener packet (red, p.75)', {name:'Splenda no calorie sweetener', category:'Sweets', per100:{kcal:336}}, 'red', 'sweets');
all &= T('Potato chips',                  {name:'Potato chips', category:'Snacks', per100:{kcal:536}}, 'red', 'sweets');
all &= T('Chocolate chip cookies',        {name:'Chocolate chip cookies', category:'Sweets', per100:{kcal:488}}, 'red', 'sweets');
all &= T('Butter',                        {name:'Butter', category:'Dairy and Egg Products', per100:{kcal:717}}, 'red', 'sweets');
all &= T('Ice cream',                     {name:'Vanilla ice cream', category:'Sweets', per100:{kcal:207}}, 'red', 'sweets');
all &= T('Milk chocolate bar (not dairy)', {name:'Candy, milk chocolate bar', category:'', usdaCategory:'Sweets', per100:{kcal:535}}, 'red', 'sweets');

// --- no colour (FRG p.7) ---
all &= T('Water',                         {name:'Water', category:'Beverages', per100:{kcal:0}}, 'free', 'free');
all &= T('Unsweetened water has no colour', {name:'Spring water', category:'Beverages', per100:{kcal:0}}, 'free', 'free');
all &= T('Black coffee',                  {name:'Coffee, brewed', category:'Beverages', per100:{kcal:1}}, 'free', 'free');
all &= T('Unsweetened iced tea (plain tea, p.7)', {name:'Unsweetened iced tea', category:'Beverages', per100:{kcal:0, sugars:0}}, 'free', 'free');
all &= T('Club soda is water',            {name:'Club soda', category:'Beverages', per100:{kcal:0}}, 'free', 'free');
all &= T('Plain sparkling water',         {name:'Lime sparkling water', category:'Beverages', per100:{kcal:0, sugars:0}}, 'free', 'free');
all &= T('LaCroix, 0 cal and no sweetener, has no colour', {name:'Naturally Essenced Coconut Sparkling Water', category:'Beverages', per100:{kcal:0}}, 'free', 'free');
all &= T('Flavored water with sucralose is red (p.2)', {name:'Berry flavored sparkling water', category:'Beverages', per100:{kcal:0}, sweetened:true}, 'red', 'sweets');
all &= T('Perrier with no tags is water',  {name:'Perrier', category:'', per100:{kcal:0}}, 'free', 'free');

// --- soups (1 cup) and condiments (1 Tbsp) (FRG p.67-76) ---
all &= T('Chicken noodle soup',           {name:'Chicken noodle soup', category:'Soups, Sauces, and Gravies', per100:{kcal:30}}, 'yellow', 'soupBroth');
all &= T('Chili with beans',              {name:'Chili with beans', category:'Soups, Sauces, and Gravies', per100:{kcal:110}}, 'red', 'soupChili');
all &= T('Chicken broth is an ingredient', {name:'Chicken broth', category:'Soups, Sauces, and Gravies', per100:{kcal:5}}, 'yellow', 'condiment');
all &= T('Ketchup',                       {name:'Ketchup', category:'Soups, Sauces, and Gravies', per100:{kcal:100}}, 'yellow', 'condiment');
all &= T('Ranch dressing',                {name:'Ranch dressing', category:'Fats and Oils', per100:{kcal:430}}, 'red', 'condiment');
all &= T('Dill pickle spear',             {name:'Kosher dill spears', category:'Vegetables and Vegetable Products', per100:{kcal:12}}, 'yellow', 'condiment');
all &= T('Lemon juice is an ingredient (p.73)', {name:'Lemon juice', category:'Fruits and Fruit Juices', per100:{kcal:22}}, 'yellow', 'condiment');
all &= T('Hummus (red p.75)',             {name:'Classic hummus', category:'Legumes and Legume Products', per100:{kcal:166}}, 'red', 'condiment');
all &= T('Unsweetened cocoa powder (yellow p.73)', {name:'Unsweetened cocoa powder', category:'Sweets', per100:{kcal:228}}, 'yellow', 'condiment');
all &= T('Chicken stock, homemade (red p.75)', {name:'Chicken stock', category:'Soups, Sauces, and Gravies', per100:{kcal:36}}, 'red', 'condiment');
all &= T('Condensed chicken soup is soup, not broth', {name:"Campbell's condensed soup chicken", category:'Soups, Sauces, and Gravies', per100:{kcal:25}}, 'yellow', 'soupBroth');
all &= T('Ketchup is a condiment, not a tomato sauce', {name:'Heinz tomato ketchup', category:'Soups, Sauces, and Gravies', per100:{kcal:118}}, 'yellow', 'condiment');
all &= T('Reddi-wip is whipped cream (yellow p.73)', {name:'REDDI WIP Original, 15 OZ', category:'Dairy and Egg Products', per100:{kcal:300}}, 'yellow', 'condiment');
all &= T('Uncrustables is a combination food', {name:"Uncrustables smucker's peanut butter & grape", category:'Baked Products', per100:{kcal:328}}, 'review', 'combo');
// --- cases found by a random draw of real packaged products, 3 Sep 2026 ---
all &= T('Hamburger buns are bread, not a burger', {name:'Hawaiian Sweet Hamburger Buns', category:'Baked Products', per100:{kcal:304}}, 'yellow', 'grain');
all &= T('Ready rice is a grain, not a meal', {name:'Whole grain brown rice', category:'Cereal Grains and Pasta', per100:{kcal:76}}, 'yellow', 'grain');
all &= T('Frozen lasagna is a combination food', {name:'Five cheese lasagna', category:'Meals, Entrees, and Side Dishes', per100:{kcal:150}}, 'review', 'combo');
all &= T('Chili-seasoned tuna is meat, not chili', {name:'Spicy thai chili seasoned tuna', category:'Finfish and Shellfish Products', per100:{kcal:127}}, 'yellow', 'meat');
all &= T('Ice cream sandwich is a sweet, not a sandwich', {name:'Tillamook, tillamookies, ice creams sandwiches', category:'Sweets', per100:{kcal:292}}, 'red', 'sweets');
all &= T('Salad kit with pecans is a vegetable', {name:'Pecan and Berry Salad', category:'Vegetables and Vegetable Products', per100:{kcal:39}}, 'green', 'veg');
all &= T('Frozen chopped onions are a vegetable', {name:'Chopped Onions', category:'Vegetables and Vegetable Products', per100:{kcal:29}}, 'green', 'veg');
all &= T('Street taco tortillas are tortillas', {name:'Street tacos corn tortillas', category:'Baked Products', per100:{kcal:227}}, 'yellow', 'grain');
all &= T('Beef tacos frozen meal is a combination food', {name:'Beef tacos', category:'Meals, Entrees, and Side Dishes', per100:{kcal:220}}, 'review', 'combo');
all &= T('Pitted dates are yellow fruit, not dried fruit (p.21)', {name:'Premium Pitted Organic Dates, Deglet Noor', category:'Fruits and Fruit Juices', per100:{kcal:275}}, 'yellow', 'fruit');
all &= T('Date rolls are dried-fruit red',  {name:'Coconut date rolls', category:'Fruits and Fruit Juices', per100:{kcal:340}}, 'red', 'juice');
all &= T('Tortilla chips are a salty snack, red (p.65)', {name:'Tortilla Chips', category:'Snacks', per100:{kcal:464}}, 'red', 'sweets');
all &= T('Canned coconut milk is an ingredient (red p.75)', {name:'Unsweetened Coconut Milk', category:'Nut and Seed Products', per100:{kcal:163}}, 'red', 'condiment');
all &= T('Coconut milk beverage is dairy (yellow p.35)', {name:'Unsweetened coconutmilk beverage', category:'Beverages', per100:{kcal:19}}, 'yellow', 'dairy');
all &= T('Apple juice is juice', {name:'Gala style apple juice', category:'Beverages', per100:{kcal:46}}, 'red', 'juice');
// --- cases found by the 400-product random audit of 3 Sep 2026 (seed 91) ---
all &= T('Cinnamon raisin bagel is a grain, not dried fruit (1 oz, yellow p.26)', {name:'Cinnamon Raisin Mini Bagel', category:'Baked Products', per100:{kcal:294}}, 'yellow', 'grain');
all &= T('"Cape Cod" popcorn is not cod', {name:'Cape cod, seaside pop popcorn, white cheddar', category:'Snacks', per100:{kcal:536}}, 'red', 'grain');
all &= T('Beer bratwurst is meat, not beer', {name:'Uncured Beer Bratwurst', category:'Sausages and Luncheon Meats', per100:{kcal:284}}, 'red', 'meat');
all &= T('Tuna "in water and sea salt" is not a seasoning', {name:'Wild skipjack solid light tuna in water and sea salt', category:'Finfish and Shellfish Products', per100:{kcal:107}}, 'yellow', 'meat');
all &= T('Rice with herb seasoning is a grain, not a seasoning', {name:'Rice medley long grain white rice & wild rice with herb seasoning', category:'Cereal Grains and Pasta', per100:{kcal:356}}, 'yellow', 'grain');
all &= T('Chili oil is not a seasoning',   {name:'Chili Oil', category:'Soups, Sauces, and Gravies', per100:{kcal:933}}, 'red', 'condiment');
all &= T('Salt-dusted caramel yogurt is not a seasoning', {name:'Salt - dusted caramel creme double cream yogurt', category:'Dairy and Egg Products', per100:{kcal:147}}, 'red', 'dairy');
all &= T('Sardines in tomato sauce are fish', {name:'Sardines In Tomato Sauce', category:'Finfish and Shellfish Products', per100:{kcal:89}}, 'yellow', 'meat');
all &= T('Tuna with olive oil is fish, not a fat', {name:'Prime fillet albacore tuna with ginger, soy & olive oil', category:'Finfish and Shellfish Products', per100:{kcal:196}}, 'red', 'meat');
all &= T('Olives themselves are still a fat (p.66)', {name:'Black ripe olives', category:'Vegetables and Vegetable Products', per100:{kcal:115}}, 'red', 'sweets');
all &= T('Bacon-flavoured chicken sausage is meat (3 oz, red p.53)', {name:'Bacon, Mushroom & Swiss Cheese Smoked Chicken Sausage', category:'Sausages and Luncheon Meats', per100:{kcal:211}}, 'red', 'meat');
all &= T('Baked tofu teriyaki is a meat substitute (3 oz, red like fried tofu p.54)', {name:'Organic Baked Tofu Teriyaki', category:'Legumes and Legume Products', per100:{kcal:172}}, 'red', 'protein');
all &= T('Chili peanuts are not chili; cocoa-coated nuts are a sweet (p.62)', {name:"Trader joe's, honey roasted cocoa & chili peanuts", category:'Legumes and Legume Products', per100:{kcal:571}}, 'red', 'sweets');
all &= T('Pine nut hummus is a dip, not nuts', {name:'Pine Nut Hummus', category:'Legumes and Legume Products', per100:{kcal:214}}, 'red', 'condiment');
all &= T('Buttermilk ranch dressing is a dressing', {name:'Buttermilk ranch dressing', category:'Fats and Oils', per100:{kcal:400}}, 'red', 'condiment');
all &= T('Sauerkraut is a green vegetable (p.13)', {name:'Cracovia, sauerkraut', category:'Vegetables and Vegetable Products', per100:{kcal:20}}, 'green', 'veg');
all &= T('Meat ravioli is a grain (red p.31)', {name:'Jumbo Meat Ravioli', category:'Cereal Grains and Pasta', per100:{kcal:250}}, 'red', 'grain');
all &= T('Sandwich crackers are a grain',   {name:'Sandwich crackers', category:'Baked Products', per100:{kcal:490}}, 'red', 'grain');
all &= T('Breaded mozzarella sticks are a combination food', {name:'Mozzarella Sticks With Italian-Seasoned Breading', category:'Meals, Entrees, and Side Dishes', per100:{kcal:263}}, 'review', 'combo');
all &= T('Rice pudding is a sweet (red p.64)', {name:'Rice pudding', category:'Sweets', per100:{kcal:124}}, 'red', 'sweets');
all &= T('Bread pudding is a sweet',        {name:'Apple Brioche Bread Pudding', category:'Sweets', per100:{kcal:291}}, 'red', 'sweets');
all &= T('Agave nectar is a syrup: a red ingredient (p.75)', {name:'Organic light blue agave nectar', category:'Sweets', per100:{kcal:333}}, 'red', 'condiment');
all &= T('Frozen low fat yogurt is a sweet (p.62)', {name:'Vanilla smooth & creamy frozen low fat yogurt', category:'Sweets', per100:{kcal:185}}, 'red', 'sweets');
all &= T('A zero-calorie fruit-flavoured drink is red, not fruit', {name:'Arizona Super LXR Acai Blueberry', category:'Beverages', per100:{kcal:0}}, 'red', 'sweets');
all &= T('Dry rice sticks are a grain (1 oz dry, yellow p.29)', {name:'Maifun rice stick', category:'Cereal Grains and Pasta', per100:{kcal:368}}, 'yellow', 'grain');
all &= T('Basmati rice with bell peppers is a grain (1 oz dry, yellow p.29)', {name:'Basmati rice, spanish style with bell peppers', category:'Cereal Grains and Pasta', per100:{kcal:326}}, 'yellow', 'grain');
all &= T('Vegetable macaroni is a grain',   {name:'Vegetable & Wheat Twisted Elbows, Macaroni Pasta', category:'Cereal Grains and Pasta', per100:{kcal:357}}, 'yellow', 'grain');
all &= T('Lima beans are yellow protein (p.42)', {name:'Birds eye, fordhook lima beans', category:'Legumes and Legume Products', per100:{kcal:114}}, 'yellow', 'protein');
all &= T('Canned red beans at 1/2 cup (p.41)', {name:'Small Red Beans', category:'Legumes and Legume Products', per100:{kcal:123}}, 'yellow', 'protein');
// --- cases found by the second 400-product random audit (seed 305) ---
all &= T('Corn tostadas are a grain (p.30)', {name:'Corn tostadas', category:'Baked Products', per100:{kcal:500}}, 'red', 'grain');
all &= T('Potato gnocchi is a grain at 1/2 cup (p.31)', {name:'Potato Gnocchi', category:'Cereal Grains and Pasta', per100:{kcal:161}}, 'yellow', 'grain');
all &= T('High-protein wraps are tortillas', {name:'Gluten Free 4 High Protein Wraps with Super Seeds', category:'Baked Products', per100:{kcal:281}}, 'yellow', 'grain');
all &= T('Street taco tortillas are a grain (1 oz, yellow p.30)', {name:'mi tienda street taco', category:'Baked Products', per100:{kcal:350}}, 'yellow', 'grain');
all &= T('"Bun size franks" are franks, not a bun', {name:'Bun size franks', category:'Sausages and Luncheon Meats', per100:{kcal:340}}, 'red', 'meat');
all &= T('Hot dog buns are still a grain',  {name:'Hot dog buns', category:'Baked Products', per100:{kcal:282}}, 'yellow', 'grain');
all &= T('"Egg Ranch, Cage Free Chickens" is a carton of eggs', {name:"Latta's Egg Ranch, Cage Free Chickens", category:'Dairy and Egg Products', per100:{kcal:140}}, 'yellow', 'protein');
all &= T('Cracked pepper baked beans are not a seasoning', {name:'Cracked pepper baked beans', category:'Legumes and Legume Products', per100:{kcal:115}}, 'red', 'protein');
all &= T('Wax beans are green beans (p.13)', {name:'Cut Wax Beans', category:'Vegetables and Vegetable Products', per100:{kcal:17}}, 'green', 'veg');
all &= T('Tuna and pasta salad is a combination food', {name:'St. dalfour, french bistro, tuna & pasta', category:'Meals, Entrees, and Side Dishes', per100:{kcal:120}}, 'review', 'combo');
all &= T('Prune cake is a sweet, not dried fruit', {name:'Prune cake', category:'Baked Products', per100:{kcal:375}}, 'red', 'sweets');
all &= T('Coconut milk pudding is a dessert (p.64)', {name:'Sun-ripened chia seed, coconut milk and real mango', category:'Sweets', per100:{kcal:94}}, 'red', 'sweets');
all &= T('Canned coconut milk is still an ingredient', {name:'Unsweetened Coconut Milk', category:'Nut and Seed Products', per100:{kcal:163}}, 'red', 'condiment');
all &= T('Honey mustard dressing is a dressing (p.75)', {name:'Honey mustard dressing', category:'Fats and Oils', per100:{kcal:433}}, 'red', 'condiment');
all &= T('Bean thread noodles are a grain',  {name:'Bean Threads', category:'Cereal Grains and Pasta', per100:{kcal:351}}, 'yellow', 'grain');
all &= T('Yogurt with caramel sauce is still dairy', {name:'Salt-dusted caramel creme double cream yogurt with caramel sauce', category:'Dairy and Egg Products', per100:{kcal:147}}, 'red', 'dairy');
all &= T('Bean salad is protein',            {name:'Black Beans Salad', category:'Legumes and Legume Products', per100:{kcal:100}}, 'yellow', 'protein');
// --- cases found by the third 400-product random audit (seed 777) ---
all &= T('Peanuts and raisins are a trail mix, not dried fruit (p.65)', {name:'Peanuts & Raisins', category:'Legumes and Legume Products', per100:{kcal:457}}, 'red', 'nuts');
all &= T('Frozen gumbo vegetable mix is a vegetable', {name:'Vegetable gumbo mix', category:'Vegetables and Vegetable Products', per100:{kcal:50}}, 'yellow', 'veg');
all &= T('Pickles sold as "sandwich stuffers" are pickles (p.73)', {name:'Kosher Dill Sandwich Stuffers', category:'Vegetables and Vegetable Products', per100:{kcal:0}}, 'yellow', 'condiment');
all &= T('Canned fruit "in natural juice" is canned fruit', {name:'Fruit, Mix in Natural Juice', category:'Fruits and Fruit Juices', per100:{kcal:71}}, 'yellow', 'fruit');
all &= T('An aloe vera drink is a sweetened drink (p.59)', {name:"T'Best, Mango Aloe Vera Drink", category:'Beverages', per100:{kcal:4}}, 'red', 'sweets');
all &= T('Shredded coleslaw mix is a vegetable', {name:'Classic coleslaw green cabbage, shredded carrots', category:'Vegetables and Vegetable Products', per100:{kcal:24}}, 'green', 'veg');
all &= T('A chickpea pizza is a combination food, not a pie', {name:'Mediterranean chickpeas, spinach and roma tomatoes with feta', category:'Meals, Entrees, and Side Dishes', per100:{kcal:233}}, 'review', 'combo');
all &= T('A calorie-free unflavoured drink has no colour', {name:'Mineral drinking water', category:'', per100:{kcal:0, sugars:0}}, 'free', 'free');
// --- cases found by the fourth 400-product random audit (seed 2024) ---
all &= T('Blackeye peas are legumes, not starchy (p.42)', {name:'Cooked dry blackeye peas', category:'Legumes and Legume Products', per100:{kcal:77}}, 'yellow', 'protein');
all &= T('A coconut curry is a dish, not a nut', {name:'Creamy Coconut Curry', category:'Legumes and Legume Products', per100:{kcal:63}}, 'yellow', 'protein');
all &= T('"Hamburger dill chips" is a jar of pickles (yellow p.73)', {name:'Hamburger Dill Chips', category:'Vegetables and Vegetable Products', per100:{kcal:54}}, 'yellow', 'condiment');
all &= T('A fresh vegetable snack pack is not chips (green p.13)', {name:'Carrot Chips, Broccoli & Celery Snack Pack', category:'Vegetables and Vegetable Products', per100:{kcal:40}}, 'green', 'veg');
all &= T('Strawberry preserves are a red ingredient (p.75)', {name:'Spartan, preserves, strawberry', category:'Sweets', per100:{kcal:250}}, 'red', 'condiment');
all &= T('Honey is a red ingredient (p.75)', {name:'Pure clover honey', category:'Sweets', per100:{kcal:304}}, 'red', 'condiment');
all &= T('Jelly beans are candy, not jelly',  {name:'Jelly beans', category:'Sweets', per100:{kcal:367}}, 'red', 'sweets');
all &= T('Blue cheese dressing is a dressing', {name:'Chunky Blue Cheese Dressing', category:'Fats and Oils', per100:{kcal:433}}, 'red', 'condiment');
// --- combination foods decomposed by the guide's one-red-serving rule (FRG p.8) ---
const PIZZA = [{text:'FLOUR',pct:51.8},{text:'MOZZARELLA CHEESE',pct:24.1},{text:'WATER',pct:12.1},{text:'PEPPERONI',pct:6.0},{text:'NONFAT MILK',pct:3.0},{text:'TOMATO PASTE',pct:1.5},{text:'VEGETABLE OIL',pct:0.8}];
all &= T('Pepperoni pizza: 1.1 servings of cheese alone makes it red', {name:'Brick Oven Pepperoni Pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:279}, servQtyG:127, ingredients:PIZZA}, 'red', 'combo');
all &= T('The same pizza at a 40 g serving stays under the limit', {name:'Brick Oven Pepperoni Pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:279}, servQtyG:40, ingredients:PIZZA}, 'yellow', 'combo');
all &= T('Pizza snack rolls hold 0.2 of a red serving', {name:'Pepperoni Pizza Snack Rolls', category:'Meals, Entrees, and Side Dishes', per100:{kcal:259}, servQtyG:85,
  ingredients:[{text:'WATER',pct:50},{text:'ENRICHED WHEAT FLOUR',pct:25},{text:'TOMATO PASTE',pct:12.5},{text:'PEPPERONI',pct:6.3},{text:'SOYBEAN OIL',pct:1.6},{text:'MODIFIED FOOD STARCH',pct:0.8}]}, 'yellow', 'combo');
const FLATBREAD = U({name:'Veggie flatbread pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:204}, servQtyG:120,
  ingredients:[{text:'WHEAT FLOUR',pct:55},{text:'TOMATO SAUCE',pct:18},{text:'MOZZARELLA CHEESE',pct:10},{text:'SPINACH',pct:8},{text:'ONIONS',pct:5},{text:'OLIVE OIL',pct:2}]});
all &= T('Veggie flatbread holds 0.6 of a red serving, so it is not red', FLATBREAD, 'yellow', 'combo');
// the limit is a setting, in case a programme runs a tighter one than the guide's serving
const TIGHTER = cloneRules(DEFAULT_RULES); TIGHTER.comboRedServings = 0.5;
{
  const r = classify(FLATBREAD, TIGHTER);
  const ok = r.color === 'red';
  console.log((ok ? 'PASS' : 'FAIL'), 'The same flatbread is red if a programme sets the limit to half a serving', '->', r.color);
  all &= ok;
}
all &= T('A cheeseburger holds a full serving of cheese and beef', {name:'Frozen cheeseburger', category:'Meals, Entrees, and Side Dishes', per100:{kcal:250}, servQtyG:150,
  ingredients:[{text:'BUN',pct:35},{text:'BEEF',pct:38},{text:'CHEDDAR CHEESE',pct:12},{text:'KETCHUP',pct:5},{text:'PICKLES',pct:4}]}, 'red', 'combo');
all &= T('An ingredient list that just restates the product is not a recipe', {name:'Spicy harissa salmon salad', category:'Meals, Entrees, and Side Dishes', per100:{kcal:200}, servQtyG:227,
  ingredients:[{text:'HARISSA SALMON SALAD',pct:52},{text:'WATER',pct:20}]}, 'review', 'combo');
all &= T('A "Cheese pizza" whose ingredients list no cheese is not trusted', {name:'Cheese pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:226}, servQtyG:147,
  ingredients:[{text:'Crust',pct:52},{text:'malted barley flour',pct:24},{text:'niacin',pct:12},{text:'water',pct:0.4}]}, 'review', 'combo');
all &= T('A 6 g serving is too small to be a mixed dish', {name:'Mozzarella sticks with marinara', category:'Meals, Entrees, and Side Dishes', per100:{kcal:290}, servQtyG:6,
  ingredients:[{text:'MOZZARELLA CHEESE',pct:40},{text:'WHEAT FLOUR',pct:30}]}, 'review', 'combo');
all &= T('Tomato basil sauce is a sauce, not basil', {name:'Margherita pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:230}, servQtyG:154,
  ingredients:[{text:'WHEAT FLOUR',pct:45},{text:'TOMATO BASIL SAUCE',pct:20},{text:'MOZZARELLA',pct:18},{text:'WATER',pct:10}]}, 'red', 'combo');
all &= T('Ingredients without a serving size cannot be decomposed', {name:'Cheese pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:226},
  ingredients:[{text:'FLOUR',pct:50},{text:'MOZZARELLA CHEESE',pct:30}]}, 'review', 'combo');
all &= T('Mostly unrecognised ingredients fall back to the question', {name:'Mystery frozen dinner', category:'Meals, Entrees, and Side Dishes', per100:{kcal:200}, servQtyG:200,
  ingredients:[{text:'SECRET RECIPE COMPONENT',pct:70},{text:'FLOUR',pct:20}]}, 'review', 'combo');
all &= T('Dried apricots are dried fruit, red (p.24)', {name:'Premium Dried Apricots', category:'Fruits and Fruit Juices', per100:{kcal:275}}, 'red', 'juice');
all &= T('Mustard spinach is a vegetable', {name:'Mustard spinach, raw', category:'', usdaCategory:'Vegetables and Vegetable Products', per100:{kcal:22}}, 'green', 'veg');

// --- combination foods and the clinician's own entries ---
all &= T('Pepperoni pizza with no ingredient list asks the question', {name:'Pepperoni pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:280}}, 'review', 'combo');
all &= T('Custom: veggie soup, group given', {name:'Homemade veggie soup', category:'', per100:{}, serv:{kcal:80}}, 'yellow', 'soupBroth', 'soupBroth');
all &= T('Custom: fudge, group given',    {name:'Grandma\'s fudge', category:'', per100:{}, serv:{kcal:120}}, 'red', 'sweets', 'sweets');
all &= T('Custom: cereal 40% sugar, group given', {name:'Mystery cereal', category:'', per100:{}, serv:{kcal:110, sugars:11}}, 'red', 'cereal', 'cereal');
all &= T('Group override beats detection', {name:'Apple, raw', category:'Fruits and Fruit Juices', per100:{kcal:52}}, 'yellow', 'veg', 'veg');
all &= T('Unknown food asks for a group', {name:'Mystery item', category:'', per100:{kcal:200}}, 'yellow', null);

// --- portions: label servings in, FRG servings out (FRG p.3, p.5, p.28, p.36) ---
const P = (name, ok, detail) => { console.log((ok ? 'PASS' : 'FAIL'), name, detail ? '| ' + detail : ''); return ok; };
{
  const bagel = U({name:'Plain bagel', category:'Baked Products', per100:{kcal:262}, serv:{kcal:275}, servQtyG:105, servingLabel:'1 bagel (105 g)'});
  const r = classify(bagel, RULES); const b = portionBasis(bagel, r, RULES); const sv = frgServings(r, b, 1, null, RULES);
  all &= P('A whole bagel is yellow per 1/4 bagel (p.28) and counts about 3.8 FRG servings', r.color === 'yellow' && r.group === 'grain' && b.kind === 'label' && fmtServ(sv) === '3.8', r.color + ' ' + r.group + ' ' + b.kind + ' ' + fmtServ(sv));
  all &= P('Half a bagel is about 1.9 FRG servings', fmtServ(frgServings(r, b, 0.5, null, RULES)) === '1.9', fmtServ(frgServings(r, b, 0.5, null, RULES)));
  all &= P('A typed 28 g of bagel is 1 FRG serving', fmtServ(frgServings(r, b, 1, 28, RULES)) === '1', fmtServ(frgServings(r, b, 1, 28, RULES)));
  all &= P('The portion line shows both scales', portionLine(r, b, 1, null, sv, RULES) === '1 label serving, 1 bagel (105 g) = about 3.8 FRG servings', portionLine(r, b, 1, null, sv, RULES));
  all &= P('...and a typed weight', portionLine(r, b, 1, 28, frgServings(r, b, 1, 28, RULES), RULES) === '28 g = about 1 FRG serving', portionLine(r, b, 1, 28, frgServings(r, b, 1, 28, RULES), RULES));
}
{
  const cc = U({name:'Cream cheese', category:'Dairy and Egg Products', per100:{kcal:321, fat:32}, serv:{}, servQtyG:null, servingLabel:'100 g'});
  const r = classify(cc, RULES); const b = portionBasis(cc, r, RULES);
  all &= P('Cream cheese with no label serving opens at the FRG ounce, about 93 cal, red (p.36)', r.color === 'red' && r.group === 'cheese' && b.kind === 'frg' && b.grams === 29 && Math.round(b.base.kcal) === 93, r.color + ' ' + r.group + ' ' + b.kind + ' ' + b.grams + ' ' + Math.round(b.base.kcal));
  all &= P('...and one of it is one FRG serving', fmtServ(frgServings(r, b, 1, null, RULES)) === '1');
  all &= P('...typed as 30 g it is still about 1 FRG serving', fmtServ(frgServings(r, b, 1, 30, RULES)) === '1', fmtServ(frgServings(r, b, 1, 30, RULES)));
  all &= P('...and the line names the guide serving', portionLine(r, b, 1, null, 1, RULES) === '1 FRG serving, about 29 g, 1 oz', portionLine(r, b, 1, null, 1, RULES));
}
{
  const water = U({name:'Spring water', category:'Beverages', per100:{kcal:0}, serv:{}});
  const r = classify(water, RULES); const b = portionBasis(water, r, RULES);
  all &= P('Water has no FRG serving to count', r.color === 'free' && frgServings(r, b, 2, null, RULES) === null, r.color + ' ' + frgServings(r, b, 2, null, RULES));
}
{
  const custom = U({name:'Homemade veggie soup', category:'', per100:{}, serv:{kcal:80}, servingLabel:'1 bowl'});
  const r = classify(custom, RULES, 'soupBroth'); const b = portionBasis(custom, r, RULES);
  all &= P('A custom food with calories but no weight counts servings by calories', b.grams === null && fmtServ(frgServings(r, b, 2, null, RULES)) === '2', b.grams + ' ' + fmtServ(frgServings(r, b, 2, null, RULES)));
}
{
  const pizza = U({name:'Pepperoni pizza', category:'Meals, Entrees, and Side Dishes', per100:{kcal:280}, serv:{kcal:392}, servQtyG:140, servingLabel:'1/4 pizza (140 g)'});
  const r = classify(pizza, RULES); const b = portionBasis(pizza, r, RULES);
  all &= P('A combination food counts its own servings (p.8 gives it no other)', r.group === 'combo' && fmtServ(frgServings(r, b, 2, null, RULES)) === '2', r.group + ' ' + fmtServ(frgServings(r, b, 2, null, RULES)));
}
all &= P('Entries logged before servings were recorded count as one', entryServings({color:'red'}) === 1 && entryServings({color:'red', servings:2.5}) === 2.5);
all &= P('Red servings add up across entries and round to a tenth', sumServings([{color:'red', servings:1.25}, {color:'red'}, {color:'yellow', servings:4}], 'red') === 2.3, String(sumServings([{color:'red', servings:1.25}, {color:'red'}, {color:'yellow', servings:4}], 'red')));
all &= P('Servings print to a tenth, whole numbers plain', fmtServ(3.75) === '3.8' && fmtServ(2) === '2' && fmtServ(0.96) === '1' && fmtServ(null) === '?');


console.log(all ? '\nALL TESTS PASS' : '\nSOME TESTS FAILED');
