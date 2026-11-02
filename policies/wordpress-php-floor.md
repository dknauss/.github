---
overridable: true
agents-md: false
description: WordPress plugins and themes require PHP 8.1+; keep every declared floor and the CI matrix in sync
---

## WordPress PHP Floor

- New and actively maintained WordPress plugins and themes require PHP 8.1 or newer. PHP 7.4 and 8.0 are end-of-life and get no security fixes.
- Declare the floor the same way everywhere it appears: `composer.json` `require.php` and `config.platform.php`, the plugin or theme header `Requires PHP`, and `readme.txt` `Requires PHP`. After changing `config.platform`, refresh `composer.lock` (`composer update --lock`).
- Test from the floor through the newest stable PHP release in CI. Do not keep matrix lanes below the floor.
- Update README badges, requirement tables, and docs that state the floor in the same change.
- Forks of upstream plugins (for example `two-factor` and `authorship`) follow the upstream project's floor. Do not raise it in the fork unless upstream does.
- Archived or finished repos are exempt.
