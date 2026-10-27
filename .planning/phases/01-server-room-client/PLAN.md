# Plan: Phase 1 — Core Architecture, Authoritative Server & Room Client

## Objective
Establish the `sandwich-hell` project workspace, configure Node dependencies (`express`, `socket.io`), implement the authoritative state machine server (`server.js`), and build the shared client connector (`room-client.js`) with persistent reconnection, atomic chapter locking, and completion gating.

---

## Architecture & Data Contracts

### 1. Room Data Structure (In-Memory in `server.js`)
```javascript
{
  code: "ABC123",            // 6-character uppercase alphanumeric code
  hostId: "player-uuid-1",   // Creator's persistent player ID
  phase: "lobby",            // 'lobby' | 'intro' | 'picking' | 'playing' | 'finale' | 'ending'
  players: {
    "player-uuid-1": {
      id: "player-uuid-1",
      name: "Chef Gordon",
      socketId: "socket_abc",
      chapter: null,         // 'hell' | 'alien' | 'ocean' | 'market'
      ready: true,
      connected: true
    }
  },
  claims: {
    // chapterName -> playerId
    hell: null,
    alien: null,
    ocean: null,
    market: null
  },
  completed: {
    // chapterName -> boolean
    hell: false,
    alien: false,
    ocean: false,
    market: false
  },
  createdAt: 1710000000000
}
```

### 2. Socket.IO Events Specification
- **Client -> Server:**
  - `create_room`: `{ playerName }` -> Emits `room_created` to creator.
  - `join_room`: `{ roomCode, playerName, playerId? }` -> Emits `room_joined` to player, `room_updated` to room.
  - `reconnect_room`: `{ roomCode, playerId }` -> Restores connection, emits `reconnect_success`.
  - `start_game`: `{ roomCode }` -> Host-only trigger; updates phase to `intro`, emits `phase_changed`.
  - `advance_phase`: `{ roomCode, phase }` -> Emits `phase_changed` to room.
  - `claim_chapter`: `{ roomCode, chapter }` -> Atomic first-come first-served check.
    - If free: assigns `claims[chapter] = playerId`, emits `chapter_claimed` to room, emits `claim_confirmed({ chapter, url: '/' + chapter })` to player.
    - If taken: emits `claim_rejected({ chapter, reason: 'Already claimed' })` to player.
  - `complete_chapter`: `{ roomCode, chapter }` -> Sets `completed[chapter] = true`. Emits `chapter_completed` to room. If all 4 complete, transitions phase to `finale` and emits `all_chapters_completed({ nextUrl: '/finale' })`.
- **Server -> Client:**
  - `room_created`: `{ roomCode, player, roomState }`
  - `room_joined`: `{ roomCode, player, roomState }`
  - `room_updated`: `{ roomState }`
  - `phase_changed`: `{ phase, roomState }`
  - `chapter_claimed`: `{ chapter, playerId, playerName, claims }`
  - `chapter_completed`: `{ chapter, completed, allCompleted }`
  - `all_chapters_completed`: `{ nextUrl: '/finale' }`
  - `error_message`: `{ message }`

### 3. Shared Client Connector (`room-client.js`)
Exposes `window.Room`:
- `Room.init(options)`
- `Room.create(playerName)`
- `Room.join(roomCode, playerName)`
- `Room.claim(chapter)`
- `Room.complete(chapter)`
- `Room.on(event, callback)`
- `Room.getState()`
- `Room.getPlayer()`
- `Room.isHost()`
- Auto-reconnection on page load using stored `sandwich_room_code` and `sandwich_player_id`.

---

## Tasks

### Task 1: Initialize Project & Dependencies
- [x] Create directory `sandwich-hell` and subdirectories (`public/shared`, `public/lobby`, `public/intro`, `public/pick`, `public/hell`, `public/alien`, `public/ocean`, `public/market`, `public/finale`).
- [x] Create `sandwich-hell/package.json` with `"dependencies": { "express": "^4.19.2", "socket.io": "^4.7.5" }`.
- [x] Run `npm install` in `sandwich-hell`.

### Task 2: Implement Authoritative Server (`sandwich-hell/server.js`)
- [x] Express web server serving static files from `sandwich-hell/public`.
- [x] Configure URL rewrites / friendly routes (`/lobby`, `/intro`, `/pick`, `/hell`, `/alien`, `/ocean`, `/market`, `/finale`).
- [x] Implement in-memory room store with clean 6-character room codes.
- [x] Implement atomic chapter claim logic with lock broadcast.
- [x] Implement completion gate logic broadcasting transition to `/finale` when all 4 report complete.
- [x] Implement local IP detection logging (displays both `http://localhost:3000` and `http://<LAN_IP>:3000` on startup for multi-device play).

### Task 3: Implement Shared Room Client (`sandwich-hell/public/shared/room-client.js`)
- [x] Socket.IO initialization and automatic reconnection handling.
- [x] Storage sync across `sessionStorage` and `localStorage` so refreshing or moving between pages (`/pick` -> `/hell` -> `/finale`) maintains room and player context.
- [x] Simple, developer-friendly API: `Room.complete('hell')`, `Room.claim('hell')`, `Room.on('room_updated', ...)`.

### Task 4: Verification Script & Phase Gate
- [x] Write a Node.js verification script (`sandwich-hell/test-socket-flow.js`) that simulates 4 distinct socket clients:
  1. Client 1 creates room `TEST01`, verifies host status.
  2. Clients 2, 3, 4 join room `TEST01`.
  3. Client 1 claims `hell`; Client 2 attempts to claim `hell` (verifies rejection).
  4. Clients 2, 3, 4 claim `alien`, `ocean`, `market` successfully.
  5. Clients 1, 2, 3, 4 report completion sequentially.
  6. Verify server emits `all_chapters_completed` with `nextUrl: '/finale'`.
- [x] Run verification script to guarantee server correctness (6/6 tests passed).
