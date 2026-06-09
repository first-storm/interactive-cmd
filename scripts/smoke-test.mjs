import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(new URL("..", import.meta.url).pathname);
const distRunner = join(root, "dist/uutils-runner.js");

if (!existsSync(distRunner)) {
  throw new Error("dist/uutils-runner.js is missing; run npm run build first");
}

const fixtures = [
  ["head -n 3", "a\nb\nc\nd\n", "a\nb\nc\n"],
  ["tail -n 2", "a\nb\nc\nd\n", "c\nd\n"],
  ["sort", "banana\napple\ncherry\n", "apple\nbanana\ncherry\n"],
  ["sort -r", "banana\napple\ncherry\n", "cherry\nbanana\napple\n"],
  ["sort | uniq -c", "b\na\nb\na\na\n", "      3 a\n      2 b\n"],
  ["sort | uniq -c | sort -rn", "banana\napple\nbanana\norange\napple\nbanana\npear\norange\n", "      3 banana\n      2 orange\n      2 apple\n      1 pear\n"],
  ["wc -l", "a\nb\nc\n", "3\n"],
  ["cat", "hello\nworld\n", "hello\nworld\n"]
];

const errorFixtures = [
  ["cat > out", "unsupported shell syntax: >"],
  ["sort && uniq", "unsupported shell syntax: &"],
  ["grep 'unterminated", "unterminated ' quote"]
];

const server = createStaticServer(root);
await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
const { port } = server.address();

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(`http://127.0.0.1:${port}/examples/basic.html`);
  const results = await page.evaluate(async ({ tests, errors }) => {
    const { runUnix } = await import("/dist/uutils-runner.js");
    const out = [];
    for (const [command, stdin, expected] of tests) {
      try {
        const result = await runUnix(command, stdin);
        out.push({ command, expected, result });
      } catch (error) {
        out.push({ command, expected, error: String(error && error.stack ? error.stack : error) });
      }
    }
    const errorOut = [];
    for (const [command, expectedMessage] of errors) {
      try {
        await runUnix(command, "");
        errorOut.push({ command, expectedMessage, actualMessage: null });
      } catch (error) {
        errorOut.push({ command, expectedMessage, actualMessage: String(error && error.message ? error.message : error) });
      }
    }
    return { out, errorOut };
  }, { tests: fixtures, errors: errorFixtures });

  let failed = false;
  for (const item of results.out) {
    if (item.error) {
      failed = true;
      console.error(`FAIL ${item.command}\n${item.error}`);
      continue;
    }
    if (item.result.stdout !== item.expected) {
      failed = true;
      console.error(`FAIL ${item.command}`);
      console.error(`  stdout expected: ${JSON.stringify(item.expected)}`);
      console.error(`  stdout actual:   ${JSON.stringify(item.result.stdout)}`);
      console.error(`  stderr:          ${JSON.stringify(item.result.stderr)}`);
    } else {
      console.log(`ok ${item.command}`);
    }
  }
  for (const item of results.errorOut) {
    if (item.actualMessage !== item.expectedMessage) {
      failed = true;
      console.error(`FAIL ${item.command}`);
      console.error(`  error expected: ${JSON.stringify(item.expectedMessage)}`);
      console.error(`  error actual:   ${JSON.stringify(item.actualMessage)}`);
    } else {
      console.log(`ok ${item.command} rejects`);
    }
  }

  if (failed) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}

function createStaticServer(rootDir) {
  const mime = new Map([
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".wasm", "application/wasm"],
    [".css", "text/css; charset=utf-8"]
  ]);

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1");
      const pathname = decodeURIComponent(url.pathname);
      const safePath = pathname === "/" ? "/examples/basic.html" : pathname;
      const file = resolve(rootDir, `.${safePath}`);
      if (!file.startsWith(rootDir)) {
        res.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": mime.get(extname(file)) || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
}
