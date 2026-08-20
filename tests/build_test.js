const fs = require('fs');
const src = fs.readFileSync('app.js', 'utf8');
const start = src.indexOf('const DEFAULT_RULES');
const end = src.indexOf('// ---------- Open Food Facts lookup');
const engine = src.slice(start, end).replace(/const \$ = .*\n/, '').replace(/function toast[^\n]*\n/, '');
const tests = fs.readFileSync('tests_body.js', 'utf8');
fs.writeFileSync('combined_test.js', engine + '\n' + tests);
