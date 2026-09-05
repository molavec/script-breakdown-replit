import { useColumnData } from './useColumnData';
import { useShotData } from './useShotData';
import { useProjectBreakdown } from './useProjectBreakdown';
import type { BreakdownColumn } from '~~/shared/types/column';
import type { Shot } from '~~/shared/types/shot';

export const useSceneTable = () => {
  const { fetchColumns } = useColumnData();
  const { fetchShots, createShot, deleteShot } = useShotData();
  const { activeScene, project } = useProjectBreakdown();

  const columns = useState<BreakdownColumn[]>('scene_columns', () => []);
  const rows = useState<Shot[]>('scene_rows', () => []);

  const loadTableData = async (projectId: string, sceneId: string) => {
    const fetchedColumns = await fetchColumns(projectId);
    columns.value = fetchedColumns;

    const fetchedShots = await fetchShots(sceneId);
    rows.value = fetchedShots;
  };

  const updateRowsOrder = (newRows: Shot[]) => {
    newRows.forEach((row, index) => {
      row.order = index + 1;
    });
    rows.value = newRows;
  };

  const addRow = async () => {
    if (!activeScene.value?.id) return;
    const sceneId = activeScene.value.id;

    try {
      const newShot = await createShot(sceneId, {
        // order is calculated in the backend, number is optional or calculated
      });
      rows.value.push(newShot);
    } catch (error) {
      console.error('Failed to create shot:', error);
    }
  };

  const shotToDelete = ref<string | null>(null);
  const isDeletingRow = ref(false);

  const confirmDeleteRow = (shotId: string) => {
    shotToDelete.value = shotId;
    const modal = document.getElementById('delete_shot_modal') as HTMLDialogElement | null;
    if (modal) modal.showModal();
  };

  const cancelDeleteRow = () => {
    shotToDelete.value = null;
    const modal = document.getElementById('delete_shot_modal') as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  const executeDeleteRow = async () => {
    if (!shotToDelete.value || !activeScene.value?.id) return;
    const shotId = shotToDelete.value;
    const sceneId = activeScene.value.id;

    isDeletingRow.value = true;
    try {
      await deleteShot(sceneId, shotId);
      const rowIndex = rows.value.findIndex(r => r.id === shotId);
      if (rowIndex !== -1) {
        rows.value.splice(rowIndex, 1);
      }
      cancelDeleteRow();
    } catch (error) {
      console.error('Failed to delete shot:', error);
      alert('Failed to delete shot.');
    } finally {
      isDeletingRow.value = false;
    }
  };

  const getColumn = (colId: string) => {
    return columns.value.find(c => c.id === colId);
  };

  const updateColumn = async (colId: string, partial: Partial<BreakdownColumn>) => {
    const colIndex = columns.value.findIndex(c => c.id === colId);
    if (colIndex !== -1) {
      const existing = columns.value[colIndex];
      if (existing) {
        columns.value[colIndex] = {
          ...existing,
          ...partial,
          options: {
            ...existing.options,
            ...(partial.options || {})
          }
        };
      }
    }

    const projectId = project.value?.id;
    if (!projectId) return;

    try {
      await $fetch(`/api/projects/${projectId}/columns/${colId}`, {
        method: 'PUT',
        body: partial
      });
    } catch (error) {
      console.error('Failed to update column:', error);
      throw error;
    }
  };

  const deleteColumn = async (colId: string) => {
    const colIndex = columns.value.findIndex(c => c.id === colId);
    if (colIndex !== -1) {
      columns.value.splice(colIndex, 1);
      // Clean cells for this column in all rows
      rows.value.forEach(row => {
        delete row.cells[colId];
      });
    }

    const projectId = project.value?.id;
    if (!projectId) return;

    try {
      await $fetch(`/api/projects/${projectId}/columns/${colId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Failed to delete column:', error);
      throw error;
    }
  };

  const addColumn = (initialData?: Partial<BreakdownColumn>) => {
    const newColId = initialData?.id || `col_${Date.now()}`;
    const newCol: BreakdownColumn = {
      id: newColId,
      name: initialData?.name || 'New Column',
      cellType: initialData?.cellType || 'text',
      description: initialData?.description || '',
      order: columns.value.length + 1,
      color: initialData?.color || '#ec4899',
      isSystem: false,
      options: {
        width: initialData?.options?.width || 200,
        placeholder: 'Enter content...',
        defaultPrompt: '',
        ...(initialData?.options || {})
      }
    };

    columns.value.push(newCol);

    rows.value.forEach(row => {
      row.cells[newColId] = {
        id: `c_${Date.now()}_${newColId}`,
        columnId: newColId,
        blocks: []
      };
    });

    return newColId;
  };

  const updateColumnsOrder = async (projectId: string, newOrderedColumns: BreakdownColumn[]) => {
    // 1. Update local state for immediate feedback
    newOrderedColumns.forEach((col, index) => {
      col.order = index + 1;
    });
    columns.value = [...newOrderedColumns];

    // 2. Call backend to persist order
    try {
      const columnIds = newOrderedColumns.map(col => col.id);
      await $fetch(`/api/projects/${projectId}/columns/reorder`, {
        method: 'PUT',
        body: { columnIds }
      });
    } catch (error) {
      console.error('Failed to save columns order:', error);
      // Optional: re-fetch from server to restore previous state if needed
    }
  };

  return {
    columns,
    rows,
    loadTableData,
    updateRowsOrder,
    addRow,
    confirmDeleteRow,
    executeDeleteRow,
    cancelDeleteRow,
    isDeletingRow,
    getColumn,
    updateColumn,
    deleteColumn,
    addColumn,
    updateColumnsOrder
  };
};
