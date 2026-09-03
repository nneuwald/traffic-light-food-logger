#!/usr/bin/env bash
# Regenerates app.js from the HTML and runs all four test suites offline.
# Requires only Node.js (the extraction step used to need Python 3, which is
# not on every lab machine). Run from anywhere: bash tests/extract_and_test.sh
set -e
cd "$(dirname "$0")"
node -e '
const fs = require("fs");
const html = fs.readFileSync("../traffic_light_food_logger.html", "utf8");
const m = html.match(/<script>\n([\s\S]*)\n<\/script>/);
if (!m) { console.error("could not find the <script> block"); process.exit(1); }
fs.writeFileSync("app.js", m[1]);
'
node --check app.js && echo "syntax OK"
node build_test.js && node combined_test.js
node fdc_unit.js && node fdc_combined.js
node off_fixture_test.js
node fdc_generic_test.js
node audit_regression.js
