# Plan: Phase 4 — Sandwich Assembly Cinematic & Leader Boss Battle

## Objective
Deliver the dramatic climax of *The Legendary Sandwich From Hell* according to the updated specification:
1. **The Gathering Gate**: All 4 players assemble in real time as their harvested ingredients arrive.
2. **The Sandwich Assembly Cinematic Placeholder**: A dedicated cutscene container reserved for the video of the 4 ingredients being collected and the sandwich being reassembled (static placeholder video slot for now).
3. **The Plot Twist & Vorbulon Awakening Placeholder**: A dedicated cutscene container reserved for the video of *Vorbulon, the Hungry Between Stars* appearing (static placeholder video slot for now).
4. **Role-Based Screen Split for Boss Battle**:
   - **Leader / Host Screen (`isHost === true`)**: Transitions to the high-stakes interactive Boss Arena where the Leader must rapidly debug continuous corrupted C programs.
   - **Teammates' Screens (`isHost === false`)**: Displays a stylized static message: `"You have successfully helped to find ingredients"`, accompanied by live spectator gauges watching the Leader battle Vorbulon in real time.
5. **Real-time Combat Mechanics**:
   - Total of 15 quick-debugging C code questions (easy, obvious bugs like missing semicolons, inverted comparisons, format string typos, wrong return values, missing brackets).
   - **5-second timer per question**.
   - **Correct patch**: Boss health reduces by 20% (or 10% configurable; 5 correct patches defeats Vorbulon).
   - **Failed patch or Time Expired**: Boss health does not reduce, time is wasted, and Leader takes 20% damage.
   - Both Boss Health (100%) and Leader Health (100%) are tracked and synchronized in real time.
6. **Victory or Defeat Outcomes**:
   - **Leader Wins (Boss HP = 0%)**: Vorbulon is defeated, the legendary sandwich is eaten by the Leader in victory; displays team stats (total game time, chefs involved) and play-again options.
   - **Vorbulon Wins (Leader HP = 0%)**: The sandwich is destroyed; Vorbulon consumes the realm; displays total time survived and retry options.

---

## Screen & Flow Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       Stage 1: Gathering Gate           │
                               │  Real-time altar displays all 4         │
                               │  ingredients (Cheese, Veggies, Sauce,   │
                               │  Bread). Auto-advances or bypass.       │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │  Stage 2: Assembly Video Placeholder    │
                               │  Static cutscene frame for sandwich     │
                               │  re-assembly video (with 'Continue' btn)│
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
                               ┌─────────────────────────────────────────┐
                               │  Stage 3: Vorbulon Awakening Placeholder│
                               │  Static cutscene frame for Vorbulon     │
                               │  entity appearance (with 'Enter Battle')│
                               └────────────────────┬────────────────────┘
                                                    │
                         ┌──────────────────────────┴──────────────────────────┐
                         │                                                     │
                         ▼                                                     ▼
         [LEADER / HOST SCREEN]                                  [TEAMMATE SCREENS]
  ┌─────────────────────────────────────┐              ┌─────────────────────────────────────┐
  │      Stage 4A: Boss Battle Arena    │              │    Stage 4B: Ingredient Heroes      │
  │ • Vorbulon Health Bar (100%)        │              │ • "You have successfully helped to  │
  │ • Leader Health Bar (100%)          │              │    find ingredients"                │
  │ • 5 -Second Active Countdown Bar    │              │ • Live Spectator View:              │
  │ • Corrupted C Program Editor        │              │    - Leader Health Bar              │
  │ • Fast "Patch Bug" Button           │              │    - Vorbulon Health Bar            │
  │ • 15 Corrupted C challenges         │              │    - Battle combat log stream       │
  └──────────────────┬──────────────────┘              └──────────────────┬──────────────────┘
                     │                                                    │
                     └──────────────────────────┬─────────────────────────┘
                                                │
                               ┌────────────────┴────────────────┐
                               │                                 │
             [Leader Wins: Boss HP = 0]        [Vorbulon Wins: Leader HP = 0]
                               ▼                                 ▼
                    ┌─────────────────────┐           ┌─────────────────────┐
                    │ Victory: Sandwich   │           │ Defeat: Sandwich is │
                    │ Eaten by Leader!    │           │ Destroyed!          │
                    │ Team stats & replay │           │ Team stats & retry  │
                    └─────────────────────┘           └─────────────────────┘
```

---

## Detailed Tasks

### Task 1: 15 Rapid-Fire Corrupted C Questions Dataset (`public/finale/boss-c-questions.js`)
- Curate 15 short, thematic C snippets (5–12 lines each) with obvious, fun bugs designed for a 10-second inspection:
  1. `int main() { int temp = 100; if (temp = 100) ... }` (Assignment instead of equality `==`).
  2. `printf("Vorbulon Power: %d\n", power);` (Missing semicolon `;`).
  3. `if (shield > 50) return 0; else return 1;` (Inverted condition: should return 1 when shield > 50).
  4. `int result = a * b; return result;` (Missing `int a = 5, b = 4;` uninitialized variable).
  5. `for (int i = 0; i < 5; i--)` (Infinite loop with decrement instead of increment `i++`).
  6. `printf("Core: %s", core_temp);` (Wrong format specifier `%s` for integer `int core_temp`).
  7. `int arr[3] = {1, 2, 3}; return arr[3];` (Off-by-one array index out of bounds).
  8. `int damage = 50; if (damage < 0) return 0;` (Missing closing curly brace `}`).
  9. `return a - b;` (Should be addition `a + b` to power the beam).
  10. `int main() { return 0 }` (Missing semicolon after return).
  11. `int status = 0; if (!status) return 0; else return 1;` (Inverted boolean check).
  12. `char sigil = 'X;` (Missing closing quote on char literal).
  13. `int health = 100; health += ;` (Syntax error in addition operand).
  14. `float ratio = 10 / 4;` (Integer division instead of floating point `10.0 / 4.0`).
  15. `int power = 9000; if (power > 9000) return "HIGH";` (Returning string pointer instead of integer status code).
- Each question defines:
  - `id`, `title`, `corruptedCode`, `expectedFix`, `hint`, and simple validation criteria (runs via lightweight client-side scanner + `/api/judge` fallback).

### Task 2: Video Cutscene Placeholders (Assembly & Vorbulon Awakening)
- **Placeholder 1 (Sandwich Assembly)**:
  - Container `#cutscene-assembly`: A gothic framed cinematic display with an animated placeholder banner:
    `🎬 [VIDEO PLACEHOLDER: The 4 Cursed Ingredients Fuse and Assemble the Legendary Sandwich]`
  - Shows animated ingredient thumbnails hovering into place and a "Continue →" / "Skip Cutscene" button.
- **Placeholder 2 (Vorbulon's Awakening)**:
  - Container `#cutscene-vorbulon`: A cosmic void themed cinematic display:
    `🎬 [VIDEO PLACEHOLDER: Vorbulon, the Hungry Between Stars Awakens from the Cosmic Rift]`
  - Shows glowing red eldritch eye artwork and a "Confront Vorbulon →" button.

### Task 3: Dual-Mode Finale Screen (`public/finale/index.html` & `public/finale/finale.css`)
- Read `Room.isHost()` on load (or query session/storage):
  - **If Host (Leader)**:
    - Renders the full interactive Boss Arena:
      - Boss Health Bar: Vorbulon (Red/Purple glowing bar, 100%).
      - Leader Health Bar: Leader Chef (Green/Gold glowing bar, 100%).
      - 10-Second Timer: Visual animated progress bar that turns red and flashes when under 3 seconds.
      - Code Editor with corrupted C snippet.
      - "Patch Bug (Enter)" button.
      - Combat log showing damages and patches.
  - **If Teammate (`!isHost`)**:
    - Renders the dedicated Hero Contributor screen:
      - Grand banner: `"You have successfully helped to find ingredients"`.
      - Displays their contributed ingredient badge (Cheese, Vegetables, Sauce, or Bread).
      - Live Spectator HUD: Real-time synced Vorbulon HP and Leader HP bars.
      - Live combat event ticker: *"Chef Leader dealt 20% damage to Vorbulon!"* or *"Vorbulon struck Leader for 20% damage!"*.
      - Encouragement buttons / sound reaction buttons.

### Task 4: Real-Time Combat State Machine & Synchronization (`server.js`)
- Server-side boss state in `server.js`:
  - `bossHealth`: 100
  - `leaderHealth`: 100
  - `currentQuestionIndex`: 0
  - `bossStatus`: `'fighting'` | `'victory'` | `'defeat'`
- Events:
  - `boss_patch_attempt`: Leader submits fix for current question.
    - If correct: `bossHealth = Math.max(0, bossHealth - 20)`.
    - If incorrect or timed out: `leaderHealth = Math.max(0, leaderHealth - 20)`.
    - Broadcasts `boss_combat_update` to all room sockets with updated healths, current question index, and action log.
  - If `bossHealth <= 0`:
    - Sets `bossStatus = 'victory'`.
    - Broadcasts `boss_victory` to all room sockets.
  - If `leaderHealth <= 0`:
    - Sets `bossStatus = 'defeat'`.
    - Broadcasts `boss_defeat` to all room sockets.

### Task 5: Cosmic Feast Victory vs Sandwich Destroyed Defeat
- **Victory Screen (`bossHealth === 0`)**:
  - Dramatic headline: *"VORBULON DEFEATED! THE LEGENDARY SANDWICH IS CONSUMED BY THE LEADER!"*
  - Animated illustration of the Leader devouring the glowing cosmic sandwich.
  - Vorbulon dialogue: *"IMPOSSIBLE... THE MORTAL CODE WAS FLAWLESS... I AM SATED..."*
  - Total Game Time calculation (from room creation time to victory).
  - List of all 4 Chefs and their ingredients.
  - "Play Again / Return to Lobby" button.
- **Defeat Screen (`leaderHealth === 0`)**:
  - Dramatic headline: *"THE LEADER HAS FALLEN! THE SANDWICH HAS BEEN DESTROYED!"*
  - Animated illustration of the sandwich shattering into ash in the cosmic void.
  - Vorbulon dialogue: *"YOUR TIMING WAS TOO SLOW, MORTALS! YOUR EFFORTS WERE IN VAIN!"*
  - Team survival time stats.
  - "Try Again" button to restart the boss fight.

### Task 6: Automated Integration Verification (`test-boss-battle.js`)
- Create automated test script verifying:
  - `boss-c-questions.js` contains 15 valid questions with correct solutions.
  - Route `/finale` serves both host and non-host views correctly.
  - Simulated Socket.IO session:
    - Host and 3 teammates enter finale.
    - Correct patch reduces boss health by 20%.
    - Timeout / incorrect patch reduces leader health by 20%.
    - 5 correct patches triggers `boss_victory`.
    - 5 incorrect patches triggers `boss_defeat`.
  - Include in `sandwich-hell` `npm test`.

---

## Verification Criteria
- [ ] Navigating to `/finale` displays the Gathering Gate with 4 ingredients.
- [ ] Assembly video cutscene placeholder appears with static frame and skip/continue controls.
- [ ] Vorbulon awakening video cutscene placeholder appears with static frame and enter controls.
- [ ] Teammates' screens display `"You have successfully helped to find ingredients"` and real-time spectator health bars.
- [ ] Leader's screen displays the 10-second timer, Vorbulon HP, Leader HP, and corrupted C editor.
- [ ] Correctly patching a program within 10s deals 20% damage to Vorbulon and advances to the next question.
- [ ] Failing or timing out at 0s deals 20% damage to the Leader.
- [ ] Reducing Vorbulon to 0% displays the victory screen where the sandwich is eaten by the Leader.
- [ ] Reducing Leader to 0% displays the defeat screen where the sandwich is destroyed.
- [ ] `npm test` runs with 100% passing tests.
