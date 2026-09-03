# Live audit of the classifier against Open Food Facts records

3 September 2026. 132 everyday US products were searched on Open Food Facts; each real record was run through the app's mapper and classifier and compared with the colour and group the Food Reference Guide gives that kind of food. Rerun with `node tests/audit_live.js` then `node tests/audit_report.js`.

## Summary by food group

| Expected group | Products | Match | Misses |
|---|---|---|---|
| Vegetables | 9 | 8 | 1 |
| Starchy vegetables | 6 | 4 | 2 |
| Fruit | 5 | 4 | 1 |
| Juice & dried fruit | 3 | 3 | 0 |
| Grains | 17 | 17 | 0 |
| Cold cereal | 10 | 8 | 2 |
| Cheese | 5 | 4 | 1 |
| Milk, yogurt & other dairy | 10 | 9 | 1 |
| Meat & seafood | 7 | 7 | 0 |
| Eggs, beans & substitutes | 5 | 5 | 0 |
| Nuts | 3 | 3 | 0 |
| Fats, oils, sweets & others | 28 | 27 | 1 |
| Soup: broth/chowder | 3 | 3 | 0 |
| Soup: chili/bean | 2 | 2 | 0 |
| Condiments | 12 | 12 | 0 |
| Combination foods | 4 | 4 | 0 |
| No colour | 3 | 3 | 0 |
| **Total** | **132** | **123** | **9** |

## The misses

| Searched for | Record returned | App | Guide expects | Why |
|---|---|---|---|---|
| campbells tomato juice 100% juice | Krave cereal with double chocolate flavored center | red / Cold cereal (124 cal @ 30 g) | yellow / Vegetables | Search returned a Krave cereal, not tomato juice; the app is right for the record it got |
| ore-ida golden tater tots | Ore-ida | yellow / no group | red / Starchy vegetables | Record is named only "Ore-ida" with no category tags, so there is nothing to classify on; the app asks the clinician to pick a group |
| ore-ida golden crinkles french fries | Golden crinkles french fried potatoes | red / Starchy vegetables (122 cal @ 85 g) | yellow / Starchy vegetables | Open Food Facts 143 kcal/100 g gives 122 per 3 oz; the label says 120 per 84 g. Sits exactly on the guide line |
| dole pineapple chunks in 100% juice | 100% pineapple juice from concentrate with vitamin c | red / Juice & dried fruit | yellow / Fruit | Search returned pineapple juice, which is correctly red |
| special k original cereal kellogg | Kellogg Special K | red / Cold cereal (110 cal @ 30 g) | yellow / Cold cereal | Record is a flavoured Special K at 32% of calories from sugar; red is right for that variant |
| post grape-nuts | Post grape nuts | yellow / Cold cereal (104 cal @ 30 g) | red / Cold cereal | Known limitation: dense cereal judged at 30 g like flakes, where the guide uses a heavier 1/4 or 1/2 cup and prints red |
| nesquik chocolate lowfat milk ready to drink | Lowfat Chocolate Drink | red / Fats, oils, sweets & others | red / Milk, yogurt & other dairy | Record "Lowfat Chocolate Drink" is tagged as a cocoa drink; red either way, the guide files chocolate milk under dairy (also red) |
| philadelphia original cream cheese brick | Whipped chive | yellow / Cheese (64 cal @ 28 g) | red / Cheese | Search returned whipped chive cream cheese, which the guide prints yellow (2 Tbsp, 62 cal); the app is right for that product |
| smucker strawberry jam | Smucker's Strawberry Jam | yellow / Condiments (9 cal @ 15 g) | red / Fats, oils, sweets & others |  |

## Every product

| Searched for | Record returned | Barcode | App colour | App group | Cal per FRG serving | Guide expects | Status |
|---|---|---|---|---|---|---|---|
| fresh baby spinach | Organic Fresh Baby Spinach | 0646670541032 | green | Vegetables | 10 @ 35 g | green / Vegetables | match |
| broccoli florets frozen | Great Value Broccoli Florets, Frozen, 32 oz | 0078742249728 | green | Vegetables | 23 @ 65 g | green / Vegetables | match |
| romaine lettuce hearts | Organic romaine | 0818431001479 | green | Vegetables | 6 @ 35 g | green / Vegetables | match |
| grape tomatoes | Grape Tomatoes | 0699058100154 | green | Vegetables | 20 @ 65 g | green / Vegetables | match |
| baby carrots | Baby carrots | 0041415112865 | green | Vegetables | 23 @ 65 g | green / Vegetables | match |
| del monte cut green beans | Del monte Cut Green Beans | 0024000162865 | green | Vegetables | 8 @ 65 g | green / Vegetables | match |
| prego traditional pasta sauce | Prego Traditional | 0051000025494 | yellow | Vegetables | 35 @ 60 g | yellow / Vegetables | match |
| v8 original vegetable juice | V8, 100% vegetable juice, original | 05101788 | red | Vegetables | 50 @ 240 g | red / Vegetables | match |
| campbells tomato juice 100% juice | Krave cereal with double chocolate flavored center | 0038000199301 | red | Cold cereal | 124 @ 30 g | yellow / Vegetables | colour+group differs |
| green giant whole kernel sweet corn can | Whole kernel sweet corn | 0037100090013 | yellow | Starchy vegetables | 24 @ 80 g | yellow / Starchy vegetables | match |
| birds eye sweet peas | Birds eye, baby sweet peas | 0014500022530 | yellow | Starchy vegetables | 64 @ 80 g | yellow / Starchy vegetables | match |
| ore-ida golden tater tots | Ore-ida | 0013120000485 | yellow | no group | n/a | red / Starchy vegetables | colour+group differs |
| ore-ida golden crinkles french fries | Golden crinkles french fried potatoes | 0013120002915 | red | Starchy vegetables | 122 @ 85 g | yellow / Starchy vegetables | colour differs |
| libby canned pumpkin | Pure Pumpkin Puree | 0039000045049 | yellow | Starchy vegetables | 30 @ 80 g | yellow / Starchy vegetables | match |
| ore-ida hash brown patties | Hash brown patties | 0041512100369 | red | Starchy vegetables | 148 @ 85 g | red / Starchy vegetables | match |
| dole mandarin oranges in juice | Dole Essentials Mandarin Oranges | 0038900020538 | yellow | Fruit | 69 @ 125 g | yellow / Fruit | match |
| del monte sliced peaches heavy syrup | Del monte, sliced peaches in heavy syrup | 0024000010623 | red | Fruit | 98 @ 125 g | red / Fruit | match |
| del monte fruit cocktail in 100% juice | Del monte quality, fruit cocktail in 100% fruit juice | 0024000167037 | yellow | Fruit | 60 @ 125 g | yellow / Fruit | match |
| mott natural applesauce unsweetened | Mott's, natural applesauce | 1917866442815 | yellow | Fruit | 51 @ 125 g | yellow / Fruit | match |
| sun-maid raisins | Sun-maid, yogurt raisins | 0041143092668 | red | Juice & dried fruit | n/a | red / Juice & dried fruit | match |
| ocean spray craisins | Ocean spray, craisins, dried cranberries | 0031200294517 | red | Juice & dried fruit | n/a | red / Juice & dried fruit | match |
| tropicana orange juice | Tropicana, 100% orange juice | 0048500305706 | red | Juice & dried fruit | n/a | red / Juice & dried fruit | match |
| welch fruit snacks | Welch's, fruit snacks | 0034856226796 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| dole pineapple chunks in 100% juice | 100% pineapple juice from concentrate with vitamin c | 0048500256749 | red | Juice & dried fruit | n/a | yellow / Fruit | colour+group differs |
| wonder classic white bread | Wonder Bread | 0072250011372 | yellow | Grains | 69 @ 28 g | yellow / Grains | match |
| thomas plain bagels | Thomas', mini bagels | 0048121216832 | yellow | Grains | 78 @ 28 g | yellow / Grains | match |
| nabisco ritz original crackers | Ritz | 0044000031114 | red | Grains | 140 @ 28 g | red / Grains | match |
| triscuit original | Triscuit Original | 71395265 | yellow | Grains | 120 @ 28 g | yellow / Grains | match |
| rold gold tiny twists original pretzels | Rold Gold Tiny Twists Original Pretzels .5 Ounce Plastic Bag | 0028400014571 | yellow | Grains | 119 @ 28 g | yellow / Grains | match |
| goldfish cheddar crackers | Goldfish colors cheddar crackers | 0014100096597 | red | Grains | 129 @ 28 g | red / Grains | match |
| cheez-it original | Cheez It Original | 0024100226429 | red | Grains | 140 @ 28 g | red / Grains | match |
| eggo homestyle waffles | Eggo homestyle waffles | 0038000402609 | yellow | Grains | 72 @ 28 g | yellow / Grains | match |
| nature valley crunchy oats n honey | Nature Valley Crunchy Oats 'N Honey | 0016000431010 | red | Grains | 127 @ 28 g | red / Grains | match |
| kellogg nutri-grain strawberry bar | Kellogg'S Nutri-Grain Cereal Bars Strawberry 1.55Oz | 0038000597749 | yellow | Grains | 42 @ 28 g | yellow / Grains | match |
| quaker chewy chocolate chip granola bar | Quaker Chewy Chocolate Chip Granola Bars 24 Pack | 0030000314050 | yellow | Grains | 117 @ 28 g | yellow / Grains | match |
| orville redenbacher movie theater butter popcorn | ORVILLE REDENBACHERS Movie Theater Butter Popcorn, 23.22 OZ | 0027000623145 | red | Grains | 127 @ 28 g | red / Grains | match |
| skinnypop original popcorn | Skinnypop popcorn | 0816925020272 | red | Grains | 150 @ 28 g | red / Grains | match |
| mission corn tortillas | Mission Red Corn Tortillas | 0073731002759 | yellow | Grains | 62 @ 28 g | yellow / Grains | match |
| barilla penne | Academia Barilla, Penne, Enriched Macaroni Product | 0076808004250 | yellow | Grains | 100 @ 28 g | yellow / Grains | match |
| minute white rice | Jasmin Bio Reis Weiss | 9120006000321 | yellow | Grains | 96 @ 28 g | yellow / Grains | match |
| quaker instant oatmeal maple brown sugar | Quaker Instant Oatmeal Maple & Brown Sugar | 0030000319581 | red | Grains | 161 @ 43 g | red / Grains | match |
| kellogg corn flakes | Kellogg's Corn Flakes Cereal .81oz | 0038000219320 | yellow | Cold cereal | 107 @ 30 g | yellow / Cold cereal | match |
| kellogg froot loops | Kellogg’s Froot Loops Tropical Cereal | 0038000234958 | red | Cold cereal | 108 @ 30 g | red / Cold cereal | match |
| kix crispy corn puffs cereal | Kix Cereal | 0016000171046 | yellow | Cold cereal | 120 @ 30 g | yellow / Cold cereal | match |
| kellogg raisin bran | Kellogg's Raisin Bran | 0041192102110 | red | Cold cereal | 97 @ 30 g | red / Cold cereal | match |
| special k original cereal kellogg | Kellogg Special K | 0038000271557 | red | Cold cereal | 110 @ 30 g | yellow / Cold cereal | colour differs |
| general mills lucky charms | Lucky Charms | 168948 | red | Cold cereal | 117 @ 30 g | red / Cold cereal | match |
| post grape-nuts | Post grape nuts | 0884912105219 | yellow | Cold cereal | 104 @ 30 g | red / Cold cereal | colour differs |
| general mills cinnamon toast crunch | General mills, cereal, cinnamon toast crunch | 0016666141544 | red | Cold cereal | 121 @ 30 g | red / Cold cereal | match |
| rice krispies toasted rice cereal | Rice krispies toasted rice cereal | 0038000863608 | yellow | Cold cereal | 114 @ 30 g | yellow / Cold cereal | match |
| quaker life cereal original | Original Life Cereal | 0030000061190 | yellow | Cold cereal | 114 @ 30 g | yellow / Cold cereal | match |
| fairlife 2% reduced fat ultra-filtered milk | Ultra 2% reduced fat ultra filtered organic milk | 0093966007176 | yellow | Milk, yogurt & other dairy | 133 @ 245 g | yellow / Milk, yogurt & other dairy | match |
| horizon organic whole milk | Horizon organic, organic whole milk | 0742365232459 | red | Milk, yogurt & other dairy | 152 @ 245 g | red / Milk, yogurt & other dairy | match |
| nesquik chocolate lowfat milk ready to drink | Lowfat Chocolate Drink | 0193476002552 | red | Fats, oils, sweets & others | n/a | red / Milk, yogurt & other dairy | group differs |
| yoplait original strawberry yogurt | YOPLAIT ORIGINAL STRAWBERRY | 0070470004303 | red | Milk, yogurt & other dairy | 216 @ 245 g | red / Milk, yogurt & other dairy | match |
| dannon light fit vanilla | Dannon Light + Fit Greek Vanilla Yogurt | 0036632032492 | yellow | Milk, yogurt & other dairy | 90 @ 170 g | yellow / Milk, yogurt & other dairy | match |
| chobani strawberry on the bottom greek yogurt | Chobani Greek Yogurt Fruit Bottom | 0818290014726 | yellow | Milk, yogurt & other dairy | 125 @ 170 g | yellow / Milk, yogurt & other dairy | match |
| kraft singles american cheese | American cheese singles | 0085239116593 | red | Cheese | 93 @ 28 g | red / Cheese | match |
| sargento string cheese | Sargento, string cheese snacks | 0046100007013 | yellow | Cheese | 82 @ 28 g | yellow / Cheese | match |
| philadelphia original cream cheese brick | Whipped chive | 0021000619870 | yellow | Cheese | 64 @ 28 g | red / Cheese | colour differs |
| breakstones all natural sour cream | All natural sour cream | 0041512102202 | red | Milk, yogurt & other dairy | 230 @ 115 g | red / Milk, yogurt & other dairy | match |
| daisy light sour cream | Daisy 8oz Sour Cream | 07342646 | red | Milk, yogurt & other dairy | 230 @ 115 g | red / Milk, yogurt & other dairy | match |
| silk original soymilk | Original soymilk | 0036800142138 | yellow | Milk, yogurt & other dairy | 103 @ 245 g | yellow / Milk, yogurt & other dairy | match |
| oatly oat drink original | Oatly Oatmilk Original 64oz | 0019064664110 | yellow | Milk, yogurt & other dairy | 123 @ 245 g | yellow / Milk, yogurt & other dairy | match |
| daisy cottage cheese 2% | Daisy cottage cheese 2pk | 0073420530648 | red | Cheese | 113 @ 113 g | red / Cheese | match |
| good culture cottage cheese 2% | Good culture cottage cheese | 0859977005330 | red | Cheese | 90 @ 113 g | red / Cheese | match |
| oscar mayer classic beef uncured franks | Uncured classic beef franks | 0073890037500 | red | Meat & seafood | 248 @ 85 g | red / Meat & seafood | match |
| oscar mayer oven roasted turkey breast deli | Oscar mayer, oven roasted turkey breast & white turkey | 0044700070642 | yellow | Meat & seafood | 96 @ 85 g | yellow / Meat & seafood | match |
| jennie-o lean ground turkey | Jennie-o, lean ground turkey | 0042222130080 | yellow | Meat & seafood | 129 @ 85 g | yellow / Meat & seafood | match |
| boca original vegan burger | Boca, Original Vegan Veggie Burgers | 0759283334455 | yellow | Eggs, beans & substitutes | 84 @ 85 g | yellow / Eggs, beans & substitutes | match |
| jif creamy peanut butter | Jif Creamy Peanut butter | 0051500720011 | red | Nuts | 184 @ 32 g | red / Nuts | match |
| blue diamond almonds | Blue diamond almonds | 0041570055779 | red | Nuts | 170 @ 28 g | red / Nuts | match |
| goya black beans | Goya black beans | 0041331023535 | yellow | Eggs, beans & substitutes | 96 @ 90 g | yellow / Eggs, beans & substitutes | match |
| bush original baked beans | Bush's original baked beans | 0039400016113 | red | Eggs, beans & substitutes | 147 @ 127 g | red / Eggs, beans & substitutes | match |
| tyson chicken nuggets | Tyson chicken nuggets | 16310230 | red | Meat & seafood | 219 @ 85 g | red / Meat & seafood | match |
| oscar mayer naturally hardwood smoked bacon | Oscar mayer, thick cut bacon, hardwood smoked | 1638936358354 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| jimmy dean pork sausage | Jimmy Dean pork sausage patties | 0077900001277 | red | Meat & seafood | 350 @ 85 g | red / Meat & seafood | match |
| bumble bee chunk light tuna in water 5 oz can | Bumble bee, chunk light tuna in vegetable oil | 0086600000367 | yellow | Meat & seafood | 106 @ 85 g | yellow / Meat & seafood | match |
| hormel canadian bacon | Hormel, uncured canadian bacon | 0037600747738 | yellow | Meat & seafood | 106 @ 85 g | yellow / Meat & seafood | match |
| eggland best eggs | Eggland's best egg | 0715141113570 | yellow | Eggs, beans & substitutes | 60 @ 50 g | yellow / Eggs, beans & substitutes | match |
| nasoya tofu firm | Firm Tofu | 0028346094101 | yellow | Eggs, beans & substitutes | 80 @ 85 g | yellow / Eggs, beans & substitutes | match |
| planters dry roasted peanuts | Planters Dry Roasted Peanuts plastic can | 0029000027114 | red | Nuts | 160 @ 28 g | red / Nuts | match |
| pepsi cola | Pepsi Cola, 12 Fl Oz, | 01256808 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| coca-cola zero sugar | Coca-Cola Zero Sugar | 0049000045840 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| sprite | Sprite | 04913207 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| lacroix sparkling water | Naturally Essenced Coconut Sparkling Water | 0012993101015 | free | No colour | n/a | free / No colour | match |
| perrier | Perrier | 0071610202887 | free | No colour | n/a | free / No colour | match |
| propel electrolyte water | Grape Propel Electrolyte Water | 0052000506488 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| vitaminwater zero | Vitamin water, vitaminwater zero squeezed, lemonade, lemonade | 0786162002976 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| gatorade zero | Gatorade zero | 0052000047752 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| red bull energy drink | Red bull, energy drink | 0611269206432 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| pure leaf unsweetened tea | Pure leaf unsweetened | 0012000173202 | free | No colour | n/a | free / No colour | match |
| arizona sweet tea | Arizona Sweet Tea | 0613008753122 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| lipton diet green tea citrus | Lipton Diet Green Tea Citrus | 17548786 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| minute maid lemonade | Minute Maid - Lemonade | 0025000053818 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| starbucks frappuccino mocha bottle | Mocha Frappuccino | 01264904 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| swiss miss hot cocoa mix | Swiss miss, hot cocoa mix | 0015700072004 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| snickers bar | Snickers, bars | 0040000512554 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| lays classic potato chips | Lay's Classic Potato chips | 0028400097802 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| nutella hazelnut spread | Nutella & go! hazelnut spread + breadsticks | 0009800800049 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| land o lakes salted butter | Land O Lakes Salted Butter | 0034500151924 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| hellmann real mayonnaise | Hellmann's, real mayonnaise | 0048001139978 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| smucker strawberry jam | Smucker's Strawberry Jam | 0051500040256 | yellow | Condiments | 9 @ 15 g | red / Fats, oils, sweets & others | colour+group differs |
| splenda no calorie sweetener | Splenda Naturals Stevia No Calorie Sweetener | 0722776001561 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| coffee mate original creamer | Coffee mate the original coffee creamer | 0050000109340 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| pop-tarts frosted strawberry | Kellogg's Pop-Tarts Frosted Strawberry 1.83oz | 0038000322105 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| chips ahoy original cookies | Chips Ahoy Original | 8410000001013 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| haribo goldbears gummy bears | Haribo Goldbears | 0042238302266 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| yasso frozen greek yogurt bars | Yasso, Frozen Greek Yogurt Bars, Mint Chocolate Chip | 0851035003395 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| cool whip original | Whipped topping lite | 0043000009505 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| planters trail mix | Planters, trail mix, peanut butter chocolate, peanut butter chocolate | 0029000021112 | red | Fats, oils, sweets & others | n/a | red / Fats, oils, sweets & others | match |
| campbell condensed chicken noodle soup | Campbell's condensed soup chicken | 0051000021076 | yellow | Soup: broth/chowder | 61 @ 245 g | yellow / Soup: broth/chowder | match |
| progresso lentil soup | Progresso Organic Savory Lentil Soup | 0041196492842 | yellow | Soup: chili/bean | 127 @ 245 g | yellow / Soup: chili/bean | match |
| hormel chili with beans | Hormel, chili with beans | 0037600046978 | red | Soup: chili/bean | 265 @ 245 g | red / Soup: chili/bean | match |
| maruchan ramen chicken | Ramen shrimp | 0041789002175 | red | Soup: broth/chowder | 1083 @ 245 g | red / Soup: broth/chowder | match |
| campbell condensed tomato soup | Campbell's condensed soup tomato | 0051000134585 | yellow | Soup: broth/chowder | 108 @ 245 g | yellow / Soup: broth/chowder | match |
| swanson beef broth | Swanson broth beef | 0051000267924 | yellow | Condiments | 15 @ 245 g | yellow / Condiments | match |
| heinz tomato ketchup | Heinz tomato ketchup | 0013000004664 | yellow | Condiments | 18 @ 15 g | yellow / Condiments | match |
| french classic yellow mustard | French's, classic yellow mustard imp | 0041500000251 | yellow | Condiments | 0 @ 15 g | yellow / Condiments | match |
| hidden valley original ranch | Hidden valley, original ranch topping & dip | 0071100211344 | red | Condiments | 130 @ 30 g | red / Condiments | match |
| sabra classic hummus | Sabra, hummus, chipotle | 0040822014724 | red | Condiments | 75 @ 30 g | red / Condiments | match |
| tostitos chunky salsa | Tostitos Chunky Salsa Medium 46.50 Ounce Glass Jar | 0028400043052 | yellow | Condiments | 9 @ 30 g | yellow / Condiments | match |
| sweet baby ray barbecue sauce | Sweet baby rays barbecue sauce | 0013409000045 | red | Condiments | 29 @ 15 g | red / Condiments | match |
| kikkoman soy sauce | Kikkoman, soy sauce | 0041390000027 | yellow | Condiments | 10 @ 15 g | yellow / Condiments | match |
| frank redhot original | Frank’s RedHot Injectable Marinade | 0041500012285 | yellow | Condiments | 0 @ 15 g | yellow / Condiments | match |
| reddi-wip original | REDDI WIP Original, 15 OZ | 0070272482354 | yellow | Condiments | 9 @ 3 g | yellow / Condiments | match |
| newman own balsamic vinaigrette | Newman's own, organics balsamic vinaigrette | 0020662005847 | red | Condiments | 50 @ 15 g | red / Condiments | match |
| heinz homestyle brown gravy | Homestyle Brown Gravy Mix | 0042187429519 | red | Condiments | 200 @ 60 g | red / Condiments | match |
| digiorno pepperoni pizza | Pepperoni Pizza | 742832056225 | yellow | Combination foods | n/a | yellow / Combination foods | match |
| hot pockets pepperoni pizza | Pepperoni pizza | 0043695071115 | yellow | Combination foods | n/a | yellow / Combination foods | match |
| smucker uncrustables peanut butter | Uncrustables smucker's peanut butter & grape | 0051500040317 | yellow | Combination foods | n/a | yellow / Combination foods | match |
| kraft macaroni and cheese original | Original macaroni & cheese dinner, original macaroni & cheese | 0018894360155 | yellow | Combination foods | n/a | yellow / Combination foods | match |
