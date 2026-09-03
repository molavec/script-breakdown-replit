import { eq, asc } from 'drizzle-orm';
import { requireProjectOwner } from '../../../utils/auth';
export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId');

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID is required',
    });
  }
  await requireProjectOwner(event, projectId);

  try {
    const projectScenes = await db.select().from(scenes).where(eq(scenes.projectId, projectId)).orderBy(asc(scenes.order));

    return projectScenes;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch scenes: ${error.message}`,
    });
  }
});
