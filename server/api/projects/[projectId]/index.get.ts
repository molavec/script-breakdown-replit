import { db } from '../../../utils/db';
import { projects } from '../../../utils/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'projectId');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID is required',
    });
  }

  try {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    const project = result[0];

    if (!project) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      });
    }

    return project;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch project: ${error.message}`,
    });
  }
});
