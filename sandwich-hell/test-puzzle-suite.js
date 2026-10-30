/**
 * Comprehensive Automated Test Suite for All 42 Puzzles across 4 Chapters
 * Validates:
 * 1. Hell Chapter: 10 Coding Challenges & Test Case Matrices
 * 2. Alien Chapter: 12 Algorithmic Crops & Input/Boundary Evaluators
 * 3. Ocean Chapter: 10 Switch-Case Potion Cauldron Recipes & Rules
 * 4. Market Chapter: 10 Queue Problems & Problem Evaluators
 * 5. 6-Solve Quotas (REQUIRED_SOLVES = 6) & Skip Buttons across all 4 levels
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Comprehensive 42-Puzzle & Solve Quota Verification Suite...\n');

let passed = 0;
let failed = 0;

function check(condition, title, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${title}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${title} ${details ? '(' + details + ')' : ''}`);
    failed++;
  }
}

// =============================================================================
// 1. HELL CHAPTER (10 CHALLENGES)
// =============================================================================
console.log('--- 1. Hell Chapter: 10 Challenges & Test Cases ---');
const hellHtml = fs.readFileSync(path.join(__dirname, 'public/hell/index.html'), 'utf8');

// Extract Q and TESTS
const hellQMatch = hellHtml.match(/const Q\s*=\s*(\[[\s\S]*?\]);\s*const TESTS\s*=\s*(\[[\s\S]*?\]);/);
assert(hellQMatch, 'Failed to extract Q and TESTS from hell/index.html');
const hellQ = JSON.parse(hellQMatch[1]);
const hellTests = JSON.parse(hellQMatch[2]);

check(hellQ.length === 10, 'Hell chapter contains exactly 10 challenges', `Found: ${hellQ.length}`);
check(hellTests.length === 10, 'Hell chapter contains 10 test suites matching questions');

const expectedHellTitles = [
  'Sum of Odd Numbers',
  'Check Divisibility',
  'Print a Multiplication Table',
  'Count Vowels',
  'Find the GCD',
  'Check a Prime Number',
  'Print a Right-Angled Star Pattern',
  'Convert Celsius to Fahrenheit',
  'Merge Two Sorted Arrays',
  'Find the Second-Largest Distinct Element'
];

hellQ.forEach((q, idx) => {
  const matchesTitle = q.t === expectedHellTitles[idx];
  check(matchesTitle, `Hell Q${idx + 1}: "${q.t}" title verified`);
  check(q.s && q.s.length > 10, `Hell Q${idx + 1}: problem statement present`);
  check(q.f && q.f.length > 5, `Hell Q${idx + 1}: input format specified`);
  const tests = hellTests[idx];
  check(Array.isArray(tests) && tests.length >= 5, `Hell Q${idx + 1}: contains at least 5 test cases (found: ${tests.length})`);
});

// =============================================================================
// 2. ALIEN CHAPTER (12 CHALLENGES)
// =============================================================================
console.log('\n--- 2. Alien Chapter: 12 Algorithmic Crops & Evaluators ---');
const alienHtml = fs.readFileSync(path.join(__dirname, 'public/alien/index.html'), 'utf8');

const alienQMatch = alienHtml.match(/const Q\s*=\s*(\[[\s\S]*?\n\];)/);
assert(alienQMatch, 'Failed to extract Q from alien/index.html');

// Run alien Q extraction via sandbox
const alienSandbox = { range: (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }, divs: (n) => [] };
eval(alienQMatch[0].replace(/const Q\s*=/, 'alienSandbox.Q ='));
const alienQ = alienSandbox.Q;

check(alienQ.length === 12, 'Alien chapter contains exactly 12 crop challenges', `Found: ${alienQ.length}`);

const expectedAlienTitles = [
  'Haunted Carrot Counter',
  'Zombie Tomato Harvest',
  'Ghost Pepper Power',
  'Vampire Lettuce Factorial',
  'Cursed Pumpkin Multiplication Table',
  'Witch’s Vegetable Sum',
  'Monster’s Reverse Spell',
  'Demon Seed Detector',
  'Haunted Garden Pattern',
  'Forbidden Vegetable Divisors',
  'Werewolf’s Number Hunt',
  'Potion Garden Digit Frequency'
];

alienQ.forEach((q, idx) => {
  check(q.t === expectedAlienTitles[idx], `Alien Q${idx + 1}: "${q.t}" title verified`);
  check(q.d && q.d.length > 15, `Alien Q${idx + 1}: description present`);
  check(q.con && q.con.length > 5, `Alien Q${idx + 1}: constraints specified`);
  check(Array.isArray(q.T) && q.T.length >= 4, `Alien Q${idx + 1}: test input matrix verified (found: ${q.T.length})`);
  check(typeof q.ref === 'function' || typeof q.alts === 'function', `Alien Q${idx + 1}: reference evaluator function defined`);
});

// =============================================================================
// 3. OCEAN CHAPTER (10 POTION CAULDRON RECIPES)
// =============================================================================
console.log('\n--- 3. Ocean Chapter: 10 Switch-Case Potion Cauldron Recipes ---');
const oceanHtml = fs.readFileSync(path.join(__dirname, 'public/ocean/index.html'), 'utf8');

const oceanQSMatch = oceanHtml.match(/const QS\s*=\s*(\[[\s\S]*?\n\];)/);
assert(oceanQSMatch, 'Failed to extract QS from ocean/index.html');

global.T = (e, t, d, s, task, head, r, con, o) => ({ e, t, d, s, task, head, r, con, ...o });
global.CMP = /cmp/;
const oceanSandbox = {};
eval(oceanQSMatch[0].replace(/const QS\s*=/, 'oceanSandbox.QS ='));
const oceanQS = oceanSandbox.QS;

check(oceanQS.length === 10, 'Ocean chapter contains exactly 10 cauldron recipes', `Found: ${oceanQS.length}`);

const expectedOceanTitles = [
  'The Demon’s Potion Calculator',
  'The Haunted Electricity Bill',
  'The Monster’s Travel Portal',
  'The Werewolf’s Shape-Shifting Spell',
  'The Haunted Arcade',
  'The Witch’s Temperature Chamber',
  'The Vampire’s Blood Bank',
  'The Demon’s Number Decoder',
  'The Haunted Parking Lot',
  'The Final Demon’s Reward System'
];

oceanQS.forEach((q, idx) => {
  check(q.t === expectedOceanTitles[idx], `Ocean Recipe ${idx + 1}: "${q.t}" title verified`);
  check(q.task && q.task.includes('switch-case'), `Ocean Recipe ${idx + 1}: explicitly requires switch-case structure`);
  check(Array.isArray(q.head) && q.head.length >= 2, `Ocean Recipe ${idx + 1}: table headers verified`);
  check(Array.isArray(q.r) && q.r.length >= 3, `Ocean Recipe ${idx + 1}: contains recipe mapping rows`);
  check(Array.isArray(q.cs) && q.cs.length >= 3, `Ocean Recipe ${idx + 1}: case values validated (${q.cs.join(', ')})`);
});

// =============================================================================
// 4. MARKET CHAPTER (10 PROBLEMS)
// =============================================================================
console.log('\n--- 4. Market Chapter: 10 Queue Problems & Problem Evaluators ---');
const marketHtml = fs.readFileSync(path.join(__dirname, 'public/market/index.html'), 'utf8');

const marketQMatch = marketHtml.match(/const Q\s*=\s*(\[[\s\S]*?\n\];)/);
assert(marketQMatch, 'Failed to extract Q from market/index.html');

const marketSandbox = {};
eval(marketQMatch[0].replace(/const Q\s*=/, 'marketSandbox.Q ='));
const marketQ = marketSandbox.Q;

check(marketQ.length === 10, 'Market chapter contains exactly 10 problems', `Found: ${marketQ.length}`);

const expectedMarketIds = [
  'smallest',
  'positives',
  'average',
  'search',
  'occurrences',
  'evenodd',
  'digitsum',
  'reversenum',
  'palindrome',
  'factorial'
];

marketQ.forEach((q, idx) => {
  check(q.id === expectedMarketIds[idx], `Market P${idx + 1}: id "${q.id}" verified`);
  check(q.t && q.t.length > 5, `Market P${idx + 1}: title "${q.t}" present`);
  check(q.inp !== undefined && q.out !== undefined, `Market P${idx + 1}: sample input & output verified`);
  check(q.txt && q.txt.includes('Constraints'), `Market P${idx + 1}: constraints specified`);
});

// =============================================================================
// 5. SOLVE QUOTAS & SKIP FUNCTIONALITY ACROSS ALL 4 CHAPTERS
// =============================================================================
console.log('\n--- 5. Solve Quotas (REQUIRED_SOLVES = 6) & Skip Buttons Verification ---');

const chapters = [
  { name: 'Hell', html: hellHtml, file: 'public/hell/index.html' },
  { name: 'Alien', html: alienHtml, file: 'public/alien/index.html' },
  { name: 'Ocean', html: oceanHtml, file: 'public/ocean/index.html' },
  { name: 'Market', html: marketHtml, file: 'public/market/index.html' }
];

chapters.forEach(ch => {
  // 1. Quota check
  check(ch.html.includes('REQUIRED_SOLVES = 6'), `${ch.name}: defines REQUIRED_SOLVES = 6`);

  // 2. Skip button check
  const hasSkip = ch.html.includes('Skip') || ch.html.includes('skip');
  check(hasSkip, `${ch.name}: includes Skip button in UI`);

  // 3. Counter display check
  const hasCounter = ch.html.includes('Solved:') || ch.html.includes('Questions Solved:') || ch.html.includes('q-counter') || ch.html.includes('market-counter');
  check(hasCounter, `${ch.name}: includes visible Question Counter`);

  // 4. Room.complete() conditioned on REQUIRED_SOLVES
  const hasRoomComplete = ch.html.includes(`Room.complete('${ch.name.toLowerCase()}')`);
  check(hasRoomComplete, `${ch.name}: calls Room.complete('${ch.name.toLowerCase()}') upon quota reached`);
});

console.log('\n=================================================================');
console.log(`📊 42-Puzzle Suite Summary: ${passed} Passed, ${failed} Failed`);
console.log('=================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
