# interactive-cmd

Reusable browser runtime for running real uutils coreutils commands from tutorial HTML.

Tutorial pages import one stable ESM runner:

```html
<script type="module">
  import { runUnix } from "./dist/uutils-runner.js";

  const result = await runUnix("head -n 3", "a\nb\nc\nd\n");
  console.log(result.stdout);
</script>
```

## API

```ts
type RunResult = {
  stdout: string;
  stderr: string;
  code: number;
};

async function runUnix(command: string, stdin?: string): Promise<RunResult>;
```

The runner supports simple commands and pipelines such as `head -n 3`, `sort | uniq -c`, and `sort | uniq -c | sort -rn`. Its parser supports whitespace splitting, single quotes, double quotes, and `|`. It intentionally rejects unsupported shell syntax such as redirects, `&&`, `;`, command substitution, globs, and env vars.

## Install

```bash
npm install
```

## Build the runner

```bash
npm run build
```

This bundles `src/uutils-runner.js` into browser ESM at `dist/uutils-runner.js`.

## Build uutils WASM

```bash
npm run build:uutils
```

The script checks `rustup`, installs or confirms the `wasm32-wasip1` target, clones `https://github.com/uutils/coreutils` into `vendor/coreutils` if needed, builds with `--no-default-features --features feat_wasm`, and copies the generated WASM to `dist/uutils.wasm`.

It first tries the `release-small` Cargo profile, then falls back to `--release` if that profile is unavailable.

## Run smoke tests

```bash
npm test
```

The smoke test starts a local static server and uses Playwright Chromium to execute the browser runner against real `dist/uutils.wasm`. It checks `head`, `tail`, `sort`, `uniq`, `wc`, `cat`, and pipelines with exact stdout assertions.

## Run the example

```bash
npm run serve
```

Open `http://127.0.0.1:4173/examples/basic.html`.

## Publish

Commit `dist/uutils-runner.js` and `dist/uutils.wasm`, then publish the repository with GitHub Pages or a release tag.

jsDelivr example:

```js
import { runUnix } from "https://cdn.jsdelivr.net/gh/first-storm/interactive-cmd@v0.1.0/dist/uutils-runner.js";
```

`uutils-runner.js` loads `uutils.wasm` with:

```js
new URL("./uutils.wasm", import.meta.url)
```

That means the WASM file is resolved next to the runner, whether hosted on GitHub Pages, jsDelivr, or another static file host.
