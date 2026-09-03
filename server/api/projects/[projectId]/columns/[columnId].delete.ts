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

  try {
    const deletedColumn = await db.delete(breakdownColumns)
      .where(
        and(
          eq(breakdownColumns.id, columnId),
          eq(breakdownColumns.projectId, projectId)
        )
      )
      .returning();

    if (!deletedColumn.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Column not found in this project',
      });
    }

    return { message: 'Column deleted successfully' };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete column: ${error.message}`,
    });
  }
});
