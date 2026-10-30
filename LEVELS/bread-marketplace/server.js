// Market chapter judge. Run: node server.js  (needs gcc, g++, and a JDK on PATH)
// Zero npm dependencies so it works offline. Reference solutions + hidden tests live ONLY here.
const http = require('http'), fs = require('fs'), path = require('path'), os = require('os');
const { spawnSync } = require('child_process');
const PORT = process.env.PORT || 3000;

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const arr = (n, a, b) => Array.from({ length: n }, () => rnd(a, b));
const nums = s => s.trim().split(/\s+/).map(Number);
const fmt = (a) => a.length + '\n' + a.join(' ');

const withX = (a, x) => fmt(a) + '\n' + x;      // N / array / X on three lines
const body = i => nums(i).slice(1);
const parseX = i => { const [n, ...r] = nums(i); return [r.slice(0, n), r[n]]; };

// NOTE (average question): hidden tests avoid sums that land exactly on a rounding tie (like 0.125),
// because C printf and Java printf round those differently. Do not add N=8,16,... tie cases.
// Each problem: solve(input) -> expected output, visible tests (shown on failure), hidden tests (never shown).
const P = {
  smallest: {
    solve: i => Math.min(...body(i)),
    visible: ['5\n12 45 7 89 23', '3\n-8 -3 -5'],
    hidden: ['1\n5', '3\n-5 -2 -9', '4\n0 1 2 3', '3\n5 3 3', '3\n1000000 -1000000 0', fmt(arr(1000, -1e6, 1e6))],
  },
  positives: {
    solve: i => body(i).filter(x => x > 0).length,
    visible: ['6\n-2 5 0 8 -1 3', '3\n0 0 0'],
    hidden: ['1\n0', '1\n5', '3\n-1 -2 -3', '5\n1 2 3 4 5', fmt(arr(1000, -1e6, 1e6))],
  },
  average: {
    solve: i => { const a = body(i); return (a.reduce((s, x) => s + x, 0) / a.length).toFixed(2); },
    visible: ['4\n10 20 30 40', '3\n1 2 2'],
    hidden: ['1\n7', '2\n1 2', '3\n-1 -2 -4', '3\n0 0 1', '5\n-5 5 -5 5 -5', fmt(arr(999, -1e6, 1e6))],
  },
  search: {
    solve: i => { const [a, x] = parseX(i); return a.includes(x) ? 'YES' : 'NO'; },
    visible: ['5\n10 20 30 40 50\n30', '3\n1 2 3\n9'],
    hidden: ['1\n5\n5', '1\n5\n6', '4\n-1 -2 -3 -4\n-4', '5\n7 7 7 7 7\n7', '5\n9 1 2 3 4\n9', '5\n1 2 3 4 9\n9', withX(arr(1000, 1, 1000), -5), (() => { const a = arr(1000, -1e6, 1e6); return withX(a, a[500]); })()],
  },
  occurrences: {
    solve: i => { const [a, x] = parseX(i); return a.filter(v => v === x).length; },
    visible: ['6\n2 4 2 5 2 7\n2', '3\n1 2 3\n9'],
    hidden: ['1\n3\n3', '1\n3\n4', '5\n2 2 2 2 2\n2', '4\n1 2 3 4\n9', '6\n-1 -1 0 0 -1 5\n-1', withX(arr(1000, -5, 5), rnd(-5, 5))],
  },
  evenodd: {
    solve: i => (+i % 2 === 0 ? 'EVEN' : 'ODD'),
    visible: ['17', '10'],
    hidden: ['0', '1', '2', '-3', '-4', '999999999', '1000000000', '-1000000000'],
  },
  digitsum: {
    solve: i => [...i.trim()].reduce((s, c) => s + +c, 0),
    visible: ['1234', '9'],
    hidden: ['0', '10', '90817', '999999999', '1000000000', '100'],
  },
  reversenum: {
    solve: i => String(+[...i.trim()].reverse().join('')),
    visible: ['12340', '907'],
    hidden: ['0', '5', '10', '100', '120', '987654321', '900000009', '1000000000'],
  },
  palindrome: {
    solve: i => { const t = i.trim(); return t === [...t].reverse().join('') ? 'YES' : 'NO'; },
    visible: ['121', '123'],
    hidden: ['0', '5', '10', '100', '1221', '1001', '12321', '999999999', '1000000000'],
  },
  factorial: {
    solve: i => { let f = 1; for (let k = 2; k <= +i; k++) f *= k; return f; },
    visible: ['5', '0'],
    hidden: ['1', '2', '3', '10', '11', '12'],
  },
};

const L = {
  c:    { file: 'main.c',    compile: ['gcc', '-O2', '-o', 'main', 'main.c', '-lm'],       run: ['./main'],                    ms: 2000 },
  cpp:  { file: 'main.cpp',  compile: ['g++', '-O2', '-std=c++17', '-o', 'main', 'main.cpp'], run: ['./main'],                 ms: 2000 },
  java: { file: 'Main.java', compile: ['javac', 'Main.java'],                               run: ['java', '-Xmx256m', 'Main'], ms: 5000 },
};

function judge(pid, lang, code) {
  const p = P[pid], l = L[lang];
  if (!p || !l) return { status: 'error', message: 'Unknown question or language.' };
  if (code.length > 20000) return { status: 'error', message: 'That recipe is far too long.' };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bread-'));
  try {
    fs.writeFileSync(path.join(dir, l.file), code);
    const c = spawnSync(l.compile[0], l.compile.slice(1), { cwd: dir, timeout: 20000, encoding: 'utf8' });
    if (c.error || c.status !== 0) {
      const lines = (c.stderr || String(c.error)).split(dir).join('').split('\n').filter(Boolean);
      return { status: 'compile_error', message: 'The oven rejected your recipe: it would not even compile. Read the first complaint below.', detail: lines.slice(0, 6).join('\n') };
    }
    const tests = [...p.visible.map(i => [i, true]), ...p.hidden.map(i => [i, false])];
    for (const [inp, vis] of tests) {
      const exp = String(p.solve(inp));
      const r = spawnSync(l.run[0], l.run.slice(1), { cwd: dir, input: inp + '\n', timeout: l.ms, encoding: 'utf8', maxBuffer: 1 << 20 });
      if (r.error && r.error.code === 'ETIMEDOUT') return { status: 'timeout', message: vis ? 'Your program took too long even on a sample. Check for an endless loop.' : 'Too slow on a big input. A smarter approach is needed (hint: do you really need to check everything against everything?).' };
      if (r.error || r.status !== 0) return { status: 'runtime_error', message: 'Your program crashed while running. Check array sizes, division, and reading input.' };
      if (r.stdout.trim() !== exp) {
        return vis
          ? { status: 'wrong', message: 'Wrong answer on a sample test.', detail: `Input:\n${inp}\n\nExpected: ${exp}\nYou printed: ${r.stdout.trim() || '(nothing)'}` }
          : { status: 'wrong', message: 'Samples pass, but a hidden test failed. Think about edge cases: negatives, duplicates, huge numbers, the smallest input.' };
      }
    }
    return { status: 'accepted' };
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/submit') {
    let b = '';
    req.on('data', d => { b += d; if (b.length > 60000) req.destroy(); });
    req.on('end', () => {
      let o; try { o = JSON.parse(b); } catch { o = {}; }
      const out = judge(String(o.problemId), String(o.lang), String(o.code || ''));
      res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(out));
    });
  } else if (req.method === 'GET' && (req.url === '/' || req.url === '/market')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'public', 'index.html')));
  } else { res.writeHead(404); res.end('Not found'); }
}).listen(PORT, '0.0.0.0', () => console.log(`Market chapter on http://localhost:${PORT}/market`));
