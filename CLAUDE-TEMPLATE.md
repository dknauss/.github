# Claude guidance for this repository

<!-- ============================================================
     CLAUDE.md TEMPLATE — Standardized across Dan Knauss repos
     ============================================================
     Copy this file to your repo root as CLAUDE.md.
     Keep all sections that apply; delete the rest.
     The Playwright handoff section should always be included.
     ============================================================ -->

<!-- SECTION: Project overview (for repos with active development) -->
<!--
## Project overview

Brief description of what this project is, its current version, and key requirements.
-->

<!-- SECTION: Commands (for repos with build/test tooling) -->
<!--
## Commands

```bash
# List the key commands an agent needs to build, test, lint, etc.
```
-->

<!-- SECTION: Documentation (for repos with internal docs worth indexing) -->
<!--
## Documentation

- `docs/foo.md` — Description of what it covers.
-->

<!-- SECTION: Verification requirements (for high-risk repos — plugins, security) -->
<!--
## Verification requirements

- Verify external code references against live sources before citing them.
- Verify statistics/counts via authoritative APIs (include query dates).
- Verify internal architectural counts against `docs/current-metrics.md`.
- Before any release, re-verify all claims and append corrections to `docs/llm-lies-log.md`.
-->

<!-- SECTION: Architecture (for repos with non-obvious structure) -->
<!--
## Architecture

Entry point, namespaces, core classes, key behaviors.
-->

<!-- SECTION: Testing (for repos with test suites) -->
<!--
## Testing

Describe the test setup and how to run tests.
-->

<!-- SECTION: Commit practices (optional, for repos with specific conventions) -->
<!--
## Commit practices

Describe any commit message conventions or PR requirements.
-->

<!-- claude-playwright-handoff -->
## Browser and Playwright handoff

If a task in this repository requires browser automation, Playwright testing, screenshots, page interaction, or browser-only inspection:

- Say clearly that a fresh browser-capable Claude session is required.
- Do not imply that Playwright or browser mode can be enabled from inside the current session.
- Tell the user to restart with `/Users/danknauss/bin/claude-playwright` or `/Users/danknauss/bin/claude-browser-handoff`.

Use this only when browser tooling is actually needed, not when it is merely convenient.
