import { db } from '../../../../utils/db';
import { scenes } from '../../../../utils/schema';

export default defineEventHandler(async (event) => {
  const projectId = getRouterParam(event, 'projectId');
  const body = await readBody(event);
  const { order, synopsis } = body;

  if (!projectId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Project ID is required',
    });
  }

  try {
    const newScene = await db.insert(scenes).values({
      projectId,
      order: order || 1,
      synopsis: synopsis || '',
    }).returning();

    if (!newScene || newScene.length === 0) {
      throw new Error('Failed to create scene in database');
    }

    return newScene[0];
  } catch (error: any) {
    console.error('Error creating scene:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create scene',
      cause: error.message
    });
  }
});
