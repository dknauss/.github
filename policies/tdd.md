---
overridable: true
agents-md: false
description: Test-driven development requirement for repos that mandate TDD
---

## Test-Driven Development

All new code must follow TDD:
1. Write failing test(s) first — commit or show them before writing production code
2. Write the minimum production code to pass
3. Refactor if needed, keeping tests green

Never commit production code without corresponding test coverage.
Tests are the primary defense against LLM context collapse — they verify
behavior that the model cannot hold in working memory.
