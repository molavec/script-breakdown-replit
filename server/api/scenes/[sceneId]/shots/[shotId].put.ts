import { db } from '../../../../utils/db';
import { shots } from '../../../../utils/schema';
import { eq, and } from 'drizzle-orm';
import { requireSceneOwner } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');
  const shotId = getRouterParam(event, 'shotId');

  if (!sceneId || !shotId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Scene ID and Shot ID are required',
    });
  }

  await requireSceneOwner(event, sceneId);

  const body = await readBody(event);

  // Validate the body, checking what we want to update
  const updateData: any = {};
  if (body.order !== undefined) updateData.order = body.order;
  if (body.options !== undefined) updateData.options = body.options;

  if (Object.keys(updateData).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No valid data provided for update',
    });
  }

  try {
    const updatedShots = await db.update(shots)
      .set(updateData)
      .where(and(eq(shots.id, shotId), eq(shots.sceneId, sceneId)))
      .returning();

    if (!updatedShots || updatedShots.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Shot not found',
      });
    }

    return updatedShots[0];
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update shot: ${error.message}`,
    });
  }
});
