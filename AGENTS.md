## Scope

Apply these instructions to repositories under `/Users/danknauss/Developer/GitHub`.

WordPress-specific sections apply only when the current repository is WordPress-related. Treat a repository as WordPress-related if at least one condition matches:
- Repository name contains `wordpress` or starts with `wp-`.
- Repository contains WordPress indicators such as `wp-config.php`, `wp-content/`, plugin headers, `block.json`, or `theme.json`.

## Skills

A skill is a local instruction set stored in a `SKILL.md` file.

### Shared skills for all repos

These skills are available across all repositories in this workspace:

- `github-repo`: Audits and improves GitHub repository quality — README structure, community health files, `.github` setup, issue/PR templates, metadata, releases, and branch hygiene.
- `github-profile`: Audits and optimizes GitHub profile pages — profile README, metadata fields, pinned repositories, stats widgets, and contribution visibility.
- `astro-seo`: Audits and improves Astro SEO — metadata, schema, Open Graph images, sitemaps, IndexNow, redirects, and performance defaults.
- `emdash-github-actions`: Sets up GitHub Actions CI/CD workflows for EmDash plugins — type-checking, ESLint, Vitest, npm security checks, and release publishing.
- `readability-check`: Runs a readability audit on prose for readers who use English as a second language and suggests concrete fixes.

### WordPress skills

For WordPress-related repositories, the canonical source for WordPress agent skills is `agent-skills/` (fork of `WordPress/agent-skills`). Individual repos should not ship their own WordPress skill definitions — they consume shared skills from `agent-skills`.

#### WordPress Development
- `wordpress-router`: Use when the correct WordPress specialist skill is not obvious.
- `wp-project-triage`: Deterministic inspection of a WordPress codebase to classify the project and surface tooling/tests/version hints.
- `wp-block-development`: WordPress block development, metadata, serialization, rendering, and migrations.
- `wp-block-themes`: WordPress block themes, `theme.json`, templates, patterns, and Site Editor behavior.
- `wp-plugin-development`: WordPress plugin architecture, hooks, admin UI, lifecycle, and release packaging.
- `wp-rest-api`: WordPress REST API endpoints, schema, permissions, and controller patterns.
- `wp-interactivity-api`: WordPress Interactivity API directives, stores, hydration, and performance.
- `wp-abilities-api`: WordPress Abilities API registration, REST exposure, and permission checks.
- `wpds`: WordPress Design System components, tokens, and patterns.

#### Operations and Tooling
- `wp-wpcli-and-ops`: WP-CLI operations, search-replace, imports/exports, cache, cron, multisite, and scripting.
- `wp-phpstan`: PHPStan setup, baselines, and WordPress-specific typing.
- `wp-playground`: WordPress Playground blueprints, local workflows, snapshots, and debugging.
- `wp-github-actions`: GitHub Actions CI/CD for WordPress plugins — WPCS/PHPCS, linting, PHPUnit, PHPStan, Playground previews, security checks, and WordPress.org deploys.
- `wp-readme-optimizer`: Reviews and rewrites WordPress.org plugin `readme.txt` files.

#### Accessibility
- `wp-accessibility`: WordPress accessibility audits, WCAG 2.2 AA, semantics, focus management, and testing.

#### Security
- `wp-secure-code`: WordPress secure code analysis and authoring — sanitization, escaping, validation, nonces, capabilities, and prepared SQL.
- `wp-vip-standards`: WordPress VIP coding standards and platform constraints.

#### Performance
- `wp-performance`: Backend WordPress performance investigation and optimization.
- `wp-performance-review`: WordPress performance code review and scalability analysis.

#### Documentation
- `security-researcher`: Source-grounded research briefs about WordPress security products, hosting stacks, and vendor guidance.
- `wordpress-security-doc-editor`: Drafts and revises WordPress security documentation with fact-checking and consistency checks.
- `wordpress-runbook-ops`: Creates and validates WordPress operations runbooks with deterministic WP-CLI steps and rollback guidance.

#### Local Development Environments
- `studio`: WordPress Studio development environment workflows and troubleshooting.
- `studio-xdebug`: Xdebug setup and debugging for WordPress Studio.
- `local-studio-env`: WordPress Studio and Local by Flywheel environment management.

### Trigger rules
- If a user names a skill or the task clearly matches a skill description, use that skill.
- Use the smallest set of skills needed for the task.
- Prefer `wordpress-router` first when the repository is WordPress-related and the correct specialist skill is not obvious.
- Use `readability-check` for prose-quality work when the user asks for readability review or when another skill explicitly calls for it.
- Do not carry skills across turns unless they are re-mentioned or clearly required by the new request.

### Coordination
- Announce which skill(s) you are using and why in one short line.
- If multiple skills apply, state the order and then execute.
- If a skill is missing or unreadable, state that briefly and continue with a direct fallback.

### Style
- Keep brand casing as `WordPress` in WordPress-related repositories.

## Policies

## Commit Practices

- Use conventional commit format.
- Run tests and static analysis before every commit.

## Security Reporting

- Never publicly disclose security vulnerabilities in code, issues, PRs, or commit messages.
- If a security issue is found, report it through the repository's `SECURITY.md` or a private channel.
- Do not include exploit details, proof-of-concept code, or reproduction steps in public artifacts.

## Tool Honesty

- Never imply that a tool or capability is available when it is not.
- If a task requires a tool not available in the current session, say so clearly and suggest how to access it.
- Do not simulate, mock, or approximate tool output that should come from a real tool.

## Verification Baseline

- Never guess or fabricate volatile facts (versions, install counts, API signatures, hook names). If you cannot verify, say so.
- When citing third-party code (WordPress core, plugins, external libraries), verify against the live source before writing.
- Prefer verifiable commands over prose claims. If a count or statistic matters, show how to check it.
