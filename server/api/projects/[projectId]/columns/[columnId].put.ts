import { eq, and } from 'drizzle-orm';
import { requireProjectOwner } from '../../../../utils/auth';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId');
  const columnId = getRouterParam(event, 'columnId');

  if (!projectId || !columnId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID and Column ID are required',
    });
  }
  await requireProjectOwner(event, projectId);

  const body = await readBody(event);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid column update' });
  }

  const updates = {
    name: typeof body.name === 'string' ? body.name : undefined,
    cellType: typeof body.cellType === 'string' ? body.cellType : undefined,
    description: typeof body.description === 'string' || body.description === null ? body.description : undefined,
    color: typeof body.color === 'string' || body.color === null ? body.color : undefined,
    options: body.options && typeof body.options === 'object' && !Array.isArray(body.options) ? body.options : undefined,
  };

  if (Object.values(updates).every((value) => value === undefined)) {
    throw createError({ statusCode: 400, statusMessage: 'No supported column fields provided' });
  }

  try {
    const updatedColumn = await db.update(breakdownColumns)
      .set(updates)
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
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update column: ${error.message}`,
    });
  }
});
