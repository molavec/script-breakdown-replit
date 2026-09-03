import { eq } from 'drizzle-orm';
import { db } from '../../../utils/db';
import { projects } from '../../../utils/schema';
import { requireProjectOwner } from '../../../utils/auth';

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
    const deletedProject = await db.delete(projects)
      .where(eq(projects.id, projectId))
      .returning();

    if (!deletedProject || deletedProject.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      });
    }

    return { success: true, message: 'Project deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting project:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Failed to delete project: ${error.message}`,
    });
  }
});
