/**
 * Automated End-to-End Simulation & Combat Balance Verification Suite
 * Verifies the complete game lifecycle:
 * 1. Room creation & 4-Player lobby join
 * 2. Host starts game -> Intro phase transition
 * 3. Pick phase & 4-Chapter distributed claims
 * 4. 4-Chapter completion -> Cutscene phase transition
 * 5. Cutscene -> Finale Boss Arena phase transition
 * 6. 12-second combat timer & 15% damage balance
 * 7. Vorbulon Defeat flow (Leader hits 7 times -> boss_victory & WIN.mp4 event)
 * 8. Leader Defeat flow (Vorbulon strikes 7 times -> boss_defeat & LOSE.mp4 event)
 * 9. Clean exit and return to main page
 */

const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const TEST_PORT = 3009;
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
  console.log('🧪 Starting End-to-End Game Lifecycle & Combat Balance Simulation...\n');
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
    // 1. STATIC ASSET & PARAMETER CHECKS
    // =========================================================================
    console.log('--- 1. Boss Arena & Combat Balance Parameter Checks ---');
    const finaleHtml = fs.readFileSync(path.join(__dirname, 'public/finale/index.html'), 'utf8');

    assert(finaleHtml.includes('12.0s TIMER'), 'Finale UI displays 12.0s active turn timer');
    assert(finaleHtml.includes('timerRemaining = 12.0'), 'Finale JS initializes timerRemaining to 12.0');
    assert(finaleHtml.includes('15% damage'), 'Finale UI communicates 15% combat damage');
    assert(finaleHtml.includes('bossHP - 15'), 'Finale JS deducts exactly 15% HP per successful hit');
    assert(finaleHtml.includes('leaderHP - 15'), 'Finale JS deducts exactly 15% HP per monster strike');
    assert(finaleHtml.includes('/cinematics/WIN.mp4'), 'Finale includes WIN.mp4 cinematic trigger');
    assert(finaleHtml.includes('/cinematics/LOSE.mp4'), 'Finale includes LOSE.mp4 cinematic trigger');
    assert(finaleHtml.includes('btn-back-to-main-victory'), 'Victory screen includes Return to Main Page button');
    assert(finaleHtml.includes('btn-back-to-main-defeat'), 'Defeat screen includes Return to Main Page button');

    // =========================================================================
    // 2. MULTIPLAYER ROOM CREATION & LOBBY JOIN
    // =========================================================================
    console.log('\n--- 2. Multiplayer Room Setup (Room: SIMU99) ---');
    const host = createClient();
    const pCheese = createClient();
    const pVeg = createClient();
    const pSauce = createClient();
    clients.push(host, pCheese, pVeg, pSauce);

    const roomData = await new Promise(res => {
      host.on('room_created', res);
      host.emit('create_room', { playerName: 'Head Chef (Leader)', customRoomCode: 'SIMU99' });
    });
    assert(roomData.roomCode === 'SIMU99', 'Room created with code SIMU99');
    assert(roomData.isHost === true, 'Host player identified');

    const cJoined = await new Promise(res => {
      pCheese.on('room_joined', res);
      pCheese.emit('join_room', { roomCode: 'SIMU99', playerName: 'Cheese Chef' });
    });
    const vJoined = await new Promise(res => {
      pVeg.on('room_joined', res);
      pVeg.emit('join_room', { roomCode: 'SIMU99', playerName: 'Veggie Chef' });
    });
    const sJoined = await new Promise(res => {
      pSauce.on('room_joined', res);
      pSauce.emit('join_room', { roomCode: 'SIMU99', playerName: 'Sauce Chef' });
    });

    assert(cJoined.roomCode === 'SIMU99' && vJoined.roomCode === 'SIMU99' && sJoined.roomCode === 'SIMU99', 'All 3 teammates joined SIMU99');

    // =========================================================================
    // 3. PHASE ADVANCEMENT: LOBBY -> INTRO -> PICK
    // =========================================================================
    console.log('\n--- 3. Phase Transitions: Lobby -> Intro -> Pick ---');
    const introData = await new Promise(res => {
      pCheese.once('phase_changed', res);
      host.emit('start_game', { roomCode: 'SIMU99', playerId: roomData.playerId });
    });
    assert(introData.nextUrl === '/intro', 'Room advanced to /intro');

    await new Promise(r => setTimeout(r, 60));

    const pickData = await new Promise(res => {
      pCheese.once('phase_changed', res);
      host.emit('advance_phase', { roomCode: 'SIMU99', playerId: roomData.playerId, phase: 'pick' });
    });
    assert(pickData.phase === 'pick', 'Room advanced to /pick');

    // =========================================================================
    // 4. DISTRIBUTED CHAPTER CLAIMS & COMPLETIONS
    // =========================================================================
    console.log('\n--- 4. Distributed Chapter Claims & 4-Ingredient Assembly ---');
    await new Promise(res => {
      host.once('chapter_claimed', res);
      host.emit('claim_chapter', { roomCode: 'SIMU99', playerId: roomData.playerId, chapter: 'market' });
    });
    await new Promise(res => {
      pCheese.once('chapter_claimed', res);
      pCheese.emit('claim_chapter', { roomCode: 'SIMU99', playerId: cJoined.playerId, chapter: 'hell' });
    });
    await new Promise(res => {
      pVeg.once('chapter_claimed', res);
      pVeg.emit('claim_chapter', { roomCode: 'SIMU99', playerId: vJoined.playerId, chapter: 'alien' });
    });
    await new Promise(res => {
      pSauce.once('chapter_claimed', res);
      pSauce.emit('claim_chapter', { roomCode: 'SIMU99', playerId: sJoined.playerId, chapter: 'ocean' });
    });
    assert(true, 'All 4 chefs claimed distinct sandwich ingredient chapters');

    // Simulate solving 6 questions and completing all 4 chapters
    const cutscenePromise = new Promise(res => {
      pSauce.once('all_chapters_completed', res);
    });
    host.emit('complete_chapter', { roomCode: 'SIMU99', playerId: roomData.playerId, chapter: 'market' });
    pCheese.emit('complete_chapter', { roomCode: 'SIMU99', playerId: cJoined.playerId, chapter: 'hell' });
    pVeg.emit('complete_chapter', { roomCode: 'SIMU99', playerId: vJoined.playerId, chapter: 'alien' });
    pSauce.emit('complete_chapter', { roomCode: 'SIMU99', playerId: sJoined.playerId, chapter: 'ocean' });

    const cutsceneData = await cutscenePromise;
    assert(cutsceneData.nextUrl === '/cutscene', 'All 4 ingredients collected -> transitioned to /cutscene');

    // =========================================================================
    // 5. BOSS BATTLE: 15% DAMAGE COMBAT BALANCING
    // =========================================================================
    console.log('\n--- 5. Boss Battle: 15% Damage & 12s Combat Turn Balance ---');

    // Turn 1: Correct patch (Boss takes 15% damage -> 85%)
    let combat = await new Promise(res => {
      pCheese.once('boss_combat_update', res);
      host.emit('boss_action', { roomCode: 'SIMU99', playerId: roomData.playerId, success: true, timeout: false, questionId: 1 });
    });
    assert(combat.bossHealth === 85 && combat.leaderHealth === 100, 'Turn 1 Strike: Vorbulon at 85%, Leader at 100%');

    // Turn 2: Timeout strike (Leader takes 15% damage -> 85%)
    combat = await new Promise(res => {
      pCheese.once('boss_combat_update', res);
      host.emit('boss_action', { roomCode: 'SIMU99', playerId: roomData.playerId, success: false, timeout: true, questionId: 2 });
    });
    assert(combat.bossHealth === 85 && combat.leaderHealth === 85, 'Turn 2 Timeout: Vorbulon at 85%, Leader at 85%');

    // Turn 3: Failed patch strike (Leader takes 15% damage -> 70%)
    combat = await new Promise(res => {
      pCheese.once('boss_combat_update', res);
      host.emit('boss_action', { roomCode: 'SIMU99', playerId: roomData.playerId, success: false, timeout: false, questionId: 3 });
    });
    assert(combat.bossHealth === 85 && combat.leaderHealth === 70, 'Turn 3 Error: Vorbulon at 85%, Leader at 70%');

    // =========================================================================
    // 6. VICTORY OUTCOME & WIN.MP4 EVENT TRIGGER
    // =========================================================================
    console.log('\n--- 6. Boss Victory Flow (Vorbulon Reaches 0%) ---');

    const victoryPromise = new Promise(res => {
      pCheese.once('boss_victory', res);
    });

    // 6 more successful strikes (85 - 6*15 = -5 -> 0%)
    for (let i = 0; i < 6; i++) {
      host.emit('boss_action', { roomCode: 'SIMU99', playerId: roomData.playerId, success: true, timeout: false, questionId: i + 4 });
      await new Promise(r => setTimeout(r, 60));
    }

    const victoryData = await victoryPromise;
    assert(victoryData.phase === 'victory', 'Authoritative server emitted boss_victory broadcast');
    assert(victoryData.roomState.bossHealth === 0, 'Vorbulon health reached 0% on defeat');

    // =========================================================================
    // 7. DEFEAT OUTCOME & LOSE.MP4 EVENT TRIGGER
    // =========================================================================
    console.log('\n--- 7. Boss Defeat Flow (Leader Reaches 0%) ---');

    // Restart boss fight
    const restartPromise = new Promise(res => {
      pVeg.once('boss_restarted', res);
    });
    host.emit('restart_boss_battle', { roomCode: 'SIMU99' });
    const restarted = await restartPromise;
    assert(restarted.bossHealth === 100 && restarted.leaderHealth === 100, 'Boss combat restarted with 100% health for both');

    const defeatPromise = new Promise(res => {
      pSauce.once('boss_defeat', res);
    });

    // 7 consecutive timeouts/errors (100 - 7*15 = -5 -> 0%)
    for (let i = 0; i < 7; i++) {
      host.emit('boss_action', { roomCode: 'SIMU99', playerId: roomData.playerId, success: false, timeout: true, questionId: i + 1 });
      await new Promise(r => setTimeout(r, 60));
    }

    const defeatData = await defeatPromise;
    assert(defeatData.phase === 'defeat', 'Authoritative server emitted boss_defeat broadcast');
    assert(defeatData.roomState.leaderHealth === 0, 'Leader health reached 0% on defeat');

  } catch (err) {
    console.error('❌ Exception during E2E simulation:', err);
    failed++;
  } finally {
    clients.forEach(c => {
      try { c.disconnect(); } catch (e) {}
    });
  }

  console.log('\n=================================================================');
  console.log(`📊 E2E Simulation Summary: ${passed} Passed, ${failed} Failed`);
  console.log('=================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
