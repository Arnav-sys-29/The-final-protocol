/**
 * Automated Verification Test for Phase 3 Levels Integration
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const io = require('socket.io-client');

const PORT = 3005;
process.env.PORT = PORT;
require('./server.js');
const SERVER_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🧪 Starting Phase 3 Levels Integration Verification Suite...\n');
  await new Promise(r => setTimeout(r, 600));
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Verify File System Integrity & Hook Injections
  console.log('--- 1. File System & Hook Injections Check ---');
  const levels = [
    { name: 'Infernal Cheese', file: 'hell/index.html', hook: "Room.complete('hell')" },
    { name: 'Cosmic Vegetables', file: 'alien/index.html', hook: "Room.complete('alien')" },
    { name: 'Abyssal Sauce', file: 'ocean/index.html', hook: "Room.complete('ocean')" },
    { name: 'Eldritch Bread', file: 'market/index.html', hook: "Room.complete('market')" }
  ];

  for (const lvl of levels) {
    const fullPath = path.join(__dirname, 'public', lvl.file);
    const exists = fs.existsSync(fullPath);
    assert(exists, `${lvl.name} exists at ${lvl.file}`);
    if (exists) {
      const content = fs.readFileSync(fullPath, 'utf8');
      assert(content.includes('room-client.js'), `${lvl.name} includes room-client.js`);
      assert(content.includes('chapter-hud.js'), `${lvl.name} includes chapter-hud.js`);
      assert(content.includes(lvl.hook), `${lvl.name} includes completion hook ${lvl.hook}`);
    }
  }

  // 2. HTTP Endpoint Verification
  console.log('\n--- 2. HTTP Route Endpoints Check ---');
  function getUrl(route) {
    return new Promise((resolve) => {
      http.get(`${SERVER_URL}${route}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }).on('error', (err) => resolve({ status: 0, error: err.message }));
    });
  }

  for (const page of ['/hell', '/alien', '/ocean', '/market', '/pick']) {
    const res = await getUrl(page);
    assert(res.status === 200, `HTTP GET ${page} returns 200 OK`);
  }

  // 3. API Endpoints Check (/api/submit and /api/judge)
  console.log('\n--- 3. API Judge Endpoints Check ---');
  function postJson(route, payload) {
    return new Promise((resolve) => {
      const data = JSON.stringify(payload);
      const req = http.request(`${SERVER_URL}${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(body) });
          } catch(e) {
            resolve({ status: res.statusCode, body });
          }
        });
      });
      req.on('error', err => resolve({ status: 0, error: err.message }));
      req.write(data);
      req.end();
    });
  }

  const submitRes = await postJson('/api/submit', {
    problemId: 'smallest',
    lang: 'c',
    code: '#include <stdio.h>\nint main(){ int n, min, x; if(scanf("%d%d", &n, &min)!=2) return 0; while(--n && scanf("%d", &x)==1){ if(x < min) min = x; } printf("%d\\n", min); return 0; }'
  });
  assert(submitRes.status === 200 && submitRes.json && submitRes.json.status === 'accepted', 'POST /api/submit compiles and accepts smallest code');

  const judgeRes = await postJson('/api/judge', {
    source: '#include <stdio.h>\nint main(){ int a, b; if(scanf("%d%d", &a, &b)==2) printf("%d\\n", a+b); return 0; }',
    language: 'c',
    inputs: ['2 3', '10 20']
  });
  assert(judgeRes.status === 200 && judgeRes.json && Array.isArray(judgeRes.json.results) && judgeRes.json.results.length === 2, 'POST /api/judge runs batch simulation correctly');

  const instantWinRes = await postJson('/api/instant-win', {
    roomCode: 'TEST99',
    chapter: 'hell'
  });
  assert(instantWinRes.status === 200 && instantWinRes.json && instantWinRes.json.success === true, 'POST /api/instant-win marks chapter completed without room dependency');

  const instantWinAllRes = await postJson('/api/instant-win', {
    roomCode: 'TEST99',
    winAll: true
  });
  assert(instantWinAllRes.status === 200 && instantWinAllRes.json && instantWinAllRes.json.allCompleted === true, 'POST /api/instant-win winAll marks all 4 chapters completed');

  // 4. Multiplayer 4-Chapter Completion Flow
  console.log('\n--- 4. Multiplayer 4-Chapter Completion Simulation ---');
  await new Promise((resolve) => {
    const hostSocket = io(SERVER_URL);
    hostSocket.on('connect', () => {
      hostSocket.emit('create_room', { playerName: 'Head Chef' });
    });

    hostSocket.on('room_created', ({ roomCode, playerId }) => {
      assert(Boolean(roomCode), `Host created room: ${roomCode}`);

      // Complete all 4 chapters
      hostSocket.emit('complete_chapter', { roomCode, playerId, chapter: 'hell' });
      hostSocket.emit('complete_chapter', { roomCode, playerId, chapter: 'alien' });
      hostSocket.emit('complete_chapter', { roomCode, playerId, chapter: 'ocean' });
      hostSocket.emit('complete_chapter', { roomCode, playerId, chapter: 'market' });
    });

    hostSocket.on('all_chapters_completed', (data) => {
      assert(data.phase === 'finale' || data.phase === 'cutscene', 'All 4 chapters completed triggers finale or cutscene phase');
      assert(data.nextUrl === '/finale' || data.nextUrl === '/cutscene', 'Next URL is /cutscene or /finale');
      hostSocket.disconnect();
      resolve();
    });
  });

  console.log(`\n=========================================`);
  console.log(`Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`=========================================\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
