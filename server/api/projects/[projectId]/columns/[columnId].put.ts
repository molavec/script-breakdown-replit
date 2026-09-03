import { eq, and } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId');
  const columnId = getRouterParam(event, 'columnId');

  if (!projectId || !columnId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID and Column ID are required',
    });
  }

  const body = await readBody(event);

  try {
    const updatedColumn = await db.update(breakdownColumns)
      .set(body)
      .where(
        and(
          eq(breakdownColumns.id, columnId),
          eq(breakdownColumns.projectId, projectId)
        )
      )
      .returning();

    if (!updatedColumn.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Column not found in this project',
      });
    }

    return updatedColumn[0];
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update column: ${error.message}`,
    });
  }
});
