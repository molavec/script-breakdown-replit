import { eq, asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId');

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID is required',
    });
  }

  try {
    const columns = await db.select().from(breakdownColumns).where(eq(breakdownColumns.projectId, projectId)).orderBy(asc(breakdownColumns.order));

    return columns;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch columns: ${error.message}`,
    });
  }
});
