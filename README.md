# 🥪 The Legendary Sandwich From Hell
### *The Final Protocol — 4-Player Cooperative Coding Adventure*

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-black.svg)](https://socket.io/)
[![Express](https://img.shields.io/badge/Express-v4.21-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Automated%20Tests-320%2F320%20PASS-brightgreen.svg)]()

> A cooperative, real-time multiplayer culinary horror game engineered for computer lab tournaments, LAN classrooms, and distributed play. Four chefs unite across separate screens to harvest arcane ingredients through coding challenges and defend the ultimate sandwich from the star-beast **Vorbulon**!

---

## 🎮 Game Overview

Four players connect simultaneously via room code (or custom room name) from four separate screens/PCs. Each chef claims one of the four legendary ingredient realms:

| Chapter | Ingredient | Domain | Core Challenge |
|---|---|---|---|
| **Infernal Cheese** (`/hell`) | 🧀 Infernal Cheese | C / C++ / Java Debugging | 10 broken code scrolls — diagnose syntax and logic errors to melt the cheese. |
| **Cosmic Vegetables** (`/alien`) | 🥬 Cosmic Vegetables | Loop & Array Algorithms | 12 cultivation puzzles — grow and harvest alien crops using AST-evaluated logic. |
| **Abyssal Sauce** (`/ocean`) | 🌶️ Abyssal Sauce | Switch-Case Logic | 10 cauldron recipes — calibrate arcane brews using condition switches and fall-through guards. |
| **Eldritch Bread** (`/market`) | 🍞 Eldritch Bread | Data Queues & Simulation | 10 bakery challenges — satisfy hungry goblin queues with judged C/C++/Java solutions. |

Each realm requires **6 solved puzzles** to secure its ingredient. Once all four ingredients are gathered, the game transitions into the animated cinematic cutscenes and the climactic boss showdown!

---

## ⚔️ The Vorbulon Boss Battle

- **Pokemon GBA-Style Battle Arena**: Classic retro visual aesthetic featuring custom monster animations (`Idle.mp4`, `Atack.mp4`, `Damage.mp4`).
- **12-Second Rapid-Fire Timer**: The Team Leader faces 20 corrupted C programs with syntax and logical bugs.
- **15% Health Impact**:
  - **Correct Patch**: -15% Vorbulon HP (7 strikes to defeat).
  - **Error or Timeout**: -15% Chef HP (7 mistakes before defeat).
- **Live Spectator Stream**: Teammates watch the leader's real-time battle status, health bars, and combat log live on their screens.
- **Synchronized Cinematics**: Simultaneous fullscreen `WIN.mp4` or `LOSE.mp4` playback on all four monitors, followed by team statistics and return-to-lobby navigation.

---

## 🌐 Computer Lab & Multi-PC Architecture

- **Authoritative Node.js Server**: Central state machine tracking rooms, player rosters, ingredient locks, and combat state in-memory.
- **0.0.0.0 Host Binding**: Accessible over LAN (`http://<ip>:3000`) or reverse proxies/forwarded ports (VS Code Port Forwarding, ngrok, Cloudflare Tunnel).
- **Zero Hardcoded URLs**: All client connections use `window.location.origin` with automatic WebSocket and polling fallback transports.
- **Room-Code-Only Join**: Students on lab PCs can join rooms typing only the room code; unprovided names automatically default to `Chef 2`, `Chef 3`, `Chef 4`.
- **Multi-Room Concurrency Isolation**: Multiple teams can play simultaneously with zero state contamination across rooms.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Launch

```bash
# Clone the repository
git clone https://github.com/Arnav-sys-29/The-final-protocol.git
cd The-final-protocol/sandwich-hell

# Install dependencies
npm install

# Start the game server
npm start
```

The game server is now running on:
- **Local Access:** `http://localhost:3000`
- **LAN Access:** `http://<your-lan-ip>:3000`

---

## 🧪 Automated Test Suites

The codebase includes comprehensive programmatic verification suites covering 320 automated checks:

```bash
cd sandwich-hell

# 1. Multi-Room Concurrency & Event Channel Isolation
node test-multi-room.js

# 2. Comprehensive 42-Puzzle AST & Quota Suite
node test-puzzle-suite.js

# 3. Full End-to-End Multi-Client Game Simulation
node test-e2e-simulation.js

# 4. Boss Combat & Cutscene Integrity Suite
node test-boss-battle.js

# 5. Levels HTTP Routes & AST API Judge Suite
node test-levels-integration.js
```

---

## 📂 Project Structure

```
├── .planning/                  # Project roadmap, state tracking & verification reports
├── CINEMATICS/                 # High-definition cutscene and ending MP4 assets
├── LEVELS/                     # Standalone chapter reference templates
├── Monster Animations/         # Vorbulon boss battle MP4 combat animations
├── sandwich-hell/              # Core application package
│   ├── server.js               # Authoritative Express & Socket.IO game server
│   ├── package.json            # Node dependencies and scripts
│   ├── public/                 # Static web client assets
│   │   ├── lobby/              # Room creation, code copy, and live player roster
│   │   ├── intro/              # Synchronized prologue cinematic screen
│   │   ├── pick/               # Real-time interactive 4-ingredient picker
│   │   ├── hell/               # Infernal Cheese C/C++/Java debugging level
│   │   ├── alien/              # Cosmic Vegetables algorithmic cultivation level
│   │   ├── ocean/              # Abyssal Sauce switch-case potion level
│   │   ├── market/             # Eldritch Bread queue problems level
│   │   ├── cutscene/           # Sandwich assembly & monster arrival cutscene
│   │   ├── finale/             # Pokemon GBA Vorbulon boss battle & endings
│   │   └── shared/             # Room client, chapter HUD, audio, themes, parallax
│   └── test-*.js               # Automated verification and regression test suites
└── README.md
```

---

## 👥 Authors & Credits

Developed by **Arnav Srivastava** & Team for **The Legendary Sandwich From Hell**.
- **Repository:** [Arnav-sys-29/The-final-protocol](https://github.com/Arnav-sys-29/The-final-protocol.git)
- **Engine:** Node.js, Express, Socket.IO, Canvas & Custom AST Evaluators.

