import { ref } from 'vue';

export const useCellInlineEdit = () => {
  const editingCellId = ref<string | null>(null);
  const inlineEditValue = ref<string | number>('');

  const startInlineEdit = (cell: any, type: 'number' | 'tags') => {
    editingCellId.value = cell.id;
    if (type === 'number') {
      inlineEditValue.value = cell.numericValue ?? '';
    } else if (type === 'tags') {
      const tags = cell.blocks?.filter((b: any) => b.type === 'entity_tag').map((b: any) => b.content) || [];
      inlineEditValue.value = tags.join(', ');
    }
  };

  const cancelInlineEdit = () => {
    editingCellId.value = null;
    inlineEditValue.value = '';
  };

  const saveInlineEdit = async (cell: any, type: 'number' | 'tags') => {
    try {
      if (type === 'number') {
        const val = parseFloat(inlineEditValue.value as string);
        if (!isNaN(val)) {
          cell.numericValue = val;
          cell.blocks = [{ id: `b_${Date.now()}`, type: 'text', content: String(val) }];
          await $fetch(`/api/cells/${cell.id}`, {
            method: 'PUT',
            body: { blocks: cell.blocks, numericValue: val }
          });
        }
      } else if (type === 'tags') {
        const tagStrings = (inlineEditValue.value as string).split(',').map(s => s.trim()).filter(s => s);
        const newBlocks = tagStrings.map((t, idx) => ({
          id: `b_${Date.now()}_${idx}`,
          type: 'entity_tag',
          content: t
        }));
        cell.blocks = newBlocks;
        await $fetch(`/api/cells/${cell.id}`, {
          method: 'PUT',
          body: { blocks: cell.blocks }
        });
      }
    } catch (err) {
      console.error('Failed to save cell:', err);
    } finally {
      editingCellId.value = null;
      inlineEditValue.value = '';
    }
  };

  return {
    editingCellId,
    inlineEditValue,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit
  };
};
