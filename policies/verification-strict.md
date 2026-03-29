## Verification Requirements

LLM-generated content has a documented history of confabulation in this project.
See `docs/llm-lies-log.md` for the full record. These rules exist to prevent recurrence.

### External code references (method names, class names, meta keys, hooks)

- **MUST** verify against the live source before writing: WordPress.org SVN trunk,
  GitHub raw file URL, or the plugin's own codebase.
- **MUST** include the verification source in the commit message when adding or
  updating technical details about third-party code.
- If unable to verify, **MUST** say so explicitly — never guess or rely on training data.

### Statistics and counts (install numbers, version numbers, dates)

- **MUST** query the authoritative API or source. For WordPress.org plugins:
  ```bash
  curl -s "https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&slug=SLUG" | jq '.active_installs'
  ```
- **MUST** note the query date when the number is first written or updated.
- Never use training data for statistics. If the API is unreachable, say so.

### Internal architectural counts

- **MUST** check `docs/current-metrics.md` before writing any count that appears
  there (tests, LOC, coverage thresholds, component counts, PHPStan level).
- When adding a feature that changes a count, update `current-metrics.md`
  FIRST, then update all files listed in its "Files that reference these
  counts" section.
- Never hardcode a count in prose without a verification command. If the
  count cannot be trivially verified, add a verification command to the
  Architectural Facts table.

### Pre-release audit

Before tagging a release, re-verify all external claims added or modified since the
last tag. Append any new findings to `docs/llm-lies-log.md`. If new fabrications are
found, fix them before tagging.
