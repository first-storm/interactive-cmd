# interactive-cmd

Run real [uutils coreutils](https://github.com/uutils/coreutils) commands in the browser. Executes coreutils commands and pipelines via WebAssembly — ideal for interactive tutorials, online playgrounds, and teaching environments.

## Quick Start

Import the runner via CDN — no install required:

```html
<script type="module">
  import { runUnix } from "https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.1.0/dist/uutils-runner.js";

  const r1 = await runUnix("head -n 3", "a\nb\nc\nd\n");
  console.log(r1.stdout); // "a\nb\nc\n"

  const r2 = await runUnix("sort | uniq -c | sort -rn", "banana\napple\nbanana\norange\napple\nbanana\n");
  console.log(r2.stdout); // "      3 banana\n      2 apple\n      1 orange\n"
</script>
```

> **Note:** The WASM file (`uutils.wasm`) must be served from the same directory as `uutils-runner.js`. When using the CDN, the WASM is loaded automatically from the same path.

## API

```ts
type RunResult = {
  stdout: string;
  stderr: string;
  code: number;
};

async function runUnix(command: string, stdin?: string): Promise<RunResult>;
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | `string` | Yes | Unix command to run, supports pipelines (`\|`) |
| `stdin` | `string` | No | Data passed via standard input, defaults to `""` |

### Supported Commands

Any command included in the bundled [uutils coreutils](https://github.com/uutils/coreutils) WASM binary is supported, along with pipelines joined with `|`.

Common examples include `cat`, `head`, `tail`, `sort`, `uniq`, `wc`, `seq`, `printf`, `basename`, and `dirname`.

This is not a full shell: commands run inside a browser WASI sandbox with an empty preopened filesystem, so commands that require host files, shell expansion, redirection, or environment access are intentionally limited.

### Command Parser

The parser handles: whitespace splitting, single quotes, double quotes, and the pipe operator `|`.

The following shell syntax is intentionally rejected and will throw an error:

```
>  <  ;  &&  $  *  ~  `
```

Redirections, logical operators, command substitution, globs, and environment variables are not supported — this is by design to ensure safe execution in the browser sandbox.

## Full Example

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>interactive-cmd demo</title>
</head>
<body>
  <label>Command <input id="cmd" value="sort | uniq -c | sort -rn"></label>
  <label>stdin <textarea id="stdin">banana
apple
banana
orange
apple
banana</textarea></label>
  <button id="run">Run</button>
  <pre id="out"></pre>

  <script type="module">
    import { runUnix } from "https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.1.0/dist/uutils-runner.js";

    document.getElementById("run").onclick = async () => {
      const cmd = document.getElementById("cmd").value;
      const stdin = document.getElementById("stdin").value;
      const { stdout, stderr, code } = await runUnix(cmd, stdin);
      document.getElementById("out").textContent =
        code === 0 ? stdout : `exit ${code}\n${stderr}`;
    };
  </script>
</body>
</html>
```

See [`examples/basic.html`](examples/basic.html) for more.

## Development Guide

### Prerequisites

| Tool | Purpose | Minimum Version |
|------|---------|-----------------|
| **Node.js** | Build scripts and tests | 18+ |
| **Rust + rustup** | Compile uutils coreutils to WASM | stable |
| **Git** | Clone the uutils repository | — |

### Install

```bash
git clone https://github.com/first-storm/interactive-cmd.git
cd interactive-cmd
npm install
```

### Project Structure

```
interactive-cmd/
├── src/
│   └── uutils-runner.js      # Core runtime (command parsing + WASI execution)
├── dist/
│   ├── uutils-runner.js      # esbuild output (browser ESM)
│   └── uutils.wasm           # uutils coreutils WASM binary
├── vendor/
│   └── coreutils/            # uutils/coreutils source (auto-generated)
├── scripts/
│   ├── build-uutils.sh       # WASM build script
│   └── smoke-test.mjs        # Playwright smoke tests
├── examples/
│   └── basic.html            # Interactive demo page
└── package.json
```

### Build

**1. Bundle the Runner (JavaScript)**

```bash
npm run build
```

Bundles `src/uutils-runner.js` into a browser ESM module at `dist/uutils-runner.js` using esbuild.

**2. Compile WASM**

```bash
npm run build:uutils
```

This command will:

1. Verify `rustup` is available
2. Install the `wasm32-wasip1` compilation target
3. Clone [uutils/coreutils](https://github.com/uutils/coreutils) into `vendor/coreutils/`
4. Compile with the `release-small` profile (falls back to `--release` if unavailable)
5. Copy the generated `.wasm` file to `dist/uutils.wasm`

The first build takes a while depending on your hardware. Subsequent builds use the Cargo cache.

### Test

```bash
npm test
```

The smoke test:

1. Starts a local static file server
2. Launches Playwright Chromium and loads `examples/basic.html`
3. Executes `runUnix()` in the browser and asserts exact stdout output

Covered commands include `head`, `tail`, `sort`, `uniq`, `wc`, `cat`, and multi-stage pipelines.

### Local Preview

```bash
npm run serve
```

Open `http://127.0.0.1:4173/examples/basic.html` to see the interactive demo.

### Typical Workflow

```bash
# Rebuild after editing src/uutils-runner.js
npm run build

# Run tests
npm test

# Start a local server for manual testing
npm run serve
```

If you change the Rust build configuration or the uutils version, re-run `npm run build:uutils`.

## Publishing

This project is distributed via [jsDelivr CDN](https://www.jsdelivr.com/). To publish a new version:

1. Make sure `dist/` contains the latest `uutils-runner.js` and `uutils.wasm`
2. Tag the release: `git tag v0.x.x`
3. Push the tag: `git push --tags`
4. The CDN automatically picks up assets from the GitHub release

CDN URL format:

```
https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.1.0/dist/uutils-runner.js
```
