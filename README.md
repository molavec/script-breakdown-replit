# Script Breakdown

## About

AI assistant in a familiar tool for them: Script Breakdown.

A script breakdown is the essential pre-production process of analyzing a screenplay scenes and shots to identify, catalog, and tag every single element required to shoot it.

License [GNU GPLv3](./LICENSE.md)

## Demo

[Live Demo](https://script-breakdown.replit.app)

[![Demo](https://img.youtube.com/vi/-wFqC2Gq_2g/hqdefault.jpg)](https://www.youtube.com/watch?v=-wFqC2Gq_2g)


## Tech Stack

This is a Nuxt 4 application using Drizzle ORM, PostgreSQL and Google
GenAI deployed in Replit.


## Important notes to jugdes

### @google/genai

This SDK is used with Google Enterprise Agent Platform APIkey.

You can find relevant code in:

* [chat.post.ts](./server/api/chat.post.ts)

Used to manage the API calls to Google GenAI.

```javascript
if (generationType === 'image') {
      return await generateAiImage(user.id, prompt, systemInstruction);
    }

return await generateAiText(user.id, prompt, systemInstruction);
```

* [genai.ts](./server/utils/genai.ts)

Used to manage the image, text generation and token consumption.

```javascript
export async function generateAiImage(
  userId: string,
  prompt: string,
  systemInstruction?: string,
) {
  // Consume tokens per image
  await checkAndConsumeTokens(userId, TOKEN_COST_IMAGE);

  const ai = useGenAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-image",
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      systemInstruction: `The style should resemble a storyboard drawn on paper with a graphite pencil. ${systemInstruction}`,
    },
  });

  let imageUrl = "";
  if (response.candidates && response.candidates.length > 0) {
    const candidate = response.candidates[0];
    for (const part of candidate?.content?.parts || []) {
      if (part && part.inlineData) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  return { type: "image" as const, imageUrl };
}

export async function generateAiText(
  userId: string,
  prompt: string,
  systemInstruction?: string,
) {
  // Consume tokens per text
  await checkAndConsumeTokens(userId, TOKEN_COST_TEXT);

  const ai = useGenAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseModalities: ["TEXT"],
      systemInstruction: [
        "Return strictly the requested content directly, with no preamble, greetings, explanations, or closing remarks.",
        "Formatting: Use only bold (**text**) and italics (*text*) for emphasis. Strictly do not use headings, bullet points, numbered lists, or other markdown elements.",
        "Spacing: Keep text compact. Avoid blank lines or excessive identation or vertical spacing between paragraphs.",
        systemInstruction?.trim(),
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  });
  return {
    type: "text" as const,
    text: response.text || "No AI text response generated.",
  };
}
```


## Setup

Use Node.js 22 or newer. 
The current locked CSS build tooling requires Node 22.11 or later.

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
| `DATABASE_URL` | PostgreSQL connection string used by Drizzle ORM and the server API. |
| `GOOGLE_API_KEY` | Google GenAI API key for AI-powered script breakdown and suggestions. |
| `GOOGLE_CLOUD_PROJECT` | Google Cloud project ID for Enterprise / Vertex AI platform connection. |
| `GOOGLE_CLOUD_LOCATION` | Google Cloud region/location (e.g., `global` or specific region) for GenAI. |
| `GOOGLE_GENAI_USE_ENTERPRISE` | Enables Google Enterprise Agent Platform connection (`true`/`false`). |
| `SESSION_SECRET` | Secret key used to encrypt and sign user auth session cookies (min 32 chars). |
| `FREE_PLAN_DAILY_TOKEN_LIMIT` | Maximum daily AI token consumption allowed for users on the Free plan (default: `25`). |
| `FREE_PLAN_MONTHLY_TOKEN_LIMIT` | Maximum monthly AI token consumption allowed for users on the Free plan (default: `750`). |
| `PRO_PLAN_DAILY_TOKEN_LIMIT` | Maximum daily AI token consumption allowed for users on the Pro plan (default: `250`). |
| `PRO_PLAN_MONTHLY_TOKEN_LIMIT` | Maximum monthly AI token consumption allowed for users on the Pro plan (default: `7500`). |
| `TEAM_PLAN_DAILY_TOKEN_LIMIT` | Maximum daily AI token consumption allowed for users on the Team plan (default: `1000`). |
| `TEAM_PLAN_MONTHLY_TOKEN_LIMIT` | Maximum monthly AI token consumption allowed for users on the Team plan (default: `30000`). |
| `TOKEN_COST_IMAGE` | AI token cost for generating an image (default: `5`). |
| `TOKEN_COST_TEXT` | AI token cost for generating text (default: `1`). |

Do not commit secret values. The repository contains no credentials. The
database and AI endpoints will not be fully usable until these values are
provided. The GenAI client can authenticate using `GOOGLE_API_KEY` or Vertex AI
Application Default Credentials (ADC) with your Google Cloud Project settings.

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
