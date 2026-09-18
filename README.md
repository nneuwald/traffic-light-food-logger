# Traffic Light Food Logger

A single-file web app for traffic-light (Epstein Stoplight Diet) food logging with clients or patients. Scan a package barcode, adjust the portion, and the app logs the food and codes it green, yellow, or red with the reasoning shown.

**Live app: https://nneuwald.github.io/traffic-light-food-logger/**

Works on a phone (camera barcode scanning) or a laptop (type a barcode or search by name). Nothing to install.

## Try it

Open the live link above. `verified_barcodes.csv` lists 33 barcodes covering all three colors plus "no colour" water. They were confirmed before the app became USDA-only, so some no longer resolve: USDA Branded carries manufacturer submissions rather than every package on a US shelf. Search by name, or use Custom food, for anything that misses.

For more than casual use, get a free USDA API key at [api.data.gov/signup](https://api.data.gov/signup) and paste it into the app's Settings. The key is remembered on that device. The bundled `DEMO_KEY` allows only about 10 searches an hour per network (measured September 2026), so a clinic will run it out in minutes.

**Data lives only while the page is open.** Use the Backup (JSON) button to save a session and Restore to reload it. This is the prototype's biggest limitation.

## How classification works

Lookups go to USDA FoodData Central and nowhere else: Foundation, SR Legacy and Survey (FNDDS) for generic foods, Branded for packages. Classification then happens entirely on-device and follows Epstein's Traffic Light Diet exactly as set out in *The Food & Activity Reference Guide* (2012):

1. **Find the food group.** Vegetables, starchy vegetables, fruit, juice & dried fruit, grains, cold cereal, cheese, other dairy, meat & seafood, eggs/beans/meat substitutes, nuts, fats/oils/sweets, two soup groups, condiments, combination foods, or "no colour" (water, plain tea and coffee, seasonings). The app reads the group from the product name and the USDA category, which `fdcCatsToTags()` turns into the classifier's category tags; the clinician can change it with one dropdown.
2. **Take the calories in one Traffic Light serving** and read the colour off the group's range (guide p.6). Only vegetables can be green (≤ 30 cal per ½ cup). Everything else is yellow up to its group's cap and red above it.
3. **Apply the guide's absolutes.** Fruit juice, dried fruit and the whole fats/oils/sweets group are always red, diet soda included. Water, plain tea and coffee carry no colour. Cold cereal is also red when more than 25% of its calories come from sugar.
4. **Take mixed dishes apart.** The guide gives combination foods no calorie range. It says a dish is red if it holds one full serving of a red food, and that serving can be made up of several red foods together (p.8). The app applies that rule three ways. The **Combination food** button logs the parts, a sandwich as its bread, meat, cheese and mayonnaise, colours each one and adds up the red servings, then saves it as a reusable recipe. For packaged food the app does that decomposition automatically: USDA publishes no ingredient percentages, so the app estimates them from the order the ingredients are listed in, which is the one thing a US label guarantees. If neither is possible it asks the one question rather than guessing, and the dish is never counted as yellow until someone answers.
5. **Count servings, not items.** The guide's daily limit is "2 or less servings of RED foods" (p.3), and its serving is often not the label's: a plain bagel is ¼ bagel in the guide and a whole bagel on the package. The portion buttons multiply the label serving, which is what the client is holding, and the app converts that to FRG servings, shows both scales, stores the figure with each entry, and adds up red servings against the daily and weekly budget. When a product record carries no label serving the app opens at the guide's serving for the group, 1 oz for cheese, rather than at 100 g, and a weight in grams can be typed instead.

Every verdict shows its reasons, the food group can be changed, and any colour can be overridden per item. Serving sizes are gram estimates of the guide's household servings; they and every threshold are editable in Settings. The guide allows no more than 2 red servings a day, so a new client's weekly budget defaults to 14.

## Repository contents

| Path | What it is |
|---|---|
| `traffic_light_food_logger.html` | The entire app: HTML, CSS, and JavaScript in one file |
| `index.html` | Redirect so the site root opens the app |
| `ORIENTATION.md` | Full project orientation: architecture, data sources, thresholds, roadmap |
| `Rules explained.docx` | The classification rules in plain language for clinicians: each group's serving and colour lines, the order the app checks groups, combination foods, portions and the daily limit |
| `verified_barcodes.csv` / `.json` | 33 US barcodes confirmed to resolve, with assigned colors and reasons (3 green, 15 yellow, 12 red, 3 no colour) |
| `screenshots/` | Light mode, dark mode, and USDA-search screenshots |
| `tests/` | Test harness: eight suites covering the classification engine, the USDA mapper, the lookup flow, the ingredient estimator and 155 everyday foods end to end |
| `fixtures/` | Saved USDA responses, plus an Open Food Facts corpus kept purely as classifier test data, so the tests run offline |

See [ORIENTATION.md](ORIENTATION.md) for the full technical writeup.

## Testing

With Node.js installed, run `bash tests/extract_and_test.sh`. It re-extracts the JavaScript from the HTML and runs eight suites against offline fixtures: 237 hand-written classification and portion checks, 11 USDA mapping checks, 39 assertions over a saved corpus of real category vocabulary, 17 over saved USDA generic-food responses, 23 checks of the name-search plumbing (request shape and ranking), 15 of the lookup flow itself (what a barcode miss says, how results are ordered, how a USDA outage reads), 23 of the ingredient-list parsing behind combination foods, and 155 everyday foods carried through the USDA mapper and the classifier together.

Three internet audits complement them. `node tests/audit_live.js` pulls about 130 named everyday US products and compares each with the guide. `node tests/audit_random.js 400 <seed>` draws products at random across 57 categories. `node tests/audit_analyze.js <file>` then checks every drawn product automatically: each category implies which food groups a product from it could legitimately take, so anything outside that set is printed for review. `node tests/audit_reclassify.js` re-runs a saved draw offline after a rule change. Across five random draws totalling 1,700 products the classifier now produces no group outside what the category allows.

The two fixture suites matter most. Hand-written cases pass tidy category arrays like `['en:fruits']` straight to `classify()`, which is not what an API actually returns; running real saved responses through a mapper is what catches category-vocabulary bugs.

## Status

Prototype, built August 2026, for professional use alongside clinical judgment. Not medical advice and not a medical device.
