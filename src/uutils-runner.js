import {
  WASI,
  File,
  OpenFile,
  ConsoleStdout,
  PreopenDirectory
} from "@bjorn3/browser_wasi_shim";

const wasmUrl = new URL("./uutils.wasm", import.meta.url);
let modulePromise;

export async function runUnix(command, stdin = "") {
  const stages = parsePipeline(command);
  let input = String(stdin);
  let last = { stdout: input, stderr: "", code: 0 };

  for (const stage of stages) {
    last = await runStage(stage, input);
    input = last.stdout;
    if (last.code !== 0) {
      break;
    }
  }

  return last;
}

async function runStage(argv, stdin) {
  const mod = await getCompiledModule();
  const stdout = new CaptureWriter();
  const stderr = new CaptureWriter();
  const stdinFile = new File(new TextEncoder().encode(stdin));

  const fds = [
    new OpenFile(stdinFile),
    new ConsoleStdout(bytes => stdout.writeBytes(bytes)),
    new ConsoleStdout(bytes => stderr.writeBytes(bytes)),
    new PreopenDirectory("/", new Map())
  ];

  const wasi = new WASI(["coreutils", ...argv], [], fds);
  const instance = await WebAssembly.instantiate(mod, {
    wasi_snapshot_preview1: wasi.wasiImport
  });

  const code = wasi.start(instance);

  return {
    stdout: stdout.text(),
    stderr: stderr.text(),
    code
  };
}

async function getCompiledModule() {
  if (!modulePromise) {
    modulePromise = compileWasm();
  }
  return modulePromise;
}

async function compileWasm() {
  if (typeof WebAssembly.compileStreaming === "function") {
    try {
      return await WebAssembly.compileStreaming(fetch(wasmUrl));
    } catch (error) {
      if (!isStreamingMimeError(error)) {
        throw error;
      }
    }
  }

  const response = await fetch(wasmUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${wasmUrl}: ${response.status} ${response.statusText}`);
  }
  return WebAssembly.compile(await response.arrayBuffer());
}

function isStreamingMimeError(error) {
  return /mime|content-type|streaming/i.test(String(error && (error.message || error)));
}

class CaptureWriter {
  constructor() {
    this.parts = [];
    this.decoder = new TextDecoder();
  }

  writeBytes(chunk) {
    this.parts.push(this.decoder.decode(chunk, { stream: true }));
  }

  text() {
    return this.parts.join("") + this.decoder.decode();
  }
}

function parsePipeline(command) {
  if (typeof command !== "string") {
    throw new TypeError("command must be a string");
  }

  const tokens = tokenize(command);
  if (tokens.length === 0) {
    throw new Error("command is empty");
  }

  const stages = [];
  let current = [];
  for (const token of tokens) {
    if (token === "|") {
      if (current.length === 0) {
        throw new Error("pipeline contains an empty command");
      }
      stages.push(current);
      current = [];
      continue;
    }
    current.push(token);
  }

  if (current.length === 0) {
    throw new Error("pipeline cannot end with |");
  }
  stages.push(current);
  return stages;
}

function tokenize(command) {
  const tokens = [];
  let token = "";
  let quote = null;

  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];

    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        token += ch;
      }
      continue;
    }

    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (token.length > 0) {
        tokens.push(token);
        token = "";
      }
      continue;
    }

    if (ch === "|") {
      if (token.length > 0) {
        tokens.push(token);
        token = "";
      }
      tokens.push("|");
      continue;
    }

    if (isUnsupportedShellChar(ch)) {
      throw new Error(`unsupported shell syntax: ${ch}`);
    }

    token += ch;
  }

  if (quote) {
    throw new Error(`unterminated ${quote} quote`);
  }
  if (token.length > 0) {
    tokens.push(token);
  }
  return tokens;
}

function isUnsupportedShellChar(ch) {
  return ch === ">" || ch === "<" || ch === ";" || ch === "&" || ch === "$" || ch === "*" || ch === "~" || ch === "`";
}

export const __testing = { parsePipeline, tokenize };
