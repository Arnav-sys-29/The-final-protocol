const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Clean URL routing to respective page index.html files
const pages = ['lobby', 'intro', 'pick', 'hell', 'alien', 'ocean', 'market', 'finale'];

pages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(publicDir, page, 'index.html'));
  });
});

// Root redirects to lobby
app.get('/', (req, res) => {
  res.redirect('/lobby');
});

// Consolidated Market Judge API (replaces standalone judge server)
app.post('/api/judge', (req, res) => {
  const { code, tests, criteria } = req.body;
  // Lightweight mock evaluator / judge endpoint for market chapter logic
  res.json({
    success: true,
    message: 'Market judge evaluation passed',
    timestamp: Date.now()
  });
});

// Health check / server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    title: 'The Legendary Sandwich From Hell',
    activeRooms: Object.keys(rooms).length
  });
});

// In-Memory Authoritative Room State
const rooms = {};

/**
 * Generate a random 6-character alphanumeric room code (e.g. "HELL01", "VORB99")
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omit ambiguous 0/O, 1/I
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

/**
 * Return sanitized room state safe to broadcast to clients
 */
function getPublicRoomState(room) {
  if (!room) return null;
  return {
    code: room.code,
    hostId: room.hostId,
    phase: room.phase,
    playerCount: Object.keys(room.players).length,
    players: Object.values(room.players).map(p => ({
      id: p.id,
      name: p.name,
      chapter: p.chapter,
      ready: p.ready,
      connected: p.connected,
      isHost: p.id === room.hostId
    })),
    claims: { ...room.claims },
    completed: { ...room.completed },
    bossHealth: room.bossHealth,
    bossPatches: { ...room.bossPatches }
  };
}

// Socket.IO Room Management & State Machine
io.on('connection', (socket) => {
  let currentRoomCode = null;
  let currentPlayerId = null;

  // 1. Create Room
  socket.on('create_room', ({ playerName }) => {
    const code = generateRoomCode();
    const playerId = 'player_' + crypto.randomBytes(4).toString('hex');
    const cleanName = (playerName || 'Chef ' + code.slice(0, 3)).trim();

    const room = {
      code,
      hostId: playerId,
      phase: 'lobby',
      players: {},
      claims: {
        hell: null,
        alien: null,
        ocean: null,
        market: null
      },
      completed: {
        hell: false,
        alien: false,
        ocean: false,
        market: false
      },
      bossHealth: 100,
      bossPatches: {
        hell: false,
        alien: false,
        ocean: false,
        market: false
      },
      createdAt: Date.now()
    };

    const player = {
      id: playerId,
      name: cleanName,
      socketId: socket.id,
      chapter: null,
      ready: true,
      connected: true
    };

    room.players[playerId] = player;
    rooms[code] = room;

    currentRoomCode = code;
    currentPlayerId = playerId;

    socket.join(`room_${code}`);

    socket.emit('room_created', {
      roomCode: code,
      playerId,
      isHost: true,
      player,
      roomState: getPublicRoomState(room)
    });
  });

  // 2. Join Room
  socket.on('join_room', ({ roomCode, playerName, playerId }) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms[code];

    if (!room) {
      return socket.emit('error_message', { message: `Room "${code}" not found. Check the code and try again.` });
    }

    // Check if player is reconnecting
    if (playerId && room.players[playerId]) {
      const existingPlayer = room.players[playerId];
      existingPlayer.socketId = socket.id;
      existingPlayer.connected = true;
      if (playerName) existingPlayer.name = playerName.trim();

      currentRoomCode = code;
      currentPlayerId = playerId;

      socket.join(`room_${code}`);

      socket.emit('room_joined', {
        roomCode: code,
        playerId,
        isHost: playerId === room.hostId,
        player: existingPlayer,
        roomState: getPublicRoomState(room)
      });

      io.to(`room_${code}`).emit('room_updated', {
        roomState: getPublicRoomState(room)
      });
      return;
    }

    // New player joining - check capacity
    const currentCount = Object.keys(room.players).length;
    if (currentCount >= 4) {
      return socket.emit('error_message', { message: `Room "${code}" is already full (max 4 players).` });
    }

    const newPlayerId = playerId || ('player_' + crypto.randomBytes(4).toString('hex'));
    const cleanName = (playerName || `Chef ${currentCount + 1}`).trim();

    const player = {
      id: newPlayerId,
      name: cleanName,
      socketId: socket.id,
      chapter: null,
      ready: true,
      connected: true
    };

    room.players[newPlayerId] = player;
    currentRoomCode = code;
    currentPlayerId = newPlayerId;

    socket.join(`room_${code}`);

    socket.emit('room_joined', {
      roomCode: code,
      playerId: newPlayerId,
      isHost: newPlayerId === room.hostId,
      player,
      roomState: getPublicRoomState(room)
    });

    io.to(`room_${code}`).emit('room_updated', {
      roomState: getPublicRoomState(room)
    });
  });

  // 3. Reconnect / Sync State
  socket.on('sync_room', ({ roomCode, playerId }) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms[code];
    if (!room || !playerId || !room.players[playerId]) {
      return socket.emit('sync_failed', { message: 'Session expired or invalid room.' });
    }

    room.players[playerId].socketId = socket.id;
    room.players[playerId].connected = true;
    currentRoomCode = code;
    currentPlayerId = playerId;

    socket.join(`room_${code}`);

    socket.emit('sync_success', {
      roomCode: code,
      playerId,
      isHost: playerId === room.hostId,
      player: room.players[playerId],
      roomState: getPublicRoomState(room)
    });

    io.to(`room_${code}`).emit('room_updated', {
      roomState: getPublicRoomState(room)
    });
  });

  // 4. Start Game (Host only -> Intro)
  socket.on('start_game', ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.hostId !== playerId) {
      return socket.emit('error_message', { message: 'Only the host can start the game.' });
    }

    room.phase = 'intro';
    io.to(`room_${roomCode}`).emit('phase_changed', {
      phase: 'intro',
      nextUrl: '/intro',
      roomState: getPublicRoomState(room)
    });
  });

  // 5. Advance Phase (Host or triggered by intro end -> Picking)
  socket.on('advance_phase', ({ roomCode, playerId, phase }) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.hostId !== playerId && phase !== 'picking') {
      return socket.emit('error_message', { message: 'Unauthorized phase transition.' });
    }

    room.phase = phase;
    io.to(`room_${roomCode}`).emit('phase_changed', {
      phase,
      nextUrl: `/${phase}`,
      roomState: getPublicRoomState(room)
    });
  });

  // 6. Atomic Chapter Claiming (First-Come, First-Served Lock)
  socket.on('claim_chapter', ({ roomCode, playerId, chapter }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const validChapters = ['hell', 'alien', 'ocean', 'market'];
    if (!validChapters.includes(chapter)) {
      return socket.emit('claim_rejected', { chapter, reason: 'Invalid chapter identifier.' });
    }

    // Check if already claimed by someone else
    const currentOwner = room.claims[chapter];
    if (currentOwner && currentOwner !== playerId) {
      const ownerName = room.players[currentOwner] ? room.players[currentOwner].name : 'Another player';
      return socket.emit('claim_rejected', {
        chapter,
        reason: `Locked! Claimed by ${ownerName}.`
      });
    }

    // Release any previous claim by this player
    for (const ch of validChapters) {
      if (room.claims[ch] === playerId && ch !== chapter) {
        room.claims[ch] = null;
      }
    }

    // Set new claim
    room.claims[chapter] = playerId;
    if (room.players[playerId]) {
      room.players[playerId].chapter = chapter;
    }

    // Confirm to claimant with redirect URL
    socket.emit('claim_confirmed', {
      chapter,
      url: `/${chapter}`,
      roomState: getPublicRoomState(room)
    });

    // Broadcast lock update to all screens in the room
    io.to(`room_${roomCode}`).emit('chapter_claimed', {
      chapter,
      playerId,
      playerName: room.players[playerId] ? room.players[playerId].name : 'Unknown',
      claims: { ...room.claims },
      roomState: getPublicRoomState(room)
    });
  });

  // 7. Chapter Completion Gate (All 4 must finish to trigger Finale)
  socket.on('complete_chapter', ({ roomCode, playerId, chapter }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.completed.hasOwnProperty(chapter)) {
      room.completed[chapter] = true;
    }

    const completedCount = Object.values(room.completed).filter(Boolean).length;
    const allCompleted = completedCount >= 4;

    io.to(`room_${roomCode}`).emit('chapter_completed', {
      chapter,
      playerId,
      completed: { ...room.completed },
      completedCount,
      totalCount: 4,
      allCompleted,
      roomState: getPublicRoomState(room)
    });

    if (allCompleted) {
      room.phase = 'finale';
      io.to(`room_${roomCode}`).emit('all_chapters_completed', {
        phase: 'finale',
        nextUrl: '/finale',
        roomState: getPublicRoomState(room)
      });
    }
  });

  // 8. Finale Boss Fight Patching (Vorbulon Collaborative Debugging)
  socket.on('patch_boss_function', ({ roomCode, playerId, chapter }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.bossPatches.hasOwnProperty(chapter)) {
      room.bossPatches[chapter] = true;
    }

    const patchedCount = Object.values(room.bossPatches).filter(Boolean).length;
    room.bossHealth = Math.max(0, 100 - (patchedCount * 25));

    io.to(`room_${roomCode}`).emit('boss_updated', {
      chapter,
      bossHealth: room.bossHealth,
      bossPatches: { ...room.bossPatches },
      patchedCount,
      allPatched: patchedCount >= 4,
      roomState: getPublicRoomState(room)
    });

    if (patchedCount >= 4) {
      room.phase = 'ending';
      io.to(`room_${roomCode}`).emit('boss_defeated', {
        phase: 'ending',
        nextUrl: '/finale#ending',
        roomState: getPublicRoomState(room)
      });
    }
  });

  // Handle Disconnect
  socket.on('disconnect', () => {
    if (currentRoomCode && currentPlayerId && rooms[currentRoomCode]) {
      const room = rooms[currentRoomCode];
      if (room.players[currentPlayerId]) {
        room.players[currentPlayerId].connected = false;
        io.to(`room_${currentRoomCode}`).emit('room_updated', {
          roomState: getPublicRoomState(room)
        });
      }
    }
  });
});

// Network IP Helper
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const { exec } = require('child_process');

function openBrowser(url) {
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${url}`, (err) => {
    if (err) console.warn('Could not auto-open browser:', err.message);
  });
}

// Handle Port in Use gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`⚠️  Port ${PORT} is busy. Trying http://localhost:${nextPort}...`);
    PORT = nextPort;
    server.listen(PORT, '0.0.0.0');
  } else {
    console.error('Server error:', err);
  }
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log('=================================================================');
  console.log('🥪  THE LEGENDARY SANDWICH FROM HELL — AUTHORITATIVE SERVER  🥪');
  console.log('=================================================================');
  console.log(`Local Access:   http://localhost:${PORT}`);
  console.log(`LAN Access:     http://${localIp}:${PORT}  (Connect from 4 monitors/PCs)`);
  console.log('=================================================================');

  const shouldOpen = process.argv.includes('--open') || process.env.npm_lifecycle_event === 'dev';
  if (shouldOpen) {
    console.log(`🚀 Launching live page in browser: http://localhost:${PORT}/lobby ...`);
    setTimeout(() => {
      openBrowser(`http://localhost:${PORT}/lobby`);
    }, 600);
  }
});

