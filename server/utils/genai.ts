import { GoogleGenAI } from "@google/genai";
import { checkAndConsumeTokens } from "./tokens";

let _ai: GoogleGenAI | null = null;

export function useGenAI(): GoogleGenAI {
  if (_ai) return _ai;

  const config = useRuntimeConfig();
  // Busca la API Key en las variables de entorno del servidor
  const apiKey =
    config.GENAI_API_KEY ||
    process.env.VITE_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    (config.public as Record<string, any>)?.apiKey;

  const gcloudId = process.env.GOOGLE_CLOUD_PROJECT;
  const glocation = process.env.GOOGLE_CLOUD_LOCATION;
  const genterprise = process.env.GOOGLE_GENAI_USE_ENTERPRISE;

  // console.log("apiKey::::", apiKey);
  try {
    // Use ADC to connect. Remember add secrets
    // # Replace the `GOOGLE_CLOUD_PROJECT_ID` and `GOOGLE_CLOUD_LOCATION` values
    // # with appropriate values for your project.
    // export GOOGLE_CLOUD_PROJECT=GOOGLE_CLOUD_PROJECT_ID
    // export GOOGLE_CLOUD_LOCATION=global
    // export GOOGLE_GENAI_USE_ENTERPRISE=True

    // console.log("-----USING API KEY-----");
    // console.log("apiKey", apiKey);
    // console.log("gcloudId", gcloudId);
    // console.log("glocation", glocation);
    // console.log("genterprise", genterprise);

    if (apiKey) {
      // Opción 1: Usa API Key si está disponible
      _ai = new GoogleGenAI({
        apiKey,
        project: gcloudId,
        location: glocation,
        vertexai: true,
      });
    } else {
      // Opción 2: Si no hay API Key, se inicializa sin ella.
      // Esto fuerza a @google/genai a buscar automáticamente las credenciales ADC.
      _ai = new GoogleGenAI({ vertexai: true });
    }
    return _ai;
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI in server", error);
    throw createError({
      statusCode: 500,
      statusMessage: "AI initialization failed",
    });
  }
}

export async function generateAiImage(
  userId: string,
  prompt: string,
  systemInstruction?: string,
) {
  // Consumimos 5 tokens por imagen
  await checkAndConsumeTokens(userId, 5);

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
  // Consumimos 1 token por texto
  await checkAndConsumeTokens(userId, 1);

  const ai = useGenAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseModalities: ["TEXT"],
      systemInstruction: `Devuelve únicamente el contenido solicitado, sin preámbulos, saludos, explicaciones ni comentarios finales. utiliza solo negritas y cursivas para enfatizar, sin encabezados, bullets points ni otros elementos visuales para los textos. ${systemInstruction}`,
    },
  });
  return {
    type: "text" as const,
    text: response.text || "No AI text response generated.",
  };
}
