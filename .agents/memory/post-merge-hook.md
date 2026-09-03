---
name: Post-merge setup hook
description: Replit merge setup needs an explicit script path in the project configuration.
---

The imported project must define a `[postMerge]` path in `.replit` and provide the referenced script; workflows alone do not satisfy automatic post-merge setup.

**Why:** Imported projects can have generated workflow configuration without a post-merge hook, causing every task merge to fail before dependency installation or build verification.

**How to apply:** Keep the hook idempotent, non-interactive, and fast; install from the lockfile and run the project build unless the project has a more specific setup requirement.