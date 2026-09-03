import { eq } from 'drizzle-orm';
import { db } from '../../../utils/db';
import { scenes } from '../../../utils/schema';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');

  if (!sceneId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Scene ID is required',
    });
  }

  try {
    const deletedScene = await db.delete(scenes)
      .where(eq(scenes.id, sceneId))
      .returning();

    if (!deletedScene || deletedScene.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Scene not found',
      });
    }

    return { success: true, message: 'Scene deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting scene:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete scene',
      cause: error.message
    });
  }
});
