# Traffic Light Food Logger: Project Orientation

A single-file web app for traffic-light (Epstein Stoplight Diet) food logging with clients or patients. Scan a package barcode, adjust the portion, and the app logs the food and codes it green, yellow, or red with the reasoning shown. Built August 2026 as a working prototype.

## Quick start

1. Open `traffic_light_food_logger.html` in any modern browser. That's it; there is no build step, server, or install.
2. On a phone, the camera barcode scanner works best. On a laptop you can type barcode numbers or search by name instead. `verified_barcodes.csv` has 23 tested barcodes to try.
3. For real use, get a free USDA API key at https://api.data.gov/signup (takes a minute) and paste it into Settings inside the app. The bundled DEMO_KEY is limited to roughly 30 lookups per hour.

**Important:** data lives only while the page is open. Use the Backup (JSON) button to save a session and Restore to reload it. This is the prototype's biggest limitation; a production version needs real storage.

## What's in this folder

| Path | What it is |
|---|---|
| `traffic_light_food_logger.html` | The entire app: HTML, CSS, and JavaScript in one file |
| `ORIENTATION.md` | This document |
| `verified_barcodes.csv` / `.json` | 23 US barcodes confirmed to resolve in Open Food Facts, with the color the app assigns |
| `screenshots/` | Light mode, dark mode, and USDA-search screenshots of the working app |
| `tests/` | Test harness for the classification engine (see Testing below) |
| `fixtures/` | Saved real API responses used by the tests, so they run offline |

## How the app works

**Data flow for a barcode:** scan or type a code, then the app queries Open Food Facts first (broadest barcode coverage). If not found, it retries USDA FoodData Central's Branded Foods using the `gtinUpc:` field query with the code zero-padded to 14 digits. **Name search** queries both databases in parallel and merges results, USDA lab-analyzed generic foods first, each labeled with its source.

**Classification** happens entirely on-device after the lookup. The engine (the `classify()` function in the file) applies rules in this order: beverages get their own track (water and skim milk green, plain milk yellow, sugary drinks and juice red), then red checks (treat/snack categories, added sugar, fat, saturated fat, calorie density), then green checks (produce, very low calorie density, plain low-fat yogurt), then everything else is yellow. Nuts and plain nut butters are exempted from the fat rule and capped at yellow. Every verdict shows its reasons as chips, and the clinician can override any color per item.

**Default thresholds** (all editable in the app's Settings panel, or in the `DEFAULT_RULES` object in the code): red at added sugar >= 10g/100g, fat >= 17g/100g, sat fat >= 8g/100g, or >= 400 kcal/100g without compensating protein; sugary drink at >= 5g sugars/100ml; green at <= 45 kcal/100g (<= 100 for fruits/vegetables). These operationalize Epstein's categories, which are defined conceptually in the literature but not as computable label thresholds; adjust them to match your program's protocol.

**Other structures worth knowing:** `state` holds clients and the log in memory. `foodFromOFF()` and `foodFromFDC()` normalize the two APIs into one food shape. `fdcCatsToTags()` maps USDA category strings onto the Open Food Facts tag vocabulary the classifier uses. The weekly view counts red foods against a per-client budget (default 4 per week).

## Data sources

- **Open Food Facts** (https://world.openfoodfacts.org): community-maintained, ~4M products, no API key, CORS-open. Used for barcodes and branded search. Quality caveat: label-deep and occasionally stale; the app tells users to verify against the package.
- **USDA FoodData Central** (https://fdc.nal.usda.gov): official, free, CORS-open, needs an API key (https://api.data.gov/signup). Foundation / SR Legacy / Survey types are lab-analyzed or survey-derived generic foods; Branded is manufacturer label data. API docs: https://fdc.nal.usda.gov/api-guide.
- **Not yet integrated:** restaurant food. Candidates evaluated: CalorieKing (https://www.calorieking.com/us/en/developers/, strong chain coverage, commercial license, contact for pricing), Nutritionix (https://www.nutritionix.com/business/api), MenuStat (https://www.menustat.org, free snapshots). For independent restaurants, the standard practice is matching a generic USDA Survey (FNDDS) dish, which already works via name search.

## Testing

With Node.js and Python 3 installed, run `tests/extract_and_test.sh`. It re-extracts the JavaScript from the HTML and runs two suites: ~30 classification checks against known foods (produce, staples, snacks, beverages, yogurt edge cases) and the USDA mapping tests using the real API fixtures in `fixtures/`. All should pass. `tests/probe.js` is the script that produced `verified_barcodes.json`; it needs internet.

If you change classification rules, add a matching test case. Two past bugs worth remembering: Open Food Facts files yogurts under "desserts" (so plain Greek yogurt was coming out red), and the word "chocolate" contains the substring "cola" (so chocolate bars were being routed through the soda detector). Both have regression tests.

## Known limitations and roadmap ideas

No persistence beyond JSON backup files (the top priority for a production version). The single-file design exposes any API key in Settings to whoever has the file; fine for internal use, but a paid data source like CalorieKing would need a small server in the middle. Restaurant food coverage is thin pending a dedicated source. A real mobile app (React Native or similar) would add proper storage, accounts, camera reliability, and offline caching. Style note: no em dashes in app text.

This is a prototype for professional use alongside clinical judgment, not medical advice or a medical device.
