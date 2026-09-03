# Traffic Light Food Logger: Project Orientation

A single-file web app for Traffic Light Diet food logging with clients or patients. Scan a package barcode, adjust the portion, and the app logs the food and codes it green, yellow, or red (or no colour) with the reasoning shown. Colours follow Epstein's *Food & Activity Reference Guide* (2012) exactly; see "How the app works". Built August 2026 as a working prototype; classification engine rewritten to the guide on 3 September 2026. This document is the handoff: read it first on a new machine.

## Quick start

1. Open `traffic_light_food_logger.html` in any modern browser. That's it; there is no build step, server, or install.
2. On a phone, the camera barcode scanner works best. On a laptop you can type barcode numbers or search by name instead. `verified_barcodes.csv` has 33 tested barcodes to try, spread across all three colors.
3. For real use, get a free USDA API key at https://api.data.gov/signup (takes a minute) and paste it into Settings inside the app. The bundled DEMO_KEY is limited to roughly 30 lookups per hour.

**Important:** data lives only while the page is open. Use the Backup (JSON) button to save a session and Restore to reload it. This is the prototype's biggest limitation; a production version needs real storage.

## Working on this from another computer

- The whole project is this folder on OneDrive: `OneDrive - University at Buffalo/Behavioral Medicine Lab (Neuwald)/traffic-light-project/`. It is a plain git repository; open the folder and you have everything. There is no build step and no dependency to install for the app itself.
- The current, complete code is on the `main` branch. Check with `git status` and `git log --oneline -5`; the top commit should describe the Traffic Light Diet engine.
- To run the tests you need Node.js and Python 3 on that machine, then `bash tests/extract_and_test.sh` (Git Bash on Windows). Everything runs offline.
- `.claude/worktrees/` is scratch space that Claude Code creates for side branches. Nothing there is needed; it is safe to ignore or delete once its branch is merged.
- OneDrive syncs the `.git` folder too. Let sync finish before switching machines, and never edit the same files on two machines at once without committing first; git will otherwise see a mess.
- The live site at https://nneuwald.github.io/traffic-light-food-logger/ is a separate GitHub remote. Pushing `main` there publishes; until then the public site runs the old (August) rules. See "Status and next steps".

## What's in this folder

| Path | What it is |
|---|---|
| `traffic_light_food_logger.html` | The entire app: HTML, CSS, and JavaScript in one file |
| `ORIENTATION.md` | This document |
| `verified_barcodes.csv` / `.json` | 33 US barcodes confirmed to resolve in Open Food Facts, with the color and reason the app assigns. Regenerate offline with `node tests/gen_verified_barcodes.js` |
| `screenshots/` | Light mode, dark mode, and USDA-search screenshots of the working app |
| `tests/` | Test harness for the classification engine (see Testing below) |
| `fixtures/` | Saved real API responses used by the tests, so they run offline |

## How the app works

**Data flow for a barcode:** scan or type a code, then the app queries Open Food Facts first (broadest barcode coverage). If not found, it retries USDA FoodData Central's Branded Foods using the `gtinUpc:` field query with the code zero-padded to 14 digits. **Name search** queries both databases in parallel and merges results, USDA lab-analyzed generic foods first, each labeled with its source.

**Classification** happens entirely on-device and implements Epstein's Traffic Light Diet as written in *The Food & Activity Reference Guide* (2012), not an approximation of it. The rule is one sentence: find the food group, take the calories in one Traffic Light serving, read the colour off the group's range (guide p.6). `detectGroup()` picks the group from Open Food Facts tags, the product name and the USDA category string; `classify()` applies the range. Only vegetables can be green (≤ 30 cal per ½ cup, yellow to 45, red above). Every other group is yellow up to a cap and red above it: starchy vegetables 120, fruit 90, grains 120, cheese 83, other dairy 135, meat & seafood 158, eggs/beans/substitutes 120, nuts 68, broth soups 186, chili and bean soups 224, condiments 23. Fruit juice, dried fruit and the fats/oils/sweets group are always red, diet drinks included. Water, plain tea and coffee, and seasonings carry no colour. Cold cereal is also red above 25% of calories from sugar, the guide's one nutrient rule. Combination foods get no range; the app flags them for the clinician. Every verdict shows its reasons, the group can be changed in a dropdown, and any colour can be overridden.

**Serving sizes.** The guide's ranges are per household serving (½ cup vegetables, 1 oz grain or cheese, 3 oz meat, 1 cup milk, 6 oz yogurt, 1 Tbsp condiment). The app converts per-100 g data at a gram estimate for each group, stored in `DEFAULT_RULES` and editable in Settings; a few foods carry their own estimate in `SERV_OVERRIDES` (cottage cheese ½ cup, nut butter 2 Tbsp, an egg, a pickle spear). The gram values were chosen so the guide's own listed foods come out the colour the guide prints. Where a product is listed in the guide, the guide wins.

**Known limits of this approach.** Foods sitting a few calories from a line (banana, cottage cheese, chicken broth) can flip on data quality: Open Food Facts lists Swanson broth at 10 kcal/100 g, which is 25 per cup and red, where the guide lists broth at 12 per cup and yellow. The colour and the number are always shown side by side so the clinician can see this. Raw leafy greens are judged at 35 g rather than 65 g because ½ cup of spinach weighs half what ½ cup of carrots does. Starchy vegetables (potato, corn, peas, beets, winter squash) are their own group and never green, exactly as the guide has them.

**Other structures worth knowing:** `state` holds clients and the log in memory. `foodFromOFF()` and `foodFromFDC()` normalize the two APIs into one food shape. `fdcCatsToTags()` adds Open Food Facts style tags to USDA foods; `detectGroup()` reads tags, name and USDA category together. The weekly view counts red foods against a per-client budget (default 14 per week, the guide's 2 a day) and the day view flags more than 2 on one day.

## Data sources

- **Open Food Facts** (https://world.openfoodfacts.org): community-maintained, ~4M products, no API key, CORS-open. Used for barcodes and branded search. Quality caveat: label-deep and occasionally stale; the app tells users to verify against the package.
- **USDA FoodData Central** (https://fdc.nal.usda.gov): official, free, CORS-open, needs an API key (https://api.data.gov/signup). Foundation / SR Legacy / Survey types are lab-analyzed or survey-derived generic foods; Branded is manufacturer label data. API docs: https://fdc.nal.usda.gov/api-guide.
- **Not yet integrated:** restaurant food. Candidates evaluated: CalorieKing (https://www.calorieking.com/us/en/developers/, strong chain coverage, commercial license, contact for pricing), Nutritionix (https://www.nutritionix.com/business/api), MenuStat (https://www.menustat.org, free snapshots). For independent restaurants, the standard practice is matching a generic USDA Survey (FNDDS) dish, which already works via name search.

## Testing

With Node.js and Python 3 installed, run `tests/extract_and_test.sh`. It re-extracts the JavaScript from the HTML and runs four suites, all offline:

- `tests_body.js`: ~30 hand-written classification checks (produce, staples, snacks, beverages, yogurt edge cases)
- `fdc_unit.js`: USDA mapping against `fixtures/fdc_search.json` and `fixtures/fdc_upc.json`
- `off_fixture_test.js`: 43 assertions over 33 saved Open Food Facts responses in `fixtures/off_products/`, covering color, the `isBeverage` flag, and the reason text
- `fdc_generic_test.js`: 11 assertions over saved USDA generic-food responses in `fixtures/fdc_generic/`

The fixture suites are the important ones. Hand-written cases pass tidy tag arrays like `['en:fruits']` straight to `classify()`, so they never exercise `foodFromOFF()` or `fdcCatsToTags()` against the messy vocabulary the APIs really return. Four classification bugs lived behind exactly that gap.

`tests/probe.js` discovers new barcodes and needs internet. `tests/gen_verified_barcodes.js` rebuilds `verified_barcodes.csv`/`.json` from the saved fixtures offline; run it after any change to `classify()` or `foodFromOFF()` so the published list cannot drift.

If you change classification rules, add a matching test case, and prefer a real saved API response over a hand-written one.

Past bugs worth remembering, all the same shape: **matching category text by substring instead of by whole word.**

- Open Food Facts files yogurts under "desserts", so plain Greek yogurt came out red
- The word "chocolate" contains "cola", so chocolate bars went through the soda detector
- `en:plant-based-foods-and-beverages` contains "beverages", and OFF puts it on nearly every plant food, so bread, peas, oats and pasta were all judged as drinks. Canned peas came out red
- `en:unsweetened-beverages` contains "sweetened-beverages", so bottled water was read as soda and came out red
- OFF files cereal grains under `en:seeds`, so rice and oats claimed the nut exemption from the fat and calorie-density rules

Two related non-substring bugs: the diet-drink escape required `sugars_100g` to be present, but OFF omits it on water and diet soda, so both fell through to red. And USDA Survey (FNDDS) records set `foodCategory` to the food's own WWEIA name ("Apples", "Carrots") rather than the "Fruits and Fruit Juices" wording Foundation and SR Legacy use, so generic produce got no tag and fell through to yellow.

All have regression tests. `hasCat()` now matches whole hyphen-delimited words, and `tagsLookLikeBeverage()` explicitly rejects the `*-foods-and-beverages` umbrella tags.

## Known limitations and roadmap ideas

No persistence beyond JSON backup files (the top priority for a production version). The single-file design exposes any API key in Settings to whoever has the file; fine for internal use, but a paid data source like CalorieKing would need a small server in the middle. Restaurant food coverage is thin pending a dedicated source. A real mobile app (React Native or similar) would add proper storage, accounts, camera reliability, and offline caching. Style note: no em dashes in app text.

## Status and next steps (3 September 2026)

**Done.** The classification engine implements the Food Reference Guide rule (food group, then calories per Traffic Light serving, then the group's range) with every threshold from the guide's page 6. Food group is auto-detected and editable per item. Four test suites pass offline. `verified_barcodes.csv` lists 33 real barcodes with their guide colour and group.

**Not yet pushed.** The GitHub Pages site still runs the August nutrient-threshold rules. Push `main` when you are happy with the new behaviour. Before publishing, decide whether reproducing the guide's serving sizes and ranges in a public app needs a word with Dr. Epstein; the guide's page 2 reserves those rights.

**Small fixes still open** (none change a colour):

1. CSV export writes every client's log, not just the selected one. `exportCsv()`.
2. The JSON backup embeds the USDA API key alongside client names.
3. The custom-food dialog no longer collects fat or sugar detail beyond the cereal rule; fine for the guide, worth a sentence in the UI if clinicians ask.
4. `user-scalable=no` in the viewport meta blocks pinch zoom on phones.
5. The CDN scanner script has no integrity hash.
6. `importJson()` does not validate entry shapes from hand-edited backups.
7. `tests/build_test.js` and friends slice the engine out of the HTML by matching section comments; renaming a comment breaks extraction.

**Judgment calls made in the rewrite, easy to revisit in Settings.** Serving gram estimates per group (vegetables 65 g, raw leafy greens 35 g, fruit 90 g, grains 28 g dry or 75 g cooked, cheese 28 g, dairy 245 g, yogurt 170 g, meat 85 g, beans 125 g, nuts 28 g, soups 245 g, condiments 15 g). Combination foods (pizza, sandwiches, frozen meals) get no colour range and are flagged for review, because the guide gives none. Broth is an ingredient (23-cal line), as the guide has it, which makes some store broths red on Open Food Facts' inflated data.

This is a prototype for professional use alongside clinical judgment, not medical advice or a medical device.
