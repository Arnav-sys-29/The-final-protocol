# 🥪 Teammate Integration Guide — Chapter Template Contract

Welcome to **The Legendary Sandwich From Hell**!

Each teammate is in charge of one of the 4 culinary horror realms:
1. **`/hell`** — Infernal Cheese (Booleans & Thermal Gates)
2. **`/alien`** — Cosmic Vegetables (Loops & Hydroponic Bio-Purge)
3. **`/ocean`** — Abyssal Sauce (Recursion & Pressure Chamber)
4. **`/market`** — Eldritch Bread (Strings/Arrays & Goblin Shadow Ledger)

---

## ⚡ The Drop-In Integration Contract

Each chapter is 100% self-contained. You can keep the default C code puzzle, or replace the entire `<main class="chapter-workspace">` with your own custom canvas, WebGL engine, 3D Mol* viewer, or mini-game.

To plug your work into the live 4-player multiplayer flow, you only need to ensure **two things**:

### 1. Include the Shared Room Client
In your `<head>` or at the bottom of your `<body>`:
```html
<script src="/socket.io/socket.io.js"></script>
<script src="/shared/room-client.js"></script>
```

### 2. Signal Chapter Completion
When the player beats your puzzle / minigame, call:
```javascript
// Replace 'hell' with your chapter ID: 'hell' | 'alien' | 'ocean' | 'market'
window.Room.complete('hell');
```

That is literally all! The authoritative server automatically tracks which players have completed their ingredients. When all 4 chefs finish, the server broadcasts `all_chapters_completed` and seamlessly warps everyone to `/finale`!

---

## 🛠️ Accessing Multiplayer Session Data

`window.Room` provides easy getters for HUD display:
```javascript
// Get room code (e.g. "HELL-42")
const roomCode = window.Room.getRoomCode();

// Get player name (e.g. "Chef Gordon")
const playerName = window.Room.getPlayerName();

// Check if this player is the room host
const isHost = window.Room.isHost();

// Listen to room events
window.Room.on('room_updated', ({ roomState }) => {
  console.log('Other chefs in room:', roomState.players);
  console.log('Ingredients completed:', roomState.completed);
});

window.Room.on('chapter_completed', ({ chapter, completedCount }) => {
  console.log(`Ingredient ${chapter} was secured! Total completed: ${completedCount}/4`);
});
```

---

## 👻 Optional Spooky Effects
To match the cosmic horror aesthetic, you can include our shared design system:
```html
<!-- Spooky Theme CSS & Fonts -->
<link rel="stylesheet" href="/shared/theme.css">
<link rel="stylesheet" href="/shared/chapter.css">

<!-- Parallax & Interactive Fleeing Ghosts / Pumpkins -->
<script src="/shared/parallax.js"></script>
<script src="/shared/spooky-entities.js"></script>
<script src="/shared/audio.js"></script>
```

---

## 🧪 Testing Locally
Run from the root directory:
```bash
npm run dev
```
Open 4 browser windows or tabs. You can use the **⚡ Instant Victory (Dev)** button on any chapter page to instantly test the 4-player completion synchronization!
