<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { Loader2 as Loader2Icon } from 'lucide-vue-next';
import type { CellBlock } from '~~/shared/types/cell';
import { parseMarkdown } from '~~/utils/markdown';
import CellDrawerEditor from './drawer/CellDrawerEditor.vue';
import CellDrawerAiChat from './drawer/CellDrawerAiChat.vue';

const { rows, getColumn, columns } = useSceneTable();
const { project } = useProjectBreakdown();
const { 
  activeCellId, 
  activeCellColId, 
  lastSelectedRowIndex, 
  isDrawerOpen, 
  closeDrawer, 
  updateActiveCellContent 
} = useBreakdownCell();

const { isUploading, processHtmlAndUploadImages } = useFileStorage();

const activeCell = computed(() => {
  if (lastSelectedRowIndex.value === null || !activeCellColId.value) return null;
  const row = rows.value[lastSelectedRowIndex.value];
  return row ? row.cells[activeCellColId.value] : null;
});

const activeColumn = computed(() => {
  return activeCellColId.value ? getColumn(activeCellColId.value) : null;
});

const currentRow = computed(() => {
  if (lastSelectedRowIndex.value === null) return null;
  return rows.value[lastSelectedRowIndex.value];
});

const availableColumns = computed(() => {
  if (!activeCellColId.value || !columns.value) return [];
  return [...columns.value]
    .filter(c => c.id !== activeCellColId.value)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

const editContent = ref('');
const previewImageUrl = ref<string | null>(null);

const editorComponentRef = ref<InstanceType<typeof CellDrawerEditor> | null>(null);
const aiChatComponentRef = ref<InstanceType<typeof CellDrawerAiChat> | null>(null);

const openImagePreview = (url: string) => {
  previewImageUrl.value = url;
};

const closeImagePreview = () => {
  previewImageUrl.value = null;
};

const createImageHtml = (src: string) => {
  return `<div class="image-wrapper not-prose mb-4 block" contenteditable="false"><div class="relative inline-block max-w-full group/img"><img src="${src}" class="max-w-full rounded-md border border-base-300 block m-0" alt="Cell image" /><button type="button" data-action="delete-image" class="image-delete-btn" title="Eliminar imagen" aria-label="Eliminar imagen"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><button type="button" data-action="view-image" class="image-view-btn" title="Ver imagen completa" aria-label="Ver imagen completa"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg></button></div></div>`;
};

watch([() => activeCell.value, () => isDrawerOpen.value], async ([newCell, isOpen]) => {
  if (isOpen && newCell) {
    let initialContent = '';
    
    if (newCell.blocks && newCell.blocks.length > 0) {
      initialContent = newCell.blocks.map(b => {
        if (b.type === 'image') {
          return createImageHtml(b.content);
        }
        return parseMarkdown(b.content);
      }).join('');
    }

    editContent.value = initialContent;
    
    let initialContextCols: string[] = [];
    const currentOrder = activeColumn.value?.order;
    if (typeof currentOrder === 'number') {
      initialContextCols = (columns.value || [])
        .filter(c => c.id !== activeCellColId.value && typeof c.order === 'number' && c.order < currentOrder)
        .map(c => c.id);
    } else {
      const currentIndex = (columns.value || []).findIndex(c => c.id === activeCellColId.value);
      if (currentIndex > 0) {
        initialContextCols = (columns.value || [])
          .slice(0, currentIndex)
          .map(c => c.id);
      }
    }

    await nextTick();
    editorComponentRef.value?.resetEditor();
    aiChatComponentRef.value?.resetChat(initialContextCols);
    
  }
});

const formatContentHtml = (text: string, imageUrl?: string) => {
  let htmlToInsert = '';
  
  if (text) {
    htmlToInsert += `<div class="mb-4 text-base-content/90">${parseMarkdown(text)}</div>`;
  }
  
  if (imageUrl) {
    htmlToInsert += createImageHtml(imageUrl);
    htmlToInsert += '<p><br></p>';
  }
  return htmlToInsert;
};

const handleAddToContent = (text: string, imageUrl?: string) => {
  const htmlToInsert = formatContentHtml(text, imageUrl);
  if (editorComponentRef.value?.editorRef) {
    const editorEl = editorComponentRef.value.editorRef;
    editorEl.insertAdjacentHTML('beforeend', htmlToInsert);
    editContent.value = editorEl.innerHTML;
    editorComponentRef.value.resetEditor();
  }
};

const handleReplaceContent = (text: string, imageUrl?: string) => {
  const htmlToInsert = formatContentHtml(text, imageUrl);
  if (editorComponentRef.value?.editorRef) {
    const editorEl = editorComponentRef.value.editorRef;
    editorEl.innerHTML = htmlToInsert;
    editContent.value = editorEl.innerHTML;
    editorComponentRef.value.resetEditor();
  }
};

const saveAndClose = async () => {
  if (activeCell.value && editorComponentRef.value?.editorRef) {
    let content = editorComponentRef.value.editorRef.innerHTML;
    
    // Subir imágenes incrustadas (base64, blob) a Replit App Storage
    content = await processHtmlAndUploadImages(content);
    editContent.value = content;

    const blocks: CellBlock[] = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    tempDiv.childNodes.forEach((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) {
           blocks.push({ id: `b${Date.now()}_${index}`, type: 'text', content: node.textContent.trim() });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const img = (el.tagName.toLowerCase() === 'img' ? el : el.querySelector('img')) as HTMLImageElement | null;
        if (img) {
          blocks.push({ id: `b${Date.now()}_${index}`, type: 'image', content: img.getAttribute('src') || img.src });
        } else {
           if (el.textContent?.trim()) {
             blocks.push({ id: `b${Date.now()}_${index}`, type: 'text', content: el.outerHTML });
           }
        }
      }
    });

    let numericVal: number | undefined;
    if (activeColumn.value?.cellType === 'number') {
      const parsed = parseFloat(tempDiv.textContent?.trim() || '');
      if (!isNaN(parsed)) {
        numericVal = parsed;
      }
    }

    updateActiveCellContent(blocks, numericVal);
  } else {
    updateActiveCellContent([]);
  }
  closeDrawer();
};

const handleCancel = () => {
  closeDrawer();
};
</script>

<template>
  <div class="drawer drawer-end absolute inset-0 z-50 pointer-events-none" :class="{ 'pointer-events-auto': isDrawerOpen }">
    <input id="cell-drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <div class="drawer-side pointer-events-auto">
      <label for="cell-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="w-full lg:w-[450px] h-full bg-base-200 border-l border-base-300 flex flex-col text-base-content shadow-2xl font-sans">
        
        <!-- Header -->
        <header class="flex justify-between items-center p-4 border-b border-base-300">
          <h1 class="text-base lg:text-sm font-semibold text-base-content">Edit Cell</h1>
        </header>

        <!-- Body -->
        <div class="flex-1 flex flex-col overflow-hidden" v-if="activeCell">
          
          <CellDrawerEditor 
            ref="editorComponentRef"
            v-model="editContent"
            :column="activeColumn"
            @open-image-preview="openImagePreview"
          />

          <div class="px-4">
            <hr class="border-base-300" />
          </div>

          <CellDrawerAiChat 
            ref="aiChatComponentRef"
            :project="project"
            :activeColumn="activeColumn"
            :availableColumns="availableColumns"
            :currentRow="currentRow"
            :currentContent="editContent"
            @insert-content="handleAddToContent"
            @replace-content="handleReplaceContent"
            @open-image-preview="openImagePreview"
          />

        </div>
        <div v-else class="p-6 text-center text-base-content/50 text-base lg:text-sm flex-1 flex items-center justify-center">
           No cell selected
        </div>

        <!-- Footer -->
        <footer class="p-4 bg-base-200 border-t border-base-300 flex flex-col gap-4 flex-shrink-0">
          <div class="flex items-center gap-3 w-full">
            <button 
              type="button" 
              @click="handleCancel" 
              :disabled="isUploading" 
              class="btn btn-outline border-base-300 text-base-content hover:bg-base-300 font-medium flex-1"
            >
              Cancel
            </button>
            <button 
              type="button" 
              @click="saveAndClose" 
              :disabled="isUploading" 
              class="btn btn-primary font-bold flex-[2] shadow-md shadow-primary/20"
            >
              <Loader2Icon v-if="isUploading" :size="16" class="animate-spin" />
              <span>{{ isUploading ? 'Uploading & Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
    
    <BreakdownImageModal :src="previewImageUrl" @close="closeImagePreview" />
  </div>
</template>

<style scoped>
/* Fix for blurry text on Chrome/Windows caused by daisyUI's transform and will-change */
:deep(.drawer-end .drawer-toggle:checked ~ .drawer-side > *:not(.drawer-overlay)) {
  transform: none !important;
  will-change: auto !important;
}
</style>