import { eq } from 'drizzle-orm';
import { db } from '../../../utils/db';
import { scenes } from '../../../utils/schema';
import { requireSceneOwner } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');

  if (!sceneId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Scene ID is required',
    });
  }
  await requireSceneOwner(event, sceneId);
  const body = await readBody(event);
  const { order, synopsis } = body;

  try {
    const updatedScene = await db.update(scenes)
      .set({
        order: order !== undefined ? order : undefined,
        synopsis: synopsis !== undefined ? synopsis : undefined,
      })
      .where(eq(scenes.id, sceneId))
      .returning();

    if (!updatedScene || updatedScene.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Scene not found',
      });
    }

    return updatedScene[0];
  } catch (error: any) {
    console.error('Error updating scene:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update scene',
      cause: error.message
    });
  }
});
