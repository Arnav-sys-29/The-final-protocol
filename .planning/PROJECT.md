# The Legendary Sandwich From Hell

## Executive Summary
**The Legendary Sandwich From Hell** is a cooperative, 4-player multi-monitor web experience. Four players connect simultaneously from four distinct monitors or devices to assemble an absurdly powerful sandwich to appease an ancient hunger. The game combines epic fantasy, cosmic horror, and culinary comedy with in-browser Python coding puzzles (powered by Pyodide in Web Workers).

## Vision & Tone
- **Tone:** Epic fantasy meets cosmic horror and absurd food comedy. Highly stylized, weird, funny, and dramatic without graphic gore.
- **Form Factor:** 4 screens/tabs orchestrated in real-time by a central Node/Socket.IO authoritative room server.
- **Twist:** Assembling all four cursed ingredients triggers the arrival of *Vorbulon, the Hungry Between Stars*. The players must collaboratively patch Vorbulon's corrupted hunger loop to survive.

## Technical Architecture
- **Location:** `sandwich-hell/`
  - `sandwich-hell/server.js`: Node.js + Express + Socket.IO authoritative game server. Tracks room codes, players, host status, ingredient claims, completion states, and phase transitions. Offline-capable after initial `npm install`.
  - `sandwich-hell/public/shared/room-client.js`: Client library handling socket connectivity, state restoration across refreshes (localStorage/sessionStorage), room signals, and `Room.complete(chapter)` API.
  - `sandwich-hell/public/lobby/`: Room creation (6-char room code), join screen, player roster, host-controlled launch.
  - `sandwich-hell/public/intro/` (or synced modal): Synchronized video/cinematic playback across all four screens.
  - `sandwich-hell/public/pick/`: First-come, first-served ingredient/chapter selection screen with real-time locking and auto-teleportation.
  - `sandwich-hell/public/hell/`: Cheese chapter (Conditions, Boolean logic).
  - `sandwich-hell/public/alien/`: Vegetables chapter (Loops, lists, robotics).
  - `sandwich-hell/public/ocean/`: Sauce chapter (Functions, string manipulation, edge cases).
  - `sandwich-hell/public/market/`: Bread chapter (Dictionaries, lookups, sorting).
  - `sandwich-hell/public/finale/`: Waiting gate -> sandwich assembly cinematic -> Vorbulon 4-function collaborative boss fight -> victory ending.
- **Execution Engine:** Pyodide running inside isolated Web Workers to avoid UI thread blocking on infinite loops, with visible and hidden test validations.

## Roles & Responsibilities
- **Team Lead (Current Scope):** Shared Backbone & Orchestration
  1. Authoritative Room Server & Socket.IO State Machine
  2. Lobby, Player Roster & Synced Start
  3. Real-Time Ingredient Claim & Lock Screen
  4. Auto-Teleportation & Reconnection Resilience
  5. Lightweight Chapter Templates with `room-client.js` integration
  6. Waiting Gate & Sandwich Assembly Cinematic
  7. Vorbulon 4-Player Collaborative Finale & Ending Scene
- **Teammates:** Drop-in standalone chapters (`/hell`, `/alien`, `/ocean`, `/market`) adhering to the shared contract:
  - Include `<script src="/shared/room-client.js"></script>`
  - Call `Room.complete('<chapter>')` when the chapter puzzle is solved.
