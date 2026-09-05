import { db } from '~~/server/utils/db';
import { shots } from '~~/server/utils/schema';
import { eq, and } from 'drizzle-orm';
import { requireSceneOwner } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');
  const shotId = getRouterParam(event, 'shotId');
  
  if (!sceneId) {
    throw createError({ statusCode: 400, statusMessage: 'sceneId is required' });
  }
  if (!shotId) {
    throw createError({ statusCode: 400, statusMessage: 'shotId is required' });
  }

  await requireSceneOwner(event, sceneId);

  await db.delete(shots).where(
    and(
      eq(shots.id, shotId),
      eq(shots.sceneId, sceneId)
    )
  );

  return { success: true };
});
