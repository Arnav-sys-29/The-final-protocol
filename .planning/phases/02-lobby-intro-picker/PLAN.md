# Plan: Phase 2 — Lobby, Synchronized Intro & Real-Time Chapter Picker

## Objective
Build a rich, cosmic-horror culinary themed pre-game experience orchestrating all 4 player screens. This includes a shared styling and Web Audio synthesizer engine, the 4-player lobby with live roster and host controls, a synchronized cinematic intro sequence, and the real-time chapter picker with instant atomic locks and monitor redirection.

---

## Architecture & Visual System

### 1. Visual Theme & Palette
- **Cosmic Food Horror Aesthetics:** Deep space void background (`#08060f`), eldritch violet (`#8b5cf6`), cursed neon green (`#10b981`), hellfire crimson/amber (`#f97316`), and abyssal cyan (`#06b6d4`).
- **Glassmorphism & Micro-animations:** Frosted glass panels (`backdrop-filter: blur(12px)`), pulsing runes, glowing borders, smooth card lifts.
- **Web Audio FX:** Built-in Web Audio API sound synthesizer (zero external mp3 assets needed, 100% offline-ready):
  - Eldritch hover chime
  - Rune lock / chain clank
  - Rejection buzzer
  - Cinematic cosmic hum / drone
  - Teleportation whoosh

### 2. State & Page Progression Flow
```text
[Lobby: /lobby] ──(Host clicks Start)──> [Intro: /intro] ──(Sequence ends or Skip)──> [Chapter Picker: /pick]
                                                                                              │
                                                                          (Player taps Hell / Alien / Ocean / Market)
                                                                                              │
                                                                               [Locked for others; Teleport]
                                                                                              │
                                                                               [/hell, /alien, /ocean, /market]
```

---

## Detailed Tasks

### Task 1: Shared Design System & Audio Synthesizer
- Create `sandwich-hell/public/shared/theme.css`:
  - Design tokens: colors, typography (Outfit & Cinzel via Google Fonts with elegant fallbacks), glassmorphic card utilities, glowing buttons, badge pills.
- Create `sandwich-hell/public/shared/audio.js`:
  - `SoundFX` utility using Web Audio API:
    - `SoundFX.play('click')`
    - `SoundFX.play('lock')`
    - `SoundFX.play('reject')`
    - `SoundFX.play('ambient_start')`
    - `SoundFX.play('teleport')`

### Task 2: Polished 4-Player Room Lobby (`/lobby`)
- Build `sandwich-hell/public/lobby/index.html`:
  - Dramatic title header with glowing runes: *The Legendary Sandwich From Hell*.
  - Dual Mode Card:
    - **Host Ritual:** Enter your Chef name -> "Summon Room" -> generates glowing 6-character room code.
    - **Join Coven:** Enter your Chef name + 6-char Room Code -> "Enter Room".
  - Active Room Dashboard:
    - Prominent 6-character code with 1-click copy badge and "Share with 3 other monitors" instructions.
    - 4-slot visual player grid showing avatar runes, player name, host crown, and connection status.
    - Host-only glowing "IGNITE RITUAL (START GAME)" launch button with ready status indicator.
    - Auto-reconnect support via `Room.init()`.

### Task 3: Synchronized Cinematic Intro (`/intro`)
- Build `sandwich-hell/public/intro/index.html`:
  - Atmospheric multi-act cinematic presentation:
    - **Act I:** The Ancient Hunger awakes between the stars.
    - **Act II:** Only the Cursed Sandwich can appease the cosmic maw.
    - **Act III:** 4 Cheflords must plunge into Hell, Deep Space, the Abyssal Ocean, and the Black Market.
  - "SYNCHRONIZE MONITOR" audio unlock overlay (handles browser autoplay policies gracefully).
  - Synced progress bar synchronized by server time/events.
  - Host "Skip to Picking" button for fast testing.
  - Automatically advances room phase to `picking` and transitions all screens to `/pick`.

### Task 4: Real-Time Chapter Picker with Atomic Locking (`/pick`)
- Build `sandwich-hell/public/pick/index.html`:
  - 4 high-fidelity thematic ingredient cards:
    1. **Hell — Cursed Cheese** (`/hell`): Boolean Logic & Gate Validation.
    2. **Alien — Cosmic Vegetables** (`/alien`): Loops, Off-by-one errors & Automation.
    3. **Ocean — Abyssal Sauce** (`/ocean`): Functions, String manipulation & Edge cases.
    4. **Market — Eldritch Bread** (`/market`): Dictionaries, Lookups & Occult Queues.
  - Real-time lock mechanics:
    - Listening for `chapter_claimed` and `room_updated`.
    - Claimed cards instantly become chained/locked with glowing "CLAIMED BY [NAME]" banner.
    - Unclaimed cards remain interactive.
    - Clicking a locked card plays rejection buzz and displays shake animation.
    - Claimant receives `claim_confirmed`, triggers dramatic teleport animation, and is routed to their chapter URL.

### Task 5: Verification & Multi-Tab Testing
- Open 4 browser sessions (or simulate concurrent socket events).
- Validate:
  1. Room creation and joining across 4 tabs.
  2. Synced transition to `/intro` when host presses start.
  3. Synced progression to `/pick`.
  4. Concurrent clicking on the same card in 2 tabs: 1 succeeds and teleports, the other is rejected and locked.
  5. All 4 players end up in their respective chapter URLs (`/hell`, `/alien`, `/ocean`, `/market`).
