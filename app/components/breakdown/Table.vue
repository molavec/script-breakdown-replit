<script setup lang="ts">
import draggable from 'vuedraggable';
import { parseMarkdown } from '~~/utils/markdown';

const { activeScene, project } = useProjectBreakdown();
const { columns, rows, updateRowsOrder, addRow, addColumn, updateColumnsOrder } = useSceneTable();
const { activeCellId, lastSelectedRowIndex, selectCell } = useBreakdownCell();

const editingCellId = ref<string | null>(null);
const inlineEditValue = ref<string | number>('');
const isSceneInfoExpanded = ref(false);

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

// Column Resizing Logic
const colWidths = ref<Record<string, number>>({});
const resizingColId = ref<string | null>(null);
const startX = ref(0);
const startWidth = ref(0);

const getColWidth = (id: string) => colWidths.value[id] || 320;

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

const getRowHeight = (id: string) => rowHeights.value[id] || 200; // default 200px

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
  resizingRowId.value = null;
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onRowMouseMove);
  document.removeEventListener('mouseup', onRowMouseUp);
};

const sceneShotsCount = computed(() => rows.value.length);

const budgetColumn = computed(() => columns.value.find(c => c.name === 'Budget' || c.name === 'Presupuesto'));

const sceneBudget = computed(() => {
  if (!budgetColumn.value) return 0;
  return rows.value.reduce((sum, row) => {
    const cell = row.cells[budgetColumn.value!.id];
    return sum + (Number(cell?.numericValue) || 0);
  }, 0);
});

const budgetCurrencySymbol = computed(() => {
  if (!budgetColumn.value) return '';
  return getCurrencySymbol(budgetColumn.value.options?.currencyCode);
});

onUnmounted(() => {
  document.body.style.cursor = '';
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('mousemove', onRowMouseMove);
  document.removeEventListener('mouseup', onRowMouseUp);
});
</script>


<template>
  <div class="flex flex-col h-full bg-[#121214] text-white">
    <!-- Scene Header -->
    <div class="px-6 py-5 flex flex-wrap gap-2 items-start justify-between shrink-0">
      <div v-if="activeScene">
        <div class="flex items-center gap-2 mb-1">
          <h1 class="text-2xl font-bold">Scene {{ activeScene?.order }}</h1>
          <NuxtLink 
            :to="`/projects/${project?.id}/scenes/${activeScene.id}`"
            class="btn btn-xs btn-ghost btn-square text-neutral-400 hover:text-white hover:bg-neutral-700/80 transition-colors"
            title="Configure Scene"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1-1-1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </NuxtLink>
        </div>
        <div :class="['transition-all duration-300', isSceneInfoExpanded ? 'block' : 'hidden lg:block']">
          <p class="text-xs font-bold text-neutral-300 font-mono tracking-wider">
            Shots: {{ sceneShotsCount }} - Budget: {{ budgetCurrencySymbol }}{{ sceneBudget }}
          </p>
          <p v-if="activeScene.synopsis" class="text-xs text-neutral-400 font-mono tracking-wider mt-1">{{ activeScene.synopsis }}</p>
        </div>
      </div>
      <div v-else>
        <h1 class="text-2xl font-bold text-neutral-500">No scene selected</h1>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          v-if="activeScene"
          class="btn btn-sm btn-ghost btn-square lg:hidden text-neutral-400 hover:text-white" 
          @click="isSceneInfoExpanded = !isSceneInfoExpanded"
        >
          <svg v-if="!isSceneInfoExpanded" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
        </button>
        <button @click="addRow" class="btn btn-sm btn-outline border-neutral-700 text-neutral-300 hover:text-white">
          Add Shot
        </button>
        <button class="btn btn-sm btn-outline border-neutral-700 text-neutral-300 hover:text-white" @click="addColumn()">
          Add Column
        </button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="flex-1 overflow-auto px-6 pb-6 relative">
      <table class="w-full text-left border-collapse table-fixed min-w-max">
        <!-- Table Header -->
        <thead class="sticky top-0 z-20 bg-[#242427] text-neutral-300 text-xs font-bold font-mono">
          <draggable
            v-model="columns"
            tag="tr"
            item-key="id"
            handle=".col-drag-handle"
            @end="updateColumnsOrder(project?.id || '1', columns)"
          >
            <template #header>
              <th class="sticky top-0 z-20 bg-[#242427] w-16 min-w-[64px] border border-neutral-700 p-3 text-center">#</th>
            </template>
            <template #item="{ element: col }">
              <th 
                class="sticky top-0 z-20 bg-[#242427] border border-neutral-700 p-3 group/th select-none relative"
                :style="{ width: `${getColWidth(col.id)}px`, minWidth: `${getColWidth(col.id)}px` }"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="col-drag-handle cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-300 transition-colors" title="Drag to reorder column">
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
                  class="btn btn-xs btn-ghost btn-square text-neutral-400 hover:text-white hover:bg-neutral-700/80 transition-colors shrink-0"
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
                  class="w-[2px] h-1/2 rounded-full bg-neutral-500"
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
              :class="rowIndex === lastSelectedRowIndex ? 'bg-[#212124]' : 'bg-[#18181b]'"
              class="transition-colors"
            >
              <!-- Row Number & Drag Handle -->
              <td class="border border-neutral-700 p-0 text-center text-xs text-neutral-400 font-mono align-top select-none relative group/rowheader">
                <div class="w-full p-3 flex flex-col items-center justify-start overflow-hidden" :style="{ height: `${getRowHeight(row.id)}px` }">
                  <div class="flex items-center justify-center gap-1.5 pt-1">
                    <div class="drag-handle cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-300 transition-colors" title="Drag to reorder">
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
                </div>
                <!-- Row Resizer Handle -->
                <div 
                  class="absolute bottom-0 left-0 w-full h-2 cursor-row-resize hover:bg-primary/50 z-30 flex items-center justify-center transition-colors group-hover/rowheader:opacity-100"
                  :class="resizingRowId === row.id ? 'bg-primary/50 opacity-100' : 'opacity-0'"
                  @mousedown.stop.prevent="startRowResize($event, row.id)"
                >
                  <div 
                    class="h-[2px] w-1/2 rounded-full bg-neutral-500"
                    :class="resizingRowId === row.id ? 'bg-primary' : ''"
                  ></div>
                </div>
              </td>
              
              <!-- Cells -->
              <td 
                v-for="col in columns" 
                :key="col.id"
                class="border align-top transition-all p-0"
                :class="[
                  activeCellId === row.cells[col.id]?.id && col.cellType !== 'number' && col.cellType !== 'tags' ? 'border-error/70 ring-1 ring-error/50 bg-[#2a2a2e]/50 z-10 relative' : 'border-neutral-700 hover:border-neutral-500',
                  col.cellType !== 'number' && col.cellType !== 'tags' ? 'cursor-pointer' : ''
                ]"
                @click="col.cellType !== 'number' && col.cellType !== 'tags' ? selectCell(rowIndex, col.id, row.cells[col.id]?.id) : null"
              >
                <div class="w-full overflow-y-auto p-4" :style="{ height: `${getRowHeight(row.id)}px` }">
                  <div v-if="row.cells[col.id]">
                  
                  <!-- Number Cell (Inline Input) -->
                  <div v-if="col.cellType === 'number'">
                    <div v-if="editingCellId === row.cells[col.id].id" class="flex items-center gap-2">
                      <input 
                        type="number" 
                        class="input input-sm input-bordered w-full bg-[#18181b] border-neutral-500 text-neutral-100 focus:outline-none focus:border-error" 
                        v-model="inlineEditValue"
                        @keydown.enter="saveInlineEdit(row.cells[col.id], 'number')"
                      />
                      <button @click="saveInlineEdit(row.cells[col.id], 'number')" class="btn btn-xs btn-circle btn-success text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button @click="cancelInlineEdit" class="btn btn-xs btn-circle btn-error text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                      </button>
                    </div>
                    <div v-else class="cursor-pointer group flex items-center justify-end gap-2 w-full text-right" @click="startInlineEdit(row.cells[col.id], 'number')">
                      <div class="flex items-center gap-1.5 font-mono ml-auto">
                        <span v-if="getCellCurrency(col, row.cells[col.id])" class="text-neutral-400 select-none">
                          {{ getCellCurrency(col, row.cells[col.id]) }}
                        </span>
                        <span class="text-neutral-300">{{ row.cells[col.id].numericValue ?? 'none' }}</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </div>
                  </div>



                  <!-- Tags Cell -->
                  <div v-else-if="col.cellType === 'tags'">
                    <div v-if="editingCellId === row.cells[col.id].id" class="flex flex-col gap-2">
                      <input 
                        type="text" 
                        class="input input-sm input-bordered w-full bg-[#18181b] border-neutral-500 text-neutral-100 focus:outline-none focus:border-error" 
                        v-model="inlineEditValue"
                        placeholder="Tag 1, Tag 2, Tag 3..."
                        @keydown.enter="saveInlineEdit(row.cells[col.id], 'tags')"
                      />
                      <div class="flex justify-end gap-1">
                        <button @click="saveInlineEdit(row.cells[col.id], 'tags')" class="btn btn-xs btn-success text-white px-2">
                          Save
                        </button>
                        <button @click="cancelInlineEdit" class="btn btn-xs btn-error text-white px-2">
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div v-else class="cursor-pointer group relative min-h-[24px]" @click="startInlineEdit(row.cells[col.id], 'tags')">
                      <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-wrap gap-1 pr-6">
                        <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                          <span v-if="block.type === 'entity_tag'" class="badge badge-sm bg-neutral-200 text-neutral-800 border-neutral-400 font-medium">
                            {{ block.content }}
                          </span>
                          <!-- fallback render for text blocks in a tag column if any -->
                          <span v-else-if="block.type === 'text'" class="text-xs text-neutral-400">{{ block.content }}</span>
                        </template>
                      </div>
                      <div v-else class="text-neutral-600 italic text-sm">none</div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="absolute right-0 top-0 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </div>
                  </div>

                  <!-- Text / Mixed / Default Cell -->
                  <div v-else>
                    <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-col gap-1 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                         <div v-if="block.type === 'text'" class="prose prose-sm prose-invert max-w-none" v-html="parseMarkdown(block.content)"></div>
                         <img v-else-if="block.type === 'image'" :src="block.content" class="max-w-full rounded-md border border-neutral-700" />
                      </template>
                    </div>
                    <div v-else class="text-neutral-600 italic text-sm">none</div>
                  </div>
                  
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </draggable>
      </table>
    </div>
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
  background: #3f3f46; /* neutral-700 */
  border-radius: 4px;
}
td .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #52525b; /* neutral-600 */
}
</style>

