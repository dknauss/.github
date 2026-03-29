# Agent and Skill Governance

How AI agents, skills, and policies are managed across Dan Knauss's WordPress repos.

## Architecture

```
.github/                          ← Governance hub (this repo)
├── policies/                     ← Shared policy blocks (Markdown fragments)
├── repo-configs/                 ← Per-repo YAML configs
├── scripts/
│   ├── render-claude-md.mjs      ← Generates CLAUDE.md for repos in generate mode
│   └── validate-policies.mjs     ← Drift detection for all configured repos
├── planning-template/            ← GSD .planning/ bootstrap template
├── AGENTS.md                     ← Generated skill listing for Codex/agents
├── CLAUDE-TEMPLATE.md            ← Manual CLAUDE.md starting point for new repos
└── GOVERNANCE.md                 ← This file

agent-skills/                     ← Canonical skill source (fork of WordPress/agent-skills)
├── skills/                       ← 27 SKILL.md definitions
├── shared/scripts/
│   └── generate-agents-md.mjs    ← Generates AGENTS.md from skill inventory
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
- `agent-skills/shared/scripts/generate-agents-md.mjs` — generates AGENTS.md from skill inventory

**Workflow:** Edit skills in agent-skills → regenerate AGENTS.md → copy to workspace root.

```bash
cd agent-skills
# Edit skills/wp-whatever/SKILL.md
node shared/scripts/generate-agents-md.mjs --out=../.github/AGENTS.md
cp ../.github/AGENTS.md ../AGENTS.md
```

### 2. Policies (how agents must behave)

**Source of truth:** `.github/policies/`

Policies are behavioral requirements that apply across repos. They are Markdown fragments stitched into CLAUDE.md files.

| Policy | Purpose | Used by |
|--------|---------|---------|
| `verification.md` | Check current-metrics.md before writing counts | authorship, comment-popularity |
| `verification-strict.md` | Full LLM verification: external sources, llm-lies-log, pre-release audit | wp-sudo |
| `tdd.md` | Test-driven development requirement | wp-sudo |
| `commit-practices.md` | Conventional commits, run tests before committing | all active dev repos |
| `playwright-handoff.md` | Browser session handoff instructions | all repos |

### 3. Per-repo config (what each repo needs)

**Source of truth:** `.github/repo-configs/`

Each YAML config declares which policies a repo requires and whether its CLAUDE.md is generated or hand-maintained.

**Two modes:**

| Mode | Meaning | Example |
|------|---------|---------|
| `generate` | CLAUDE.md is produced by `render-claude-md.mjs` from config + policies | two-factor |
| `validate` | CLAUDE.md is hand-maintained; validator checks it contains required policy markers | wp-sudo, authorship, comment-popularity |

Use `generate` for repos with straightforward needs. Use `validate` for repos with rich, hand-crafted CLAUDE.md that go beyond what a config can express (wp-sudo's verification commands, architecture deep-dives, etc.).

## Common operations

### Add a new repo

1. Create a config in `.github/repo-configs/<repo>.yml`
2. Choose `mode: generate` or `mode: validate`
3. List required policies
4. If generate mode: add overview, commands, architecture, testing sections
5. Run `node scripts/render-claude-md.mjs <repo> --write` (generate mode)
6. Run `node scripts/validate-policies.mjs <repo>` (either mode)

### Add a new policy

1. Write the policy block in `.github/policies/<name>.md`
2. Add validation markers to `POLICY_MARKERS` in `validate-policies.mjs`
3. Add the policy name to relevant repo configs
4. Re-render or re-validate affected repos

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

**Why not a neutral policy language?**
The policies are already in Markdown — the same format the agents read. Adding a templating layer (Jinja, Mustache) would add a build dependency for minimal gain. The YAML-lite parser in the scripts handles the subset we need.

**Why AGENTS.md in both .github and workspace root?**
`.github/AGENTS.md` is version-controlled and generated. The root `AGENTS.md` at `/Developer/GitHub/` is the actively-read copy (agents in any sub-repo can see it). The root directory isn't a git repo, so the .github copy is the durable source.

**Why are some CLAUDE.md files gitignored?**
Upstream convention in WordPress/agent-skills and WordPress/two-factor. CLAUDE.md is treated as a local agent config file, not committed. This is fine for local-only use.
