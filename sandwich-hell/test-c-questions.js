/**
 * Automated Verification Script for C Questions and In-Browser C Runner
 * Tests all 40 questions across Hell, Alien, Ocean, and Market.
 */

const fs = require('fs');
const path = require('path');

// Mock window environment
global.window = global;

// Load CRunner and Questions
require(path.join(__dirname, 'public/shared/c-runner.js'));
require(path.join(__dirname, 'public/shared/questions-data.js'));

const runner = global.CRunner;
const dataset = global.CHAPTER_QUESTIONS;

async function runAllChapterTests() {
  console.log('Testing C Question Suites across all 4 chapters...\n');
  let totalQuestions = 0;
  let passedQuestions = 0;

  for (const [chapter, questions] of Object.entries(dataset)) {
    console.log(`=== Chapter: ${chapter.toUpperCase()} (${questions.length} questions) ===`);
    for (const q of questions) {
      totalQuestions++;
      const result = await runner.runTests(q.boilerplate, q.functionName, q.testCases);
      if (result.success && result.allPassed) {
        passedQuestions++;
        console.log(`  ✓ Q${q.id} [${q.difficulty}]: "${q.title}" -> ${result.testsPassed}/${result.totalTests} tests passed`);
      } else {
        console.error(`  ✗ Q${q.id} [${q.difficulty}]: "${q.title}" FAILED!`);
        if (!result.success) console.error(`    Compile Error:`, result.compileError);
        else console.error(`    Test Results:`, result.results.filter(r => !r.passed));
      }
    }
    console.log('');
  }

  console.log(`=======================================================`);
  console.log(`Results: ${passedQuestions} / ${totalQuestions} Questions Passed Boilerplate Tests`);
  console.log(`=======================================================`);

  if (passedQuestions === totalQuestions) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllChapterTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
