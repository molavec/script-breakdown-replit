import { requireProjectOwner, requireUser } from '../utils/auth';

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const body = await readBody(event);
  const { prompt, generationType, systemInstruction, projectId } = body;

  console.log("\n\n\n------------CHAT API----------");
  console.log("prompt:::", prompt);
  console.log("generationType:::", generationType);
  console.log("systemInstruction:::", systemInstruction);
  console.log("projectId:::", projectId);
  console.log("--------------------------------\n\n\n");


  if (!projectId || typeof projectId !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'projectId is required' });
  }
  await requireProjectOwner(event, projectId);

  try {
    if (generationType === 'image') {
      return await generateAiImage(prompt, systemInstruction);
    }
    // We can handle 'video' or 'audio' here in the future.
    return await generateAiText(prompt, systemInstruction);
  } catch (error: any) {
    console.error("API error:", error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error generating content',
    });
  }
});
