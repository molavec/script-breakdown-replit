import { db } from '../../../utils/db';
import { projects } from '../../../utils/schema';
import { eq } from 'drizzle-orm';
import { requireProjectOwner } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'projectId');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID is required',
    });
  }
  const project = await requireProjectOwner(event, id);

  try {
    return project;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch project: ${error.message}`,
    });
  }
});
