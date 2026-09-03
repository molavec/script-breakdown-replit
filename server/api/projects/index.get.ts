import { db } from '../../utils/db';
import { projects } from '../../utils/schema';
import { and, desc, eq } from 'drizzle-orm';
import { requireUser } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  try {
    const allProjects = await db.select().from(projects).where(eq(projects.ownerUserId, user.id)).orderBy(desc(projects.updatedAt));
    return allProjects;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch projects: ${error.message}`,
    });
  }
});
