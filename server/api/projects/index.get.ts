import { db } from '../../utils/db';
import { projects } from '../../utils/schema';
import { desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  try {
    const allProjects = await db.select().from(projects).orderBy(desc(projects.updatedAt));
    return allProjects;
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch projects: ${error.message}`,
    });
  }
});
