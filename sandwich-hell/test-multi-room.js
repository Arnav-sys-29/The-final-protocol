/**
 * Automated Multi-Room Concurrency & State Isolation Test Suite
 * Verifies:
 * 1. Players can join rooms solely with a room code (blank name defaults to Chef X)
 * 2. Custom room codes (e.g. TEAM01, TEAM02) and random room codes work reliably
 * 3. Simultaneous rooms run concurrently with 0 state leakage
 * 4. Chapter claims, completions, and boss battle combat events are strictly isolated to their room channels
 */

const io = require('socket.io-client');

const TEST_PORT = 3008;
process.env.PORT = TEST_PORT;
process.env.ALLOW_DEV_CHEATS = 'true';
require('./server.js');
const SERVER_URL = `http://localhost:${TEST_PORT}`;

function createClient() {
  return io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    forceNew: true,
    reconnection: false
  });
}

async function runTests() {
  console.log('🧪 Starting Multi-Room Concurrency & Isolation Verification Suite...\n');
  await new Promise(r => setTimeout(r, 600));

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

  const clients = [];

  try {
    // =========================================================================
    // 1. CREATE TWO CONCURRENT ROOMS: TEAM01 & TEAM02
    // =========================================================================
    console.log('--- 1. Multi-Room Setup & Code-Only Join ---');
    const r1Host = createClient();
    const r2Host = createClient();
    clients.push(r1Host, r2Host);

    // Host 1 creates TEAM01
    const r1Created = await new Promise((resolve) => {
      r1Host.on('room_created', resolve);
      r1Host.emit('create_room', { playerName: 'Leader Alpha', customRoomCode: 'TEAM01' });
    });
    assert(r1Created.roomCode === 'TEAM01', 'Room 1 created with custom code TEAM01');
    assert(r1Created.isHost === true, 'Room 1 creator is marked as host');

    // Host 2 creates TEAM02
    const r2Created = await new Promise((resolve) => {
      r2Host.on('room_created', resolve);
      r2Host.emit('create_room', { playerName: 'Leader Beta', customRoomCode: 'TEAM02' });
    });
    assert(r2Created.roomCode === 'TEAM02', 'Room 2 created with custom code TEAM02');
    assert(r2Created.isHost === true, 'Room 2 creator is marked as host');

    // Room 1: Add 3 teammates (one with empty name to test code-only join)
    const r1P2 = createClient();
    const r1P3 = createClient();
    const r1P4 = createClient();
    clients.push(r1P2, r1P3, r1P4);

    const r1P2Joined = await new Promise(res => {
      r1P2.on('room_joined', res);
      r1P2.emit('join_room', { roomCode: 'TEAM01', playerName: 'Chef Cheese' });
    });
    assert(r1P2Joined.roomCode === 'TEAM01', 'Room 1 Player 2 joined TEAM01');

    const r1P3Joined = await new Promise(res => {
      r1P3.on('room_joined', res);
      // Code-only join: blank player name
      r1P3.emit('join_room', { roomCode: 'TEAM01', playerName: '   ' });
    });
    assert(r1P3Joined.roomCode === 'TEAM01', 'Room 1 Player 3 joined with blank name (code-only)');
    assert(r1P3Joined.player.name.startsWith('Chef'), 'Blank name defaulted to Chef fallback', r1P3Joined.player.name);

    const r1P4Joined = await new Promise(res => {
      r1P4.on('room_joined', res);
      r1P4.emit('join_room', { roomCode: 'TEAM01', playerName: 'Chef Bread' });
    });
    assert(r1P4Joined.roomCode === 'TEAM01', 'Room 1 Player 4 joined TEAM01');

    // Room 2: Add 3 teammates
    const r2P2 = createClient();
    const r2P3 = createClient();
    const r2P4 = createClient();
    clients.push(r2P2, r2P3, r2P4);

    const r2P2Joined = await new Promise(res => {
      r2P2.on('room_joined', res);
      r2P2.emit('join_room', { roomCode: 'TEAM02', playerName: 'Beta Cheese' });
    });
    assert(r2P2Joined.roomCode === 'TEAM02', 'Room 2 Player 2 joined TEAM02');

    const r2P3Joined = await new Promise(res => {
      r2P3.on('room_joined', res);
      r2P3.emit('join_room', { roomCode: 'TEAM02', playerName: 'Beta Veg' });
    });
    assert(r2P3Joined.roomCode === 'TEAM02', 'Room 2 Player 3 joined TEAM02');

    const r2P4Joined = await new Promise(res => {
      r2P4.on('room_joined', res);
      r2P4.emit('join_room', { roomCode: 'TEAM02', playerName: 'Beta Sauce' });
    });
    assert(r2P4Joined.roomCode === 'TEAM02', 'Room 2 Player 4 joined TEAM02');

    // =========================================================================
    // 2. STATE ISOLATION: CHAPTER CLAIMS & PROGRESSION
    // =========================================================================
    console.log('\n--- 2. Chapter Claims & Progression Isolation ---');

    // Room 1 players claim chapters
    await new Promise(res => {
      r1Host.on('chapter_claimed', res);
      r1Host.emit('claim_chapter', { roomCode: 'TEAM01', playerId: r1Created.playerId, chapter: 'hell' });
    });
    await new Promise(res => {
      r1P2.on('chapter_claimed', res);
      r1P2.emit('claim_chapter', { roomCode: 'TEAM01', playerId: r1P2Joined.playerId, chapter: 'alien' });
    });

    // Verify Room 2 claims are completely unpolluted
    let r2State = await new Promise(res => {
      r2Host.emit('get_room_state', { roomCode: 'TEAM02' });
      r2Host.once('room_state', d => res(d.roomState));
    });
    assert(r2State.claims.hell === null, 'Room 2 hell claim remains null (isolated from Room 1)');
    assert(r2State.claims.alien === null, 'Room 2 alien claim remains null (isolated from Room 1)');

    // Room 1 completes chapters
    await new Promise(res => {
      r1Host.once('chapter_completed', res);
      r1Host.emit('complete_chapter', { roomCode: 'TEAM01', playerId: r1Created.playerId, chapter: 'hell' });
    });
    await new Promise(res => {
      r1P2.once('chapter_completed', res);
      r1P2.emit('complete_chapter', { roomCode: 'TEAM01', playerId: r1P2Joined.playerId, chapter: 'alien' });
    });

    // Check Room 2 completed state
    r2State = await new Promise(res => {
      r2Host.emit('get_room_state', { roomCode: 'TEAM02' });
      r2Host.once('room_state', d => res(d.roomState));
    });
    assert(r2State.completed.hell === false, 'Room 2 hell completed remains false');
    assert(r2State.completed.alien === false, 'Room 2 alien completed remains false');
    const r2DoneCount = Object.values(r2State.completed).filter(Boolean).length;
    assert(r2DoneCount === 0, 'Room 2 completedCount remains 0', r2DoneCount);

    // Complete remaining chapters in Room 1 -> advances to cutscene
    const r1AllDonePromise = new Promise(res => {
      r1Host.once('all_chapters_completed', res);
    });
    r1P3.emit('complete_chapter', { roomCode: 'TEAM01', playerId: r1P3Joined.playerId, chapter: 'ocean' });
    r1P4.emit('complete_chapter', { roomCode: 'TEAM01', playerId: r1P4Joined.playerId, chapter: 'market' });
    const r1AllDone = await r1AllDonePromise;
    assert(r1AllDone.nextUrl === '/cutscene', 'Room 1 transitioned to /cutscene');

    // Verify Room 2 is still in its original phase
    r2State = await new Promise(res => {
      r2Host.emit('get_room_state', { roomCode: 'TEAM02' });
      r2Host.once('room_state', d => res(d.roomState));
    });
    assert(r2State.phase !== 'cutscene', 'Room 2 phase is NOT cutscene (remains isolated)', r2State.phase);

    // =========================================================================
    // 3. COMBAT EVENT ISOLATION (BOSS BATTLE)
    // =========================================================================
    console.log('\n--- 3. Combat Event Channel Isolation ---');

    // Listen on Room 2 host to ensure zero leak of Room 1 boss combat events
    let leakedBossAction = false;
    r2Host.on('boss_combat_update', () => {
      leakedBossAction = true;
    });

    // Room 1 host attacks boss for 15% damage
    const r1CombatPromise = new Promise(res => {
      r1P2.once('boss_combat_update', res);
    });
    r1Host.emit('boss_action', { roomCode: 'TEAM01', playerId: r1Created.playerId, success: true, timeout: false, questionId: 1 });
    const r1Combat = await r1CombatPromise;

    assert(r1Combat.bossHealth === 85, 'Room 1 Vorbulon took 15% damage (bossHealth = 85)');
    await new Promise(r => setTimeout(r, 200));
    assert(leakedBossAction === false, 'Room 2 received ZERO boss_combat_update events from Room 1');

    // Check Room 2 boss state independently
    r2State = await new Promise(res => {
      r2Host.emit('get_room_state', { roomCode: 'TEAM02' });
      r2Host.once('room_state', d => res(d.roomState));
    });
    assert(r2State.bossHealth === 100, 'Room 2 bossHealth remains at 100%');

    // =========================================================================
    // 4. CLEAN DISCONNECT & LEAVE
    // =========================================================================
    console.log('\n--- 4. Clean Room Departure & Teardown ---');
    r1P4.emit('leave_room');
    await new Promise(r => setTimeout(r, 150));

    const r1AfterLeave = await new Promise(res => {
      r1Host.emit('get_room_state', { roomCode: 'TEAM01' });
      r1Host.once('room_state', d => res(d.roomState));
    });
    assert(r1AfterLeave.players.length === 3, 'Room 1 player left cleanly; 3 players remain');
    assert(r2State.players.length === 4, 'Room 2 player count remains unaffected at 4');

  } catch (err) {
    console.error('❌ Exception during test:', err);
    failed++;
  } finally {
    clients.forEach(c => {
      try { c.disconnect(); } catch (e) {}
    });
  }

  console.log('\n=================================================');
  console.log(`📊 Multi-Room Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('=================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
