# Plan: Phase 5 — Multi-Screen Playtesting, LAN Setup & Final Polish

## Objective
Validate the complete 4-player multiplayer flow across multiple screens/tabs, establish seamless LAN connection support with automatic IP discovery, ensure robust session persistence & reconnect resilience across all phases, and deliver final visual and UX polish for a cohesive, vibrant cosmic arcade aesthetic.

---

## Scope & Deliverables

1. **LAN Discovery & Multi-Device Setup**:
   - Provide `/api/server-info` exposing LAN IP, port, and join URL.
   - Display dynamic LAN connection badge in the Game Lobby (`/lobby`) with one-click copy so teammates on other PCs or tablets can instantly join.
   - Confirm server binds to `0.0.0.0:3000` with clear terminal banner output.

2. **Full End-to-End Multi-Screen Playtesting & Simulation**:
   - Simulate 4 concurrent players joining a room: 1 Host (Chef Leader) + 3 Teammates.
   - Test stage transitions across all 4 sessions:
     - Lobby (`/lobby`) → synchronized start.
     - Prologue Cinematic (`/intro`) → synchronized story video.
     - Ingredient Claiming (`/pick`) → atomic first-come first-served locking for Hell (Cheese), Alien (Vegetables), Ocean (Sauce), Market (Bread).
     - Concurrent gameplay across all 4 levels (`/hell`, `/alien`, `/ocean`, `/market`).
     - Automatic synchronized redirection upon all 4 completions → Assembly & Vorbulon Cutscenes (`/cutscene`).
     - Cutscene Flow: Sandwich reassembly video → "Finish Game" prompt → "Wait, something's happening..." surprise → Monster awakening video → "We have to protect the goddamn sandwich!!!!!" battle cry → Transition to Final Boss Arena (`/finale`).
     - Final Boss Arena: Leader active Pokemon-style debugging combat with 10s timer, attack animations, damage floaters, question announcements, times-up banner; Teammates synchronized spectator HUD with HP meters and combat log.
     - Victory / Defeat endings and replay cycle.

3. **Session Persistence & Disconnect / Refresh Resilience**:
   - Verify `room-client.js` restores `roomCode`, `playerName`, `playerRole`, and claimed chapter from `sessionStorage` upon browser refresh.
   - Test page refresh on `/pick`, `/hell`, `/alien`, `/ocean`, `/market`, `/cutscene`, and `/finale` without losing room state or socket association.

4. **Visual & UI Polish**:
   - Consistent typography, vibrant cosmic glow styling, polished animations, and responsive scaling across screen resolutions.
   - Ensure all user-facing copy is in clean, simple English throughout the entire application.

---

## Tasks

- [ ] **Task 1: LAN Info Endpoint & Lobby Display**: Add `/api/server-info` to `server.js` and render LAN join URL with copy button in `public/lobby/index.html`.
- [ ] **Task 2: End-to-End Cutscene & Finale Navigation Flow Check**: Ensure `/cutscene` and `/finale` properly connect with room state, role distribution (Leader vs Spectator), and post-level gathering triggers.
- [ ] **Task 3: Browser Subagent Verification**: Perform end-to-end browser subagent run to verify the full flow and visual fidelity.
- [ ] **Task 4: Update Documentation & Roadmap**: Mark Phase 5 complete in `ROADMAP.md` and generate verification summary.
