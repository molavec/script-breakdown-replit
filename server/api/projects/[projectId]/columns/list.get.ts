import { eq, asc } from 'drizzle-orm';
import { requireProjectOwner } from '../../../../utils/auth';

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
    const columns = await db.select().from(breakdownColumns).where(eq(breakdownColumns.projectId, projectId)).orderBy(asc(breakdownColumns.order));

    return columns;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch columns: ${error.message}`,
    });
  }
});
