#!/usr/bin/env node

/**
 * Validates that repo CLAUDE.md files contain required policy blocks.
 *
 * For each repo config in repo-configs/, checks that the repo's CLAUDE.md
 * contains key phrases from each required policy. Reports drift.
 *
 * Usage:
 *   node scripts/validate-policies.mjs [repo-name]
 *   node scripts/validate-policies.mjs --all
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POLICIES_DIR = path.join(ROOT, "policies");
const CONFIGS_DIR = path.join(ROOT, "repo-configs");
const WORKSPACE = path.resolve(ROOT, "..");
const DEFAULTS_FILE = path.join(CONFIGS_DIR, "_defaults.yml");

// Key phrases that MUST appear in CLAUDE.md for each policy.
// These are the minimum markers — not the full text.
const POLICY_MARKERS = {
  "design-intent-review": [
    "Before writing or substantially changing code",
    "name the intended approach",
    "If the implementation changed, explain why",
  ],
  "simplicity-first": [
    "Is this the simplest solution?",
    "If no code is the best code, say so explicitly",
  ],
  "verification": [
    "current-metrics.md",
    "MUST",
  ],
  "verification-strict": [
    "current-metrics.md",
    "llm-lies-log.md",
    "MUST",
    "verify against the live source",
  ],
  "commit-practices": [
    "conventional commit",
  ],
  "playwright-handoff": [
    "claude-playwright-handoff",
    "browser-capable Claude session",
  ],
  "tdd": [
    "Write failing test",
    "TDD",
  ],
};

function mergeConfigs(defaults, config) {
  const merged = { ...defaults, ...config };
  const defaultPolicies = Array.isArray(defaults.policies) ? defaults.policies : [];
  const repoPolicies = Array.isArray(config.policies) ? config.policies : [];
  merged.policies = [...new Set([...defaultPolicies, ...repoPolicies])];
  return merged;
}

// ---- YAML-lite parser (minimal, same subset as render script) ----

function parseYaml(text) {
  const result = {};
  let listKey = null;
  let listItems = [];

  function flushList() {
    if (listKey) {
      result[listKey] = listItems;
      listKey = null;
      listItems = [];
    }
  }

  for (const line of text.split("\n")) {
    if (line.startsWith("#")) continue;

    if (listKey && line.match(/^\s+-\s/)) {
      listItems.push(line.replace(/^\s+-\s*/, "").trim());
      continue;
    }
    if (listKey && !line.startsWith(" ") && line !== "") {
      flushList();
    }

    const keyMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (keyMatch) {
      flushList();
      const key = keyMatch[1];
      const val = keyMatch[2].trim();
      if (val === "" || val === "|" || val === ">") {
        if (val === "") {
          listKey = key;
          listItems = [];
        } else {
          result[key] = val;
        }
      } else {
        let v = val;
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        result[key] = v;
      }
    }
  }
  flushList();
  return result;
}

// ---- Validator ----

function validate(repo, config) {
  const repoDir = path.join(WORKSPACE, repo);
  const claudeMd = path.join(repoDir, "CLAUDE.md");
  const issues = [];

  if (!fs.existsSync(repoDir)) {
    return [{ level: "error", msg: `repo directory not found: ${repoDir}` }];
  }

  if (!fs.existsSync(claudeMd)) {
    return [{ level: "error", msg: `CLAUDE.md not found in ${repo}` }];
  }

  const content = fs.readFileSync(claudeMd, "utf-8");
  const policies = config.policies || [];

  for (const policy of policies) {
    const markers = POLICY_MARKERS[policy];
    if (!markers) {
      // Check that the policy file at least exists
      const policyFile = path.join(POLICIES_DIR, `${policy}.md`);
      if (!fs.existsSync(policyFile)) {
        issues.push({ level: "error", msg: `policy '${policy}' has no file and no markers defined` });
      } else {
        issues.push({ level: "warn", msg: `policy '${policy}' has no validation markers — cannot verify presence` });
      }
      continue;
    }

    for (const marker of markers) {
      if (!content.includes(marker)) {
        issues.push({
          level: "error",
          msg: `missing policy marker for '${policy}': "${marker}"`,
        });
      }
    }
  }

  // Drift check for generate-mode repos
  if (config.mode === "generate") {
    try {
      const renderScript = path.join(ROOT, "scripts", "render-claude-md.mjs");
      const rendered = execSync(`node "${renderScript}" ${repo}`, {
        cwd: ROOT,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });
      // Strip the "=== repo ===" header line and trailing newline from render output
      const renderedBody = rendered.replace(/^=== .* ===\n/, "").replace(/\n$/, "");
      if (content !== renderedBody) {
        issues.push({
          level: "warn",
          msg: `CLAUDE.md has drifted from generated output — run: node scripts/render-claude-md.mjs ${repo} --write`,
        });
      }
    } catch {
      issues.push({
        level: "warn",
        msg: `could not run render script for drift check`,
      });
    }
  }

  return issues;
}

// ---- Main ----

function main() {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const repoArgs = args.filter(a => !a.startsWith("--"));

  if (!all && repoArgs.length === 0) {
    process.stderr.write("Usage: node scripts/validate-policies.mjs <repo-name>\n");
    process.stderr.write("       node scripts/validate-policies.mjs --all\n");
    process.exit(1);
  }

  let repos;
  if (all) {
    repos = fs.readdirSync(CONFIGS_DIR)
      .filter(f => f.endsWith(".yml") && !f.startsWith("_"))
      .map(f => f.replace(".yml", ""));
  } else {
    repos = repoArgs;
  }

  let totalErrors = 0;
  let totalWarns = 0;

  for (const repo of repos) {
    const configFile = path.join(CONFIGS_DIR, `${repo}.yml`);
    if (!fs.existsSync(configFile)) {
      process.stderr.write(`Error: no config for '${repo}'\n`);
      totalErrors++;
      continue;
    }

    const defaults = fs.existsSync(DEFAULTS_FILE)
      ? parseYaml(fs.readFileSync(DEFAULTS_FILE, "utf-8"))
      : {};
    const config = mergeConfigs(defaults, parseYaml(fs.readFileSync(configFile, "utf-8")));
    const issues = validate(repo, config);

    const errors = issues.filter(i => i.level === "error");
    const warns = issues.filter(i => i.level === "warn");

    if (errors.length === 0 && warns.length === 0) {
      process.stdout.write(`✓ ${repo} — all policy markers present\n`);
    } else {
      for (const issue of issues) {
        const icon = issue.level === "error" ? "✗" : "⚠";
        process.stdout.write(`${icon} ${repo} — ${issue.msg}\n`);
      }
    }

    totalErrors += errors.length;
    totalWarns += warns.length;
  }

  process.stdout.write(`\n${repos.length} repos checked, ${totalErrors} errors, ${totalWarns} warnings\n`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
