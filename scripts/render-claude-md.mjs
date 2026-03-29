#!/usr/bin/env node

/**
 * Renders CLAUDE.md for repos in generate mode.
 *
 * Reads repo config from repo-configs/<repo>.yml, loads referenced policy
 * blocks from policies/, and produces a CLAUDE.md.
 *
 * Usage:
 *   node scripts/render-claude-md.mjs <repo-name> [--write]
 *   node scripts/render-claude-md.mjs --all [--write]
 *
 * Without --write, outputs to stdout. With --write, writes to the repo's CLAUDE.md.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POLICIES_DIR = path.join(ROOT, "policies");
const CONFIGS_DIR = path.join(ROOT, "repo-configs");
const WORKSPACE = path.resolve(ROOT, "..");

// ---- YAML-lite parser (handles the subset we use) ----

function parseYaml(text) {
  const result = {};
  let currentKey = null;
  let currentVal = "";
  let multiline = false;
  let listKey = null;
  let listItems = [];

  function flush() {
    if (listKey) {
      result[listKey] = listItems;
      listKey = null;
      listItems = [];
    }
    if (currentKey && multiline) {
      result[currentKey] = currentVal.trimEnd();
      currentKey = null;
      currentVal = "";
      multiline = false;
    }
  }

  for (const line of text.split("\n")) {
    // Skip comments and blank lines at top level
    if (line.startsWith("#") && !multiline && !listKey) continue;

    // Multiline block scalar continuation
    if (multiline) {
      if (line === "" || line.startsWith("  ") || line.startsWith("\t")) {
        currentVal += (currentVal ? "\n" : "") + (line.startsWith("  ") ? line.slice(2) : line);
        continue;
      } else {
        flush();
      }
    }

    // List item (starts with "  - ")
    if (listKey && line.match(/^\s+-\s/)) {
      const item = line.replace(/^\s+-\s*/, "").trim();
      // Handle mapping items in lists (- label: ... \n   cmd: ...)
      if (item.startsWith("label:")) {
        listItems.push({ label: item.slice(6).trim() });
      } else {
        listItems.push(item);
      }
      continue;
    }
    // List mapping continuation (indented key under a list item, e.g. "    cmd: ...")
    if (listKey && line.match(/^\s{4,}\w/) && listItems.length > 0) {
      const kvMatch = line.trim().match(/^(\w+):\s*(.*)/);
      if (kvMatch && typeof listItems[listItems.length - 1] === "object") {
        listItems[listItems.length - 1][kvMatch[1]] = kvMatch[2].trim();
        continue;
      }
    }
    if (listKey && (line === "" || !line.startsWith(" "))) {
      flush();
    }

    // Nested key under a mapping parent (e.g. requirements:\n  wordpress: "6.8+")
    // Must check before top-level key match since indented lines with colons could match both
    const nestedMatch = line.match(/^\s+(\w[\w-]*):\s*(.*)/);
    if (nestedMatch && !multiline) {
      // If we're in a "list" context but see a nested key (no - prefix), convert to mapping
      if (listKey && listItems.length === 0) {
        result[listKey] = {};
        const mapKey = listKey;
        listKey = null;
        listItems = [];
        let val = nestedMatch[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[mapKey][nestedMatch[1]] = val;
        continue;
      }
      if (!listKey) {
        // Attach to previous top-level key as sub-object
        const parentKey = Object.keys(result).pop();
        if (parentKey && typeof result[parentKey] === "object" && !Array.isArray(result[parentKey])) {
          let val = nestedMatch[2].trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          result[parentKey][nestedMatch[1]] = val;
        }
        continue;
      }
    }

    // Top-level key
    const keyMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (keyMatch) {
      flush();
      const key = keyMatch[1];
      let val = keyMatch[2].trim();

      if (val === "|" || val === ">") {
        currentKey = key;
        currentVal = "";
        multiline = true;
      } else if (val === "") {
        // Could be start of a list or mapping — we'll figure out from next line
        listKey = key;
        listItems = [];
      } else {
        // Strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        result[key] = val;
      }
    }
  }
  flush();
  return result;
}

// ---- Policy loader ----

function loadPolicy(name) {
  const file = path.join(POLICIES_DIR, `${name}.md`);
  if (!fs.existsSync(file)) {
    process.stderr.write(`Error: policy '${name}' not found at ${file}\n`);
    process.exit(1);
  }
  // Strip YAML frontmatter if present
  const content = fs.readFileSync(file, "utf-8").trim();
  return content.replace(/^---\n[\s\S]*?\n---\n*/, "").trim();
}

// ---- Renderer ----

function render(config) {
  const sections = [];

  sections.push("# Claude guidance for this repository");
  sections.push("");

  // Overview
  if (config.overview) {
    sections.push("## Project Overview");
    sections.push("");
    sections.push(config.overview.trim());
    sections.push("");
    if (config.requirements) {
      const reqs = config.requirements;
      if (reqs.wordpress) sections.push(`**Requirements:** WordPress ${reqs.wordpress}, PHP ${reqs.php || "7.2+"}`);
      sections.push("");
    }
  }

  // Commands
  if (config.commands && config.commands.length > 0) {
    sections.push("## Commands");
    sections.push("");
    sections.push("```bash");
    const maxCmd = Math.max(...config.commands.map(c => {
      const cmd = typeof c === "string" ? c : c.cmd;
      return cmd ? cmd.length : 0;
    }));
    for (const c of config.commands) {
      if (typeof c === "string") {
        sections.push(c);
      } else if (c.cmd && c.label) {
        const pad = " ".repeat(Math.max(1, maxCmd - c.cmd.length + 4));
        sections.push(`${c.cmd}${pad}# ${c.label}`);
      }
    }
    sections.push("```");
    sections.push("");
  }

  // Documentation
  if (config.documentation && config.documentation.length > 0) {
    sections.push("## Documentation");
    sections.push("");
    for (const d of config.documentation) {
      if (typeof d === "string") {
        sections.push(`- \`${d}\``);
      } else if (d.path && d.desc) {
        sections.push(`- \`${d.path}\` — ${d.desc}`);
      }
    }
    sections.push("");
  }

  // Policies (verification, tdd, etc.) — before architecture
  const nonTerminalPolicies = (config.policies || []).filter(p => p !== "playwright-handoff");
  for (const policy of nonTerminalPolicies) {
    sections.push(loadPolicy(policy));
    sections.push("");
  }

  // Architecture
  if (config.architecture) {
    sections.push("## Architecture");
    sections.push("");
    sections.push(config.architecture.trim());
    sections.push("");
  }

  // Testing
  if (config.testing) {
    sections.push("## Testing");
    sections.push("");
    sections.push(config.testing.trim());
    sections.push("");
  }

  // Playwright handoff always last
  if ((config.policies || []).includes("playwright-handoff")) {
    sections.push(loadPolicy("playwright-handoff"));
    sections.push("");
  }

  return sections.join("\n");
}

// ---- Main ----

function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const repoArgs = args.filter(a => !a.startsWith("--"));
  const all = args.includes("--all");

  if (!all && repoArgs.length === 0) {
    process.stderr.write("Usage: node scripts/render-claude-md.mjs <repo-name> [--write]\n");
    process.stderr.write("       node scripts/render-claude-md.mjs --all [--write]\n");
    process.exit(1);
  }

  // Collect repo names
  let repos;
  if (all) {
    repos = fs.readdirSync(CONFIGS_DIR)
      .filter(f => f.endsWith(".yml") && !f.startsWith("_"))
      .map(f => f.replace(".yml", ""));
  } else {
    repos = repoArgs;
  }

  for (const repo of repos) {
    const configFile = path.join(CONFIGS_DIR, `${repo}.yml`);
    if (!fs.existsSync(configFile)) {
      process.stderr.write(`Error: no config for '${repo}' at ${configFile}\n`);
      process.exit(1);
    }

    const configText = fs.readFileSync(configFile, "utf-8");
    const config = parseYaml(configText);

    if (config.mode !== "generate") {
      process.stderr.write(`Skipping '${repo}' (mode: ${config.mode || "unknown"}, not generate)\n`);
      continue;
    }

    const output = render(config);

    if (write) {
      const target = path.join(WORKSPACE, repo, "CLAUDE.md");
      if (!fs.existsSync(path.join(WORKSPACE, repo))) {
        process.stderr.write(`Error: repo directory not found at ${path.join(WORKSPACE, repo)}\n`);
        continue;
      }
      fs.writeFileSync(target, output, "utf-8");
      process.stderr.write(`Wrote ${target}\n`);
    } else {
      process.stdout.write(`=== ${repo} ===\n`);
      process.stdout.write(output);
      process.stdout.write("\n");
    }
  }
}

main();
