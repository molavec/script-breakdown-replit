import type { BreakdownColumn, CellContentType } from '~~/shared/types/column';

export const useColumnData = () => {

  const fetchColumns = async (projectId: string): Promise<BreakdownColumn[]> => {
    return await $fetch<BreakdownColumn[]>(`/api/projects/${projectId}/columns/list`);
  };



  const cellTypes: { id: CellContentType; label: string; desc: string }[] = [
    { id: 'text', label: 'Plain Text', desc: 'Texto estándar y múltiple (HTML)' },
    { id: 'media', label: 'Image / Media', desc: 'Generación con IA o subida multimedia' },
    { id: 'tags', label: 'Tags', desc: 'Múltiples etiquetas' },
    { id: 'number', label: 'Number / Currency', desc: 'Valores numéricos e importes monetarios' }
  ];

  const presetColors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Amber
    '#10b981', // Emerald
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#64748b'  // Slate
  ];

  return { fetchColumns, cellTypes, presetColors };
};
