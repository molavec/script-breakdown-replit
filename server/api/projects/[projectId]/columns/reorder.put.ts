import { eq, and } from 'drizzle-orm';
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


  console.log('projectId', projectId);


  const body = await readBody(event);

  if (!body || !Array.isArray(body.columnIds)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid body: columnIds array is required',
    });
  }

  const columnIds: string[] = body.columnIds;

  try {
    // Execute multiple updates inside a transaction
    await db.transaction(async (tx) => {
      for (let i = 0; i < columnIds.length; i++) {
        const columnId = columnIds[i];
        if (columnId) {
          await tx
            .update(breakdownColumns)
            .set({ order: i + 1 })
            .where(
              and(
                eq(breakdownColumns.id, columnId),
                eq(breakdownColumns.projectId, projectId)
              )
            );
        }
      }
    });

    return { success: true, message: 'Columns reordered successfully' };
  } catch (error: any) {
    console.error('Failed to reorder columns:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to reorder columns: ${error.message}`,
    });
  }
});
