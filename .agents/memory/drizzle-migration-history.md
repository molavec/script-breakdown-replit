---
name: Drizzle migration baseline
description: Safety constraint for preserving the reconciled migration baseline.
---

Keep the reconciled baseline idempotent: it must initialize an empty database and safely adopt a legacy database that has the tables but no Drizzle ledger.

**Why:** The original history lagged behind the development database. Replaying it failed on columns already removed, while generating from it proposed unrelated destructive drops.

**How to apply:** Preserve the root snapshot ancestry and adoption-safe SQL when editing old history. For new changes, generate forward migrations, review every statement, and verify clean replay plus a no-op follow-up generation.