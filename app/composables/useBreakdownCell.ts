import type { CellBlock } from '~~/shared/types/cell';
import { useSceneTable } from './useSceneTable';

export const useBreakdownCell = () => {
  const activeCellId = useState<string | null>('active_cell_id', () => null);
  const activeCellColId = useState<string | null>('active_cell_col_id', () => null);
  const lastSelectedRowIndex = useState<number | null>('last_selected_row_index', () => null);
  const isDrawerOpen = useState<boolean>('is_drawer_open', () => false);

  const { rows } = useSceneTable();

  const selectCell = (rowIndex: number, colId: string, cellId: string) => {
    lastSelectedRowIndex.value = rowIndex;
    activeCellId.value = cellId;
    activeCellColId.value = colId;
    isDrawerOpen.value = true;
  };

  const closeDrawer = () => {
    isDrawerOpen.value = false;
  };

  const updateActiveCellContent = (blocks: CellBlock[], numericValue?: number) => {
    if (lastSelectedRowIndex.value === null || !activeCellColId.value) return;

    const row = rows.value[lastSelectedRowIndex.value];
    const cell = row?.cells[activeCellColId.value];
    if (cell) {
      cell.blocks = blocks;
      if (numericValue !== undefined) {
        cell.numericValue = numericValue;
      }
      
      // Try to save to backend
      $fetch(`/api/cells/${cell.id}`, {
        method: 'PUT',
        body: { blocks, numericValue }
      }).catch(err => {
        console.error('Failed to save cell:', err);
      });
    }
  };

  return {
    activeCellId,
    activeCellColId,
    lastSelectedRowIndex,
    isDrawerOpen,
    selectCell,
    closeDrawer,
    updateActiveCellContent
  };
};
