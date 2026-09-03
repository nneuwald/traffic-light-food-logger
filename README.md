# Traffic Light Food Logger

A single-file web app for traffic-light (Epstein Stoplight Diet) food logging with clients or patients. Scan a package barcode, adjust the portion, and the app logs the food and codes it green, yellow, or red with the reasoning shown.

**Live app: https://nneuwald.github.io/traffic-light-food-logger/**

Works on a phone (camera barcode scanning) or a laptop (type a barcode or search by name). Nothing to install.

## Try it

Open the live link above. `verified_barcodes.csv` lists 33 barcodes confirmed to resolve, covering all three colors plus "no colour" water, if you want known-good codes to test with.

For more than casual use, get a free USDA API key at [api.data.gov/signup](https://api.data.gov/signup) and paste it into the app's Settings. The bundled `DEMO_KEY` is limited to roughly 30 lookups per hour.

**Data lives only while the page is open.** Use the Backup (JSON) button to save a session and Restore to reload it. This is the prototype's biggest limitation.

## How classification works

Lookups hit Open Food Facts first, then USDA FoodData Central as a fallback. Classification then happens entirely on-device and follows Epstein's Traffic Light Diet exactly as set out in *The Food & Activity Reference Guide* (2012):

1. **Find the food group.** Vegetables, starchy vegetables, fruit, juice & dried fruit, grains, cold cereal, cheese, other dairy, meat & seafood, eggs/beans/meat substitutes, nuts, fats/oils/sweets, two soup groups, condiments, combination foods, or "no colour" (water, plain tea and coffee, seasonings). The app reads the group from Open Food Facts category tags, the product name, and the USDA category; the clinician can change it with one dropdown.
2. **Take the calories in one Traffic Light serving** and read the colour off the group's range (guide p.6). Only vegetables can be green (≤ 30 cal per ½ cup). Everything else is yellow up to its group's cap and red above it.
3. **Apply the guide's absolutes.** Fruit juice, dried fruit and the whole fats/oils/sweets group are always red, diet soda included. Water, plain tea and coffee carry no colour. Cold cereal is also red when more than 25% of its calories come from sugar.

Every verdict shows its reasons, the food group can be changed, and any colour can be overridden per item. Serving sizes are gram estimates of the guide's household servings; they and every threshold are editable in Settings. The guide allows no more than 2 red servings a day, so a new client's weekly budget defaults to 14.

## Repository contents

| Path | What it is |
|---|---|
| `traffic_light_food_logger.html` | The entire app: HTML, CSS, and JavaScript in one file |
| `index.html` | Redirect so the site root opens the app |
| `ORIENTATION.md` | Full project orientation: architecture, data sources, thresholds, roadmap |
| `verified_barcodes.csv` / `.json` | 33 US barcodes confirmed to resolve, with assigned colors and reasons (3 green, 15 yellow, 12 red, 3 no colour) |
| `screenshots/` | Light mode, dark mode, and USDA-search screenshots |
| `tests/` | Test harness: four suites covering the classification engine and both API mappers |
| `fixtures/` | Saved Open Food Facts and USDA responses so the tests run offline |

See [ORIENTATION.md](ORIENTATION.md) for the full technical writeup.

## Testing

With Node.js installed, run `bash tests/extract_and_test.sh`. It re-extracts the JavaScript from the HTML and runs four suites against offline fixtures: 210 hand-written classification checks, 11 USDA mapping checks, 39 assertions over saved Open Food Facts responses, and 17 over saved USDA generic-food responses.

Three internet audits complement them. `node tests/audit_live.js` pulls about 130 named everyday US products and compares each with the guide. `node tests/audit_random.js 400 <seed>` draws products at random across 57 categories. `node tests/audit_analyze.js <file>` then checks every drawn product automatically: each Open Food Facts category implies which food groups a product from it could legitimately take, so anything outside that set is printed for review. `node tests/audit_reclassify.js` re-runs a saved draw offline after a rule change. Across five random draws totalling 1,700 products the classifier now produces no group outside what the category allows.

The two fixture suites matter most. Hand-written cases pass tidy category arrays like `['en:fruits']` straight to `classify()`, which is not what either API actually returns; running real saved responses through the full mapper is what catches category-vocabulary bugs.

## Status

Prototype, built August 2026, for professional use alongside clinical judgment. Not medical advice and not a medical device.
