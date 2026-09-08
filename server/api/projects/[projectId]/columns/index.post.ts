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

  const body = await readBody(event);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid column data' });
  }

  // Basic validation
  if (!body.name || !body.cellType || body.order === undefined || !body.id) {
     throw createError({ statusCode: 400, statusMessage: 'Missing required column fields (id, name, cellType, order)' });
  }

  const newColumnData = {
    id: body.id,
    projectId,
    name: body.name,
    cellType: body.cellType,
    description: body.description || null,
    order: body.order,
    color: body.color || null,
    isSystem: body.isSystem || false,
    options: body.options || {},
  };

  try {
    const newColumn = await db.insert(breakdownColumns)
      .values(newColumnData)
      .returning();

    return newColumn[0];
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create column: ${error.message}`,
    });
  }
});
