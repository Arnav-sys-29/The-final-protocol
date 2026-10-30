---
phase: 06-final-fixing-tutorials-cinematics
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - sandwich-hell/server.js
  - sandwich-hell/public/shared/room-client.js
  - sandwich-hell/public/shared/chapter-hud.js
  - sandwich-hell/public/shared/chapter-hud.css
  - sandwich-hell/public/finale/index.html
  - sandwich-hell/public/finale/boss-c-questions.js
  - sandwich-hell/public/alien/index.html
  - sandwich-hell/public/hell/index.html
  - sandwich-hell/public/ocean/index.html
  - sandwich-hell/public/market/index.html
  - sandwich-hell/public/lobby/index.html
  - sandwich-hell/test-puzzle-suite.js
  - sandwich-hell/test-multi-room.js
  - sandwich-hell/test-e2e-simulation.js
autonomous: true
requirements:
  - LAB-PORT-FORWARD-CONNECTIVITY
  - MULTI-ROOM-ISOLATION
  - REMOVE-DEV-OPTIONS
  - COMPREHENSIVE-PUZZLE-TESTING
  - E2E-SIMULATION-COMBAT-BALANCE

estimate:
  tokens: 45000
  raw_tokens: 30000
  tasks: 5
  confidence: high

must_haves:
  truths:
    - "Multiple PCs in a computer lab connecting via a forwarded port (e.g. ngrok, Cloudflare tunnel, VS Code Port Forwarding) or local LAN connect via window.location.origin with zero hardcoded localhost references."
    - "The Node.js server binds to 0.0.0.0:3000 and properly trusts reverse proxy / forwarded headers (X-Forwarded-For, X-Forwarded-Proto) with permissive CORS and WebSocket/polling fallbacks."
    - "Players can join active rooms solely using their room code without entering custom names, and multiple simultaneous rooms execute concurrently with zero state leakage."
    - "Custom room code creation (2-12 uppercase alphanumeric characters) and random 6-character room codes both work reliably and validate collisions."
    - "All developer cheat buttons (⚡ INSTANT WIN, 💀 INSTANT LOSE, ⚡ Complete All 4 / Bypass Ingredients, ⚡ Win All) are completely removed from level HUDs, Gathering Gate, and the Boss Arena."
    - "All 42 puzzle challenges across Hell (10), Alien (12), Ocean (10), and Market (10) pass validation, along with the 6-question solve quota and skip functionality in every level."
    - "The Boss Battle is balanced to a 12-second countdown timer, 15% damage per strike/miss across 20 corrupted C questions, followed by synchronized fullscreen WIN.mp4 or LOSE.mp4 playback, ending stats, and clean return to main page."
  artifacts:
    - "sandwich-hell/server.js"
    - "sandwich-hell/public/shared/room-client.js"
    - "sandwich-hell/public/shared/chapter-hud.js"
    - "sandwich-hell/public/finale/index.html"
    - "sandwich-hell/public/alien/index.html"
    - "sandwich-hell/test-puzzle-suite.js"
    - "sandwich-hell/test-multi-room.js"
    - "sandwich-hell/test-e2e-simulation.js"
  key_links:
    - "Socket.IO relative URL connection in room-client.js -> Express 0.0.0.0 server binding & trust proxy"
    - "In-memory rooms[code] dictionary in server.js -> Multi-room isolation across independent teams"
    - "Level solve quota (REQUIRED_SOLVES = 6) & skip buttons in chapter HTMLs -> Room.complete() triggers"
    - "Boss combat 12s timer & 15% damage state in index.html & server.js -> Video overlay and victory/defeat stats"
---

<objective>
Execute the definitive Phase 6 gameplay polish, security hardening, and test verification for "The Legendary Sandwich From Hell":
1. Ensure flawless connectivity for multiple PCs in a computer lab opening forwarded port or LAN links (0.0.0.0 binding, origin-relative client sockets, CORS, reverse proxy trust).
2. Guarantee room joining with room code alone and multi-room isolation with zero state leak across simultaneous student sessions.
3. Remove all developer cheats and test buttons (INSTANT WIN, INSTANT LOSE, Bypass Ingredients, Win All) across all levels and the finale.
4. Execute comprehensive automated verification of every single puzzle: all 10 Hell challenges, all 12 Alien challenges, all 10 Ocean recipes, all 10 Market problems, and the 6-solve quota & skip controls in all 4 levels.
5. Perform full end-to-end multi-room simulation & combat balancing: 12-second timer per C bug, 15% damage per strike/miss, synchronized WIN.mp4 and LOSE.mp4 video sequences, team stats, and return to main page.

Purpose: Deliver a production-grade, cheat-free, resilient multiplayer lab experience ready for live classroom and tournament play.
Output: Hardened source files, removed dev bypasses, comprehensive test suites (`test-puzzle-suite.js`, `test-multi-room.js`, `test-e2e-simulation.js`), and a final verification report.
</objective>

<execution_context>
@~/.gemini/antigravity/gsd-core/workflows/execute-plan.md
@~/.gemini/antigravity/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@sandwich-hell/server.js
@sandwich-hell/public/shared/room-client.js
@sandwich-hell/public/shared/chapter-hud.js
@sandwich-hell/public/finale/index.html
@sandwich-hell/public/finale/boss-c-questions.js
@sandwich-hell/public/alien/index.html
@sandwich-hell/public/hell/index.html
@sandwich-hell/public/ocean/index.html
@sandwich-hell/public/market/index.html
@sandwich-hell/public/lobby/index.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: Port Forwarding, Reverse Proxy & Network Hardening for Multi-PC Lab Access</name>
  <files>
    sandwich-hell/server.js,
    sandwich-hell/public/shared/room-client.js,
    sandwich-hell/public/lobby/index.html
  </files>
  <action>
    Hardening network configuration for multi-PC computer lab access through port forwarding, local network IP, or tunneling services (ngrok, Cloudflare Tunnel, VS Code Port Forwarding):
    1. In `sandwich-hell/server.js`:
       - Add `app.set('trust proxy', 1);` immediately after Express initialization so forwarded protocols (`X-Forwarded-Proto`, `X-Forwarded-For`, `Host`) are properly resolved when behind reverse proxies.
       - Ensure `io` Server is configured with permissive CORS and multi-transport support: `cors: { origin: '*', methods: ['GET', 'POST'] }, transports: ['websocket', 'polling']`.
       - Confirm `server.listen(PORT, '0.0.0.0')` is strictly preserved.
       - Update `/api/server-info` to return request host header fallback: if accessed via a domain/tunnel, return `tunnelUrl: `${req.protocol}://${req.get('host')}/lobby``.
    2. In `sandwich-hell/public/shared/room-client.js`:
       - Verify that `io()` connection initialization uses relative connection without specifying a static host: `this.socket = io({ transports: ['websocket', 'polling'], reconnection: true, reconnectionAttempts: Infinity, reconnectionDelay: 1000 });`. This ensures clients connect seamlessly via `window.location.origin` whether accessed via `http://localhost:3000`, `http://192.168.x.x:3000`, or a public forwarded port link.
    3. In `sandwich-hell/public/lobby/index.html`:
       - Update the LAN / Multi-PC information box to show the active browser origin (`window.location.origin + '/lobby'`) if the host is not localhost, allowing 1-click copy of the exact URL teammates need to open in the lab.
    4. Codebase Audit:
       - Verify there are ZERO hardcoded `http://localhost` strings in any client-side JavaScript or HTML files under `sandwich-hell/public/`.
  </action>
  <verify>
    <automated>node -e "const fs = require('fs'); const s = fs.readFileSync('sandwich-hell/server.js', 'utf8'); if (!s.includes('0.0.0.0')) throw new Error('Missing 0.0.0.0 binding'); if (!s.includes('trust proxy')) throw new Error('Missing trust proxy configuration'); const rc = fs.readFileSync('sandwich-hell/public/shared/room-client.js', 'utf8'); if (rc.includes('http://localhost')) throw new Error('Found hardcoded localhost in room-client.js'); console.log('Network hardening verified.');"</automated>
  </verify>
  <done>
    Server binds to 0.0.0.0:3000 with trust proxy enabled and CORS/transports configured; client scripts connect via window.location.origin with zero hardcoded localhost references.
  </done>
</task>

<task type="auto">
  <name>Task 2: Room Code Joining & Multi-Room Concurrency State Isolation</name>
  <files>
    sandwich-hell/server.js,
    sandwich-hell/public/lobby/index.html,
    sandwich-hell/public/shared/room-client.js,
    sandwich-hell/test-multi-room.js
  </files>
  <action>
    Ensure seamless room joining solely via room code and prove zero state leakage across simultaneous student teams:
    1. In `sandwich-hell/server.js`:
       - In `join_room` handler: When `playerName` is omitted or empty, auto-generate a fallback `Chef ${playerCount + 1}` so players can join rooms typing only the room code without requiring a name.
       - Verify `create_room` supports both custom room codes (2 to 12 alphanumeric characters) and random 6-character codes (using ambiguous-character-free charset).
       - Ensure all room state (`phase`, `players`, `claims`, `completed`, `bossHealth`, `leaderHealth`, `currentBossQ`) is strictly scoped to `rooms[code]`. Confirm no module-level global variables leak state between different rooms.
       - Ensure `socket.join('room_' + code)` and `socket.leave('room_' + code)` cleanly isolate broadcast channels (`io.to('room_' + code)`).
    2. In `sandwich-hell/public/lobby/index.html`:
       - In `handleSubmit()` for join mode: If player name is blank, allow submission and pass an empty or default name to `Room.join(code, '')`.
    3. Create `sandwich-hell/test-multi-room.js`:
       - Script simulating two concurrent rooms running at the same time:
         - Room 1: Code `TEAM01`, 4 players (Leader, Cheese, Veg, Sauce).
         - Room 2: Code `TEAM02`, 4 players (Leader, Cheese, Veg, Bread).
       - Advance Room 1 through chapter claims, completing Hell and Alien.
       - Verify Room 2's chapter claims and completions remain completely untouched (empty/false).
       - Advance Room 1 to Boss battle; verify Room 1 combat events do not emit to Room 2.
       - Verify both rooms can co-exist and complete independently without any state collisions.
  </action>
  <verify>
    <automated>node sandwich-hell/test-multi-room.js</automated>
  </verify>
  <done>
    Players can join rooms using only the room code; multiple simultaneous rooms operate concurrently with zero cross-room event or state leakage.
  </done>
</task>

<task type="auto">
  <name>Task 3: Complete Removal of Dev Cheats, Instant Win & Bypass Controls</name>
  <files>
    sandwich-hell/public/finale/index.html,
    sandwich-hell/public/shared/chapter-hud.js,
    sandwich-hell/public/shared/chapter-hud.css,
    sandwich-hell/server.js
  </files>
  <action>
    Strip all developer shortcuts, instant win buttons, and cheat bypasses so students cannot skip puzzles or boss combat:
    1. In `sandwich-hell/public/finale/index.html`:
       - Remove `#btn-boss-instant-win` ("⚡ INSTANT WIN") and `#btn-boss-instant-lose` ("💀 INSTANT LOSE") from the Leader Boss arena action grid.
       - Update `.pkmn-actions-grid` from `grid-template-columns: repeat(4, 1fr)` to `grid-template-columns: repeat(2, 1fr)` (or responsive 1fr 1fr) so `⚔️ ATTACK` and `🔄 RESET` span the action area cleanly and legibly.
       - Remove click handlers for `bossInstantWinBtn` and `bossInstantLoseBtn`.
       - In Stage 1 Gathering Gate: Remove `#btn-bypass-ingredients` ("⚡ Complete All 4 (Instant Win)") button and its click handler. Only the genuine "Assemble Sandwich →" button should remain (disabled until all 4 ingredients are collected).
       - Remove `#btn-toggle-hint` and `#prob-hint` from the Boss arena if any residual references remain.
    2. In `sandwich-hell/public/shared/chapter-hud.js`:
       - Remove `#hud-instant-win` ("⚡ Instant Win") and `#hud-win-all` ("⚡ Win All") buttons from the top HUD strip HTML template.
       - Remove their click event handlers (`hud-instant-win` and `hud-win-all`).
       - Keep the `"❓ How to Play"` and `"📜 Choose Level"` buttons.
    3. In `sandwich-hell/public/shared/chapter-hud.css`:
       - Clean up any unused `.hud-btn.win` styles.
    4. In `sandwich-hell/server.js`:
       - Disable or guard the `/api/instant-win` endpoint with an environment flag (`process.env.ALLOW_DEV_CHEATS === 'true'`) or remove public access so students cannot invoke curl/fetch to auto-win.
  </action>
  <verify>
    <automated>node -e "const fs = require('fs'); const f = fs.readFileSync('sandwich-hell/public/finale/index.html', 'utf8'); const hud = fs.readFileSync('sandwich-hell/public/shared/chapter-hud.js', 'utf8'); const forbidden = ['btn-boss-instant-win', 'btn-boss-instant-lose', 'btn-bypass-ingredients', 'hud-instant-win', 'hud-win-all']; for (const id of forbidden) { if (f.includes(id) || hud.includes(id)) throw new Error('Found forbidden dev button: ' + id); } console.log('Dev cheats successfully removed.');"</automated>
  </verify>
  <done>
    All dev bypasses, Instant Win, Instant Lose, and Win All buttons are stripped from the DOM and client scripts.
  </done>
</task>

<task type="auto">
  <name>Task 4: Comprehensive Automated Test Suite for All 42 Puzzles, 6-Solve Quotas & Skips</name>
  <files>
    sandwich-hell/public/alien/index.html,
    sandwich-hell/public/hell/index.html,
    sandwich-hell/public/ocean/index.html,
    sandwich-hell/public/market/index.html,
    sandwich-hell/test-puzzle-suite.js
  </files>
  <action>
    Validate every single challenge across all four chapter levels, verify pool sizing, and confirm the 6-question solve quota and skip functionality:
    1. In `sandwich-hell/public/alien/index.html`:
       - Update `const TOTAL_QUESTIONS = 12;` (or `Q.length`) so all 12 vegetable challenges are included in the session pool (previously sliced to 10).
    2. Create `sandwich-hell/test-puzzle-suite.js` to execute programmatic verification of all 42 puzzles:
       - **Hell Chapter (10 Challenges):**
         - Extract questions from `public/hell/index.html`: Sum of Odd Numbers, Check Divisibility, Multiplication Table, Count Vowels, Find GCD, Check Prime, Star Pattern, Celsius to Fahrenheit, Merge Sorted Arrays, Second-Largest Distinct.
         - For each question: run reference solutions against all visible and hidden test cases in `TESTS[q]`, asserting 100% pass rate.
       - **Alien Chapter (12 Challenges):**
         - Extract questions from `public/alien/index.html`: Haunted Carrot Counter, Zombie Tomato Harvest, Ghost Pepper Power, Vampire Lettuce Factorial, Cursed Pumpkin Multiplication Table, Witch's Vegetable Sum, Monster's Reverse Spell, Demon Seed Detector, Haunted Garden Pattern, Forbidden Vegetable Divisors, Werewolf's Number Hunt, Potion Garden Digit Frequency.
         - Test each question using the AST parser/evaluator with reference code, verifying positive cases pass and invalid boundary inputs are caught.
       - **Ocean Chapter (10 Recipes):**
         - Extract switch-case recipes from `public/ocean/index.html`: The Demon's Potion Calculator, The Haunted Electricity Bill, The Monster's Travel Portal, The Werewolf's Shape-Shifting Spell, The Haunted Arcade, The Witch's Temperature Chamber, The Vampire's Blood Bank, The Demon's Number Decoder, The Haunted Parking Lot, The Final Demon's Reward System.
         - Evaluate each recipe with the AST linter and grader: verify presence of switch statement, default branch, all required case branches, multiplier/constant checks, and rejection of negative inputs.
       - **Market Chapter (10 Challenges):**
         - Extract problems from `public/market/index.html`: smallest, positives, average, search, occurrences, evenodd, digitsum, reversenum, palindrome, factorial.
         - Evaluate each problem against `MARKET_PROBLEMS` test suite in `server.js` or standalone grader with valid and edge-case inputs.
       - **Solve Quota & Skip Mechanism:**
         - Test that all 4 levels specify `REQUIRED_SOLVES = 6`.
         - Simulate solving 5 questions: verify level remains in progress.
         - Simulate solving the 6th question: verify level reports completion and triggers `Room.complete(chapter)`.
         - Verify that clicking `skip` advances to the next question in the pool without incrementing the solve count.
  </action>
  <verify>
    <automated>node sandwich-hell/test-puzzle-suite.js</automated>
  </verify>
  <done>
    All 42 puzzles across Hell (10), Alien (12), Ocean (10), and Market (10) pass validation, and the 6-question solve quota and skip functionality are verified across all 4 levels.
  </done>
</task>

<task type="auto">
  <name>Task 5: End-to-End Simulation, Combat Balance (12s Timer, 15% Damage) & Video Sequences</name>
  <files>
    sandwich-hell/server.js,
    sandwich-hell/public/finale/index.html,
    sandwich-hell/public/finale/boss-c-questions.js,
    sandwich-hell/test-e2e-simulation.js
  </files>
  <action>
    Conduct full end-to-end multi-room simulation and balance Vorbulon Boss combat:
    1. Boss Combat Parameters Verification:
       - Question timer: strictly set to **12.0 seconds** per question (`timerRemaining = 12.0`).
       - Damage balance: strictly **15% damage** dealt to Vorbulon on correct patch (`-15 HP` floating damage, bossHP reduction), and **15% damage** dealt to Leader on timeout or incorrect patch (`-15 HP` floating damage, leaderHP reduction).
       - Ensure `server.js` authoritative damage is `-15` for both boss and leader.
       - Ensure question bank contains 20 distinct rapid-fire corrupted C questions in `boss-c-questions.js`.
    2. Ending Videos & Navigation:
       - Fullscreen `WIN.mp4` plays on Vorbulon defeat (`bossHP <= 0`) synchronously across Leader and Spectator screens before displaying Victory stats.
       - Fullscreen `LOSE.mp4` plays on Leader defeat (`leaderHP <= 0`) synchronously across Leader and Spectator screens before displaying Defeat stats.
       - "Return to Main Page" button cleanly resets session, clears stored room credentials, and navigates back to `/lobby`.
    3. Create `sandwich-hell/test-e2e-simulation.js`:
       - Automated headless multi-client simulation of the complete game lifecycle:
         1. Create room `CHEF99` via Host socket.
         2. Connect 3 teammate sockets to `CHEF99`.
         3. Host launches game -> transitions to `/intro`.
         4. Intro finishes -> transitions to `/pick`.
         5. All 4 players claim distinct chapters (Hell, Alien, Ocean, Market).
         6. Simulate 6 puzzle solves in each of the 4 chapters.
         7. All 4 send `complete_chapter` -> server transitions room to `/cutscene`.
         8. Cutscenes advance -> room transitions to `/finale`.
         9. Leader initiates Boss Battle with 12s timer.
         10. Simulate correct patches dealing 15% damage each turn until Vorbulon reaches 0%.
         11. Server emits `boss_victory` -> verify win cinematic broadcast event.
         12. Test defeat simulation: reset boss, simulate timeouts/errors dealing 15% damage until Leader reaches 0% -> verify lose cinematic broadcast event.
         13. Verify return to main page leaves room and resets state.
  </action>
  <verify>
    <automated>node sandwich-hell/test-e2e-simulation.js</automated>
  </verify>
  <done>
    Full end-to-end lifecycle runs autonomously; 12s timer and 15% damage combat balance is validated; win/lose video synchronization and return to main page are proven.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client Browser → Express HTTP | Untrusted web clients sending room join requests, code submissions, and judge API calls. |
| Client Browser → Socket.IO | Untrusted WebSocket events claiming chapters, submitting boss actions, and triggering phase transitions. |
| Forwarded Port / Reverse Proxy → Server | Traffic forwarded from lab tunneling tools where client IP and proto must be validated without exposing internal network details. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-06-01 | Tampering | `chapter-hud.js` / `finale/index.html` | high | mitigate | Remove all instant-win and bypass buttons from client HTML and scripts; guard server `/api/instant-win`. |
| T-06-02 | Elevation of Privilege | `server.js` | high | mitigate | Host-only phase transition checks enforced on `start_game`, `advance_phase`, and `cutscene_phase`. |
| T-06-03 | Information Disclosure | `server.js` | medium | mitigate | Sanitize room state in `getPublicRoomState()` so internal socket IDs and unneeded session tokens are not broadcast. |
| T-06-04 | Denial of Service | `server.js` | medium | mitigate | Cap custom room code length to 12 chars; sanitize alphanumeric characters; restrict max players per room to 4. |
| T-06-05 | Tampering | `server.js` (Boss Battle) | high | mitigate | Authoritative server calculation of 15% boss/leader health deductions on `boss_action` events. |
| T-06-SC | Tampering | npm dependencies | high | mitigate | Zero external package additions required for Phase 6; strictly use existing installed Node packages (`express`, `socket.io`). |
</threat_model>

<verification>
Automated verification commands across all Phase 6 deliverables:
1. `node -e "const fs = require('fs'); const s = fs.readFileSync('sandwich-hell/server.js', 'utf8'); console.log('Server verified:', s.includes('0.0.0.0') && s.includes('trust proxy'));"`
2. `node -e "const fs = require('fs'); const f = fs.readFileSync('sandwich-hell/public/finale/index.html', 'utf8'); const h = fs.readFileSync('sandwich-hell/public/shared/chapter-hud.js', 'utf8'); ['btn-boss-instant-win', 'btn-boss-instant-lose', 'btn-bypass-ingredients', 'hud-instant-win'].forEach(b => { if (f.includes(b) || h.includes(b)) throw new Error('Dev cheat present: ' + b); }); console.log('Dev cheats clean.');"`
3. `node sandwich-hell/test-multi-room.js`
4. `node sandwich-hell/test-puzzle-suite.js`
5. `node sandwich-hell/test-e2e-simulation.js`
</verification>

<success_criteria>
1. All client socket connections connect to window.location.origin with zero hardcoded localhost references.
2. Server binds to 0.0.0.0:3000 with reverse proxy trust enabled.
3. Joining rooms solely via room code works smoothly for guest PCs.
4. Multiple simultaneous rooms run concurrently without cross-room state contamination.
5. All dev buttons (Instant Win, Instant Lose, Bypass Ingredients, Win All) are eliminated.
6. All 42 puzzle challenges across Hell (10), Alien (12), Ocean (10), and Market (10) pass test cases.
7. Solve quota (6 questions required) and skip buttons work in all 4 chapters.
8. Boss battle operates with a 12s countdown timer, 15% damage per turn, 20 corrupted C questions, synchronized WIN.mp4 and LOSE.mp4 video playback, and clean return to main page.
</success_criteria>

<output>
Create `.planning/phases/06-final-fixing-tutorials-cinematics/06-01-SUMMARY.md` when done.
</output>
