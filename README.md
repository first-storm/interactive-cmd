# interactive-cmd

Run real command-line tools in the browser via [Biowasm/Aioli](https://biowasm.com/). Supports 76 programs across coreutils, bioinformatics, JSON processing, and more — all executing via WebAssembly in a sandboxed WebWorker.

## Quick Start

Import the runner via CDN — no install required:

```html
<script type="module">
  import { runUnix } from "https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.3.0/dist/runner.js";

  const r1 = await runUnix("head -n 3", "a\nb\nc\nd\n");
  console.log(r1.stdout); // "a\nb\nc\n"

  const r2 = await runUnix("sort | uniq -c | sort -rn", "banana\napple\nbanana\norange\napple\nbanana\n");
  console.log(r2.stdout); // "      3 banana\n      2 apple\n      1 orange\n"
</script>
```

> **Note:** The WASM modules are loaded on demand from the [Biowasm CDN](https://biowasm.com/). Each command is fetched lazily only when first used.

## API

```ts
type RunResult = {
  stdout: string;
  stderr: string;
};

async function runUnix(command: string, stdin?: string): Promise<RunResult>;

function configure(options: { commands?: string[] }): void;
```

### `runUnix(command, stdin?)`

| Parameter | Type     | Required | Description                                    |
|-----------|----------|----------|------------------------------------------------|
| `command` | `string` | Yes      | Unix command to run, supports pipelines (`\|`) |
| `stdin`   | `string` | No       | Data passed via standard input, defaults to `""` |

Returns `{ stdout, stderr }`. The `code` (exit code) field is not available since the underlying Biowasm runtime does not expose it.

### `configure({ commands })`

Restrict which commands are available. Must be called **before** the first `runUnix()` call — once the Aioli runtime is initialized, the command set cannot be changed.

```js
import { configure, runUnix } from "./dist/runner.js";

// Only allow coreutils text processing commands
configure({ commands: ["sort", "uniq", "head", "tail", "cat", "wc", "tr", "cut", "paste", "join", "comm", "fold", "seq", "shuf"] });

await runUnix("sort | uniq -c", "...\n...\n"); // works

await runUnix("samtools view ..."); // throws Error: Command not available: samtools
```

If `configure()` is never called, **all 76 commands** are available.

### Supported Commands

| Category           | Commands                                                                                        |
|--------------------|-------------------------------------------------------------------------------------------------|
| **Coreutils**      | `basename`, `cat`, `comm`, `cut`, `date`, `df`, `dirname`, `du`, `echo`, `env`, `fold`, `head`, `join`, `ls`, `md5sum`, `paste`, `seq`, `shuf`, `sort`, `tail`, `tee`, `tr`, `uniq`, `wc` |
| **Text processing** | `grep`, `sed`, `gawk`, `jq`                                                                    |
| **File utilities** | `find`, `tree`, `bsdunzip`                                                                     |
| **Bioinformatics** | `samtools`, `bcftools`, `bedtools`, `seqtk`, `minimap2`, `bowtie2`, `fastp`, `mafft`, `muscle`, `kalign`, `fasttree`, `hyphy`, `gffread`, `gfatools`, `ivar`, `modbam2bed`, `ViralConsensus`, `wgsim`, `vidjil-algo`, `tn93`, `ssw`, `seq-align`, `mummer4`, `lsd2`, `bhtsne`, `ASTER`, `cawlign`, `lastz` |
| **Genomics file utils** | `tabix`, `htsfile`, `bgzip`, `bigBedToBed`, `bigBedInfo`, `bigWigToWig`, `bigWigInfo`       |

This is not a full shell: commands run inside a browser WebWorker sandbox with a virtual filesystem, so commands that require host files, shell expansion, redirection, or environment access are intentionally limited.

### Command Parser

The parser handles: whitespace splitting, single quotes, double quotes, and the pipe operator `|`.

The following shell syntax is intentionally rejected and will throw an error:

```
>  <  ;  &&  $  *  ~  `
```

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
    import { runUnix } from "https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.3.0/dist/runner.js";

    document.getElementById("run").onclick = async () => {
      const cmd = document.getElementById("cmd").value;
      const stdin = document.getElementById("stdin").value;
      const { stdout, stderr } = await runUnix(cmd, stdin);
      document.getElementById("out").textContent = stderr ? stderr : stdout;
    };
  </script>
</body>
</html>
```

See [`examples/basic.html`](examples/basic.html) for more.

## Development Guide

### Prerequisites

| Tool       | Purpose                | Minimum Version |
|------------|------------------------|-----------------|
| **Node.js** | Build scripts and tests | 18+             |

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
│   └── runner.js             # Core runtime (command parsing + Aioli execution)
├── dist/
│   └── runner.js             # esbuild output (browser ESM)
├── scripts/
│   └── smoke-test.mjs        # Playwright smoke tests
├── examples/
│   └── basic.html            # Interactive demo page
└── package.json
```

Note: WASM modules are loaded from the Biowasm CDN at runtime — no local `.wasm` file is needed.

### Build

```bash
npm run build
```

Bundles `src/runner.js` into a browser ESM module at `dist/runner.js` using esbuild.

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
# Rebuild after editing src/runner.js
npm run build

# Run tests
npm test

# Start a local server for manual testing
npm run serve
```

## Publishing

This project is distributed via [jsDelivr CDN](https://www.jsdelivr.com/). To publish a new version:

1. Make sure `dist/` contains the latest `runner.js`
2. Tag the release: `git tag v0.x.x`
3. Push the tag: `git push --tags`
4. The CDN automatically picks up assets from the GitHub release

CDN URL format:

```
https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.3.0/dist/runner.js
```
