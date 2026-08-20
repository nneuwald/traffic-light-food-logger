const T = (name, f, expect) => {
  const r = classify(f, RULES);
  const ok = r.color === expect;
  console.log((ok ? 'PASS' : 'FAIL'), name, '->', r.color, '| expected', expect, '|', r.reasons.join('; '));
  return ok;
};
let all = true;
// produce
all &= T('Broccoli', {cats:['en:vegetables'], per100:{kcal:35,fat:0.4,sugars:1.4,added:0,protein:2.4}}, 'green');
all &= T('Apple', {cats:['en:fruits'], per100:{kcal:52,fat:0.2,sugars:10.4,added:0,protein:0.3}}, 'green');
all &= T('Banana', {cats:['en:fruits'], per100:{kcal:89,fat:0.3,sugars:12.2,added:0,protein:1.1}}, 'green');
all &= T('Dried mango, sweetened', {cats:['en:fruits','en:dried-fruits','en:dried'], per100:{kcal:319,fat:1.2,sugars:66,added:47,protein:2.5}}, 'red');
// staples
all &= T('Chicken breast', {cats:['en:meats'], per100:{kcal:165,fat:3.6,sat:1,sugars:0,added:0,protein:31}}, 'yellow');
all &= T('White rice', {cats:['en:cereals'], per100:{kcal:130,fat:0.3,sugars:0.1,added:0,protein:2.7}}, 'yellow');
all &= T('Plain Cheerios', {cats:['en:breakfast-cereals'], per100:{kcal:367,fat:6.7,sat:1.3,sugars:4.8,added:4.1,protein:12}}, 'yellow');
all &= T('Whole wheat bread', {cats:['en:breads'], per100:{kcal:247,fat:3.4,sat:0.7,sugars:5.6,added:4,protein:13}}, 'yellow');
// red foods
all &= T('Honey Nut Cheerios', {cats:['en:breakfast-cereals'], per100:{kcal:393,fat:5.4,sat:0,sugars:32.1,added:22.1,protein:7.1}}, 'red');
all &= T('Potato chips', {cats:['en:salty-snacks','en:crisps'], per100:{kcal:536,fat:35,sat:4.6,sugars:0.4,added:0,protein:7}}, 'red');
all &= T('Choc chip cookie', {cats:['en:sugary-snacks','en:biscuits'], per100:{kcal:488,fat:24,sat:8,sugars:36,added:30,protein:5}}, 'red');
all &= T('Cheddar cheese', {cats:['en:cheeses'], per100:{kcal:403,fat:33,sat:19,sugars:0.5,added:0,protein:23}}, 'red');
all &= T('Ice cream', {cats:['en:desserts','en:ice-cream'], per100:{kcal:207,fat:11,sat:6.8,sugars:21,added:17,protein:3.5}}, 'red');
// nuts exemption
all &= T('Almonds, raw', {cats:['en:nuts'], per100:{kcal:579,fat:50,sat:3.8,sugars:4.4,added:0,protein:21}}, 'yellow');
all &= T('Peanut butter, no added sugar', {cats:['en:nut-butters','en:peanut-butter'], per100:{kcal:588,fat:50,sat:10,sugars:9,added:2,protein:25}}, 'yellow');
all &= T('Candied nuts', {cats:['en:nuts','en:sugary-snacks'], per100:{kcal:520,fat:35,sat:4,sugars:35,added:30,protein:12}}, 'red');
// beverages
all &= T('Water', {cats:['en:beverages','en:waters'], isBeverage:true, per100:{kcal:0,sugars:0,added:0}}, 'green');
all &= T('Cola', {cats:['en:beverages','en:sodas'], isBeverage:true, per100:{kcal:39,sugars:10.6,added:10.6}}, 'red');
all &= T('Diet cola', {cats:['en:beverages','en:sodas','en:diet-sodas'], isBeverage:true, per100:{kcal:0.4,sugars:0,added:0}}, 'yellow');
all &= T('Orange juice 100%', {cats:['en:beverages','en:fruit-juices'], isBeverage:true, per100:{kcal:45,sugars:8.4,added:0}}, 'red');
all &= T('Skim milk', {cats:['en:beverages','en:milks','en:skimmed-milks'], isBeverage:true, per100:{kcal:34,fat:0.1,sugars:5,added:0,protein:3.4}}, 'green');
all &= T('Whole milk', {cats:['en:beverages','en:milks','en:whole-milks'], isBeverage:true, per100:{kcal:61,fat:3.3,sat:1.9,sugars:5,added:0,protein:3.2}}, 'yellow');
all &= T('Chocolate milk', {cats:['en:beverages','en:milks','en:flavoured-milks','en:chocolate-milks'], isBeverage:true, per100:{kcal:83,fat:2.1,sugars:9.9,added:5,protein:3.2}}, 'red');
// serving-only fallback (custom entry)
all &= T('Custom: veggie soup (serving only)', {cats:[], serv:{kcal:45,fat:0.8,added:0,protein:2}}, 'green');
all &= T('Custom: donut (serving only)', {cats:[], serv:{kcal:260,fat:14,sat:6,added:10,protein:3}}, 'red');
console.log(all ? '\nALL TESTS PASS' : '\nSOME TESTS FAILED');
