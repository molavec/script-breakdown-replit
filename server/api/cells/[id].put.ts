import { db } from '../../utils/db';
import { breakdownCells, breakdownColumns } from '../../utils/schema';
import { eq } from 'drizzle-orm';
import type { CellBlock } from '~~/shared/types';
import { requireCellOwner } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const cellId = getRouterParam(event, 'id');
  
  if (!cellId) {
    throw createError({ statusCode: 400, statusMessage: 'Cell ID is required' });
  }
  await requireCellOwner(event, cellId);

  const body = await readBody(event);
  const { blocks } = body;

  if (!blocks || !Array.isArray(blocks)) {
    throw createError({ statusCode: 400, statusMessage: 'Blocks array is required' });
  }

  try {
    // Fetch the cell and its associated column to validate
    const cellResult = await db.select().from(breakdownCells).where(eq(breakdownCells.id, cellId)).limit(1);
    const cell = cellResult[0];

    if (!cell) {
      throw createError({ statusCode: 404, statusMessage: 'Cell not found' });
    }

    const columnResult = await db.select().from(breakdownColumns).where(eq(breakdownColumns.id, cell.columnId)).limit(1);
    const column = columnResult[0];

    if (!column) {
      throw createError({ statusCode: 500, statusMessage: 'Associated column not found' });
    }

    let numericValue: number | null = null;
    let finalBlocks: CellBlock[] = blocks;

    // Strict validation for 'number' columns
    if (column.cellType === 'number') {
      if (blocks.length !== 1 || blocks[0].type !== 'text') {
         throw createError({ statusCode: 400, statusMessage: 'Number columns must have exactly one text block' });
      }

      const parsedValue = parseFloat(blocks[0].content);
      if (isNaN(parsedValue)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid numeric value' });
      }
      
      numericValue = parsedValue;
      // Enforce the schema
      finalBlocks = [{ id: blocks[0].id || `b_${Date.now()}`, type: 'text', content: String(parsedValue) }];
    }

    const updatedCell = await db.update(breakdownCells)
      .set({
        blocks: finalBlocks,
        numericValue: numericValue,
        updatedAt: new Date(),
      })
      .where(eq(breakdownCells.id, cellId))
      .returning();

    return updatedCell[0];

  } catch (error: any) {
    console.error('Error updating cell:', error);
    if (error?.statusCode) throw error;
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to update cell',
    });
  }
});
