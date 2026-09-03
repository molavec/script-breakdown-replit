import { db } from '../../../utils/db';
import { projects, scenes, shots, breakdownColumns, breakdownCells } from '../../../utils/schema';
import { eq, and, sql } from 'drizzle-orm';
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
    // 1. Calculate total shots
    const totalShotsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(shots)
      .leftJoin(scenes, eq(shots.sceneId, scenes.id))
      .where(eq(scenes.projectId, projectId));
    
    const totalShots = totalShotsResult[0]?.count || 0;

    // 2. Calculate estimated budget
    const budgetColumnResult = await db
      .select({ id: breakdownColumns.id })
      .from(breakdownColumns)
      .where(
        and(
          eq(breakdownColumns.projectId, projectId),
          eq(breakdownColumns.isSystem, true),
          eq(breakdownColumns.name, 'Budget')
        )
      )
      .limit(1);

    let totalEstimatedBudget = 0;

    if (budgetColumnResult.length > 0) {
      const budgetColumnId = budgetColumnResult[0]?.id;
      
      if (budgetColumnId) {
        const budgetSumResult = await db
          .select({ sum: sql<number>`sum(${breakdownCells.numericValue})::float` })
          .from(breakdownCells)
          .where(eq(breakdownCells.columnId, budgetColumnId));
          
        totalEstimatedBudget = budgetSumResult[0]?.sum || 0;
      }
    }

    // 3. Update the project stats
    const updatedProject = await db
      .update(projects)
      .set({ 
        stats: sql`jsonb_set(
          COALESCE(stats, '{}'::jsonb), 
          '{totalShots}', 
          ${totalShots}::text::jsonb
        )`,
        updatedAt: new Date() 
      })
      .where(eq(projects.id, projectId))
      .returning();

    // Now update totalEstimatedBudget (doing it in two steps for jsonb_set simplicity or we can do it in one if we merge)
    const finalProjectResult = await db
      .update(projects)
      .set({
        stats: sql`jsonb_set(
          COALESCE(stats, '{}'::jsonb),
          '{totalEstimatedBudget}',
          ${totalEstimatedBudget}::text::jsonb
        )`,
      })
      .where(eq(projects.id, projectId))
      .returning();

    const finalProject = finalProjectResult[0];

    if (!finalProject) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Project not found',
      });
    }

    return finalProject;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to recalculate stats: ${error.message}`,
    });
  }
});
