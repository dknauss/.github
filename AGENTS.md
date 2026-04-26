## Scope

Apply these instructions to repositories under `/Users/danknauss/Developer/GitHub`.

WordPress-specific sections apply only when the current repository is WordPress-related. Treat a repository as WordPress-related if at least one condition matches:
- Repository name contains `wordpress` or starts with `wp-`.
- Repository contains WordPress indicators such as `wp-config.php`, `wp-content/`, plugin headers, `block.json`, or `theme.json`.

## Skills

A skill is a local instruction set stored in a `SKILL.md` file.

### Shared skills for all repos

These skills are available across all repositories in this workspace:
- `github-repo`: Audits and improves GitHub repository quality — README structure, community health files, .github directory setup, is...
- `github-profile`: Audits and optimizes GitHub profile pages — profile README, metadata fields, pinned repositories, stats widgets, and ...
- `astro-seo`: Audits and improves Astro SEO — metadata, schema, Open Graph images, sitemaps, IndexNow, redirects, and performance defaults.
- `emdash-github-actions`: Sets up GitHub Actions CI/CD workflows for EmDash plugins — type-checking, ESLint, Vitest, npm security checks, and release publishing.
- `readability-check`: Runs a readability audit on prose for readers who use English as a second language and suggests concrete fixes.
- `code-mentor`: Use when writing or substantially changing code and you should explain the intended design approach before coding, th...
- `cs-philosophy-review`: Use for a deeper design or implementation critique grounded in enduring programming wisdom: simplicity first, clarity...

### WordPress skills

For WordPress-related repositories, the canonical source for WordPress agent skills is `agent-skills/` (fork of `WordPress/agent-skills`). Individual repos should not ship their own WordPress skill definitions — they consume shared skills from `agent-skills`.

#### WordPress Development
- `wordpress-router`: Use when the user asks about WordPress codebases (plugins, themes, block themes, Gutenberg blocks, WP core checkouts)...
- `wp-project-triage`: Use when you need a deterministic inspection of a WordPress repository (plugin/theme/block theme/WP core/Gutenberg/fu...
- `wp-block-development`: Use when developing WordPress (Gutenberg) blocks: block.json metadata, register_block_type(_from_metadata), attribute...
- `wp-block-themes`: Use when developing WordPress block themes: theme.json (global settings/styles), templates and template parts, patter...
- `wp-plugin-development`: Use when developing WordPress plugins: architecture and hooks, activation/deactivation/uninstall, admin UI and Settin...
- `wp-rest-api`: Use when building, extending, or debugging WordPress REST API endpoints/routes: register_rest_route, WP_REST_Controll...
- `wp-interactivity-api`: Use when building or debugging WordPress Interactivity API features (data-wp-* directives, @wordpress/interactivity s...
- `wp-abilities-api`: Use when working with the WordPress Abilities API (wp_register_ability, wp_register_ability_category, /wp-json/wp-abi...
- `wpds`: Use when building UIs leveraging the WordPress Design System (WPDS) and its components, tokens, patterns, etc.

#### Operations and Tooling
- `blueprint`: Use when creating, editing, or reviewing WordPress Playground blueprint JSON files.
- `wp-wpcli-and-ops`: Use when working with WP-CLI (wp) for WordPress operations: safe search-replace, db export/import, plugin/theme/user/...
- `wp-phpstan`: Use when configuring, running, or fixing PHPStan static analysis in WordPress projects (plugins/themes/sites): phpsta...
- `wp-playground`: Use for WordPress Playground workflows: fast disposable WP instances in the browser or locally via @wp-playground/cli...
- `wp-github-actions`: Set up GitHub Actions CI/CD for WordPress plugins: WPCS/PHPCS, linting, PHPUnit, PHPStan, Playground previews, Compos...
- `wp-readme-optimizer`: Reviews and rewrites WordPress.org plugin readme.txt files for maximum quality.

#### Accessibility
- `wp-accessibility`: WordPress accessibility: auditing, WCAG 2.2 AA compliance, semantic HTML, focus management, ARIA landmarks, screen-re...

#### Security
- `wp-secure-code`: WordPress secure code analysis and authoring: sanitization, escaping, validation, nonces, capability checks, $wpdb->p...
- `wp-vip-standards`: WordPress VIP platform coding standards: VIP-specific PHPCS rulesets (WordPressVIPMinimum, WordPress-VIP-Go), banned ...

#### Performance
- `wp-performance`: Use when investigating or improving WordPress performance (backend-only agent): profiling and measurement (WP-CLI pro...
- `wp-performance-review`: WordPress performance code review and optimization analysis.

#### Documentation
- `security-researcher`: Produce source-grounded internal research briefs about vendor-specific WordPress security products, hosting stacks, o...
- `wordpress-security-doc-editor`: Draft, revise, and fact-check WordPress security documentation using authority hierarchy, terminology rules, and cros...
- `wordpress-runbook-ops`: Create, revise, and validate WordPress operations runbooks with deterministic WP-CLI steps, metadata, verification, r...

#### Local Development Environments
- `studio`: WordPress Studio development environment: site creation, WP-CLI, plugin/theme development, SQLite databases, Playwrig...
- `studio-xdebug`: Debug WordPress with Xdebug in WordPress Studio.
- `local-studio-env`: Manage WordPress Studio and Local by Flywheel development environments: site routing, port conflicts, plugin syncing,...

### Trigger rules
- If a user names a skill (for example `$wp-rest-api`) or the task clearly matches a skill description, use that skill.
- Use the smallest set of skills needed for the task.
- Prefer `wordpress-router` first when the repository is WordPress-related and the correct specialist skill is not obvious.
- Use `readability-check` for prose-quality work when the user asks for readability review or when another skill explicitly calls for it.
- Use `code-mentor` before implementing or substantially changing code when the user wants explanation, teaching, or stronger design justification.
- Use `cs-philosophy-review` for deeper design critique, simplicity review, or first-principles programming judgment.
- Do not carry skills across turns unless they are re-mentioned or clearly required by the new request.

### Coordination
- Announce which skill(s) you are using and why in one short line.
- If multiple skills apply, state the order and then execute.
- If a skill is missing or unreadable, state that briefly and continue with a direct fallback.

### Style
- Keep brand casing as `WordPress`.

## Policies

These behavioral rules apply to all agents working in this workspace. Non-overridable policies cannot be weakened by per-repo configuration.

## Commit Practices

- Use conventional commit format.
- Run tests and static analysis before every commit.

## Design Intent Review

- Before writing or substantially changing code, briefly restate the problem and name the intended approach in 2–4 sentences.
- Ask whether new code is necessary before implementing. Prefer deletion, simplification, configuration, or reuse when they solve the problem cleanly.
- After implementation, explain whether the intended approach was followed. If the implementation changed, explain why.
- Call out key tradeoffs, likely failure modes, and why this approach is better than the most obvious naive alternative.

## Security Reporting

- Never publicly disclose security vulnerabilities in code, issues, PRs, or commit messages.
- If a security issue is found, report it through the repository's SECURITY.md or private channel.
- Do not include exploit details, proof-of-concept code, or reproduction steps in public artifacts.

## Simplicity First

- Always ask: Is this the simplest solution?
- Prefer fewer moving parts, less abstraction, and less code when they satisfy the requirement.
- If no code is the best code, say so explicitly and prefer that outcome.
- Do not add indirection, generic abstraction, or framework machinery unless it clearly earns its cost.

## Tool Honesty

- Never imply that a tool or capability is available when it is not.
- If a task requires a tool not available in the current session (browser, network, specific CLI), say so clearly and suggest how the user can access it.
- Do not simulate, mock, or approximate tool output that should come from a real tool.

## Verification Baseline

- Never guess or fabricate volatile facts (version numbers, install counts, API signatures, hook names). If you cannot verify, say so.
- When citing third-party code (WordPress core, plugins, external libraries), verify against the live source before writing.
- Prefer verifiable commands over prose claims. If a count or statistic matters, show how to check it.
