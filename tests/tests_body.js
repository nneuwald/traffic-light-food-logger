// Hand-written cases against the FRG rule: food group -> calories per Traffic
// Light serving -> colour. Every expected colour below can be checked against a
// page of Epstein's Food & Activity Reference Guide (2012); page numbers are the
// guide's own. Expected groups are asserted too, because a right colour reached
// through the wrong group is still a bug.
const T = (name, f, expect, group, override) => {
  const r = classify(f, RULES, override);
  const ok = r.color === expect && (group === undefined || r.group === group);
  console.log((ok ? 'PASS' : 'FAIL'), name, '->', r.color, '(' + r.group + ')', '| expected', expect, group === undefined ? '' : '(' + group + ')',
    ok ? '' : '| ' + r.reasons.join('; '));
  return ok;
};
let all = true;

// --- vegetables: the only group that can be green (FRG p.12-17) ---
all &= T('Broccoli, cooked',              {name:'Broccoli, cooked', cats:['en:vegetables'], per100:{kcal:35}}, 'green', 'veg');
all &= T('Carrots, raw',                  {name:'Carrots, raw', cats:['en:vegetables','en:carrots'], per100:{kcal:41}}, 'green', 'veg');
all &= T('Kale, raw (leafy = light)',     {name:'Kale, raw', cats:['en:vegetables'], per100:{kcal:49}}, 'green', 'veg');
all &= T('Artichoke hearts in oil',       {name:'Artichoke hearts in oil', cats:['en:vegetables'], per100:{kcal:150}}, 'red', 'veg');
all &= T('Marinara sauce (1/4 cup)',      {name:'Marinara sauce', cats:['en:tomato-sauces'], per100:{kcal:55}}, 'yellow', 'veg');
all &= T('Tomato juice (8 fl oz)',        {name:'Tomato juice', cats:['en:beverages','en:vegetable-juices'], isBeverage:true, per100:{kcal:17}}, 'yellow', 'veg');

// --- starchy vegetables: never green (FRG p.18-20) ---
all &= T('Potato, baked',                 {name:'Potato, baked', cats:['en:potatoes'], per100:{kcal:93}}, 'yellow', 'starchy');
all &= T('Green peas (starchy, not green)', {name:'Green peas', cats:['en:vegetables','en:peas'], per100:{kcal:66}}, 'yellow', 'starchy');
all &= T('Corn, canned',                  {name:'Corn, sweet, canned', cats:['en:vegetables','en:corn'], per100:{kcal:81}}, 'yellow', 'starchy');
all &= T('French fries, oven baked',      {name:'French fries, frozen, oven baked', cats:['en:french-fries'], per100:{kcal:164}}, 'red', 'starchy');

// --- fruit: yellow at most; juice and dried fruit are always red (FRG p.21-25) ---
all &= T('Apple',                         {name:'Apple, raw', cats:['en:fruits'], per100:{kcal:52}}, 'yellow', 'fruit');
all &= T('Banana',                        {name:'Banana, raw', cats:['en:fruits'], per100:{kcal:89}}, 'yellow', 'fruit');
all &= T('Avocado',                       {name:'Avocado, raw', cats:['en:fruits','en:avocados'], per100:{kcal:160}}, 'red', 'fruit');
all &= T('Orange juice, 100%',            {name:'Orange juice', cats:['en:beverages','en:fruit-juices'], isBeverage:true, per100:{kcal:45}}, 'red', 'juice');
all &= T('Raisins',                       {name:'Raisins', cats:['en:dried-fruits'], per100:{kcal:299}}, 'red', 'juice');

// --- grains (FRG p.26-32) ---
all &= T('Whole wheat bread',             {name:'Whole wheat bread', cats:['en:breads'], per100:{kcal:247}}, 'yellow', 'grain');
all &= T('Honey wheat bread (honey is not a sweet here)', {name:'Honey wheat bread', cats:['en:breads'], per100:{kcal:233}}, 'yellow', 'grain');
all &= T('Bread with seeds (seeds are not nuts here)', {name:'21 whole grains and seeds bread', cats:['en:breads'], per100:{kcal:244}}, 'yellow', 'grain');
all &= T('Brown rice, cooked (1/2 cup)',  {name:'Brown rice, cooked', cats:['en:rices'], per100:{kcal:112}}, 'yellow', 'grain');
all &= T('Spaghetti, dry (1 oz)',         {name:'Spaghetti', cats:['en:pastas'], per100:{kcal:357}}, 'yellow', 'grain');
all &= T('Cheez-It crackers',             {name:'Cheez-It original crackers', cats:['en:crackers'], per100:{kcal:503}}, 'red', 'grain');
all &= T('Granola bar',                   {name:'Oats and honey granola bar', cats:['en:granola-bars'], per100:{kcal:450}}, 'red', 'grain');
all &= T('Banana bread is a grain',       {name:'Banana bread', cats:[], per100:{kcal:326}}, 'yellow', 'grain');

// --- cold cereal: calories and the 25% sugar rule (FRG p.77) ---
all &= T('Cheerios',                      {name:'Cheerios', cats:['en:breakfast-cereals'], per100:{kcal:367, sugars:4.8}}, 'yellow', 'cereal');
all &= T('Honey Nut Cheerios (33% sugar)', {name:'Honey Nut Cheerios', cats:['en:breakfast-cereals'], per100:{kcal:393, sugars:32.1}}, 'red', 'cereal');
all &= T('Dense granola (>120 cal)',      {name:'Granola', cats:['en:granolas'], per100:{kcal:489, sugars:20}}, 'red', 'cereal');

// --- cheese (1 oz) and other dairy (1 cup; yogurt 6 oz) (FRG p.33-40) ---
all &= T('Cheddar cheese',                {name:'Cheddar cheese', cats:['en:cheeses'], per100:{kcal:403}}, 'red', 'cheese');
all &= T('Mozzarella, part skim',         {name:'Mozzarella, part skim', cats:['en:cheeses'], per100:{kcal:254}}, 'yellow', 'cheese');
all &= T('Cottage cheese 1% (1/2 cup)',   {name:'Cottage cheese, 1% fat', cats:['en:cottage-cheeses'], per100:{kcal:72}}, 'yellow', 'cheese');
all &= T('Skim milk (yellow, not green)', {name:'Skim milk', cats:['en:beverages','en:milks','en:skimmed-milks'], isBeverage:true, per100:{kcal:34}}, 'yellow', 'dairy');
all &= T('Whole milk',                    {name:'Whole milk', cats:['en:beverages','en:milks'], isBeverage:true, per100:{kcal:61}}, 'red', 'dairy');
all &= T('Chocolate milk, 1%',            {name:'Chocolate milk, lowfat', cats:['en:beverages','en:milks','en:chocolate-milks'], isBeverage:true, per100:{kcal:71}}, 'red', 'dairy');
all &= T('Plain nonfat Greek yogurt',     {name:'Plain nonfat greek yogurt', cats:['en:yogurts','en:desserts'], per100:{kcal:59}}, 'yellow', 'dairy');
all &= T('Strawberry yogurt',             {name:'Strawberry yogurt', cats:['en:yogurts'], per100:{kcal:100}}, 'red', 'dairy');
all &= T('Unsweetened almond milk',       {name:'Unsweetened almondmilk', cats:[], isBeverage:true, per100:{kcal:5}}, 'yellow', 'dairy');

// --- protein (FRG p.41-58) ---
all &= T('Chicken breast, roasted',       {name:'Chicken breast, roasted', cats:['en:meats','en:chicken'], per100:{kcal:165}}, 'yellow', 'meat');
all &= T('Ground beef 80/20',             {name:'Ground beef, 80% lean, broiled', cats:['en:meats','en:beef'], per100:{kcal:270}}, 'red', 'meat');
all &= T('Tuna in water',                 {name:'Chunk light tuna in water', cats:['en:canned-fish'], per100:{kcal:86}}, 'yellow', 'meat');
all &= T('Egg, hard boiled',              {name:'Egg, hard boiled', cats:['en:eggs'], per100:{kcal:155}}, 'yellow', 'protein');
all &= T('Black beans, canned',           {name:'Black beans, canned', cats:['en:legumes','en:beans'], per100:{kcal:87}}, 'yellow', 'protein');
all &= T('Green beans are vegetables',    {name:'Cut green beans', cats:['en:legumes','en:green-beans','en:vegetables'], per100:{kcal:17}}, 'green', 'veg');
all &= T('Almonds',                       {name:'Almonds, raw', cats:['en:nuts'], per100:{kcal:579}}, 'red', 'nuts');
all &= T('Peanut butter (2 Tbsp)',        {name:'Peanut butter, smooth', cats:['en:nut-butters','en:peanut-butter'], per100:{kcal:588}}, 'red', 'nuts');
all &= T('Chestnuts, roasted',            {name:'Chestnuts, roasted', cats:['en:nuts'], per100:{kcal:240}}, 'yellow', 'nuts');
all &= T('Rice tagged en:seeds is a grain', {name:'Ready rice', cats:['en:seeds','en:cereals','en:rices'], per100:{kcal:160}}, 'yellow', 'grain');

// --- fats, oils, sweets & others: always red, diet drinks included (FRG p.59-66) ---
all &= T('Cola',                          {name:'Cola', cats:['en:beverages','en:sodas'], isBeverage:true, per100:{kcal:39}}, 'red', 'sweets');
all &= T('Diet cola (red, not yellow)',   {name:'Diet cola', cats:['en:beverages','en:sodas','en:diet-beverages'], isBeverage:true, per100:{kcal:0}}, 'red', 'sweets');
all &= T('Sports drink',                  {name:'Lemon-lime thirst quencher', cats:['en:beverages','en:sports-drinks'], isBeverage:true, per100:{kcal:25}}, 'red', 'sweets');
all &= T('Sweetened iced tea',            {name:'Iced tea, sweetened', cats:['en:beverages','en:teas','en:iced-teas'], isBeverage:true, per100:{kcal:35}}, 'red', 'sweets');
all &= T('Potato chips',                  {name:'Potato chips', cats:['en:salty-snacks','en:crisps'], per100:{kcal:536}}, 'red', 'sweets');
all &= T('Chocolate chip cookies',        {name:'Chocolate chip cookies', cats:['en:sugary-snacks','en:biscuits'], per100:{kcal:488}}, 'red', 'sweets');
all &= T('Butter',                        {name:'Butter', cats:['en:butters'], per100:{kcal:717}}, 'red', 'sweets');
all &= T('Ice cream',                     {name:'Vanilla ice cream', cats:['en:desserts','en:ice-cream'], per100:{kcal:207}}, 'red', 'sweets');
all &= T('Milk chocolate bar (not dairy)', {name:'Candy, milk chocolate bar', cats:[], usdaCategory:'Sweets', per100:{kcal:535}}, 'red', 'sweets');

// --- no colour (FRG p.7) ---
all &= T('Water',                         {name:'Water', cats:['en:beverages','en:waters'], isBeverage:true, per100:{kcal:0}}, 'free', 'free');
all &= T('Water tagged unsweetened-beverages', {name:'Spring water', cats:['en:beverages','en:waters','en:unsweetened-beverages'], isBeverage:true, per100:{kcal:0}}, 'free', 'free');
all &= T('Black coffee',                  {name:'Coffee, brewed', cats:['en:beverages','en:coffees'], isBeverage:true, per100:{kcal:1}}, 'free', 'free');

// --- soups (1 cup) and condiments (1 Tbsp) (FRG p.67-76) ---
all &= T('Chicken noodle soup',           {name:'Chicken noodle soup', cats:['en:soups','en:meals'], per100:{kcal:30}}, 'yellow', 'soupBroth');
all &= T('Chili with beans',              {name:'Chili with beans', cats:['en:soups','en:chilis'], per100:{kcal:110}}, 'red', 'soupChili');
all &= T('Chicken broth is an ingredient', {name:'Chicken broth', cats:['en:broths','en:meals'], per100:{kcal:5}}, 'yellow', 'condiment');
all &= T('Ketchup',                       {name:'Ketchup', cats:['en:condiments','en:ketchups'], per100:{kcal:100}}, 'yellow', 'condiment');
all &= T('Ranch dressing',                {name:'Ranch dressing', cats:['en:salad-dressings'], per100:{kcal:430}}, 'red', 'condiment');
all &= T('Dill pickle spear',             {name:'Kosher dill spears', cats:['en:pickles'], per100:{kcal:12}}, 'yellow', 'condiment');
all &= T('Mustard spinach is a vegetable', {name:'Mustard spinach, raw', cats:[], usdaCategory:'Vegetables and Vegetable Products', per100:{kcal:22}}, 'green', 'veg');

// --- combination foods and the clinician's own entries ---
all &= T('Pepperoni pizza (review)',      {name:'Pepperoni pizza', cats:['en:pizzas'], per100:{kcal:280}}, 'yellow', 'combo');
all &= T('Custom: veggie soup, group given', {name:'Homemade veggie soup', cats:[], per100:{}, serv:{kcal:80}}, 'yellow', 'soupBroth', 'soupBroth');
all &= T('Custom: fudge, group given',    {name:'Grandma\'s fudge', cats:[], per100:{}, serv:{kcal:120}}, 'red', 'sweets', 'sweets');
all &= T('Custom: cereal 40% sugar, group given', {name:'Mystery cereal', cats:[], per100:{}, serv:{kcal:110, sugars:11}}, 'red', 'cereal', 'cereal');
all &= T('Group override beats detection', {name:'Apple, raw', cats:['en:fruits'], per100:{kcal:52}}, 'yellow', 'veg', 'veg');
all &= T('Unknown food asks for a group', {name:'Mystery item', cats:[], per100:{kcal:200}}, 'yellow', null);

console.log(all ? '\nALL TESTS PASS' : '\nSOME TESTS FAILED');
