const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Verifying newly implemented features...');

// 1. Check boss-c-questions.js
const bossQPath = path.join(__dirname, '../sandwich-hell/public/finale/boss-c-questions.js');
const bossQContent = fs.readFileSync(bossQPath, 'utf8');

// Load questions into node context
const sandbox = { window: {} };
eval(bossQContent.replace('window.BOSS_C_QUESTIONS =', 'sandbox.window.BOSS_C_QUESTIONS ='));
const questions = sandbox.window.BOSS_C_QUESTIONS;

assert(Array.isArray(questions), 'BOSS_C_QUESTIONS must be an array');
assert.strictEqual(questions.length, 20, 'Must have exactly 20 questions');

// Check no comments
questions.forEach((q, idx) => {
  assert(!q.corrupted.includes('//'), `Question ${idx + 1} (${q.title}) still contains single-line comments!`);
  assert(!q.corrupted.includes('/*'), `Question ${idx + 1} (${q.title}) still contains multi-line comments!`);
  assert(typeof q.validate === 'function', `Question ${idx + 1} validator must be a function`);
  // Corrupted code should NOT pass validator initially
  assert.strictEqual(q.validate(q.corrupted), false, `Question ${idx + 1} corrupted code should not pass validation`);
});
console.log('✅ PASS: All 20 boss C questions have clean code without any comments, and fail initially');

// 2. Check finale/index.html
const finalePath = path.join(__dirname, '../sandwich-hell/public/finale/index.html');
const finaleContent = fs.readFileSync(finalePath, 'utf8');

assert(finaleContent.includes('12.0s TIMER'), 'Must include 12.0s TIMER badge');
assert(finaleContent.includes('12-Second Active Timer'), 'Must include 12-Second Active Timer in tutorial');
assert(finaleContent.includes('timerRemaining = 12.0'), 'Must set timerRemaining to 12.0');
assert(finaleContent.includes('btn-boss-instant-lose'), 'Must have Instant Lose button');
assert(finaleContent.includes('💀 INSTANT LOSE'), 'Must have Instant Lose label');
assert(!finaleContent.includes('btn-retry-boss'), 'Must NOT have btn-retry-boss button in HTML');
assert(!finaleContent.includes('Try Boss Again →'), 'Must NOT have Try Boss Again button in HTML');
assert(finaleContent.includes('btn-back-to-main-defeat'), 'Must have Back to Main Page button in defeat screen');
console.log('✅ PASS: finale/index.html contains 12s timer, instant lose dev button, and removed Try Boss Again');

// 3. Check 4 levels for counter, skip, and REQUIRED_SOLVES
const levels = ['hell', 'alien', 'ocean', 'market'];
levels.forEach(lvl => {
  const lvlPath = path.join(__dirname, `../sandwich-hell/public/${lvl}/index.html`);
  const content = fs.readFileSync(lvlPath, 'utf8');
  assert(content.includes('REQUIRED_SOLVES = 6'), `${lvl} must define REQUIRED_SOLVES = 6`);
  assert(content.includes('Skip') || content.includes('skip'), `${lvl} must include Skip button`);
  assert(content.includes('Solved:') || content.includes('Questions Solved:'), `${lvl} must include Solved counter`);
  assert(content.includes(`Room.complete('${lvl}')`), `${lvl} must include Room.complete hook`);
});
console.log('✅ PASS: All 4 levels have question counter, skip button, and REQUIRED_SOLVES = 6');

console.log('\n🎉 ALL VERIFICATIONS PASSED SUCCESSFULLY!');
