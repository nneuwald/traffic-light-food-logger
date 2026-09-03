# Random draw of 100 Open Food Facts products, judged against the guide

3 September 2026, seed 23. One hundred US products drawn at random across 50 Open Food Facts categories (random page, random products on the page), run through the app, and each verdict checked by hand against the Food Reference Guide. Rerun with `node tests/audit_random.js 100 23` then `node tests/audit_random_report.js`.

| Verdict | Products |
|---|---|
| App colour and group follow the guide's rule for the food | 92 |
| Rule applied correctly, but the database calorie value or its basis (raw, dry, condensed) is doubtful | 8 |
| Classifier wrong | 0 |
| **Total** | **100** |

## By app food group

| App group | Products | Follow the guide | Data doubtful |
|---|---|---|---|
| Vegetables | 5 | 5 | 0 |
| Starchy vegetables | 4 | 3 | 1 |
| Fruit | 5 | 5 | 0 |
| Juice & dried fruit | 4 | 4 | 0 |
| Grains | 15 | 15 | 0 |
| Cold cereal | 2 | 1 | 1 |
| Cheese | 3 | 3 | 0 |
| Milk, yogurt & other dairy | 5 | 5 | 0 |
| Meat & seafood | 6 | 5 | 1 |
| Eggs, beans & substitutes | 7 | 4 | 3 |
| Nuts | 2 | 2 | 0 |
| Fats, oils, sweets & others | 28 | 28 | 0 |
| Soup: broth/chowder | 2 | 0 | 2 |
| Condiments | 8 | 8 | 0 |
| Combination foods | 2 | 2 | 0 |
| No colour | 2 | 2 | 0 |

## Colour spread

| Colour | Products |
|---|---|
| green | 3 |
| yellow | 37 |
| red | 58 |
| no colour | 2 |

## Every product

| # | Sampled from | Product | Brand | kcal/100 g | App colour | App group | Cal per FRG serving | Verdict | Note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | breakfast-cereals | Frosted Flakes, Sweetened Flakes Of Corn Cereal | Malt-O-Meal | 387 | red | Cold cereal | 116 @ 30 g | follows guide |  |
| 2 | breakfast-cereals | Corn Flakes | Spartan | 406 | red | Cold cereal | 122 @ 30 g | data doubtful | Open Food Facts lists 406 kcal/100 g, which is high for plain corn flakes (label Corn Flakes are 100 per cup and yellow in the guide, p.77). Red follows from the data, not the rule. |
| 3 | breads | Flax oat bran & whole wheat pita bread | Joseph's | 177 | yellow | Grains | 49 @ 28 g | follows guide |  |
| 4 | breads | Kroger White Hot Dog Enriched Buns | Kroger | 282 | yellow | Grains | 79 @ 28 g | follows guide | Hamburger and hot dog buns were read as burgers (combination food) before this session; they are grain (p.29). |
| 5 | crackers | Snack crackers |  | 439 | red | Grains | 123 @ 28 g | follows guide |  |
| 6 | crackers | Crackers, cheddar cheese |  | 478 | red | Grains | 134 @ 28 g | follows guide |  |
| 7 | pastas | Orzo | Harris-Teeter Inc. | 357 | yellow | Grains | 100 @ 28 g | follows guide |  |
| 8 | pastas | Whole Grain Pasta | Fresh & Easy | 357 | yellow | Grains | 100 @ 28 g | follows guide |  |
| 9 | rices | Uncle bens original rice | Uncle Ben's | 160 | yellow | Grains | 120 @ 75 g | follows guide | 160 kcal/100 g reads as a cooked or pouch rice, so it is judged at 1/2 cup cooked: 120, yellow (p.29). |
| 10 | rices | Enriched long grain rice |  | 356 | yellow | Grains | 100 @ 28 g | follows guide |  |
| 11 | cereal-bars | Fruit & Grain Cereal Bars | Great Value | 351 | yellow | Grains | 98 @ 28 g | follows guide |  |
| 12 | cereal-bars | Kellogg'S Special K Cereal Bars Red Berries .88Oz | Kellogg's | 360 | yellow | Grains | 101 @ 28 g | follows guide |  |
| 13 | popcorn | Popcorn | Skinny Girl Snacks | 464 | red | Grains | 130 @ 28 g | follows guide | Oil-popped brands at 130 to 140 per oz are over the grain line. The guide prints plain air-popped popcorn yellow (113) and buttered red (p.29, p.31). |
| 14 | popcorn | Popcorn | Smart Sense | 500 | red | Grains | 140 @ 28 g | follows guide | Oil-popped brands at 130 to 140 per oz are over the grain line. The guide prints plain air-popped popcorn yellow (113) and buttered red (p.29, p.31). |
| 15 | tortillas | Fresh Milled Mighty Tortillas | One mighty mill | 255 | yellow | Grains | 71 @ 28 g | follows guide |  |
| 16 | tortillas | Street tacos corn tortillas | Mission | 227 | yellow | Grains | 64 @ 28 g | follows guide | Was read as tacos (combination food) before this session; tortillas are grain (p.30). |
| 17 | yogurts | Non-Fat Plain Greek Yogurt | Chobani | 53 | yellow | Milk, yogurt & other dairy | 90 @ 170 g | follows guide |  |
| 18 | yogurts | Yoplait peach 32 oz | Yoplait | 88 | red | Milk, yogurt & other dairy | 216 @ 245 g | follows guide | Judged at the label's 1-cup serving from a 32 oz tub: 216, red. The guide prints Yoplait Original red at 6 oz too (p.39). |
| 19 | cheeses | Mexican 4 Cheese Blend | Giant Eagle | 393 | red | Cheese | 110 @ 28 g | follows guide |  |
| 20 | cheeses | Mozzarella twists string cheese | Kroger | 292 | yellow | Cheese | 82 @ 28 g | follows guide |  |
| 21 | milks | Evaporated milk |  | 133 | red | Milk, yogurt & other dairy | 326 @ 245 g | follows guide | Guide lists whole evaporated milk red (p.38). The app judges it at 1 cup; the guide's own serving is 1/3 cup, red either way. |
| 22 | milks | Evaporated milk |  | 133 | red | Milk, yogurt & other dairy | 326 @ 245 g | follows guide | Guide lists whole evaporated milk red (p.38). The app judges it at 1 cup; the guide's own serving is 1/3 cup, red either way. |
| 23 | plant-based-milk-alternatives | Vanilla Oat Milk | Malk | 25 | yellow | Milk, yogurt & other dairy | 61 @ 245 g | follows guide |  |
| 24 | plant-based-milk-alternatives | Unsweetened Coconut Milk | Blue Dragon | 163 | red | Condiments | 24 @ 15 g | follows guide | Canned cooking coconut milk (163 kcal/100 g) is an ingredient at 1 Tbsp, red (p.75). Was read as a fat before this session; same colour, right group now. |
| 25 | ice-creams | Ice cream sandwiches | Kemps | 270 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 26 | ice-creams | Ice Cream Bars | Baskin Robbins | 317 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 27 | butters | President, butter, unsalted | President | 714 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 28 | butters | Salted Butter | Piggly Wiggly | 714 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 29 | meats | Mortadella | Citterio | 214 | red | Meat & seafood | 182 @ 85 g | follows guide |  |
| 30 | meats | Chicken Drumsticks | Forester Farmer's Market | 184 | yellow | Meat & seafood | 156 @ 85 g | data doubtful | Raw weight. At 3 oz raw with skin the app reads 156 (yellow); the guide judges cooked meat, and a roasted drumstick with skin is about 180 per 3 oz (red, p.49). |
| 31 | sausages | Hot Italian Sausage | Roundy's | 329 | red | Meat & seafood | 280 @ 85 g | follows guide |  |
| 32 | sausages | Bratwurst | Shurfine | 385 | red | Meat & seafood | 327 @ 85 g | follows guide |  |
| 33 | canned-fishes | Pole and line caught skipjack tuna |  | 99 | yellow | Meat & seafood | 84 @ 85 g | follows guide |  |
| 34 | canned-fishes | Chunk Light Tuna In Water | Essential Everyday | 108 | yellow | Meat & seafood | 92 @ 85 g | follows guide |  |
| 35 | eggs | Heirloom cage free blue eggs |  | 140 | yellow | Eggs, beans & substitutes | 70 @ 50 g | follows guide |  |
| 36 | eggs | Hard boiled eggs |  | 136 | yellow | Eggs, beans & substitutes | 68 @ 50 g | follows guide |  |
| 37 | legumes | The original boston baked beans candy coated peanuts, original |  | 467 | red | Fats, oils, sweets & others | n/a | follows guide | Candy-coated peanuts, not beans: red as a sweet (p.62), which the word "candy" catches. |
| 38 | legumes | Small Red Beans | Goya | 123 | red | Eggs, beans & substitutes | 154 @ 125 g | data doubtful | 123 kcal/100 g reads as drained beans; the guide lists canned kidney beans with liquid at 105 per 1/2 cup, yellow (p.41). Red follows from the data basis. |
| 39 | nuts | Roasted Cashews | Davis Lewis Orchards | 579 | red | Nuts | 162 @ 28 g | follows guide |  |
| 40 | nuts | Unsalted & Dry Roasted Peanuts | Southern Home | 600 | red | Nuts | 168 @ 28 g | follows guide |  |
| 41 | tofu | Extra Firm Tofu | House Foods | 92 | yellow | Eggs, beans & substitutes | 78 @ 85 g | follows guide |  |
| 42 | tofu | Soft Tofu |  | 59 | yellow | Eggs, beans & substitutes | 50 @ 85 g | follows guide |  |
| 43 | meat-alternatives | Veggie Burger | Decanto's Best | 329 | red | Eggs, beans & substitutes | 280 @ 85 g | data doubtful | 329 kcal/100 g is implausible for a veggie burger (typical 150 to 250; guide patties run 100 to 170, p.44 and p.54). The rule is applied correctly to bad data. |
| 44 | meat-alternatives | Veggie Burger | Decanto's Best | 329 | red | Eggs, beans & substitutes | 280 @ 85 g | data doubtful | 329 kcal/100 g is implausible for a veggie burger (typical 150 to 250; guide patties run 100 to 170, p.44 and p.54). The rule is applied correctly to bad data. |
| 45 | frozen-vegetables | Birds eye, artichoke hearts | Birds Eye | 48 | yellow | Vegetables | 31 @ 65 g | follows guide | Sits at 31 cals per 1/2 cup, one over the green line; the guide prints frozen artichoke hearts yellow too. |
| 46 | frozen-vegetables | Steamin' Easy, Petite Broccoli Florets | Big Y | 29 | green | Vegetables | 19 @ 65 g | follows guide |  |
| 47 | canned-vegetables | Whole Green Beans | Kings | 29 | green | Vegetables | 19 @ 65 g | follows guide |  |
| 48 | canned-vegetables | Peas & Carrots | Giant Eagle | 67 | yellow | Starchy vegetables | 54 @ 80 g | follows guide |  |
| 49 | fresh-vegetables | Baby Spinach | Trader Joe's | 24 | green | Vegetables | 8 @ 35 g | follows guide |  |
| 50 | fresh-vegetables | Sweet potato |  | 77 | yellow | Starchy vegetables | 62 @ 80 g | follows guide |  |
| 51 | salads | Grandma's, Macaroni Salad | Jaybee Mfg Corp | 321 | yellow | Combination foods | n/a | follows guide | Deli salads with dressing are mixed dishes; the guide has no range for them and the app flags them for review (p.8). |
| 52 | salads | Classic Chicken Salad Dressing | Food Lion | 229 | yellow | Combination foods | n/a | follows guide | Deli salads with dressing are mixed dishes; the guide has no range for them and the app flags them for review (p.8). |
| 53 | potatoes | Hashbrown Potatoes | Idaho Spuds | 375 | red | Starchy vegetables | 319 @ 85 g | data doubtful | Dehydrated product; calories are per dry weight. As prepared, 3 oz would be judged like the guide's hash browns (p.19 to 20). |
| 54 | potatoes | Sliced white potatoes | Kroger | 38 | yellow | Starchy vegetables | 30 @ 80 g | follows guide |  |
| 55 | fruits | Apples | Trout | 52 | yellow | Fruit | 47 @ 90 g | follows guide |  |
| 56 | fruits | Fresh frozen blueberries | Freedoms Choice | 50 | yellow | Fruit | 45 @ 90 g | follows guide |  |
| 57 | canned-fruits | Mixed fruit diced peaches, pears & pineapple in a naturally flavored light syrup, mixed fruit | Food Club | 71 | yellow | Fruit | 89 @ 125 g | follows guide | 89 cals per 1/2 cup, one under the fruit line; yellow as the guide prints fruit canned in juice (p.22). |
| 58 | canned-fruits | Yellow Cling Peaches In Heavy Syrup | Shurfine | 78 | red | Fruit | 98 @ 125 g | follows guide |  |
| 59 | dried-fruits | Sundried Figs | Sunshine Snacks | 250 | red | Juice & dried fruit | n/a | follows guide |  |
| 60 | dried-fruits | Premium Pitted Organic Dates, Deglet Noor | Desert Valley Date | 275 | yellow | Fruit | 66 @ 24 g | follows guide | Tagged "dried fruit" by Open Food Facts, but the guide lists dates under fresh fruit, yellow, at 3 deglet noor (p.21). Fixed in this session. |
| 61 | fruit-juices | Lemon Juice | 365 Everyday Value | 20 | yellow | Condiments | 3 @ 15 g | follows guide |  |
| 62 | fruit-juices | Gala style apple juice | Meijer | 46 | red | Juice & dried fruit | n/a | follows guide | Tagged "sweetened beverage" by Open Food Facts; red either way, and now filed under juice as the guide does (p.24). |
| 63 | sodas | Thirst quenching cola | Rite Aid Corporation | 42 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 64 | sodas | 7UP |  | 39 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 65 | waters | Sparkling Water Beverage | The Kroger Co. | 0 | free | No colour | n/a | follows guide |  |
| 66 | waters | Sparkling seltzer water | Kroger | 0 | free | No colour | n/a | follows guide |  |
| 67 | energy-drinks | Energy Drink | Monster Energy Company | 21 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 68 | energy-drinks | Bubblicious Cotton Candy Energy Drink | Ghost | 3 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 69 | iced-teas | Raspberry tea |  | 40 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 70 | iced-teas | Apple cider real brewed tea, apple cider |  | 28 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 71 | coffees | Hazelnut Cappuccino Mix | Great Value | 20 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 72 | coffees | Genius coffee | VitaCup | 51 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 73 | plant-based-beverages | Organic Orange Juice |  | 46 | red | Juice & dried fruit | n/a | follows guide |  |
| 74 | plant-based-beverages | Mango Juice Drink |  | 49 | red | Juice & dried fruit | n/a | follows guide |  |
| 75 | biscuits-and-cakes | Irish Cream Cheesecake | Chuckanut Bay Foods | 336 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 76 | biscuits-and-cakes | Chocolate Grahams | Honey Maid | 419 | yellow | Grains | 117 @ 28 g | follows guide |  |
| 77 | chocolates | Simple truth organic, dark chocolate | Simple Truth Organic | 550 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 78 | chocolates | Dark Chocolate | Ghirardelli Chocolate Company | 450 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 79 | candies | peanut butter bones | atkinson candy | 400 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 80 | candies | Passports Hard Candy Drops | Ragolds | 250 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 81 | salty-snacks | Barcel fuego | Barcel | 500 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 82 | salty-snacks | Tortilla chips Authentic blue corn masa | Herdez | 500 | red | Fats, oils, sweets & others | n/a | follows guide | Was read as grain before this session; the guide files tortilla chips under salty snacks, red (p.65). |
| 83 | crisps | Corn Chips | Shurfine | 571 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 84 | crisps | Tortilla Chips | Dehoff's Key Markets | 464 | red | Fats, oils, sweets & others | n/a | follows guide | Was read as grain before this session; the guide files tortilla chips under salty snacks, red (p.65). |
| 85 | frozen-desserts | Triple-filled light ice cream with chocolate fudge cores | Edys | 164 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 86 | frozen-desserts | First street cookies & cream premium ice cream | First Street | 241 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 87 | puddings | Peanut Butter Milk Chocolate Pudding | Dove | 140 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 88 | puddings | Vanilla Instant Pudding & Pie Filling | Baker's Corner | 375 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 89 | spreads | Organic Traditional Hummus | Nature's Promise | 280 | red | Condiments | 84 @ 30 g | follows guide |  |
| 90 | spreads | fromage fondu pour tartine | LAND'OR | 263 | yellow | Cheese | 74 @ 28 g | follows guide | Processed cheese spread; 2 Tbsp would be about 79 cals, matching the guide's light cheese spreads yellow (p.33). |
| 91 | jams | Bama, jam, grape | Bama | 250 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 92 | jams | Strawberry Jam | Hill country fare | 250 | red | Fats, oils, sweets & others | n/a | follows guide |  |
| 93 | soups | Soup | Taste Of Scandinavia Bakery & Cafe | 84 | red | Soup: broth/chowder | 206 @ 245 g | data doubtful | Product is named only "Soup". The Great Value one is a canned, probably condensed, soup whose per-100 g calories double the as-prepared value; the other is unverifiable. The rule is applied correctly. |
| 94 | soups | Soup | Great Value | 78 | red | Soup: broth/chowder | 190 @ 245 g | data doubtful | Product is named only "Soup". The Great Value one is a canned, probably condensed, soup whose per-100 g calories double the as-prepared value; the other is unverifiable. The rule is applied correctly. |
| 95 | condiments | Arrabbiata sauce |  | 64 | yellow | Vegetables | 38 @ 60 g | follows guide |  |
| 96 | condiments | Carolina Red style BBQ sauce | Wegmans | 106 | yellow | Condiments | 16 @ 15 g | follows guide |  |
| 97 | salad-dressings | Cilantro dressing | Trader Joe's | 167 | red | Condiments | 25 @ 15 g | follows guide | 25 cals per Tbsp, two over the condiment line: red, as the guide prints regular dressings (p.75). |
| 98 | salad-dressings | Organic goddess dressing | Full Circle | 433 | red | Condiments | 65 @ 15 g | follows guide |  |
| 99 | sauces | The Original Ranch, Fat Free Dressing | Hidden Valley | 83 | yellow | Condiments | 12 @ 15 g | follows guide |  |
| 100 | sauces | Seven seas viva italian dressing marinade |  | 6 | yellow | Condiments | 1 @ 15 g | follows guide |  |
