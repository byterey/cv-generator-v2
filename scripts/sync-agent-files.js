#!/usr/bin/env node

/**
 * Sync agent instruction files from MASTER.md.
 *
 * MASTER.md is the single source of truth. This script regenerates
 * CLAUDE.md and AGENTS.md from it, each with the correct header.
 *
 * This is optional — only needed if you maintain agent instruction files
 * alongside the project. If you don't use Claude Code or other coding agents,
 * you can ignore this script and the generated files.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const master = readFileSync(join(root, "MASTER.md"), "utf-8");

// Strip the MASTER.md preamble (everything up to and including the first ---)
const contentStart = master.indexOf("\n---\n");
if (contentStart === -1) {
  console.error("ERROR: MASTER.md missing preamble separator '\\n---\\n'");
  process.exit(1);
}
const body = master.slice(contentStart + 5); // skip past "\n---\n"

const targets = {
  "CLAUDE.md": {
    firstLine:
      "# CLAUDE.md",
    secondLine:
      "This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.",
    note: "> This file is auto-generated from MASTER.md. Edit MASTER.md instead.",
  },
  "AGENTS.md": {
    firstLine:
      "# AGENTS.md",
    secondLine:
      "This file provides guidance to coding agents when working with code in this repository.",
    note: "> This file is auto-generated from MASTER.md. Edit MASTER.md instead.",
  },
};

for (const [filename, header] of Object.entries(targets)) {
  const output = `${header.firstLine}\n\n${header.secondLine}\n\n${header.note}\n${body}`;
  const path = join(root, filename);
  const existing = (() => {
    try { return readFileSync(path, "utf-8"); } catch { return ""; }
  })();

  if (output === existing) {
    console.log(`${filename} — up to date`);
  } else {
    writeFileSync(path, output, "utf-8");
    console.log(`${filename} — regenerated`);
  }
}