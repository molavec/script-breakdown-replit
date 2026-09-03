import { db } from '~~/server/utils/db';
import { shots, breakdownCells, breakdownColumns, scenes } from '~~/server/utils/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const sceneId = getRouterParam(event, 'sceneId');
  if (!sceneId) {
    throw createError({ statusCode: 400, statusMessage: 'sceneId is required' });
  }

  const body = await readBody(event);
  
  // Calculate order for new shot
  const existingShots = await db.select().from(shots).where(eq(shots.sceneId, sceneId));
  const newOrder = existingShots.length + 1;

  // Create shot
  const shotId = crypto.randomUUID();
  const [newShot] = await db.insert(shots).values({
    id: shotId,
    sceneId: sceneId,
    order: newOrder,
  }).returning();

  // Create empty cells for all columns for this project
  const sceneResult = await db.select().from(scenes).where(eq(scenes.id, sceneId)).limit(1);
  const scene = sceneResult[0];
  
  let createdCells: any[] = [];
  
  if (scene) {
    const columns = await db.select().from(breakdownColumns).where(eq(breakdownColumns.projectId, scene.projectId));
    
    if (columns.length > 0) {
      const newCells = columns.map(col => ({
        id: `c_${Date.now()}_${col.id}_${Math.random().toString(36).substring(7)}`,
        shotId: shotId,
        columnId: col.id,
        blocks: [],
      }));
      createdCells = await db.insert(breakdownCells).values(newCells).returning();
    }
  }

  // Format response to match frontend Shot type
  const cellsMap: Record<string, any> = {};
  createdCells.forEach(cell => {
    cellsMap[cell.columnId] = cell;
  });

  return {
    ...newShot,
    cells: cellsMap,
  };
});
