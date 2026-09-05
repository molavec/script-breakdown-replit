<script setup lang="ts">
import { computed, ref } from 'vue';
import draggable from 'vuedraggable';
import { parseMarkdown } from '~~/utils/markdown';

const { activeScene } = useProjectBreakdown();
const { columns, rows, updateRowsOrder } = useSceneTable();
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
        <div class="bg-[#18181b] border border-neutral-700 rounded-xl p-5 shadow-lg relative group transition-colors hover:border-neutral-500 w-full max-w-none lg:max-w-md">
          
          <!-- Card Header (Shot Number & Drag) -->
          <div class="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div class="flex items-center gap-2">
              <div class="drag-handle cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-300 transition-colors p-1" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="4" y1="9" x2="20" y2="9"></line>
                  <line x1="4" y1="15" x2="20" y2="15"></line>
                </svg>
              </div>
              <span class="text-sm font-bold text-rose-400 font-mono tracking-wider">
                SHOT {{ activeScene?.order ?? '?' }}.{{ row.order }}
              </span>
            </div>
          </div>

          <!-- Card Fields -->
          <div class="flex flex-col gap-5">
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
                  <span class="text-xs font-mono font-semibold text-neutral-400 uppercase">{{ col.name }}</span>
                </div>
                
                <!-- Edit Button -->
                <button 
                  v-if="col.cellType !== 'number' && col.cellType !== 'tags'"
                  class="btn btn-xs btn-ghost btn-square text-neutral-500 hover:text-white"
                  title="Edit Field"
                  @click="selectCell(rowIndex, col.id, row.cells[col.id]?.id)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
                <button 
                  v-else-if="editingCellId !== row.cells[col.id]?.id"
                  class="btn btn-xs btn-ghost btn-square text-neutral-500 hover:text-white"
                  title="Edit Field"
                  @click="startInlineEdit(row.cells[col.id], col.cellType)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                </button>
              </div>

              <!-- Field Value -->
              <div 
                class="min-h-[24px] py-1 transition-colors rounded-md"
                :class="activeCellId === row.cells[col.id]?.id && col.cellType !== 'number' && col.cellType !== 'tags' ? 'bg-[#2a2a2e]/50 ring-1 ring-error/50 px-2' : ''"
              >
                <div v-if="row.cells[col.id]">
                  <BreakdownExpandableCell :max-height="250">
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
                      <div v-else class="flex items-center gap-1.5 font-mono">
                        <span v-if="getCellCurrency(col, row.cells[col.id])" class="text-neutral-400 select-none">
                          {{ getCellCurrency(col, row.cells[col.id]) }}
                        </span>
                        <span class="text-neutral-200 text-sm">{{ row.cells[col.id].numericValue ?? 'none' }}</span>
                      </div>
                    </div>

                    <!-- Tags Cell -->
                    <div v-else-if="col.cellType === 'tags'">
                      <div v-if="editingCellId === row.cells[col.id].id" class="flex flex-col gap-2">
                        <input 
                          type="text" 
                          class="input input-sm input-bordered w-full bg-[#18181b] border-neutral-500 text-neutral-100 focus:outline-none focus:border-error" 
                          v-model="inlineEditValue"
                          placeholder="Item 1, Item 2, Item 3..."
                          @keydown.enter="saveInlineEdit(row.cells[col.id], 'tags')"
                        />
                        <div class="flex justify-end gap-1">
                          <button @click="saveInlineEdit(row.cells[col.id], 'tags')" class="btn btn-xs btn-success text-white px-2">Save</button>
                          <button @click="cancelInlineEdit" class="btn btn-xs btn-error text-white px-2">Cancel</button>
                        </div>
                      </div>
                      <div v-else>
                        <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-wrap gap-1.5">
                          <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                            <span v-if="block.type === 'entity_tag'" class="badge badge-sm bg-neutral-200 text-neutral-800 border-neutral-400 font-medium px-2 py-3 rounded-md">
                              {{ block.content }}
                            </span>
                            <span v-else-if="block.type === 'text'" class="text-xs text-neutral-400">{{ block.content }}</span>
                          </template>
                        </div>
                        <div v-else class="text-neutral-500 italic text-sm">none</div>
                      </div>
                    </div>

                    <!-- Text / Mixed / Default Cell -->
                    <div v-else>
                      <div v-if="row.cells[col.id].blocks && row.cells[col.id].blocks.length > 0" class="flex flex-col gap-2 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                        <template v-for="block in row.cells[col.id].blocks" :key="block.id">
                          <div v-if="block.type === 'text'" class="prose prose-sm prose-invert max-w-none" v-html="parseMarkdown(block.content)"></div>
                          <div v-else-if="block.type === 'image'" class="relative inline-block max-w-full group/img my-1">
                            <img :src="block.content" class="max-w-full rounded-md border border-neutral-700 block" alt="Card image" />
                            <button 
                              type="button"
                              class="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-md bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
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
                      <div v-else class="text-neutral-500 italic text-sm">none</div>
                    </div>
                  </BreakdownExpandableCell>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <BreakdownImageModal :src="previewImageUrl" @close="closeImagePreview" />
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
  background: #3f3f46; /* neutral-700 */
  border-radius: 4px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #52525b; /* neutral-600 */
}
</style>
