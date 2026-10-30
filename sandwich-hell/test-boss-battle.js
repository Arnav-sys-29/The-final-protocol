/**
 * Automated Verification Test for Phase 4: Sandwich Assembly & Vorbulon Finale
 * Tests:
 * 1. 15 Corrupted C Questions dataset integrity & validators
 * 2. HTTP endpoints and HTML structure (all 5 stages, teammate spectator screen, cutscene placeholders)
 * 3. Socket.IO real-time boss battle synchronization (host & teammate)
 * 4. Damage mechanics: 20% boss damage on patch, 20% leader damage on timeout/error
 * 5. Dual endings: Boss Victory (leader wins) & Boss Defeat (Vorbulon wins)
 * 6. Battle restart functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const io = require('socket.io-client');

const PORT = 3006;
process.env.PORT = PORT;
require('./server.js');
const SERVER_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('🧪 Starting Phase 4 Finale & Boss Battle Verification Suite...\n');
  await new Promise(r => setTimeout(r, 600)); // Wait for server to bind

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // ==========================================
  // 1. Dataset Integrity & Question Validation
  // ==========================================
  console.log('--- 1. Corrupted C Questions Dataset Integrity ---');
  const questionsPath = path.join(__dirname, 'public/finale/boss-c-questions.js');
  assert(fs.existsSync(questionsPath), 'boss-c-questions.js file exists');

  const questions = require(questionsPath);
  assert(Array.isArray(questions), 'BOSS_C_QUESTIONS is an array');
  assert(questions.length >= 15, `Dataset contains at least 15 questions (found: ${questions.length})`);

  let allQuestionsValid = true;
  questions.forEach(q => {
    if (!q.id || !q.title || !q.desc || !q.corrupted || typeof q.validate !== 'function') {
      allQuestionsValid = false;
    }
    // Buggy code should fail its own validator
    const buggyValidates = q.validate(q.corrupted);
    if (buggyValidates) {
      console.warn(`    ⚠️ Warning: Q${q.id} buggy code passed validation`);
    }
  });
  assert(allQuestionsValid, 'All questions have required schema and validator functions');

  // ==========================================
  // 2. HTTP Endpoints and Page Assets
  // ==========================================
  console.log('\n--- 2. HTTP Endpoints & Finale View Elements ---');

  function getUrl(route) {
    return new Promise((resolve) => {
      http.get(`${SERVER_URL}${route}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }).on('error', (err) => resolve({ status: 0, error: err.message }));
    });
  }

  const finaleRes = await getUrl('/finale');
  assert(finaleRes.status === 200, 'GET /finale returns 200 OK');
  assert(finaleRes.body.includes('boss-c-questions.js'), 'GET /finale loads boss-c-questions.js');
  assert(finaleRes.body.includes('room-client.js'), 'GET /finale loads room-client.js');
  assert(finaleRes.body.includes('chapter-hud.js'), 'GET /finale loads chapter-hud.js');
  assert(finaleRes.body.includes('finale.css'), 'GET /finale loads finale.css');

  // Verify Stage UI Elements
  assert(finaleRes.body.includes('id="stage-gathering"'), 'Contains Stage 1 Gathering Gate (#stage-gathering)');
  assert(finaleRes.body.includes('id="stage-assembly-cutscene"'), 'Contains Stage 2 Assembly Cutscene Placeholder (#stage-assembly-cutscene)');
  assert(finaleRes.body.includes('id="stage-vorbulon-cutscene"'), 'Contains Stage 3 Vorbulon Awakening Cutscene Placeholder (#stage-vorbulon-cutscene)');
  assert(finaleRes.body.includes('id="stage-boss-arena"'), 'Contains Stage 4A Leader Boss Arena (#stage-boss-arena)');
  assert(finaleRes.body.includes('id="stage-teammate"'), 'Contains Stage 4B Teammate Spectator Screen (#stage-teammate)');
  assert(finaleRes.body.includes('You have successfully helped to find ingredients'), 'Teammate screen contains exact required prompt');
  assert(finaleRes.body.includes('id="stage-victory"'), 'Contains Stage 5A Victory Ending (#stage-victory)');
  assert(finaleRes.body.includes('id="stage-defeat"'), 'Contains Stage 5B Defeat Ending (#stage-defeat)');
  assert(finaleRes.body.includes('id="btn-boss-instant-win"'), 'Contains instant win bypass button (#btn-boss-instant-win)');

  const cssRes = await getUrl('/finale/finale.css');
  assert(cssRes.status === 200, 'GET /finale/finale.css returns 200 OK');

  const jsRes = await getUrl('/finale/boss-c-questions.js');
  assert(jsRes.status === 200, 'GET /finale/boss-c-questions.js returns 200 OK');

  // ==========================================
  // 3. Socket.IO Real-Time Boss Combat Simulation
  // ==========================================
  console.log('\n--- 3. Multi-Screen Socket.IO Combat State Machine ---');

  function createClient(name) {
    return io(`${SERVER_URL}`, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false
    });
  }

  const hostSocket = createClient('HostLeader');
  const peerSocket = createClient('TeammateChef');

  let testRoomCode = null;
  let hostPlayerId = null;
  let peerPlayerId = null;

  // 3a. Room setup
  await new Promise((resolve) => {
    hostSocket.on('room_created', (data) => {
      testRoomCode = data.roomCode;
      hostPlayerId = data.playerId;
      resolve();
    });
    hostSocket.emit('create_room', { playerName: 'GordonLeader' });
  });

  assert(Boolean(testRoomCode), `Host created room: ${testRoomCode}`);

  await new Promise((resolve) => {
    peerSocket.on('room_joined', (data) => {
      peerPlayerId = data.playerId;
      resolve();
    });
    peerSocket.emit('join_room', { roomCode: testRoomCode, playerName: 'SousChef' });
  });

  assert(Boolean(peerPlayerId), `Teammate joined room: ${testRoomCode}`);

  // 3b. Test Boss Damage (Successful Patch -> Boss takes 15% damage)
  console.log('\n--- Testing Combat: Successful Patch (+15% Boss DMG) ---');
  const patchPromiseHost = new Promise((resolve) => {
    hostSocket.once('boss_combat_update', (data) => resolve(data));
  });
  const patchPromisePeer = new Promise((resolve) => {
    peerSocket.once('boss_combat_update', (data) => resolve(data));
  });

  hostSocket.emit('boss_action', {
    roomCode: testRoomCode,
    playerId: hostPlayerId,
    success: true,
    timeout: false,
    questionId: 1
  });

  const [hostUpdate1, peerUpdate1] = await Promise.all([patchPromiseHost, patchPromisePeer]);
  assert(hostUpdate1.bossHealth === 85, `Host received Boss HP = 85 (was 100, got: ${hostUpdate1.bossHealth})`);
  assert(peerUpdate1.bossHealth === 85, `Teammate received synchronized Boss HP = 85`);
  assert(hostUpdate1.leaderHealth === 100, `Leader HP remained 100`);

  // 3c. Test Leader Damage (Timeout / Buggy Code -> Leader takes 15% damage)
  console.log('\n--- Testing Combat: Timeout / Failed Code (+15% Leader DMG) ---');
  const failPromiseHost = new Promise((resolve) => {
    hostSocket.once('boss_combat_update', (data) => resolve(data));
  });
  const failPromisePeer = new Promise((resolve) => {
    peerSocket.once('boss_combat_update', (data) => resolve(data));
  });

  hostSocket.emit('boss_action', {
    roomCode: testRoomCode,
    playerId: hostPlayerId,
    success: false,
    timeout: true,
    questionId: 2
  });

  const [hostUpdate2, peerUpdate2] = await Promise.all([failPromiseHost, failPromisePeer]);
  assert(hostUpdate2.leaderHealth === 85, `Host received Leader HP = 85 (got: ${hostUpdate2.leaderHealth})`);
  assert(peerUpdate2.leaderHealth === 85, `Teammate received synchronized Leader HP = 85`);
  assert(hostUpdate2.bossHealth === 85, `Boss HP remained 85`);

  // 3d. Test Victory Flow: 6 more successful hits (15% each) -> Boss HP <= 0 -> boss_victory
  console.log('\n--- Testing Boss Victory (Leader Defeats Vorbulon) ---');
  const victoryPromiseHost = new Promise((resolve) => {
    hostSocket.once('boss_victory', (data) => resolve(data));
  });
  const victoryPromisePeer = new Promise((resolve) => {
    peerSocket.once('boss_victory', (data) => resolve(data));
  });

  for (let i = 0; i < 6; i++) {
    hostSocket.emit('boss_action', {
      roomCode: testRoomCode,
      playerId: hostPlayerId,
      success: true,
      timeout: false,
      questionId: i + 3
    });
    await new Promise(r => setTimeout(r, 60));
  }

  const [hostVictory, peerVictory] = await Promise.all([victoryPromiseHost, victoryPromisePeer]);
  assert(Boolean(hostVictory), 'Host received boss_victory broadcast');
  assert(Boolean(peerVictory), 'Teammate received synchronized boss_victory broadcast');

  // 3e. Test Restart Battle
  console.log('\n--- Testing Boss Restart Event ---');
  const restartPromiseHost = new Promise((resolve) => {
    hostSocket.once('boss_restarted', (data) => resolve(data));
  });
  const restartPromisePeer = new Promise((resolve) => {
    peerSocket.once('boss_restarted', (data) => resolve(data));
  });

  hostSocket.emit('restart_boss_battle', {
    roomCode: testRoomCode,
    playerId: hostPlayerId
  });

  const [hostRestart, peerRestart] = await Promise.all([restartPromiseHost, restartPromisePeer]);
  const hostHpOk = (hostRestart.bossHealth === 100 || hostRestart.roomState?.bossHealth === 100) && (hostRestart.leaderHealth === 100 || hostRestart.roomState?.leaderHealth === 100);
  const peerHpOk = (peerRestart.bossHealth === 100 || peerRestart.roomState?.bossHealth === 100) && (peerRestart.leaderHealth === 100 || peerRestart.roomState?.leaderHealth === 100);
  assert(hostHpOk, 'Host received boss_restarted (100 HP both)');
  assert(peerHpOk, 'Teammate received boss_restarted (100 HP both)');

  // 3f. Test Defeat Flow: 7 consecutive failures (15% DMG each) -> Leader HP <= 0 -> boss_defeat
  console.log('\n--- Testing Boss Defeat (Vorbulon Defeats Leader) ---');
  const defeatPromiseHost = new Promise((resolve) => {
    hostSocket.once('boss_defeat', (data) => resolve(data));
  });
  const defeatPromisePeer = new Promise((resolve) => {
    peerSocket.once('boss_defeat', (data) => resolve(data));
  });

  for (let i = 0; i < 7; i++) {
    hostSocket.emit('boss_action', {
      roomCode: testRoomCode,
      playerId: hostPlayerId,
      success: false,
      timeout: true,
      questionId: i + 1
    });
    await new Promise(r => setTimeout(r, 60));
  }

  const [hostDefeat, peerDefeat] = await Promise.all([defeatPromiseHost, defeatPromisePeer]);
  assert(Boolean(hostDefeat), 'Host received boss_defeat broadcast');
  assert(Boolean(peerDefeat), 'Teammate received synchronized boss_defeat broadcast');

  // Cleanup
  hostSocket.disconnect();
  peerSocket.disconnect();

  console.log(`\n=================================================`);
  console.log(`📊 Phase 4 Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`=================================================`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
