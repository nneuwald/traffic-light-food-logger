#!/usr/bin/env bash
# Regenerates app.js from the HTML and runs both test suites.
# Requires Node.js and Python 3. Run from the tests/ folder.
set -e
cd "$(dirname "$0")"
python3 - <<'PY'
import re
html = open('../traffic_light_food_logger.html', encoding='utf-8').read()
m = re.search(r'<script>\n(.*)\n</script>', html, re.S)
open('app.js', 'w', encoding='utf-8').write(m.group(1))
PY
node --check app.js && echo "syntax OK"
node build_test.js && node combined_test.js
node fdc_unit.js && node fdc_combined.js
node off_fixture_test.js
node fdc_generic_test.js
