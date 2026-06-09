import Aioli from "@biowasm/aioli";

const COMMAND_REGISTRY = {
  "astral":       { tool: "ASTER",       version: "1.23",       program: "astral" },
  "astral-pro":   { tool: "ASTER",       version: "1.23",       program: "astral-pro" },
  "wastral":      { tool: "ASTER",       version: "1.23",       program: "wastral" },
  "caster-site":  { tool: "ASTER",       version: "1.23",       program: "caster-site" },
  "caster-pair":  { tool: "ASTER",       version: "1.23",       program: "caster-pair" },
  "bcftools":     { tool: "bcftools",    version: "1.10",       program: "bcftools" },
  "bedtools":     { tool: "bedtools",    version: "2.31.0",     program: "bedtools" },
  "bhtsne":       { tool: "bhtsne",      version: "2016.08.22", program: "bhtsne" },
  "bowtie2-align-s": { tool: "bowtie2",  version: "2.4.2",      program: "bowtie2-align-s" },
  "cawlign":      { tool: "cawlign",     version: "0.1.0",      program: "cawlign" },
  "basename":     { tool: "coreutils",   version: "8.32",       program: "basename" },
  "cat":          { tool: "coreutils",   version: "8.32",       program: "cat" },
  "comm":         { tool: "coreutils",   version: "8.32",       program: "comm" },
  "cut":          { tool: "coreutils",   version: "8.32",       program: "cut" },
  "date":         { tool: "coreutils",   version: "8.32",       program: "date" },
  "df":           { tool: "coreutils",   version: "8.32",       program: "df" },
  "dirname":      { tool: "coreutils",   version: "8.32",       program: "dirname" },
  "du":           { tool: "coreutils",   version: "8.32",       program: "du" },
  "echo":         { tool: "coreutils",   version: "8.32",       program: "echo" },
  "env":          { tool: "coreutils",   version: "8.32",       program: "env" },
  "fold":         { tool: "coreutils",   version: "8.32",       program: "fold" },
  "head":         { tool: "coreutils",   version: "8.32",       program: "head" },
  "join":         { tool: "coreutils",   version: "8.32",       program: "join" },
  "ls":           { tool: "coreutils",   version: "8.32",       program: "ls" },
  "md5sum":       { tool: "coreutils",   version: "8.32",       program: "md5sum" },
  "paste":        { tool: "coreutils",   version: "8.32",       program: "paste" },
  "seq":          { tool: "coreutils",   version: "8.32",       program: "seq" },
  "shuf":         { tool: "coreutils",   version: "8.32",       program: "shuf" },
  "sort":         { tool: "coreutils",   version: "8.32",       program: "sort" },
  "tail":         { tool: "coreutils",   version: "8.32",       program: "tail" },
  "tee":          { tool: "coreutils",   version: "8.32",       program: "tee" },
  "tr":           { tool: "coreutils",   version: "8.32",       program: "tr" },
  "uniq":         { tool: "coreutils",   version: "8.32",       program: "uniq" },
  "wc":           { tool: "coreutils",   version: "8.32",       program: "wc" },
  "fastp":        { tool: "fastp",       version: "0.20.1",     program: "fastp" },
  "find":         { tool: "findutils",   version: "4.9.0",      program: "find" },
  "fasttree":     { tool: "fasttree",    version: "2.1.11",     program: "fasttree" },
  "gawk":         { tool: "gawk",        version: "5.1.0",       program: "gawk" },
  "gfatools":     { tool: "gfatools",    version: "253",        program: "gfatools" },
  "gffread":      { tool: "gffread",     version: "0.12.7",     program: "gffread" },
  "grep":         { tool: "grep",        version: "3.7",         program: "grep" },
  "tabix":        { tool: "htslib",      version: "1.21",       program: "tabix" },
  "htsfile":      { tool: "htslib",      version: "1.21",       program: "htsfile" },
  "bgzip":        { tool: "htslib",      version: "1.21",       program: "bgzip" },
  "hyphy":        { tool: "hyphy",       version: "2.5.57",     program: "hyphy" },
  "ivar":         { tool: "ivar",        version: "1.3.1",       program: "ivar" },
  "jq":           { tool: "jq",          version: "1.7",         program: "jq" },
  "kalign":       { tool: "kalign",      version: "3.3.1",      program: "kalign" },
  "bigBedToBed":  { tool: "kentutils",   version: "437",        program: "bigBedToBed" },
  "bigBedInfo":   { tool: "kentutils",   version: "437",        program: "bigBedInfo" },
  "bigWigToWig":  { tool: "kentutils",   version: "437",        program: "bigWigToWig" },
  "bigWigInfo":   { tool: "kentutils",   version: "437",        program: "bigWigInfo" },
  "lastz":        { tool: "lastz",       version: "1.04.52",    program: "lastz" },
  "lastz_D":      { tool: "lastz",       version: "1.04.52",    program: "lastz_D" },
  "bsdunzip":     { tool: "libarchive",  version: "3.7.2",      program: "bsdunzip" },
  "lsd2":         { tool: "lsd2",        version: "2.3",         program: "lsd2" },
  "tbfast":        { tool: "mafft",      version: "7.520",       program: "tbfast" },
  "dvtditr":       { tool: "mafft",      version: "7.520",       program: "dvtditr" },
  "minimap2":     { tool: "minimap2",    version: "2.22",       program: "minimap2" },
  "minimap2-simd": { tool: "minimap2",   version: "2.22",       program: "minimap2-simd" },
  "modbam2bed":   { tool: "modbam2bed",  version: "0.9.5",      program: "modbam2bed" },
  "nucmer":       { tool: "mummer4",      version: "4.0.0rc1",   program: "nucmer" },
  "muscle":       { tool: "muscle",      version: "5.1.0",       program: "muscle" },
  "samtools":     { tool: "samtools",    version: "1.21",       program: "samtools" },
  "sed":          { tool: "sed",         version: "4.8",         program: "sed",       reinit: true },
  "lcs":          { tool: "seq-align",   version: "2017.10.18", program: "lcs" },
  "needleman_wunsch": { tool: "seq-align", version: "2017.10.18", program: "needleman_wunsch" },
  "smith_waterman": { tool: "seq-align", version: "2017.10.18", program: "smith_waterman" },
  "seqtk":        { tool: "seqtk",       version: "1.4",        program: "seqtk" },
  "ssw":          { tool: "ssw",         version: "1.2.4",      program: "ssw" },
  "ssw-simd":     { tool: "ssw",         version: "1.2.4",      program: "ssw-simd" },
  "tn93":         { tool: "tn93",        version: "1.0.11",     program: "tn93" },
  "tree":         { tool: "tree",        version: "2.0.4",      program: "tree" },
  "vidjil-algo":  { tool: "vidjil-algo", version: "2025.12",   program: "vidjil-algo" },
  "viral_consensus": { tool: "ViralConsensus", version: "1.0.0", program: "viral_consensus" },
  "wgsim":        { tool: "wgsim",       version: "2011.10.17", program: "wgsim" },
};

const NEEDS_REINIT = new Set(["sed"]);
const AIOLI_BASE_PROGRAM = "cat";

let commandFilterSet = null;
let runQueue = Promise.resolve();
let hasRun = false;
let configured = false;

export function configure({ commands } = {}) {
  if (hasRun) {
    throw new Error("configure() must be called before the first runUnix() call");
  }
  if (commands !== undefined) {
    for (const cmd of commands) {
      if (!COMMAND_REGISTRY[cmd]) {
        throw new Error(`Unknown command: ${cmd}`);
      }
    }
    commandFilterSet = new Set(commands);
  }
  configured = true;
}

export async function runUnix(command, stdin = "") {
  const stages = parsePipeline(command);

  for (const stage of stages) {
    const programName = stage[0];
    if (commandFilterSet && !commandFilterSet.has(programName)) {
      throw new Error(`Command not available: ${programName}`);
    }
    if (!COMMAND_REGISTRY[programName]) {
      throw new Error(`Unknown command: ${programName}`);
    }
  }

  const runPromise = runQueue.then(() => execPipeline(stages, stdin));
  runQueue = runPromise.catch(() => {});
  hasRun = true;
  return runPromise;
}

async function execPipeline(stages, stdin) {
  let input = String(stdin);
  let last = { stdout: input, stderr: "" };

  for (const [programName, ...args] of stages) {
    const cli = await initAioli(programName);
    cli.stdin = input;
    const raw = await cli.exec(programName, args.length > 0 ? args : null);
    const result = typeof raw === "string"
      ? { stdout: raw, stderr: "" }
      : { stdout: raw.stdout || "", stderr: raw.stderr || "" };
    last = result;
    input = result.stdout;
  }

  return last;
}

async function initAioli(programName) {
  const entries = getAioliEntries(programName);

  const toolConfigs = entries.map(entry => {
    const cfg = {
      tool: entry.tool,
      version: entry.version,
      program: entry.program,
      loading: "lazy",
    };
    if (NEEDS_REINIT.has(entry.program)) {
      cfg.reinit = true;
    }
    return cfg;
  });

  return new Aioli(toolConfigs, { printInterleaved: false });
}

function getAioliEntries(programName = null) {
  const requestedPrograms = programName
    ? [programName]
    : commandFilterSet
      ? [...commandFilterSet]
      : Object.keys(COMMAND_REGISTRY);
  const programs = [AIOLI_BASE_PROGRAM, ...requestedPrograms];
  return [...new Set(programs)].map(program => COMMAND_REGISTRY[program]);
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

export const __testing = { parsePipeline, tokenize, COMMAND_REGISTRY, getAioliEntries };
