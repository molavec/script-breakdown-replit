---
name: Nuxt noninteractive builds
description: Why production Nuxt builds in this workspace must disable interactive telemetry prompts.
---

Use `CI=1 NUXT_TELEMETRY_DISABLED=1` when running production Nuxt builds in Replit's noninteractive build environment.

**Why:** Without those flags, Nuxt telemetry can attempt to initialize a TTY prompt and fail with `ERR_TTY_INIT_FAILED`, even though the application itself builds correctly.

**How to apply:** Include both environment settings in deployment build commands and other automated production-build checks.