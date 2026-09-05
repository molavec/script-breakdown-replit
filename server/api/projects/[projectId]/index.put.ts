import { db } from '../../../utils/db';
import { projects } from '../../../utils/schema';
import { eq } from 'drizzle-orm';
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
  const body = await readBody(event);
  const { name, title, description, logline, type, genre, status, coverImage } = body;

  try {
    const projectTitle = name || title;
    const projectDescription = description !== undefined ? description : (logline !== undefined ? logline : undefined);

    const updatedProjects = await db.update(projects)
      .set({
        name: projectTitle !== undefined ? projectTitle : undefined,
        title: projectTitle !== undefined ? projectTitle : undefined,
        description: projectDescription !== undefined ? projectDescription : undefined,
        type: type !== undefined ? type : undefined,
        genre: genre !== undefined ? genre : undefined,
        status: status !== undefined ? status : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    if (!updatedProjects || updatedProjects.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      });
    }

    return updatedProjects[0];
  } catch (error: any) {
    console.error('Error updating project:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update project: ${error.message}`,
      cause: error.message,
    });
  }
});
