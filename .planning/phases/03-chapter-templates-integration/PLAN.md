# Plan: Phase 3 — Drop-in Chapter Templates & Teammate Integration

## Objective
Deliver four polished, self-contained, drop-in chapter templates (`/hell`, `/alien`, `/ocean`, `/market`) matching the spooky Lovecraftian horror aesthetic. Each template provides a fully interactive demo puzzle, a shared Pyodide Web Worker runner with timeout protection, clear drop-in replacement markers for teammates, and verified integration with `room-client.js` via `Room.complete(chapter)`.

---

## Chapter Domains & Contract

| Chapter | Ingredient | Primary Domain | Interactive Mechanic & Visual Feedback |
| :--- | :--- | :--- | :--- |
| **`/hell`** | **Infernal Cheese** | Booleans & Conditions (`if/elif/else`) | Brimstone Gate Calibration: Calibrate thermal pressure locks; solving code opens the fiery vault doors. |
| **`/alien`** | **Cosmic Vegetables** | Loops (`for/while`), Lists & Off-by-one | Hydroponic Conveyor Automation: Loop through rogue bio-tendril pods to weed out parasites; repairs harvesting robotic arms. |
| **`/ocean`** | **Abyssal Sauce** | Functions, Recursion| Pressure Chamber De-acidification: Implement the dilution function; drains corrosive bio-acid from the vat. |
| **`/market`** | **Eldritch Bread** | Strings and arrays | Black Bazaar Ledger: Filter and sort occult vendor barter transactions; unlocks the hidden baker's vault. |

### Shared Chapter Contract
Each chapter page implements:
1. `<script src="/shared/room-client.js"></script>`
2. Automatic session restoration (keeps room code and player ID across refreshes).
3. Call to `Room.complete('<chapter>')` upon puzzle completion.
4. Top status HUD showing current Room Code, assigned Chef name, ingredient target, and connection status.
5. "DROP-IN CODE FOR TEAMMATES" demarcated boundaries so peers can replace the puzzle container with their own custom UI/engine without touching the networking logic.
6. Add a timer for each questions and depending on question's difficulty and length, and the questions resets if the player fails to complete the code in the given time.
7. On level completion add a Glowing animation around the ingredient showcasing the player acquired the ingredient And display waiting for other players at the bottom is other teammates have not completed their respective level.
---

## Detailed Tasks
## NOTE: USE STITCH FOR ALL DIFFERENT PUZZLES FRONT END AND THEMES MAKE IS GAMEY AND INTERACTIVE AS GIVEN BELOW ALSO GENERATE IMAGES AND  VIDEOS WHEREVER NEEDED 

### Task 1: Lightweight Web Worker Python Sandbox (`public/shared/python-worker.js`)
- Create an isolated Web Worker running in the background.
- Load Pyodide via CDN/Worker.
- Execute user Python code with timeout protection (3-second watchdog) preventing infinite `while True:` UI freezes.
- Run visible and hidden test assertions, returning structured test pass/fail results to the main thread.

### Task 2: Hell Chapter Template (`public/hell/index.html`)
- Fiery volcanic sulfur aesthetic with glowing lava cheese.
- 10 Basic to inetermediate Booleans and conditions in C programming language questions with pre written #include<stdio.h> and parenthesis' `def authenticate_brimstone_gate(temp, pressure, rune_sigil): ...`
- Interactive visual gate that unlatches and swings open upon test case pass.
- Calls `Room.complete('hell')` and displays "Ingredient Secured! Awaiting other chefs...".

### Task 3: Alien Chapter Template (`public/alien/index.html`)
- Bioluminescent cybernetic greenhouse aesthetic with writhing alien tendrils.
- Loop and list filtering puzzle: 10 Basic to inetermediate questions in C programming language questions with pre written #include<stdio.h> and parenthesis' `def filter_parasitic_tendrils(plant_list): ...`
- Interactive robotic conveyor arm that activates and purges infected pods upon test pass.
- Calls `Room.complete('alien')` and displays "Ingredient Secured! Awaiting other chefs...".

### Task 4: Ocean Chapter Template (`public/ocean/index.html`)
- Deep-sea Mariana trench chamber with bubbling abyssal sauce.
- Function & Recursion puzzle:10 Basic to inetermediate questions in C programming language questions with pre written #include<stdio.h> and parenthesis' `def brew_abyssal_dilution(formula_str, target_ph): ...`
- Interactive pressure gauge that normalizes and drains corrosive fluid upon test pass.
- Calls `Room.complete('ocean')` and displays "Ingredient Secured! Awaiting other chefs...".

### Task 5: Market Chapter Template (`public/market/index.html`)
- Occult midnight goblin market bazaar with shadow ledger.
- String and arrays 10 Basic to inetermediate questions in C programming language questions with pre written #include<stdio.h> and parenthesis' `def audit_vendor_ledger(transactions_dict): ...`
- Interactive vault safe that unlocks and reveals the wailing void sourdough upon test pass.
- Consolidated Market Judge API integration (`/api/judge`).
- Calls `Room.complete('market')` and displays "Ingredient Secured! Awaiting other chefs...".

### Task 6: Teammate Drop-in Documentation & Automated Verification
- Create `sandwich-hell/README-TEAMMATES.md` providing exact copy-paste guidelines for teammates.
- Run automated test suite verifying that all 4 chapter completion signals trigger the `/finale` transition.
