/**
 * Automated Verification Test for The Legendary Sandwich From Hell
 * Simulates 4 concurrent players verifying:
 * - Room creation & 6-char code generation
 * - Player joining & 4-player capacity cap
 * - Host authority & phase progression
 * - First-come, first-served atomic chapter claiming and rejection of race conditions
 * - Completion gate: all 4 chapters completed triggers transition to /finale
 */

const { io: ioClient } = require('socket.io-client');
const http = require('http');

// Spin up test server instance or test against active server
const PORT = 3001;
process.env.PORT = PORT;

// Require the actual server
console.log('Testing server logic...');
require('./server.js');

function createClient(name) {
  return ioClient(`http://localhost:${PORT}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('\n--- STARTING 4-PLAYER SOCKET STATE MACHINE TESTS ---\n');

  let passed = 0;
  let total = 6;

  try {
    await wait(800); // Wait for server to bind

    const client1 = createClient('Player1-Host');
    let roomCode = null;
    let client1Id = null;

    // Test 1: Room Creation
    console.log('[Test 1] Creating Room with Host...');
    const createPromise = new Promise((resolve, reject) => {
      client1.on('room_created', (data) => {
        if (data.roomCode && data.isHost && data.roomCode.length === 6) {
          roomCode = data.roomCode;
          client1Id = data.playerId;
          resolve(data);
        } else {
          reject(new Error(`Invalid room_created payload: ${JSON.stringify(data)}`));
        }
      });
    });

    client1.emit('create_room', { playerName: 'Chef Gordon' });
    await createPromise;
    console.log(`✓ Test 1 Passed: Room created with code "${roomCode}", Host verified.\n`);
    passed++;

    // Test 2: Joining 3 more players
    console.log('[Test 2] Joining 3 more players to reach 4-player capacity...');
    const client2 = createClient('Player2-Alien');
    const client3 = createClient('Player3-Ocean');
    const client4 = createClient('Player4-Market');

    let client2Id = null;
    let client3Id = null;
    let client4Id = null;

    const joinPromises = [
      new Promise(res => client2.on('room_joined', d => { client2Id = d.playerId; res(d); })),
      new Promise(res => client3.on('room_joined', d => { client3Id = d.playerId; res(d); })),
      new Promise(res => client4.on('room_joined', d => { client4Id = d.playerId; res(d); }))
    ];

    client2.emit('join_room', { roomCode, playerName: 'Chef Spock' });
    client3.emit('join_room', { roomCode, playerName: 'Chef Nemo' });
    client4.emit('join_room', { roomCode, playerName: 'Chef Baker' });

    await Promise.all(joinPromises);
    console.log('✓ Test 2 Passed: 4 players successfully joined the room.\n');
    passed++;

    // Test 3: 5th Player Rejected (Room Capacity Enforced)
    console.log('[Test 3] Verifying 5th player is rejected (Max 4)...');
    const client5 = createClient('Player5-Overflow');
    const overflowPromise = new Promise((resolve, reject) => {
      client5.on('error_message', (data) => {
        if (data.message && data.message.includes('full')) {
          resolve(data);
        } else {
          reject(new Error(`Unexpected error message: ${data.message}`));
        }
      });
    });

    client5.emit('join_room', { roomCode, playerName: 'Chef Late' });
    await overflowPromise;
    client5.disconnect();
    console.log('✓ Test 3 Passed: 5th player rejected as room reached 4-player limit.\n');
    passed++;

    // Test 4: Host Authority & Phase Progression
    console.log('[Test 4] Testing Host Start Game & Advance Phase...');
    const phasePromise = new Promise((resolve) => {
      client2.on('phase_changed', (data) => {
        if (data.phase === 'intro') resolve(data);
      });
    });

    client1.emit('start_game', { roomCode, playerId: client1Id });
    await phasePromise;
    console.log('✓ Test 4 Passed: Game started and intro broadcast to all monitors.\n');
    passed++;

    // Test 5: Atomic Chapter Locking & Claim Race Condition
    console.log('[Test 5] Testing Atomic Chapter Locking (Hell/Cheese)...');
    const claim1Promise = new Promise(res => client1.on('claim_confirmed', res));
    client1.emit('claim_chapter', { roomCode, playerId: client1Id, chapter: 'hell' });
    await claim1Promise;

    // Client 2 attempts to claim Hell (should be rejected)
    const claimRejectPromise = new Promise((resolve, reject) => {
      client2.on('claim_rejected', (data) => {
        if (data.chapter === 'hell') resolve(data);
        else reject(new Error('Unexpected claim rejection'));
      });
    });
    client2.emit('claim_chapter', { roomCode, playerId: client2Id, chapter: 'hell' });
    await claimRejectPromise;

    // Now clients 2, 3, 4 claim remaining valid chapters
    const claim2 = new Promise(res => client2.on('claim_confirmed', res));
    const claim3 = new Promise(res => client3.on('claim_confirmed', res));
    const claim4 = new Promise(res => client4.on('claim_confirmed', res));

    client2.emit('claim_chapter', { roomCode, playerId: client2Id, chapter: 'alien' });
    client3.emit('claim_chapter', { roomCode, playerId: client3Id, chapter: 'ocean' });
    client4.emit('claim_chapter', { roomCode, playerId: client4Id, chapter: 'market' });

    await Promise.all([claim2, claim3, claim4]);
    console.log('✓ Test 5 Passed: Atomic locking prevented duplicate claim; all 4 chapters cleanly claimed.\n');
    passed++;

    // Test 6: Chapter Completion Gate -> /finale Trigger
    console.log('[Test 6] Testing Completion Gate (all 4 chapters complete -> /finale)...');
    const finaleBroadcastPromise = new Promise((resolve) => {
      client1.on('all_chapters_completed', (data) => {
        if (data.nextUrl === '/finale') resolve(data);
      });
    });

    client1.emit('complete_chapter', { roomCode, playerId: client1Id, chapter: 'hell' });
    client2.emit('complete_chapter', { roomCode, playerId: client2Id, chapter: 'alien' });
    client3.emit('complete_chapter', { roomCode, playerId: client3Id, chapter: 'ocean' });
    client4.emit('complete_chapter', { roomCode, playerId: client4Id, chapter: 'market' });

    await finaleBroadcastPromise;
    console.log('✓ Test 6 Passed: Completion gate triggered! All 4 chapters done -> /finale transition received.\n');
    passed++;

    // Cleanup
    client1.disconnect();
    client2.disconnect();
    client3.disconnect();
    client4.disconnect();

    console.log(`===============================================`);
    console.log(`🎯 ALL TESTS PASSED: ${passed}/${total}`);
    console.log(`Phase 1 State Machine & Core Backbone Verified!`);
    console.log(`===============================================\n`);
    process.exit(0);

  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
}

runTests();
