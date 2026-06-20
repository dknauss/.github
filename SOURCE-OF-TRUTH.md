# Source of Truth Map

This document records which repositories are authoritative for shared agent policy, shared skills, and specialized skill sets across the `/Users/danknauss/Developer/GitHub` workspace.

## Canonical / primary sources

### 1. Shared governance and policy

- **Local:** `/Users/danknauss/Developer/GitHub/.github`
- **GitHub:** [dknauss/.github](https://github.com/dknauss/.github)
- **Role:** canonical source of truth for:
  - shared policies
  - repo configs
  - governance documentation
  - generated tracked `AGENTS.md`
  - policy validation logic

**Key paths:**

- `/Users/danknauss/Developer/GitHub/.github/policies/`
- `/Users/danknauss/Developer/GitHub/.github/repo-configs/`
- `/Users/danknauss/Developer/GitHub/.github/GOVERNANCE.md`
- `/Users/danknauss/Developer/GitHub/.github/AGENTS.md`

---

### 2. Shared WordPress agent skills

- **Local:** `/Users/danknauss/Developer/GitHub/agent-skills`
- **GitHub:** [dknauss/agent-skills](https://github.com/dknauss/agent-skills)
- **Role:** canonical source of truth for shared WordPress agent skills and the primary skill distribution point for WordPress-related work.
- **Upstream lineage:** [WordPress/agent-skills](https://github.com/WordPress/agent-skills)

**Remote model:**

- `origin` → `dknauss/agent-skills`
- `upstream` → `WordPress/agent-skills`
- upstream push is disabled locally

**Key paths:**

- `/Users/danknauss/Developer/GitHub/agent-skills/skills/`
- `/Users/danknauss/Developer/GitHub/agent-skills/shared/scripts/generate-agents-md.mjs`

---

### 3. Design review skill set

- **Local:** `/Users/danknauss/Developer/GitHub/code-design-review-skills`
- **GitHub:** [dknauss/code-design-review-skills](https://github.com/dknauss/code-design-review-skills)
- **Role:** canonical standalone home for the two design-review skills:
  - `code-mentor`
  - `cs-philosophy-review`

This repo exists because these skills are broader than WordPress and broader than ordinary repo hygiene. They are process and judgment skills.

**Remote model:**

- `origin` only
- not a fork
- no upstream

**Key paths:**

- `/Users/danknauss/Developer/GitHub/code-design-review-skills/skills/code-mentor/SKILL.md`
- `/Users/danknauss/Developer/GitHub/code-design-review-skills/skills/cs-philosophy-review/SKILL.md`

## Mirrors / operational copies

### 4. Workspace-level agent instructions

- **Active workspace copy:** `/Users/danknauss/Developer/GitHub/AGENTS.md`
- **Tracked generated source:** `/Users/danknauss/Developer/GitHub/.github/AGENTS.md`

The root file is the actively read workspace copy. The `.github` copy is the durable generated source in version control.

---

### 5. Repo-local skill mirrors

- **Mirror root:** `/Users/danknauss/Developer/GitHub/.github/.github/skills/`

These are consumer mirrors for GitHub/Copilot-style repo-local consumption. They are not the canonical authoring source.

---

### 6. Global installed skill copies

- **Codex:** `~/.codex/skills/`
- **Claude:** `~/.claude/skills/`
- **Other local consumers:** may be installed from the same pack scripts

These are runtime install locations, not source-of-truth locations.

## Historical / specialized but non-primary sources

### 7. `skills`

- **Local:** `/Users/danknauss/Developer/GitHub/skills`
- **GitHub:** [dknauss/skills](https://github.com/dknauss/skills)
- **Upstream:** [jdevalk/skills](https://github.com/jdevalk/skills)
- **Current role:** public fork maintained for lineage, compatibility, and selected non-WordPress skills
- **Not the canonical source** for shared WordPress agent skills

---

### 8. `claude-wordpress-skills`

- **Local:** `/Users/danknauss/Developer/GitHub/claude-wordpress-skills`
- **GitHub:** [dknauss/claude-wordpress-skills](https://github.com/dknauss/claude-wordpress-skills)
- **Upstream:** [elvismdev/claude-wordpress-skills](https://github.com/elvismdev/claude-wordpress-skills)
- **Current role:** public fork preserved for lineage and compatibility
- **Not the primary distribution point** for WordPress skills anymore

Notable migration: `wp-performance-review` is now maintained through `agent-skills`.

---

### 9. `ai-assisted-docs`

- **Local:** `/Users/danknauss/Developer/GitHub/ai-assisted-docs`
- **GitHub:** [dknauss/ai-assisted-docs](https://github.com/dknauss/ai-assisted-docs)
- **Current role:** editorial/process repo for the WordPress security docs workflow
- May retain embedded or specialized skill material for editorial work
- **Not** the primary shared skill distribution point

## Decision rules

### Edit policy here

If the change is about:

- verification rules
- security disclosure rules
- tool honesty
- commit practices
- simplicity/design-review baseline behavior
- repo config defaults

edit:

- `/Users/danknauss/Developer/GitHub/.github`

### Edit shared WordPress skills here

If the change is about reusable WordPress task execution skills, edit:

- `/Users/danknauss/Developer/GitHub/agent-skills`

### Edit design-review skills here

If the change is specifically about the mentoring/philosophy pair, edit:

- `/Users/danknauss/Developer/GitHub/code-design-review-skills`

Then mirror or sync into broader operational distribution as needed.

### Treat these as non-primary unless intentional

Do **not** treat these as the first edit target unless there is a specific reason:

- `/Users/danknauss/Developer/GitHub/skills`
- `/Users/danknauss/Developer/GitHub/claude-wordpress-skills`
- embedded skill copies inside `/Users/danknauss/Developer/GitHub/ai-assisted-docs`
- installed copies under `~/.codex/skills/` or `~/.claude/skills/`

## Summary

```text
.github
  -> canonical policies, repo configs, AGENTS generation, governance docs

agent-skills
  -> canonical shared WordPress skill source

code-design-review-skills
  -> canonical home for code-mentor and cs-philosophy-review

skills / claude-wordpress-skills / ai-assisted-docs
  -> historical, specialized, or compatibility sources
  -> not primary for shared skill distribution
```
