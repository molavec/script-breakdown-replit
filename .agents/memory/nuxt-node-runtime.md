---
name: Nuxt Node runtime
description: Why development and production validation require different attention when choosing the Node runtime.
---

Use Node 22.11 or newer for this project's locked Nuxt toolchain, even when the development server appears to work on Node 20. Verify `node --version` immediately before validation because package installation can leave Node 20 first on `PATH` even while Node 22 remains installed.

**Why:** The development server can start successfully on Node 20, while the production CSS optimizer relies on modern Set methods and fails only during a production build. Replit module changes can also alter runtime priority without removing Node 22, so preview-only verification and module presence both miss the incompatibility.

**How to apply:** Keep the Replit runtime at Node 22 or newer, confirm the active version after dependency updates, and include a production build in setup validation.