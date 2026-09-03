export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { prompt, generationType, systemInstruction } = body;

  try {
    if (generationType === 'image') {
      return await generateAiImage(prompt, systemInstruction);
    }
    // We can handle 'video' or 'audio' here in the future.
    return await generateAiText(prompt, systemInstruction);
  } catch (error: any) {
    console.error("API error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Error generating content',
    });
  }
});
