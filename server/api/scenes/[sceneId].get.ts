import { db } from '../../utils/db';
import { scenes } from '../../utils/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');

  if (!sceneId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Scene ID is required',
    });
  }

  try {
    const result = await db.select().from(scenes).where(eq(scenes.id, sceneId));
    const scene = result[0];

    if (!scene) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Scene not found',
      });
    }

    return scene;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch scene: ${error.message}`,
    });
  }
});
