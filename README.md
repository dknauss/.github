# dknauss/.github

Default community health files for repositories owned by `dknauss`.

Repositories with their own `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, issue templates, or pull request templates should prefer the repo-specific versions. Repositories without those files inherit the defaults from this repository.

## Tooling

This repo also holds small portfolio-maintenance tools:

- `tools/repo-bootstrap.sh`
  Creates a new repo in `~/Developer/GitHub` using the default conventions:
  `main` as the default branch, repo URL as the default homepage, and baseline topics by repo type.
- `tools/repo-health-audit.py`
  Scans the local GitHub workspace, checks git cleanliness and integrity, runs `composer validate` where relevant, queries GitHub metadata, and emits a Markdown health report.

Examples:

```bash
# Dry-run a new WordPress plugin repo bootstrap.
bash tools/repo-bootstrap.sh \
  --slug my-plugin \
  --type wordpress-plugin \
  --description "Short repo description" \
  --dry-run

# Run a workspace health report.
python3 tools/repo-health-audit.py --workspace ~/Developer/GitHub
```

## Portfolio Defaults

Current standard for new repos:

- default branch: `main`
- homepage: repo URL by default
- exceptions:
  - real project site when it is the primary landing page
  - platform listing when it is the canonical install/discovery point
  - release URL only when releases are the intended entry point
- baseline topics applied at creation time instead of retrofitted later
