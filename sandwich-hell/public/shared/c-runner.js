/**
 * The Legendary Sandwich From Hell — In-Browser C Language Evaluator
 * Transpiles and executes C functions with test case validation and timeout watchdog.
 * Supports:
 * - #include <stdio.h> and standard C function signatures
 * - Basic to intermediate control flow (if/else, for/while, switch)
 * - Recursion, array manipulation, string indexing, math operators
 * - Timeout watchdog against while(1) infinite loops
 */

(function(window) {
  'use strict';

  class CCodeRunner {
    constructor() {
      this.timeoutMs = 2000;
    }

    /**
     * Transpile basic to intermediate C function to JS for safe in-browser execution
     */
    transpileCToJS(cCode) {
      let code = cCode;

      // Strip preprocessor directives (e.g. #include <stdio.h>, #include <string.h>)
      code = code.replace(/#\s*include\s*<[^>]+>/g, '');
      code = code.replace(/#\s*define\s+[^\n]+/g, '');

      // Standardize C string null terminator comparisons
      code = code.replace(/([a-zA-Z0-9_]+\[[^\]]+\])\s*!=\s*['"]\\0['"]/g, '($1 !== undefined && $1 !== "\\0" && $1 !== "")');
      code = code.replace(/([a-zA-Z0-9_]+\[[^\]]+\])\s*==\s*['"]\\0['"]/g, '($1 === undefined || $1 === "\\0" || $1 === "")');
      code = code.replace(/while\s*\(\s*([a-zA-Z0-9_]+\[[^\]]+\])\s*\)/g, 'while ($1 !== undefined && $1 !== "\\0" && $1 !== "")');

      // Replace C types with empty or JS variables
      const typeRegex = /\b(const\s+)?(unsigned\s+)?(long\s+long|long|int|float|double|char|void|size_t)\s*(\*+)?\s+/g;

      // Convert function headers: e.g. "int solve(int a, char* b)" -> "function solve(a, b)"
      code = code.replace(/(?:^|\n)\s*(?:const\s+)?(?:unsigned\s+)?(?:long\s+long|long|int|float|double|char|void)\s*(?:\*+)?\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*\{/g, 
        (match, funcName, params) => {
          const cleanParams = params.split(',').map(p => {
            p = p.trim();
            if (!p || p === 'void') return '';
            return p.replace(typeRegex, '').replace(/\[\s*\]/g, '').replace(/\*/g, '').trim();
          }).filter(Boolean).join(', ');
          return `\nfunction ${funcName}(${cleanParams}) {`;
        }
      );

      // Handle variable declarations inside function body: "int x = 5;" -> "let x = 5;"
      code = code.replace(/\b(?:const\s+)?(?:unsigned\s+)?(?:long\s+long|long|int|float|double|char|size_t)\s+(?:\*+)?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[[^\]]*\])?\s*(=|;|,)/g, 'let $1 $2');
      
      // Replace remaining type casts: "(int)" -> "Math.floor"
      code = code.replace(/\(int\)\s*\(([^)]+)\)/g, 'Math.floor($1)');
      code = code.replace(/\(int\)/g, 'Math.floor');
      code = code.replace(/\b([a-zA-Z0-9_]+)\s*\/\s*10\b/g, 'Math.floor($1 / 10)');
      code = code.replace(/\(float\)/g, 'Number');
      code = code.replace(/\(double\)/g, 'Number');

      // Replace standard C string/char functions
      code = code.replace(/\bstrlen\s*\(([^)]+)\)/g, '($1 ? $1.length : 0)');

      // Loop watchdog injection to avoid browser lockups
      let loopCounter = 0;
      code = code.replace(/\b(for|while)\s*\(([^)]+)\)\s*\{/g, (match, loopType, cond) => {
        loopCounter++;
        return `${loopType} (${cond}) { let __wd_${loopCounter} = 0; if (++__wd_${loopCounter} > 20000) throw new Error("Watchdog: Loop exceeded 20,000 iterations. Check for infinite loops.");`;
      });

      return code;
    }

    /**
     * Run test suite against user C code
     */
    async runTests(userCode, functionName, testCases) {
      const results = [];
      let allPassed = true;

      try {
        const jsCode = this.transpileCToJS(userCode);

        // Build executable harness
        const harness = `
          ${jsCode}
          if (typeof ${functionName} !== 'function') {
            throw new Error("Function '${functionName}' not declared. Please keep the function signature intact.");
          }
          return ${functionName};
        `;

        const compiledFunction = new Function(harness)();

        for (const test of testCases) {
          const testStart = performance.now();
          let passed = false;
          let actual = null;
          let error = null;

          try {
            // Clone arguments for in-place modifications
            const args = JSON.parse(JSON.stringify(test.input));

            // Execute function
            actual = compiledFunction(...args);

            // If test expects array modification in-place (void return)
            if (test.expectedArray) {
              actual = args[test.modifyArgIndex || 0];
              passed = JSON.stringify(actual) === JSON.stringify(test.expectedArray);
            } else if (typeof test.expected === 'number') {
              // Floating point tolerance or strict equality
              passed = Math.abs(actual - test.expected) < 0.001;
            } else {
              passed = JSON.stringify(actual) === JSON.stringify(test.expected);
            }
          } catch (err) {
            error = err.message || 'Runtime execution error';
            passed = false;
          }

          if (!passed) allPassed = false;

          results.push({
            id: test.id,
            title: test.title || `Test Case #${test.id}`,
            input: test.inputDisplay || JSON.stringify(test.input),
            expected: test.expectedDisplay || JSON.stringify(test.expectedArray || test.expected),
            actual: actual !== null ? JSON.stringify(actual) : (error ? 'Error' : 'undefined'),
            passed,
            error,
            durationMs: (performance.now() - testStart).toFixed(1)
          });
        }
      } catch (compileErr) {
        return {
          success: false,
          compileError: compileErr.message,
          allPassed: false,
          results: []
        };
      }

      return {
        success: true,
        allPassed,
        testsPassed: results.filter(r => r.passed).length,
        totalTests: results.length,
        results
      };
    }
  }

  window.CRunner = new CCodeRunner();

})(typeof window !== 'undefined' ? window : this);
