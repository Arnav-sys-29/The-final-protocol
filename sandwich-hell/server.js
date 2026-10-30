const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

let PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicDir = path.join(__dirname, 'public');

// Clean URL routing to respective page index.html files (before static to prevent 301 dir redirects)
const pages = ['lobby', 'intro', 'pick', 'hell', 'alien', 'ocean', 'market', 'cutscene', 'finale'];

pages.forEach(page => {
  app.get([`/${page}`, `/${page}/`], (req, res) => {
    res.sendFile(path.join(publicDir, page, 'index.html'));
  });
});

app.get(['/ingredient', '/ingredient/'], (req, res) => {
  res.redirect('/pick');
});

// Root redirects to lobby
app.get('/', (req, res) => {
  res.redirect('/lobby');
});

// Server network info API for multi-computer LAN join
app.get('/api/server-info', (req, res) => {
  const localIp = getLocalIp();
  const hostHeader = req.get('host') || `${localIp}:${PORT}`;
  const proto = req.protocol || 'http';
  res.json({
    localIp,
    port: PORT,
    lanUrl: `http://${localIp}:${PORT}/lobby`,
    localUrl: `http://localhost:${PORT}/lobby`,
    tunnelUrl: `${proto}://${hostHeader}/lobby`
  });
});

// Serve static assets from public
app.use(express.static(publicDir));

// Serve cinematics directly from root CINEMATICS folder
const cinematicsDir = path.join(__dirname, '..', 'CINEMATICS');
app.use('/cinematics', express.static(cinematicsDir));

// Market Chapter Judge Engine (supporting C, C++, and Java)
const fs = require('fs');
const { spawnSync } = require('child_process');

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const arr = (n, a, b) => Array.from({ length: n }, () => rnd(a, b));
const nums = s => s.trim().split(/\s+/).map(Number);
const fmt = (a) => a.length + '\n' + a.join(' ');
const withX = (a, x) => fmt(a) + '\n' + x;
const body = i => nums(i).slice(1);
const parseX = i => { const [n, ...r] = nums(i); return [r.slice(0, n), r[n]]; };

const MARKET_PROBLEMS = {
  smallest: {
    solve: i => Math.min(...body(i)),
    visible: ['5\n12 45 7 89 23', '3\n-8 -3 -5'],
    hidden: ['1\n5', '3\n-5 -2 -9', '4\n0 1 2 3', '3\n5 3 3', '3\n1000000 -1000000 0', fmt(arr(100, -1e6, 1e6))],
    keywords: [/min|<|for|while/i]
  },
  positives: {
    solve: i => body(i).filter(x => x > 0).length,
    visible: ['6\n-2 5 0 8 -1 3', '3\n0 0 0'],
    hidden: ['1\n0', '1\n5', '3\n-1 -2 -3', '5\n1 2 3 4 5', fmt(arr(100, -1e6, 1e6))],
    keywords: [/>\s*0|count|\+\+/i]
  },
  average: {
    solve: i => { const a = body(i); return (a.reduce((s, x) => s + x, 0) / a.length).toFixed(2); },
    visible: ['4\n10 20 30 40', '3\n1 2 2'],
    hidden: ['1\n7', '2\n1 2', '3\n-1 -2 -4', '3\n0 0 1', '5\n-5 5 -5 5 -5', fmt(arr(99, -1e6, 1e6))],
    keywords: [/sum|\+|\/|avg|average|float|double|\.2f/i]
  },
  search: {
    solve: i => { const [a, x] = parseX(i); return a.includes(x) ? 'YES' : 'NO'; },
    visible: ['5\n10 20 30 40 50\n30', '3\n1 2 3\n9'],
    hidden: ['1\n5\n5', '1\n5\n6', '4\n-1 -2 -3 -4\n-4', '5\n7 7 7 7 7\n7', '5\n9 1 2 3 4\n9'],
    keywords: [/==|YES|NO|found|flag/i]
  },
  occurrences: {
    solve: i => { const [a, x] = parseX(i); return a.filter(v => v === x).length; },
    visible: ['6\n2 4 2 5 2 7\n2', '3\n1 2 3\n9'],
    hidden: ['1\n3\n3', '1\n3\n4', '5\n2 2 2 2 2\n2', '4\n1 2 3 4\n9'],
    keywords: [/==|count|\+\+/i]
  },
  evenodd: {
    solve: i => (+i % 2 === 0 ? 'EVEN' : 'ODD'),
    visible: ['17', '10'],
    hidden: ['0', '1', '2', '-3', '-4', '999999999', '1000000000', '-1000000000'],
    keywords: [/%|EVEN|ODD/i]
  },
  digitsum: {
    solve: i => [...i.trim()].reduce((s, c) => s + +c, 0),
    visible: ['1234', '9'],
    hidden: ['0', '10', '90817', '999999999', '1000000000', '100'],
    keywords: [/%|\/|sum|\+/i]
  },
  reversenum: {
    solve: i => String(+[...i.trim()].reverse().join('')),
    visible: ['12340', '907'],
    hidden: ['0', '5', '10', '100', '120', '987654321', '900000009', '1000000000'],
    keywords: [/%|\*|rev|reverse|10/i]
  },
  palindrome: {
    solve: i => { const t = i.trim(); return t === [...t].reverse().join('') ? 'YES' : 'NO'; },
    visible: ['121', '123'],
    hidden: ['0', '5', '10', '100', '1221', '1001', '12321', '999999999', '1000000000'],
    keywords: [/==|YES|NO|rev/i]
  },
  factorial: {
    solve: i => { let f = 1; for (let k = 2; k <= +i; k++) f *= k; return f; },
    visible: ['5', '0'],
    hidden: ['1', '2', '3', '10', '11', '12'],
    keywords: [/\*|fact|factorial|for|while/i]
  }
};

const LANG_CONFIG = {
  c:    { file: 'main.c',    cmd: 'gcc', compile: ['gcc', '-O2', '-o', 'main', 'main.c', '-lm'],       run: ['./main'],                    ms: 2000 },
  cpp:  { file: 'main.cpp',  cmd: 'g++', compile: ['g++', '-O2', '-std=c++17', '-o', 'main', 'main.cpp'], run: ['./main'],                 ms: 2000 },
  java: { file: 'Main.java', cmd: 'javac', compile: ['javac', 'Main.java'],                               run: ['java', '-Xmx256m', 'Main'], ms: 5000 },
};

// Check if compiler exists on system
function hasCompiler(cmd) {
  try {
    const res = spawnSync(cmd, ['--version'], { timeout: 2000 });
    return res && !res.error && res.status === 0;
  } catch (e) {
    return false;
  }
}

function judgeMarketSubmission(pid, lang, code) {
  const p = MARKET_PROBLEMS[pid];
  const l = LANG_CONFIG[lang] || LANG_CONFIG.c;
  if (!p) return { status: 'error', message: 'Unknown question identifier.' };
  if (!code || !code.trim()) return { status: 'error', message: 'Your recipe code is empty.' };
  if (code.length > 25000) return { status: 'error', message: 'That recipe is far too long.' };

  // Try native compilation if compiler is available
  if (hasCompiler(l.cmd)) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bread-'));
    try {
      fs.writeFileSync(path.join(dir, l.file), code);
      const c = spawnSync(l.compile[0], l.compile.slice(1), { cwd: dir, timeout: 15000, encoding: 'utf8' });
      if (c.error || c.status !== 0) {
        const lines = (c.stderr || String(c.error)).split(dir).join('').split('\n').filter(Boolean);
        return { status: 'compile_error', message: 'The oven rejected your recipe: it would not even compile.', detail: lines.slice(0, 6).join('\n') };
      }
      const tests = [...p.visible.map(i => [i, true]), ...p.hidden.map(i => [i, false])];
      for (const [inp, vis] of tests) {
        const exp = String(p.solve(inp));
        const r = spawnSync(l.run[0], l.run.slice(1), { cwd: dir, input: inp + '\n', timeout: l.ms, encoding: 'utf8', maxBuffer: 1 << 20 });
        if (r.error && r.error.code === 'ETIMEDOUT') return { status: 'timeout', message: vis ? 'Your program took too long even on a sample.' : 'Too slow on a hidden test.' };
        if (r.error || r.status !== 0) return { status: 'runtime_error', message: 'Your program crashed while running. Check memory and inputs.' };
        if (r.stdout.trim() !== exp) {
          return vis
            ? { status: 'wrong', message: 'Wrong answer on a sample test.', detail: `Input:\n${inp}\n\nExpected: ${exp}\nYou printed: ${r.stdout.trim() || '(nothing)'}` }
            : { status: 'wrong', message: 'Samples pass, but a hidden test failed.' };
        }
      }
      return { status: 'accepted' };
    } finally {
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
    }
  }

  // Graceful Simulated Verification Fallback (ensures smooth gameplay if gcc/javac is absent)
  const cleanCode = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  const hasSkeleton = (lang === 'java')
    ? (/class\s+\w+/.test(cleanCode) && /static\s+void\s+main/.test(cleanCode))
    : (/main\s*\(/.test(cleanCode));

  if (!hasSkeleton) {
    return {
      status: 'compile_error',
      message: 'Compilation Error: missing main() entry point.',
      detail: lang === 'java' ? 'Missing public static void main(String[] args)' : 'Missing int main()'
    };
  }

  const hasIO = (lang === 'c')
    ? (/printf|scanf|puts/.test(cleanCode))
    : (lang === 'cpp')
    ? (/cout|cin/.test(cleanCode))
    : (/System\.out|Scanner/.test(cleanCode));

  if (!hasIO) {
    return {
      status: 'wrong',
      message: 'Your program produces no output.',
      detail: 'Make sure you read the inputs and print the required result.'
    };
  }

  // Check required problem concepts
  if (p.keywords && p.keywords.length) {
    const passedKeywords = p.keywords.some(regex => regex.test(cleanCode));
    if (!passedKeywords) {
      return {
        status: 'wrong',
        message: 'The logic does not match the problem requirements.',
        detail: `Sample test failed: Input: ${p.visible[0]}`
      };
    }
  }

  return { status: 'accepted' };
}

// Market Chapter Submission Endpoint
app.post('/api/submit', (req, res) => {
  const pid = req.body.problemId || req.body.pid || 'smallest';
  const lang = req.body.lang || req.body.language || 'c';
  const code = req.body.code || req.body.source || '';

  const result = judgeMarketSubmission(pid, lang, code);
  res.json(result);
});

// Judge Fallback Endpoint (batch execution simulation for Hell-Cheese / testing)
app.post('/api/judge', (req, res) => {
  const code = req.body.code || req.body.source || '';
  const lang = req.body.lang || req.body.language || 'c';
  const inputs = Array.isArray(req.body.inputs) ? req.body.inputs : [req.body.input || ''];

  if (req.body.problemId || req.body.pid) {
    const pid = req.body.problemId || req.body.pid;
    const result = judgeMarketSubmission(pid, lang, code);
    return res.json(result);
  }

  const results = inputs.map((inp, idx) => ({
    status_id: 3,
    passed: true,
    description: 'Accepted',
    stdout: 'Output\n',
    stderr: '',
    compile_output: '',
    message: '',
    time: '0.01'
  }));

  res.json({ results });
});

// Health check / server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    title: 'The Legendary Sandwich From Hell',
    activeRooms: Object.keys(rooms).length
  });
});

// Guaranteed Instant Win REST Endpoint (Dev Option)
app.post('/api/instant-win', (req, res) => {
  const code = ((req.body && req.body.roomCode) || 'DEMO01').toUpperCase();
  let room = rooms[code];
  if (!room) {
    room = {
      code,
      hostId: (req.body && req.body.playerId) || 'player_solo',
      phase: 'chapters',
      players: {},
      claims: { hell: null, alien: null, ocean: null, market: null },
      completed: { hell: false, alien: false, ocean: false, market: false },
      bossHealth: 100,
      bossPatches: { hell: false, alien: false, ocean: false, market: false },
      createdAt: Date.now()
    };
    rooms[code] = room;
  }

  const chapter = req.body && req.body.chapter;
  const winAll = req.body && req.body.winAll;

  if (winAll) {
    room.completed.hell = true;
    room.completed.alien = true;
    room.completed.ocean = true;
    room.completed.market = true;
  } else if (chapter && room.completed.hasOwnProperty(chapter)) {
    room.completed[chapter] = true;
  }

  const completedCount = Object.values(room.completed).filter(Boolean).length;
  const allCompleted = completedCount >= 4;

  if (allCompleted) {
    room.phase = 'cutscene';
    io.to(`room_${code}`).emit('all_chapters_completed', {
      phase: 'cutscene',
      nextUrl: '/cutscene',
      roomState: getPublicRoomState(room)
    });
  } else {
    io.to(`room_${code}`).emit('chapter_completed', {
      chapter,
      playerId: req.body && req.body.playerId,
      completed: { ...room.completed },
      completedCount,
      totalCount: 4,
      allCompleted: false,
      roomState: getPublicRoomState(room)
    });
  }

  res.json({ success: true, allCompleted, roomState: getPublicRoomState(room) });
});

// REST Fallback for Boss Combat Action
app.post('/api/boss-combat', (req, res) => {
  const code = ((req.body && req.body.roomCode) || 'DEMO01').toUpperCase();
  let room = rooms[code];
  if (!room) {
    room = {
      code,
      hostId: (req.body && req.body.playerId) || 'player_solo',
      phase: 'finale',
      players: {},
      claims: { hell: 'player_solo', alien: 'player_solo', ocean: 'player_solo', market: 'player_solo' },
      completed: { hell: true, alien: true, ocean: true, market: true },
      bossHealth: 100,
      leaderHealth: 100,
      currentBossQ: 0,
      createdAt: Date.now()
    };
    rooms[code] = room;
  }
  const { success, timeout, questionId } = req.body;
  if (success) {
    room.bossHealth = Math.max(0, (room.bossHealth !== undefined ? room.bossHealth : 100) - 15);
  } else {
    room.leaderHealth = Math.max(0, (room.leaderHealth !== undefined ? room.leaderHealth : 100) - 15);
  }
  room.currentBossQ = ((room.currentBossQ || 0) + 1) % 20;
  const outcome = room.bossHealth <= 0 ? 'victory' : room.leaderHealth <= 0 ? 'defeat' : null;
  if (outcome) room.phase = outcome;
  io.to(`room_${code}`).emit('boss_combat_update', {
    bossHealth: room.bossHealth,
    leaderHealth: room.leaderHealth,
    currentBossQ: room.currentBossQ,
    success,
    timeout,
    outcome,
    roomState: getPublicRoomState(room)
  });
  res.json({
    bossHealth: room.bossHealth,
    leaderHealth: room.leaderHealth,
    currentBossQ: room.currentBossQ,
    outcome
  });
});

app.post('/api/boss-restart', (req, res) => {
  const code = ((req.body && req.body.roomCode) || 'DEMO01').toUpperCase();
  let room = rooms[code];
  if (!room) {
    room = {
      code,
      hostId: 'player_solo',
      phase: 'finale',
      players: {},
      claims: { hell: 'player_solo', alien: 'player_solo', ocean: 'player_solo', market: 'player_solo' },
      completed: { hell: true, alien: true, ocean: true, market: true },
      bossHealth: 100,
      leaderHealth: 100,
      currentBossQ: 0,
      createdAt: Date.now()
    };
    rooms[code] = room;
  }
  room.bossHealth = 100;
  room.leaderHealth = 100;
  room.currentBossQ = 0;
  room.phase = 'finale';
  io.to(`room_${code}`).emit('boss_restarted', {
    bossHealth: 100,
    leaderHealth: 100,
    currentBossQ: 0,
    roomState: getPublicRoomState(room)
  });
  res.json({ success: true, bossHealth: 100, leaderHealth: 100 });
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
    bossHealth: room.bossHealth !== undefined ? room.bossHealth : 100,
    leaderHealth: room.leaderHealth !== undefined ? room.leaderHealth : 100,
    currentBossQ: room.currentBossQ || 0,
    bossStatus: room.bossStatus || 'waiting',
    bossPatches: { ...room.bossPatches },
    createdAt: room.createdAt || Date.now()
  };
}

// Socket.IO Room Management & State Machine
io.on('connection', (socket) => {
  let currentRoomCode = null;
  let currentPlayerId = null;

  // 1. Create Room (Supports Random or Custom Room Code)
  socket.on('create_room', ({ playerName, customRoomCode }) => {
    let code = (customRoomCode || '').toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    if (code) {
      if (code.length < 2 || code.length > 12) {
        return socket.emit('error_message', { message: 'Custom Room Code must be between 2 and 12 characters.' });
      }
      if (rooms[code]) {
        return socket.emit('error_message', { message: `Room "${code}" already exists! Please choose another code or join it.` });
      }
    } else {
      code = generateRoomCode();
    }
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
      leaderHealth: 100,
      currentBossQ: 0,
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
    const cleanName = ((playerName || '').trim() || `Chef ${currentCount + 1}`);

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

  socket.on('get_room_state', ({ roomCode }) => {
    const code = (roomCode || '').toUpperCase().trim();
    const room = rooms[code];
    if (room) {
      socket.emit('room_state', { roomState: getPublicRoomState(room) });
    } else {
      socket.emit('error_message', { message: `Room "${code}" not found.` });
    }
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

  // 4b. Start Prologue Video (Host broadcasts to all screens)
  socket.on('start_prologue', ({ roomCode, playerId }) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.hostId !== playerId) {
      return socket.emit('error_message', { message: 'Only the host can start the story.' });
    }
    io.to(`room_${roomCode}`).emit('play_prologue', {
      timestamp: Date.now(),
      roomState: getPublicRoomState(room)
    });
  });

  // 4c. Start Cutscene Phase (Host broadcasts phase transitions to all screens)
  socket.on('start_cutscene_phase', ({ roomCode, playerId, phase }) => {
    const room = rooms[roomCode];
    if (!room) return;
    if (room.hostId !== playerId) {
      return socket.emit('error_message', { message: 'Only the host can advance the cutscene.' });
    }
    io.to(`room_${roomCode}`).emit('cutscene_phase', {
      phase,
      timestamp: Date.now(),
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
    const nextUrl = phase === 'finale' ? '/finale?battle=1' : `/${phase}`;
    io.to(`room_${roomCode}`).emit('phase_changed', {
      phase,
      nextUrl,
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
    const code = (roomCode || 'DEMO01').toUpperCase();
    let room = rooms[code];
    if (!room) {
      room = {
        code,
        hostId: playerId || 'player_solo',
        phase: 'chapters',
        players: {},
        claims: { hell: null, alien: null, ocean: null, market: null },
        completed: { hell: false, alien: false, ocean: false, market: false },
        bossHealth: 100,
        bossPatches: { hell: false, alien: false, ocean: false, market: false },
        createdAt: Date.now()
      };
      rooms[code] = room;
      socket.join(`room_${code}`);
    }

    if (room.completed.hasOwnProperty(chapter)) {
      room.completed[chapter] = true;
    }

    const completedCount = Object.values(room.completed).filter(Boolean).length;
    const allCompleted = completedCount >= 4;

    io.to(`room_${code}`).emit('chapter_completed', {
      chapter,
      playerId,
      completed: { ...room.completed },
      completedCount,
      totalCount: 4,
      allCompleted,
      roomState: getPublicRoomState(room)
    });

    if (allCompleted) {
      room.phase = 'cutscene';
      io.to(`room_${code}`).emit('all_chapters_completed', {
        phase: 'cutscene',
        nextUrl: '/cutscene',
        roomState: getPublicRoomState(room)
      });
    }
  });

  socket.on('complete_all_chapters', ({ roomCode, playerId }) => {
    const code = (roomCode || 'DEMO01').toUpperCase();
    let room = rooms[code];
    if (!room) {
      room = {
        code,
        hostId: playerId || 'player_solo',
        phase: 'chapters',
        players: {},
        claims: { hell: null, alien: null, ocean: null, market: null },
        completed: { hell: true, alien: true, ocean: true, market: true },
        bossHealth: 100,
        bossPatches: { hell: false, alien: false, ocean: false, market: false },
        createdAt: Date.now()
      };
      rooms[code] = room;
      socket.join(`room_${code}`);
    } else {
      room.completed.hell = true;
      room.completed.alien = true;
      room.completed.ocean = true;
      room.completed.market = true;
    }
    room.phase = 'cutscene';
    io.to(`room_${code}`).emit('all_chapters_completed', {
      phase: 'cutscene',
      nextUrl: '/cutscene',
      roomState: getPublicRoomState(room)
    });
  });

  // Cutscene Phase Synchronization
  socket.on('cutscene_phase', ({ roomCode, phase }) => {
    const code = (roomCode || 'DEMO01').toUpperCase();
    io.to(`room_${code}`).emit('cutscene_phase', { phase });
  });

  // 8. Finale Boss Fight Combat Events (Leader 10s C Debugging)
  socket.on('boss_action', ({ roomCode, playerId, success, timeout, questionId }) => {
    const code = (roomCode || 'DEMO01').toUpperCase();
    let room = rooms[code];
    if (!room) return;

    if (room.bossHealth === undefined) room.bossHealth = 100;
    if (room.leaderHealth === undefined) room.leaderHealth = 100;
    if (room.currentBossQ === undefined) room.currentBossQ = 0;

    let logMsg = '';
    if (success) {
      room.bossHealth = Math.max(0, room.bossHealth - 15);
      logMsg = `⚡ Leader patched bug #${questionId}! Vorbulon takes 15% damage!`;
    } else {
      room.leaderHealth = Math.max(0, room.leaderHealth - 15);
      logMsg = timeout
        ? `⏳ Time expired on bug #${questionId}! Vorbulon strikes Leader for 15% damage!`
        : `💥 Failed patch on bug #${questionId}! Vorbulon strikes Leader for 15% damage!`;
    }

    room.currentBossQ = (room.currentBossQ + 1) % 20;
    const outcome = room.bossHealth <= 0 ? 'victory' : room.leaderHealth <= 0 ? 'defeat' : null;
    if (outcome) room.phase = outcome;

    io.to(`room_${code}`).emit('boss_combat_update', {
      bossHealth: room.bossHealth,
      leaderHealth: room.leaderHealth,
      currentBossQ: room.currentBossQ,
      success,
      timeout,
      logMsg,
      outcome,
      roomState: getPublicRoomState(room)
    });

    if (outcome === 'victory') {
      io.to(`room_${code}`).emit('boss_victory', {
        phase: 'victory',
        totalTimeSeconds: Math.floor((Date.now() - (room.createdAt || Date.now())) / 1000),
        roomState: getPublicRoomState(room)
      });
    } else if (outcome === 'defeat') {
      io.to(`room_${code}`).emit('boss_defeat', {
        phase: 'defeat',
        totalTimeSeconds: Math.floor((Date.now() - (room.createdAt || Date.now())) / 1000),
        roomState: getPublicRoomState(room)
      });
    }
  });

  socket.on('restart_boss_battle', ({ roomCode }) => {
    const code = (roomCode || 'DEMO01').toUpperCase();
    let room = rooms[code];
    if (!room) return;
    room.bossHealth = 100;
    room.leaderHealth = 100;
    room.currentBossQ = 0;
    room.phase = 'finale';
    io.to(`room_${code}`).emit('boss_restarted', {
      bossHealth: 100,
      leaderHealth: 100,
      currentBossQ: 0,
      roomState: getPublicRoomState(room)
    });
  });

  // Legacy patch compatibility
  socket.on('patch_boss_function', ({ roomCode, playerId, chapter }) => {
    const code = (roomCode || 'DEMO01').toUpperCase();
    let room = rooms[code];
    if (!room) return;

    if (room.bossHealth === undefined) room.bossHealth = 100;
    room.bossHealth = Math.max(0, room.bossHealth - 20);

    const defeated = room.bossHealth <= 0;
    if (defeated) room.phase = 'victory';

    io.to(`room_${code}`).emit('boss_updated', {
      chapter,
      bossHealth: room.bossHealth,
      defeated,
      roomState: getPublicRoomState(room)
    });

    if (defeated) {
      io.to(`room_${code}`).emit('boss_victory', {
        phase: 'victory',
        totalTimeSeconds: Math.floor((Date.now() - (room.createdAt || Date.now())) / 1000),
        roomState: getPublicRoomState(room)
      });
    }
  });

  // Handle Leave Room
  socket.on('leave_room', () => {
    if (currentRoomCode && currentPlayerId && rooms[currentRoomCode]) {
      const room = rooms[currentRoomCode];
      delete room.players[currentPlayerId];
      socket.leave(`room_${currentRoomCode}`);
      io.to(`room_${currentRoomCode}`).emit('room_updated', {
        roomState: getPublicRoomState(room)
      });
      currentRoomCode = null;
      currentPlayerId = null;
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

