# Agent and Skill Governance

How AI agents, skills, and policies are managed across Dan Knauss's WordPress repos.

## Target model

```
                    ┌──────────────────────┐
                    │   Neutral policies   │  ← .github/policies/
                    │  (Markdown + YAML    │
                    │   frontmatter)       │
                    └──────┬───────┬───────┘
                           │       │
              ┌────────────┘       └────────────┐
              ▼                                 ▼
    ┌─────────────────┐               ┌─────────────────┐
    │   AGENTS.md     │               │   CLAUDE.md     │
    │  (skills +      │               │  (policies +    │
    │   non-overrid-  │               │   repo-specific │
    │   able policies)│               │   config)       │
    └─────────────────┘               └─────────────────┘
    Read by: all agents               Read by: Claude Code
    Generated from:                   Generated or validated
    skill inventory +                 from repo configs +
    agents-md policies                all assigned policies
```

**Source of truth:** `.github/policies/` (neutral Markdown — not Claude-first, not Codex-first)

**Generated targets:**
- `AGENTS.md` — skills + non-overridable policies (read by any agent: Codex, Claude, Cursor)
- `CLAUDE.md` — per-repo policies + project config (read by Claude Code only)

**Validated manual targets:**
- Rich CLAUDE.md files (wp-sudo, authorship, comment-popularity) — hand-maintained but checked for required policy markers

## Architecture

```
.github/                          ← Governance hub (this repo)
├── policies/                     ← Shared policy blocks (Markdown + YAML frontmatter)
├── repo-configs/                 ← Per-repo YAML configs
├── scripts/
│   ├── render-claude-md.mjs      ← Generates CLAUDE.md for repos in generate mode
│   └── validate-policies.mjs     ← Policy marker + drift detection for all repos
├── planning-template/            ← GSD .planning/ bootstrap template
├── AGENTS.md                     ← Generated: skills + non-overridable policies
├── CLAUDE-TEMPLATE.md            ← Manual CLAUDE.md starting point for new repos
└── GOVERNANCE.md                 ← This file

agent-skills/                     ← Canonical skill source (fork of WordPress/agent-skills)
├── skills/                       ← 27 SKILL.md definitions
├── shared/scripts/
│   └── generate-agents-md.mjs    ← Generates AGENTS.md from skills + policies
├── eval/                         ← BDD test scenarios per skill
└── dist/                         ← Multi-editor distribution (Claude, Codex, Cursor, VSCode)

AGENTS.md                         ← Root-level copy (read by agents in this workspace)
```

## Three layers

### 1. Skills (what agents can do)

**Source of truth:** `agent-skills/skills/`

Skills are domain instructions stored in SKILL.md files. Each skill teaches an agent how to perform a specific WordPress task (block development, REST API, performance review, etc.).

**Key files:**
- `agent-skills/skills/<name>/SKILL.md` — skill definition with YAML frontmatter
- `agent-skills/shared/scripts/generate-agents-md.mjs` — generates AGENTS.md from skill inventory + policies

**Workflow:** Edit skills in agent-skills → regenerate AGENTS.md → copy to workspace root.

```bash
cd agent-skills
# Edit skills/wp-whatever/SKILL.md
node shared/scripts/generate-agents-md.mjs --out=../.github/AGENTS.md
cp ../.github/AGENTS.md ../AGENTS.md
```

### 2. Policies (how agents must behave)

**Source of truth:** `.github/policies/`

Policies are behavioral requirements expressed as Markdown fragments with YAML frontmatter. Each policy declares:
- `overridable: true/false` — whether repos can omit or weaken this policy
- `agents-md: true/false` — whether this policy appears in the generated AGENTS.md

#### Policy inventory

| Policy | Overridable | In AGENTS.md | Purpose |
|--------|:-----------:|:------------:|---------|
| `verification-baseline.md` | no | yes | Never guess volatile facts; verify against live sources |
| `security-reporting.md` | no | yes | No public disclosure; use private channels |
| `tool-honesty.md` | no | yes | Never imply unavailable capabilities |
| `commit-practices.md` | no | yes | Conventional commits, run tests first |
| `verification.md` | yes | no | Check current-metrics.md before writing counts |
| `verification-strict.md` | yes | no | Full LLM verification: llm-lies-log, pre-release audit |
| `tdd.md` | yes | no | Test-driven development requirement |
| `playwright-handoff.md` | no | no | Claude-specific browser session handoff |

**Non-overridable policies** are the behavioral baseline every agent must follow. They appear in AGENTS.md (for all agents) and are validated in every repo's CLAUDE.md.

**Overridable policies** are assigned per-repo based on project needs. A repo that doesn't track `docs/current-metrics.md` doesn't need the `verification` policy.

**Claude-only policies** (like `playwright-handoff`) are non-overridable but not in AGENTS.md because they're tool-specific.

### 3. Per-repo config (what each repo needs)

**Source of truth:** `.github/repo-configs/`

`_defaults.yml` is merged first for every repo. Repo-specific config extends or overrides those defaults, while policy lists are combined.

Each YAML config declares which policies a repo requires and whether its CLAUDE.md is generated or hand-maintained.

**Two modes:**

| Mode | Meaning | Example |
|------|---------|---------|
| `generate` | CLAUDE.md is produced by `render-claude-md.mjs` from config + policies | two-factor |
| `validate` | CLAUDE.md is hand-maintained; validator checks policy markers and no drift | wp-sudo, authorship, comment-popularity |

Use `generate` for repos with straightforward needs. Use `validate` for repos with rich, hand-crafted CLAUDE.md that go beyond what a config can express (wp-sudo's verification commands, architecture deep-dives, etc.).

**What belongs where:**

| Content type | Lives in |
|--------------|----------|
| Behavioral rules (verification, security, TDD) | `policies/` |
| Project facts (commands, architecture, entry points) | `repo-configs/` or hand-written CLAUDE.md |
| Skill definitions (how to do WordPress tasks) | `agent-skills/skills/` |
| Skill metadata (which skills exist, categories) | Generated AGENTS.md |

## Common operations

### Add a new repo

1. Create a config in `.github/repo-configs/<repo>.yml`
2. Choose `mode: generate` or `mode: validate`
3. List required policies
4. If generate mode: add overview, commands, architecture, testing sections
5. Run `node scripts/render-claude-md.mjs <repo> --write` (generate mode)
6. Run `node scripts/validate-policies.mjs <repo>` (either mode)

### Add a new policy

1. Write the policy block in `.github/policies/<name>.md` with frontmatter:
   ```yaml
   ---
   overridable: true/false
   agents-md: true/false
   description: One-line summary
   ---
   ```
2. Add validation markers to `POLICY_MARKERS` in `validate-policies.mjs`
3. Add the policy name to relevant repo configs
4. If `agents-md: true`: regenerate AGENTS.md from agent-skills
5. Re-render or re-validate affected repos

### Add a new skill

1. Create the skill in `agent-skills/skills/<name>/SKILL.md`
2. Add the skill to the category map in `generate-agents-md.mjs`
3. Regenerate: `node shared/scripts/generate-agents-md.mjs --out=../.github/AGENTS.md`
4. Copy to root: `cp ../.github/AGENTS.md ../AGENTS.md`

### Validate all repos

```bash
cd .github
node scripts/validate-policies.mjs --all
```

For validate-mode repos: checks that required policy markers are present.
For generate-mode repos: also checks that CLAUDE.md matches current rendered output (drift detection).

### Render all generate-mode repos

```bash
cd .github
node scripts/render-claude-md.mjs --all --write
```

### Bootstrap GSD for a new repo

```bash
cp -r .github/planning-template/ your-repo/.planning/
# Edit PROJECT.md and STATE.md with project-specific details
```

## Satellite repos

These repos previously shipped their own skill copies. They now point to agent-skills as canonical:

| Repo | Status | Skills migrated |
|------|--------|-----------------|
| `skills/` (fork of jdevalk/skills) | Deprecated as skill source | github-profile, github-repo, wp-github-actions, wp-readme-optimizer |
| `claude-wordpress-skills/` (fork of elvismdev) | Deprecated as skill source | wp-performance-review |
| `ai-assisted-docs/wp-docs-skills/` | Kept embedded for editorial workflow | security-researcher, wordpress-runbook-ops, wordpress-security-doc-editor |

## Design decisions

**Why not full generation for all repos?**
Repos like wp-sudo have 200+ lines of CLAUDE.md with project-specific verification commands, version sync checklists, and architectural details that don't fit a config format. Forcing those into YAML would just be moving complexity sideways. The validate approach keeps those repos hand-maintained while still enforcing shared policies.

**Why not a neutral policy language (Jinja, Mustache)?**
The policies are already in Markdown — the same format the agents read. Adding a templating layer would add a build dependency for minimal gain. The YAML-lite parser in the scripts handles the subset we need.

**Why AGENTS.md in both .github and workspace root?**
`.github/AGENTS.md` is version-controlled and generated. The root `AGENTS.md` at `/Developer/GitHub/` is the actively-read copy (agents in any sub-repo can see it). The root directory isn't a git repo, so the .github copy is the durable source.

**Why are some CLAUDE.md files gitignored?**
All forked repos now gitignore CLAUDE.md to prevent local agent config from leaking into upstream PRs. Non-forked repos may track it at their discretion.

**Why separate AGENTS.md and CLAUDE.md?**
AGENTS.md is agent-neutral (skills + universal policies — any agent can read it). CLAUDE.md is Claude-specific (repo config + all assigned policies including Claude-only ones like playwright-handoff). Both are generated from the same neutral policy source.
