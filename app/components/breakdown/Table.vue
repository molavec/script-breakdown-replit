<script setup lang="ts">
import draggable from 'vuedraggable';
import { parseMarkdown } from '~~/utils/markdown';

const { activeScene, project } = useProjectBreakdown();
const { columns, rows, updateRowsOrder, updateColumnsOrder, confirmDeleteRow, updateColumn, updateRow } = useSceneTable();
const { activeCellId, lastSelectedRowIndex, selectCell } = useBreakdownCell();
const { editingCellId, inlineEditValue, startInlineEdit, cancelInlineEdit, saveInlineEdit } = useCellInlineEdit();

const previewImageUrl = ref<string | null>(null);

const handleCellClick = (row: any, col: any, rowIndex: number) => {
  const cell = row.cells[col.id];
  if (!cell) {
    if (col.cellType !== 'number' && col.cellType !== 'tags') {
      selectCell(rowIndex, col.id, undefined);
    }
    return;
  }
  
  if (editingCellId.value === cell.id) return;

  if (col.cellType === 'number') {
    startInlineEdit(cell, 'number');
  } else if (col.cellType === 'tags') {
    startInlineEdit(cell, 'tags');
  } else {
    selectCell(rowIndex, col.id, cell.id);
  }
};

const openImagePreview = (url: string) => {
  previewImageUrl.value = url;
};

const closeImagePreview = () => {
  previewImageUrl.value = null;
};

const tableRows = computed({
  get: () => rows.value,
  set: (newRows) => {
    updateRowsOrder(newRows);
  }
});

const openColumnConfig = (columnId: string) => {
  const projectId = project.value?.id || '1';
  navigateTo(`/projects/${projectId}/columns/${columnId}`);
};

const getCurrencySymbol = (code?: string): string => {
  if (!code) return '';
  const trimmed = String(code).trim();
  const symbols: Record<string, string> = {
    USD: '$', EUR: '€', GBP: '£', MXN: '$', CAD: '$', AUD: '$',
    JPY: '¥', CNY: '¥', INR: '₹', BRL: 'R$', ARS: '$', CLP: '$',
    COP: '$', PEN: 'S/'
  };
  return symbols[trimmed.toUpperCase()] || trimmed;
};

const getCellCurrency = (col: any, cell?: any): string => {
  const code = cell?.options?.currencyCode || col?.options?.currencyCode || cell?.currencyCode;
  return getCurrencySymbol(code);
};

// Column Resizing Logic
const colWidths = ref<Record<string, number>>({});
const resizingColId = ref<string | null>(null);
const startX = ref(0);
const startWidth = ref(0);

const getColWidth = (id: string) => {
  if (colWidths.value[id]) return colWidths.value[id];
  const col = columns.value.find(c => c.id === id);
  return col?.options?.width || 320;
};

const startResize = (e: MouseEvent, colId: string) => {
  resizingColId.value = colId;
  startX.value = e.clientX;
  startWidth.value = getColWidth(colId);
  document.body.style.cursor = 'col-resize';
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
};

const onMouseMove = (e: MouseEvent) => {
  if (!resizingColId.value) return;
  const delta = e.clientX - startX.value;
  const newWidth = Math.max(120, startWidth.value + delta); // minimum 120px
  colWidths.value[resizingColId.value] = newWidth;
};

const onMouseUp = () => {
  if (resizingColId.value) {
    updateColumn(resizingColId.value, { 
      options: { width: colWidths.value[resizingColId.value] } 
    });
  }
  resizingColId.value = null;
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
};

// Row Resizing Logic
const rowHeights = ref<Record<string, number>>({});
const resizingRowId = ref<string | null>(null);
const startY = ref(0);
const startHeight = ref(0);

const getRowHeight = (id: string) => {
  if (rowHeights.value[id]) return rowHeights.value[id];
  const row = rows.value.find(r => r.id === id);
  return row?.options?.height || 200; // default 200px
};

const startRowResize = (e: MouseEvent, rowId: string) => {
  resizingRowId.value = rowId;
  startY.value = e.clientY;
  startHeight.value = getRowHeight(rowId);
  document.body.style.cursor = 'row-resize';
  document.addEventListener('mousemove', onRowMouseMove);
  document.addEventListener('mouseup', onRowMouseUp);
};

const onRowMouseMove = (e: MouseEvent) => {
  if (!resizingRowId.value) return;
  const delta = e.clientY - startY.value;
  const newHeight = Math.max(48, startHeight.value + delta); // minimum 48px
  rowHeights.value[resizingRowId.value] = newHeight;
};

const onRowMouseUp = () => {
  if (resizingRowId.value) {
    updateRow(resizingRowId.value, {
      options: { height: rowHeights.value[resizingRowId.value] }
    });
  }
  resizingRowId.value = null;
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onRowMouseMove);
  document.removeEventListener('mouseup', onRowMouseUp);
};

// Sticky first-column activation threshold (matches container px-6 = 24px)
const containerScrollLeft = ref(0);
const isColumnSticky = computed(() => containerScrollLeft.value >= 24);

const onContainerScroll = (e: Event) => {
  containerScrollLeft.value = (e.currentTarget as HTMLElement).scrollLeft;
};

onUnmounted(() => {
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('mousemove', onRowMouseMove);
  document.removeEventListener('mouseup', onRowMouseUp);
});
</script>

<template>
  <div class="h-full overflow-auto pb-6 px-6" @scroll.passive="onContainerScroll">
    <table class="w-max text-left border-separate border-spacing-0 table-fixed mb-128 mr-64">
      <!-- Table Header -->
      <thead class="sticky top-0 z-20 bg-base-200 text-base-content text-xs font-bold font-mono">
        <draggable
          v-model="columns"
          tag="tr"
          item-key="id"
          handle=".col-drag-handle"
          @end="updateColumnsOrder(project?.id || '1', columns)"
        >
          <template #header>
            <th 
              class="sticky top-0 z-30 bg-base-200 w-16 min-w-[64px] border border-base-300 p-3 text-center"
              :class="isColumnSticky ? 'left-[-24px] shadow-[1px_0_0_0_var(--color-base-300)]' : ''"
            >#</th>
          </template>
          <template #item="{ element: col }">
            <th 
              class="sticky top-0 z-20 bg-base-200 border border-base-300 p-3 group/th select-none relative"
              :style="{ width: `${getColWidth(col.id)}px`, minWidth: `${getColWidth(col.id)}px` }"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="col-drag-handle cursor-grab active:cursor-grabbing text-base-content/40 hover:text-base-content transition-colors" title="Drag to reorder column">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                  </div>
                <span 
                  v-if="col.color" 
                  class="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                  :style="{ backgroundColor: col.color }"
                ></span>
                <span class="truncate font-mono">{{ col.name }}</span>
              </div>

              <button 
                type="button"
                class="btn btn-xs btn-ghost btn-square text-base-content/60 hover:text-primary hover:bg-base-300 transition-colors shrink-0"
                :title="`Configure ${col.name} Column`"
                @click.stop="openColumnConfig(col.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>

            <!-- Resizer Handle -->
            <div 
              class="absolute right-0 top-0 h-full w-2 cursor-col-resize hover:bg-primary/50 z-30 flex items-center justify-center transition-colors group-hover/th:opacity-100"
              :class="resizingColId === col.id ? 'bg-primary/50 opacity-100' : 'opacity-0'"
              @mousedown.stop.prevent="startResize($event, col.id)"
            >
              <div 
                class="w-[2px] h-1/2 rounded-full bg-base-content/40"
                :class="resizingColId === col.id ? 'bg-primary' : ''"
              ></div>
            </div>
          </th>
          </template>
        </draggable>
      </thead>
      <!-- Table Body (Draggable) -->
      <draggable
        v-model="tableRows"
        tag="tbody"
        item-key="id"
        handle=".drag-handle"
        ghost-class="opacity-50"
      >
        <template #item="{ element: row, index: rowIndex }">
          <tr 
            :key="row.id"
            :class="rowIndex === lastSelectedRowIndex ? 'bg-base-200/80' : 'bg-base-100'"
            class="transition-colors"
          >
            <!-- Row Number & Drag Handle -->
            <td 
              class="z-10 border border-base-300 p-0 text-center text-xs text-base-content/70 font-mono align-top select-none relative group/rowheader"
              :class="[
                isColumnSticky ? 'sticky left-[-24px] shadow-[1px_0_0_0_var(--color-base-300)] z-30' : '',
                rowIndex === lastSelectedRowIndex ? 'bg-base-200' : 'bg-base-100'
              ]"
            >
              <div class="w-full p-3 flex flex-col items-center justify-start overflow-hidden" :style="{ height: `${getRowHeight(row.id)}px` }">
                <div class="flex items-center justify-center gap-1.5 pt-1">
                  <div class="drag-handle cursor-grab active:cursor-grabbing text-base-content/40 hover:text-base-content transition-colors" title="Drag to reorder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="9" cy="12" r="1"></circle>
                      <circle cx="9" cy="5" r="1"></circle>
                      <circle cx="9" cy="19" r="1"></circle>
                      <circle cx="15" cy="12" r="1"></circle>
                      <circle cx="15" cy="5" r="1"></circle>
                      <circle cx="15" cy="19" r="1"></circle>
                    </svg>
                  </div>
                  <span>{{ activeScene?.order ?? '?' }}.{{ row.order }}</span>
                </div>
                
                <button 
                  class="mt-2 opacity-0 group-hover/rowheader:opacity-100 btn btn-xs btn-ghost btn-square text-base-content/50 hover:text-error hover:bg-error/10 transition-all scale-90"
                  title="Delete Shot"
                  @click.stop="confirmDeleteRow(row.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
              <!-- Row Resizer Handle -->
              <div 
                class="absolute bottom-0 left-0 w-full h-2 cursor-row-resize hover:bg-primary/50 z-30 flex items-center justify-center transition-colors group-hover/rowheader:opacity-100"
                :class="resizingRowId === row.id ? 'bg-primary/50 opacity-100' : 'opacity-0'"
                @mousedown.stop.prevent="startRowResize($event, row.id)"
              >
                <div 
                  class="h-[2px] w-1/2 rounded-full bg-base-content/40"
                  :class="resizingRowId === row.id ? 'bg-primary' : ''"
                ></div>
              </div>
            </td>
            
            <td 
              v-for="col in columns" 
              :key="col.id"
              class="border align-top transition-all p-0"
              :class="[
                activeCellId === row.cells[col.id]?.id && col.cellType !== 'number' && col.cellType !== 'tags' ? 'border-primary ring-1 ring-primary/50 bg-primary/10 z-10 relative' : 'border-base-300 hover:border-primary/40',
                editingCellId !== row.cells[col.id]?.id ? 'cursor-pointer' : ''
              ]"
              @click="handleCellClick(row, col, rowIndex)"
            >
              <div class="w-full overflow-y-auto p-4" :style="{ height: `${getRowHeight(row.id)}px` }">
                <div v-if="row.cells[col.id]">
                
                <!-- Number Cell (Inline Input) -->
                <div v-if="col.cellType === 'number'">
                  <div v-if="editingCellId === row.cells[col.id].id" class="flex flex-col gap-2" @click.stop>
                    <div class="flex items-center gap-2">
                      <input 
                        type="number" 
                        class="input input-sm input-bordered w-full bg-base-200 border-base-300 text-base-content focus:outline-none focus:border-primary" 
                        v-model="inlineEditValue"
                        @keydown.enter="saveInlineEdit(row.cells[col.id], 'number')"
                      />
                      <button @click="saveInlineEdit(row.cells[col.id], 'number')" class="btn btn-xs btn-circle btn-success text-success-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button @click="cancelInlineEdit" class="btn btn-xs btn-circle btn-error text-error-content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    <span class="text-sm text-base-content/50">Only numbers are allowed.</span>
                  </div>
                  <div v-else class="group flex items-center justify-end gap-2 w-full text-right">
                    <div class="flex items-center gap-1.5 font-mono ml-auto">
                      <span v-if="getCellCurrency(col, row.cells[col.id])" class="text-base-content/60 select-none">
                        {{ getCellCurrency(col, row.cells[col.id]) }}
                      </span>
                      <span class="text-base-content">{{ row.cells[col.id].numericValue ?? 'none' }}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </div>
                </div>

                <!-- Tags Cell -->
                <div v-else-if="col.cellType === 'tags'">
                  <div v-if="editingCellId === row.cells[col.id].id" class="flex flex-col gap-2" @click.stop>
                    <input 
                      type="text" 
                      class="input input-sm input-bordered w-full bg-base-200 border-base-300 text-base-content focus:outline-none focus:border-primary" 
                      v-model="inlineEditValue"
                      placeholder="Item 1, Item 2, Item 3..."
                      @keydown.enter="saveInlineEdit(row.cells[col.id], 'tags')"
                    />
                    <span class="text-sm text-base-content/50">Enter tags separated by commas.</span>
                    <div class="flex justify-end gap-1">
                      <button @click="cancelInlineEdit" class="btn btn-xs btn-error text-error-content px-2">
                        Cancel
                      </button>
                      <button @click="saveInlineEdit(row.cells[col.id], 'tags')" class="btn btn-xs btn-success text-success-content px-2">
                        Save
                      </button>
                    </div>
                  </div>
                  <div v-else class="group relative min-h-[24px]">
                    <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-wrap gap-1 pr-6">
                      <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                        <span v-if="block.type === 'entity_tag'" class="badge badge-sm badge-neutral border-base-300 text-base-content/90 font-medium">
                          {{ block.content }}
                        </span>
                        <!-- fallback render for text blocks in a tag column if any -->
                        <span v-else-if="block.type === 'text'" class="text-xs text-base-content/60">{{ block.content }}</span>
                      </template>
                    </div>
                    <div v-else class="text-base-content/40 italic text-sm">none</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute right-0 top-0 text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                  </div>
                </div>

                <!-- Text / Mixed / Default Cell -->
                <div v-else>
                  <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-col gap-1 text-sm text-base-content/90 whitespace-pre-wrap leading-relaxed">
                    <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                       <div v-if="block.type === 'text'" class="prose prose-sm prose-invert max-w-none" v-html="parseMarkdown(block.content)"></div>
                       <div v-else-if="block.type === 'image'" class="relative inline-block max-w-full group/img my-1">
                         <img :src="block.content" class="max-w-full rounded-md border border-base-300 block" alt="Table cell image" />
                         <button 
                           type="button"
                           class="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-md bg-base-200/90 hover:bg-base-300 text-base-content border border-base-300 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
                           title="Ver imagen completa"
                           aria-label="Ver imagen completa"
                           @click.stop="openImagePreview(block.content)"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                             <polyline points="15 3 21 3 21 9"></polyline>
                             <polyline points="9 21 3 21 3 15"></polyline>
                             <line x1="21" y1="3" x2="14" y2="10"></line>
                             <line x1="3" y1="21" x2="10" y2="14"></line>
                           </svg>
                         </button>
                       </div>
                    </template>
                  </div>
                  <div v-else class="text-base-content/40 italic text-sm">none</div>
                </div>
                
                </div>
              </div>
            </td>
          </tr>
        </template>
      </draggable>
    </table>

    <BreakdownImageModal :src="previewImageUrl" @close="closeImagePreview" />
    <BreakdownDeleteShotModal />
  </div>
</template>

<style scoped>
/* Custom scrollbar for cells */
td .overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
td .overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
td .overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--color-base-300);
  border-radius: 4px;
}
td .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--color-base-content);
  opacity: 0.3;
}
</style>

