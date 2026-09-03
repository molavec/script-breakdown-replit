# Script Breakdown

This is a Nuxt 4 application using pnpm, Drizzle ORM, PostgreSQL, and Google
GenAI.

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Use Node.js 22 or newer. The current locked CSS build tooling requires Node
22.11 or later.

Install dependencies with the lockfile:

```sh
pnpm install
```

## Replit development

The Replit workflow is named `Start application` and runs:

```sh
CI=1 NUXT_TELEMETRY_DISABLED=1 pnpm exec nuxt dev --host 0.0.0.0 --port 5000
```

The server is intentionally bound to `0.0.0.0:5000` so it is available in the
Replit preview. Start it manually with the same command when needed.

### Required environment settings

Add these values as Replit environment variables or secrets before using the
database and AI-backed features:

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Drizzle and the server API. |
| `VITE_API_KEY` | Google GenAI API key read by the server-side GenAI helper. |

Do not commit either value. The repository contains no credentials. The
database and AI endpoints will not be fully usable until these values are
provided. The current code can also initialize Google GenAI through Vertex AI
Application Default Credentials instead of `VITE_API_KEY` when that environment
is configured.

The current app does not read `SESSION_SECRET`, so it is not required to start
the Nuxt server.

## Local development

Start the development server on `http://localhost:3000`:

```sh
pnpm dev
```

To run locally on the same port and host behavior as Replit:

```sh
pnpm exec nuxt dev --host 0.0.0.0 --port 5000
```

## Production

Build the application:

```sh
CI=1 NUXT_TELEMETRY_DISABLED=1 pnpm build
```

Preview the production build locally:

```sh
pnpm preview
```

See the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Database commands

These commands require `DATABASE_URL`:

```sh
pnpm db:generate
pnpm db:push
pnpm db:migrate
pnpm db:studio
```
