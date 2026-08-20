# Traffic Light Food Logger

A single-file web app for traffic-light (Epstein Stoplight Diet) food logging with clients or patients. Scan a package barcode, adjust the portion, and the app logs the food and codes it green, yellow, or red with the reasoning shown.

**Live app: https://nneuwald.github.io/traffic-light-food-logger/**

Works on a phone (camera barcode scanning) or a laptop (type a barcode or search by name). Nothing to install.

## Try it

Open the live link above. `verified_barcodes.csv` lists 23 barcodes confirmed to resolve, if you want known-good codes to test with.

For more than casual use, get a free USDA API key at [api.data.gov/signup](https://api.data.gov/signup) and paste it into the app's Settings. The bundled `DEMO_KEY` is limited to roughly 30 lookups per hour.

**Data lives only while the page is open.** Use the Backup (JSON) button to save a session and Restore to reload it. This is the prototype's biggest limitation.

## How classification works

Lookups hit Open Food Facts first, then USDA FoodData Central as a fallback. Classification then happens entirely on-device: beverages get their own track, then red checks (treat categories, added sugar, fat, saturated fat, calorie density), then green checks (produce, very low calorie density, plain low-fat yogurt), and everything else lands yellow. Every verdict shows its reasons, and any color can be overridden per item.

All thresholds are editable in the app's Settings panel.

## Repository contents

| Path | What it is |
|---|---|
| `traffic_light_food_logger.html` | The entire app: HTML, CSS, and JavaScript in one file |
| `index.html` | Redirect so the site root opens the app |
| `ORIENTATION.md` | Full project orientation: architecture, data sources, thresholds, roadmap |
| `verified_barcodes.csv` / `.json` | 23 US barcodes confirmed to resolve, with assigned colors |
| `screenshots/` | Light mode, dark mode, and USDA-search screenshots |
| `tests/` | Test harness for the classification engine |
| `fixtures/` | Saved API responses so the tests run offline |

See [ORIENTATION.md](ORIENTATION.md) for the full technical writeup.

## Testing

With Node.js and Python 3 installed, run `tests/extract_and_test.sh`. It re-extracts the JavaScript from the HTML and runs the classification and USDA mapping suites against the offline fixtures.

## Status

Prototype, built August 2026, for professional use alongside clinical judgment. Not medical advice and not a medical device.
