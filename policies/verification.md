---
overridable: true
agents-md: false
description: Basic verification — check current-metrics.md before writing counts
---

## Verification Requirements

### Internal architectural counts

- **MUST** check `docs/current-metrics.md` before writing any count that appears
  there (tests, LOC, coverage thresholds, component counts, PHPStan level).
- When adding a feature that changes a count, update `current-metrics.md`
  FIRST, then update all files listed in its "Files that reference these
  counts" section.
