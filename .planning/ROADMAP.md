# Project Roadmap: The Legendary Sandwich From Hell

## Milestones & Phases

```mermaid
graph TD
  P1[Phase 1: Server & Room Client Backbone] --> P2[Phase 2: Lobby, Intro & Chapter Picker]
  P2 --> P3[Phase 3: Chapter Templates & Contract Integration]
  P3 --> P4[Phase 4: Assembly Cinematic & Vorbulon Finale]
  P4 --> P5[Phase 5: Multi-Screen Testing & Final Polish]
```

---

### Phase 1: Core Architecture, Authoritative Server & Room Client
**Goal:** Establish the `sandwich-hell` project directory, dependencies, Node.js + Express + Socket.IO server with in-memory room management, and the `room-client.js` connector.
- [x] Initialize `sandwich-hell/package.json` with `express` and `socket.io`.
- [x] Implement `sandwich-hell/server.js` with authoritative room state machine (`lobby`, `intro`, `picking`, `playing`, `finale`, `ending`).
- [x] Implement player management: 6-character room codes, player joining, host privileges, disconnect/reconnect handling.
- [x] Implement chapter locking mechanism: first-come first-served atomic claiming.
- [x] Implement `sandwich-hell/public/shared/room-client.js` with storage persistence and `Room.complete(...)` API.

---

### Phase 2: Lobby, Synchronized Intro & Real-Time Chapter Picker
**Goal:** Create a polished pre-game experience orchestrating all 4 monitors before gameplay.
- [x] Implement `public/lobby/index.html` with Create/Join room, code copy, and live player roster.
- [x] Implement synchronized intro cinematic screen with browser autoplay fallback.
- [x] Implement `public/pick/index.html` featuring interactive cards for Hell, Alien, Ocean, and Market.
- [x] Real-time card locking visual effects and automatic monitor redirection to claimed chapter URLs.

---

### Phase 3: Drop-in Chapter Templates & Teammate Integration
**Goal:** Provide ready-to-drop scaffolds for teammates' chapter pages with verified communication back to the server.
- [x] Implement `public/hell/index.html` (Cheese / Booleans & Conditions in C) with molten gate calibration and 10 C questions.
- [x] Implement `public/alien/index.html` (Vegetables / Loops & Arrays in C) with bio-conveyor purge animation and 10 C questions.
- [x] Implement `public/ocean/index.html` (Sauce / Functions & Recursion in C) with pressure chamber dial and 10 C questions.
- [x] Implement `public/market/index.html` (Bread / Strings & Arrays in C) with goblin vault safe tumbler and 10 C questions.
- [x] Implement `public/shared/c-runner.js` and `public/shared/questions-data.js` for in-browser C execution with 40/40 passing test suites.
- [x] Document drop-in instructions for teammates in each template and `README-TEAMMATES.md`.

---

### Phase 4: Sandwich Assembly Cinematic & Vorbulon Boss Finale
**Goal:** Deliver the dramatic waiting gate, sandwich assembly animation, twist reveal of Vorbulon, and cooperative 4-player Python debugging fight.
- [ ] Implement `public/finale/index.html` with 4-ingredient waiting gate HUD.
- [ ] Create CSS/JS sandwich assembly animation sequence depicting the cursed ingredients fusing together.
- [ ] Implement the cosmic horror twist reveal of *Vorbulon, the Hungry Between Stars*.
- [ ] Implement Pyodide Web Worker runner with timeout watchdog (prevents infinite loop crashes).
- [ ] Design and implement 4 specialized corrupted Python functions (1 per player) with visible and hidden tests.
- [ ] Implement real-time boss health / hunger bar synchronizing player patch successes via Socket.IO.
- [ ] Implement victory ending sequence and credits.

---

### Phase 5: Multi-Screen Playtesting, LAN Setup & Final Polish
**Goal:** Validate complete 4-player flow across 4 simultaneous browser tabs and multi-device LAN testing.
- [ ] Conduct end-to-end 4-tab simulation of the complete game cycle.
- [ ] Validate refresh / disconnect recovery at each phase of the game.
- [ ] Verify LAN binding (`0.0.0.0:3000`) and print helpful local network connection instructions for multi-computer play.
- [ ] Fine-tune UI styling, animations, contrast, and responsive layout across monitor resolutions.
