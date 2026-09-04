import { db } from '../../utils/db';
import { projects } from '../../utils/schema';
import { createDefaultProjectData } from '../../utils/projectDefaults';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const body = await readBody(event);
  const { title, type, genre, description } = body;

  try {
    // 1. Create Project
    const newProject = await db.insert(projects).values({
      ownerUserId: user.id,
      name: title || 'Untitled Project',
      title: title || 'Untitled Project',
      type: type || 'feature',
      genre: genre || 'thriller',
      description: description || '',
      status: 'draft'
    }).returning();
    const projectId = newProject[0]?.id;
    if (!projectId) throw new Error('Failed to create project');

    // 2. Create Default Data
    await createDefaultProjectData(projectId);

    return newProject[0];
  } catch (error: any) {
    console.error('Error creating project:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create project',
      cause: error.message
    });
  }
});
