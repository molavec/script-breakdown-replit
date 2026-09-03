import { db } from '../../utils/db';
import { scenes } from '../../utils/schema';
import { eq } from 'drizzle-orm';
import { requireSceneOwner } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');

  if (!sceneId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Scene ID is required',
    });
  }
  const scene = await requireSceneOwner(event, sceneId);

  try {
    return scene;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch scene: ${error.message}`,
    });
  }
});
