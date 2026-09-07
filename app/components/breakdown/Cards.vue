<script setup lang="ts">
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { parseMarkdown } from '~~/utils/markdown';

const { activeScene } = useProjectBreakdown();
const { columns, rows, updateRowsOrder, confirmDeleteRow } = useSceneTable();
const { activeCellId, selectCell } = useBreakdownCell();
const { editingCellId, inlineEditValue, startInlineEdit, cancelInlineEdit, saveInlineEdit } = useCellInlineEdit();

const previewImageUrl = ref<string | null>(null);

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

const collapsedCards = ref<string[]>([]);

const toggleCollapse = (id: string) => {
  const index = collapsedCards.value.indexOf(id);
  if (index > -1) {
    collapsedCards.value.splice(index, 1);
  } else {
    collapsedCards.value.push(id);
  }
};

const getScriptSnippet = (row: any) => {
  const scriptCol = columns.value.find((c: any) => c.name.toLowerCase() === 'script');
  if (!scriptCol) return '';
  const cell = row.cells[scriptCol.id];
  if (!cell || !cell.blocks || cell.blocks.length === 0) return '';
  const textBlock = cell.blocks.find((b: any) => b.type === 'text');
  if (!textBlock) return '';
  return textBlock.content.replace(/<[^>]+>/g, '').trim();
};

</script>

<template>
  <div class="w-full h-full p-4 overflow-y-auto">
    <draggable
      v-model="tableRows"
      tag="div"
      class="flex flex-wrap gap-4"
      item-key="id"
      handle=".drag-handle"
      ghost-class="opacity-50"
    >
      <template #item="{ element: row, index: rowIndex }">
        <div class="card bg-base-200 border border-base-300 rounded-box p-5 shadow-lg relative group transition-colors hover:border-primary/40 w-full max-w-none lg:max-w-md">
          
          <!-- Card Header (Shot Number & Drag) -->
          <div class="flex items-center justify-between transition-all" :class="collapsedCards.includes(row.id) ? 'mb-2' : 'mb-4 pb-3 border-b border-base-300'">
            <div class="flex items-center gap-2">
              <div class="drag-handle cursor-grab active:cursor-grabbing text-base-content/40 hover:text-base-content transition-colors p-1" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="9" x2="20" y2="9"></line>
                  <line x1="4" y1="15" x2="20" y2="15"></line>
                </svg>
              </div>
              <span class="text-sm font-bold text-primary font-mono tracking-wider">
                SHOT {{ activeScene?.order ?? '?' }}.{{ row.order }}
              </span>
            </div>
            
            <button 
              class="btn btn-xs btn-ghost btn-square text-base-content/40 hover:text-base-content transition-colors"
              :title="collapsedCards.includes(row.id) ? 'Expand Shot' : 'Collapse Shot'"
              @click="toggleCollapse(row.id)"
            >
              <svg v-if="collapsedCards.includes(row.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
          </div>

          <!-- Collapsed State Snippet -->
          <div v-if="collapsedCards.includes(row.id)" class="text-sm text-base-content/60 italic line-clamp-3 px-1 mb-1">
             {{ getScriptSnippet(row) || 'No script available...' }}
          </div>

          <!-- Card Fields -->
          <div v-show="!collapsedCards.includes(row.id)" class="flex flex-col gap-5">
            <div 
              v-for="col in columns" 
              :key="col.id" 
              class="flex flex-col gap-1.5"
            >
              <!-- Field Header -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span 
                    v-if="col.color" 
                    class="w-2 h-2 rounded-full shrink-0 shadow-sm" 
                    :style="{ backgroundColor: col.color }"
                  ></span>
                  <span class="text-xs font-mono font-semibold text-base-content/60 uppercase">{{ col.name }}</span>
                </div>
                
                <!-- Edit Button -->
                <button 
                  v-if="col.cellType !== 'number' && col.cellType !== 'tags'"
                  class="btn btn-xs btn-ghost btn-square text-base-content/40 hover:text-base-content"
                  title="Edit Field"
                  @click="selectCell(rowIndex, col.id, row.cells[col.id]?.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button 
                  v-else-if="editingCellId !== row.cells[col.id]?.id"
                  class="btn btn-xs btn-ghost btn-square text-base-content/40 hover:text-base-content"
                  title="Edit Field"
                  @click="startInlineEdit(row.cells[col.id], col.cellType)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
              </div>

              <!-- Field Value -->
              <div 
                class="min-h-[24px] py-1 transition-colors rounded-box"
                :class="activeCellId === row.cells[col.id]?.id && col.cellType !== 'number' && col.cellType !== 'tags' ? 'bg-primary/10 ring-1 ring-primary/40 px-2' : ''"
              >
                <div v-if="row.cells[col.id]">
                  <BreakdownExpandableCell :max-height="250">
                    <!-- Number Cell (Inline Input) -->
                    <div v-if="col.cellType === 'number'">
                      <div v-if="editingCellId === row.cells[col.id].id" class="flex flex-col gap-1.5">
                        <p v-if="col.description" class="text-xs text-base-content/60 mb-0.5 leading-relaxed">
                          {{ col.description }}
                        </p>
                        <div class="flex items-center gap-2">
                          <input 
                            type="number" 
                            class="input input-sm input-bordered w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary" 
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
                      </div>
                      <div v-else class="flex items-center gap-1.5 font-mono">
                        <span v-if="getCellCurrency(col, row.cells[col.id])" class="text-base-content/60 select-none">
                          {{ getCellCurrency(col, row.cells[col.id]) }}
                        </span>
                        <span class="text-base-content text-sm">{{ row.cells[col.id].numericValue ?? 'none' }}</span>
                      </div>
                    </div>

                    <!-- Tags Cell -->
                    <div v-else-if="col.cellType === 'tags'">
                      <div v-if="editingCellId === row.cells[col.id].id" class="flex flex-col gap-2">
                        <p v-if="col.description" class="text-xs text-base-content/60 mb-0.5 leading-relaxed">
                          {{ col.description }}
                        </p>
                        <input 
                          type="text" 
                          class="input input-sm input-bordered w-full bg-base-100 border-base-300 text-base-content focus:outline-none focus:border-primary" 
                          v-model="inlineEditValue"
                          placeholder="Item 1, Item 2, Item 3..."
                          @keydown.enter="saveInlineEdit(row.cells[col.id], 'tags')"
                        />
                        <div class="flex justify-end gap-1">
                          <button @click="cancelInlineEdit" class="btn btn-xs btn-error text-error-content px-2">Cancel</button>
                          <button @click="saveInlineEdit(row.cells[col.id], 'tags')" class="btn btn-xs btn-success text-success-content px-2">Save</button>
                        </div>
                      </div>
                      <div v-else>
                        <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-wrap gap-1.5">
                          <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                            <span v-if="block.type === 'entity_tag'" class="badge badge-sm badge-neutral border-base-300 text-base-content/90 font-medium px-2 py-3 rounded-md">
                              {{ block.content }}
                            </span>
                            <span v-else-if="block.type === 'text'" class="text-xs text-base-content/60">{{ block.content }}</span>
                          </template>
                        </div>
                        <div v-else class="text-base-content/40 italic text-sm">none</div>
                      </div>
                    </div>

                    <!-- Text / Mixed / Default Cell -->
                    <div v-else>
                      <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-col gap-2 text-sm text-base-content/90 whitespace-pre-wrap leading-relaxed">
                        <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                          <div v-if="block.type === 'text'" class="prose prose-sm prose-invert max-w-none text-base-content/90" v-html="parseMarkdown(block.content)"></div>
                          <div v-else-if="block.type === 'image'" class="relative inline-block max-w-full group/img my-1">
                            <img :src="block.content" class="max-w-full rounded-box border border-base-300 block" alt="Card image" />
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
                  </BreakdownExpandableCell>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer (Delete Shot) -->
          <div v-show="!collapsedCards.includes(row.id)" class="mt-4 pt-3 border-t border-base-300 flex justify-start">
            <button 
              class="btn btn-xs btn-ghost text-error/70 hover:text-error hover:bg-error/10 transition-colors gap-2"
              title="Delete Shot"
              @click="confirmDeleteRow(row.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete Shot
            </button>
          </div>
        </div>
      </template>
    </draggable>

    <BreakdownImageModal :src="previewImageUrl" @close="closeImagePreview" />
    <BreakdownDeleteShotModal />
  </div>
</template>

<style scoped>
/* Custom scrollbar for cells */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: var(--color-base-300);
  border-radius: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: var(--color-base-content);
  opacity: 0.3;
}
</style>
