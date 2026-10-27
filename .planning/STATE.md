# Project State: The Legendary Sandwich From Hell

## Current Milestone: Milestone 1 - The Shared Backbone & 4-Player Engine
- **Current Phase:** Ready for Phase 2 (`Phase 2: Lobby, Synchronized Intro & Real-Time Chapter Picker`)
- **Status:** Phase 1 executed & verified (6/6 tests passed)
- **Last Updated:** 2026-10-28

## Progress Summary
- [x] Project scope and technical architecture defined
- [x] Requirements specification created (`.planning/REQUIREMENTS.md`)
- [x] 5-phase roadmap established (`.planning/ROADMAP.md`)
- [x] Phase 1: Core Architecture, Authoritative Server & Room Client
- [ ] Phase 2: Lobby, Synchronized Intro & Real-Time Chapter Picker
- [ ] Phase 3: Drop-in Chapter Templates & Teammate Integration
- [ ] Phase 4: Sandwich Assembly Cinematic & Vorbulon Boss Finale
- [ ] Phase 5: Multi-Screen Playtesting, LAN Setup & Final Polish

## Decisions & Constraints
- **Subfolder location:** Project root is `sandwich-hell/` within the workspace.
- **Chapter URL mapping:** `/hell` (Cheese), `/alien` (Vegetables), `/ocean` (Sauce), `/market` (Bread).
- **Chapter scaffolds:** Lightweight starter pages with working `room-client.js` triggers ready for teammates to drop in their finished HTML/CSS/JS.
- **Python Execution:** Pyodide in an isolated Web Worker to safeguard against freezing when players test loops or complex code.
- **Authoritative Locking:** Server-side atomic locking prevents race conditions on chapter claims.
