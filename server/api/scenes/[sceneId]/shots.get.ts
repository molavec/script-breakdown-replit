import { db } from '../../../utils/db';
import { shots, breakdownCells } from '../../../utils/schema';
import { eq, asc } from 'drizzle-orm';
import { requireSceneOwner } from '../../../utils/auth';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');

  if (!sceneId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Scene ID is required',
    });
  }
  await requireSceneOwner(event, sceneId);

  try {
    const sceneShots = await db.select().from(shots).where(eq(shots.sceneId, sceneId)).orderBy(asc(shots.order));

    const shotIds = sceneShots.map(s => s.id);
    
    // Fetch all cells for these shots
    let allCells: any[] = [];
    if (shotIds.length > 0) {
      const { inArray } = await import('drizzle-orm');
      allCells = await db.select().from(breakdownCells).where(inArray(breakdownCells.shotId, shotIds));
    }

    // Map cells to their shots
    const formattedShots = sceneShots.map(shot => {
      const shotCells = allCells.filter(cell => cell.shotId === shot.id);
      
      // Structure them as a Record keyed by columnId as expected by the composable
      const cellsRecord: Record<string, any> = {};
      for (const cell of shotCells) {
        cellsRecord[cell.columnId] = cell;
      }
      
      return {
        ...shot,
        cells: cellsRecord
      };
    });

    return formattedShots;
  } catch (error: any) {
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch shots: ${error.message}`,
    });
  }
});
