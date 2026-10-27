# Requirements Specification: The Legendary Sandwich From Hell

## System Overview
The Legendary Sandwich From Hell is a multi-screen, 4-player cooperative web game orchestrated via a central Node.js/Socket.IO server. Four players collaborate across four screens to collect four cursed sandwich ingredients, assemble the eldritch sandwich, and defeat the cosmic entity *Vorbulon* through synchronized Python debugging.

---

## Functional Requirements

### FR-1: Authoritative Room Server (`server.js`)
- **FR-1.1:** Room Lifecycle: Players can create a room (generating a unique 6-character room code) or join an existing room with player name and room code. Max 4 players per room.
- **FR-1.2:** Host Authority: The room creator is designated host; only the host can start the game and progress global phases.
- **FR-1.3:** State Machine: Authoritative phases: `lobby` -> `intro` -> `picking` -> `playing` -> `finale` -> `ending`.
- **FR-1.4:** First-Come First-Served Chapter Locking: Prevents race conditions or double-claims across all four chapter choices.
- **FR-1.5:** Completion Gate: Collects completion signals (`Room.complete(chapter)`) from all four chapters; triggers global transition to `/finale` once all 4 report success.
- **FR-1.6:** Local Network & Offline Readiness: Runs smoothly on LAN/Wi-Fi (`http://<HOST_IP>:3000`) and requires no cloud connectivity after local setup.
- **FR-1.7:** Merged Helper APIs: Consolidates any chapter helper routes (e.g. Market judge) into the unified server.

### FR-2: Client Room Connector (`public/shared/room-client.js`)
- **FR-2.1:** Persistent State: Stores `roomCode`, `playerId`, `playerName`, and assigned chapter in `sessionStorage`/`localStorage`.
- **FR-2.2:** Transparent Reconnection: Reconnects automatically on page refresh, preserving player assignment and room phase.
- **FR-2.3:** Standardized API: Provides clean hooks:
  - `Room.init()`
  - `Room.claim(chapter)`
  - `Room.complete(chapter)`
  - `Room.onPhase(phase, callback)`
  - `Room.getPlayerInfo()`

### FR-3: Lobby & Player Management (`public/lobby/index.html`)
- **FR-3.1:** Create Room flow with instantaneous 6-character room code display and 1-click clipboard copy.
- **FR-3.2:** Join Room flow with name validation and room code entry.
- **FR-3.3:** Real-time lobby roster displaying all connected players (up to 4) with host badge and status indicators.
- **FR-3.4:** Host-only "Start Game" action, disabled until players are ready or when host chooses to start.

### FR-4: Synced Cinematic Intro Sequence
- **FR-4.1:** Broadcast start signal that synchronizes video/cinematic presentation across all four connected client screens.
- **FR-4.2:** Browser autoplay mitigation with an intuitive "Click to Synchronize" overlay if media autoplay is blocked.
- **FR-4.3:** Synced completion/skip leading seamlessly into Chapter Picking.

### FR-5: Real-Time Chapter Picker & Auto-Teleportation (`public/pick/`)
- **FR-5.1:** Grid of 4 chapter cards:
  - `/hell` — Hell (Ingredient: Cursed Cheese | Topic: Conditions, Booleans)
  - `/alien` — Alien (Ingredient: Cosmic Vegetables | Topic: Loops, Lists)
  - `/ocean` — Ocean (Ingredient: Abyssal Sauce | Topic: Functions, Strings)
  - `/market` — Market (Ingredient: Eldritch Bread | Topic: Dictionaries, Lookups)
- **FR-5.2:** Real-time locking: Selecting a card locks it instantaneously across all 4 screens with player claim badge.
- **FR-5.3:** Client teleportation: Successfully claiming an ingredient immediately redirects the browser to that chapter's URL with room credentials preserved.

### FR-6: Drop-in Chapter Page Boilerplates
- **FR-6.1:** Dedicated directories: `public/hell/`, `public/alien/`, `public/ocean/`, `public/market/`.
- **FR-6.2:** Teammate-friendly scaffold: Includes `<script src="/shared/room-client.js"></script>` and interactive "Complete Chapter" trigger button simulating puzzle completion for immediate end-to-end testing.
- **FR-6.3:** Complete drop-in documentation for teammates to replace UI and logic without modifying the server protocol.

### FR-7: Waiting Gate & Sandwich Assembly Cinematic (`public/finale/index.html`)
- **FR-7.1:** Live HUD displaying status of all 4 chapters (Pending vs Completed).
- **FR-7.2:** Sandwich Assembly Animation: Assembling 4 ingredients into an eldritch, twitching sandwich when all report complete.
- **FR-7.3:** Secret Plot Twist: Atmospheric shift (lighting, sound, dialogue) revealing *Vorbulon, the Hungry Between Stars*.

### FR-8: Collaborative Vorbulon Finale Boss Fight
- **FR-8.1:** 4 distinct corrupted Python functions distributed to the respective players based on their chosen chapter.
- **FR-8.2:** In-browser Python sandbox powered by Pyodide in an isolated Web Worker (timeout watchdog preventing UI lockup).
- **FR-8.3:** Visible unit tests + hidden test cases to ensure robust code fixes.
- **FR-8.4:** Dynamic boss hunger/health bar decreasing in real-time as players fix their functions.
- **FR-8.5:** Victory sequence: Vorbulon sated, cosmic ending sequence, and credits.

---

## Non-Functional Requirements

### NFR-1: Performance & Real-Time Responsiveness
- Socket message delivery latency < 50ms on local network.
- Worker-isolated Python execution preventing main UI thread stutter.

### NFR-2: Aesthetics & Polish
- Immersive dark fantasy / cosmic horror visuals with high-contrast neon accents, glassmorphic HUDs, smooth micro-interactions, and sound design hooks.

### NFR-3: Fault Tolerance & Reconnection
- Graceful handling of browser refresh, accidental tab closes, and network drops during any phase.
