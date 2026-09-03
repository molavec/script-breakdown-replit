---
name: Publishing run command state
description: Replit publishing behavior when a valid project run command is reported as missing.
---

If Replit reports that no run command exists even though `.replit` has a valid production `run` entry, disconnect the run command in the Publish settings, add it again, save, and republish.

**Why:** Replit's publishing settings can retain stale command metadata independently of the checked-in `.replit` configuration.

**How to apply:** Verify `.replit` first, then refresh the command through the Publish UI instead of repeatedly changing application code.