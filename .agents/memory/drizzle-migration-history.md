---
name: Drizzle migration history
description: Safety constraint for generating and applying schema migrations in this project.
---

The development database schema is ahead of the migrations Drizzle considers applied. New generated migrations can include unrelated drops of legacy columns, and replaying the full history can fail because earlier drops were already applied.

**Why:** A migration generated for an additive ownership column also proposed many unrelated destructive drops, while the standard migrate command failed on an older already-absent column.

**How to apply:** Review every generated SQL statement and keep only the intended schema change. Do not use an automatic push or full migration replay to repair this mismatch without a separate ownership decision and backup plan.