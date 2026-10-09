const fs = require('fs');
const src = fs.readFileSync('app.js', 'utf8');
const start = src.indexOf('const DEFAULT_RULES');
const end = src.indexOf('// ---------- search helpers');
// the USDA mapper as well, so the cases can describe foods the way USDA does
const fdcStart = src.indexOf('// ---------- USDA FoodData Central lookup');
const fdcEnd = src.indexOf('// ---------- quick-add foods');
const engine = src.slice(start, end).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '')
  + src.slice(fdcStart, fdcEnd);
const tests = fs.readFileSync('tests_body.js', 'utf8');
fs.writeFileSync('combined_test.js', engine + '\n' + tests);
