<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { X as XIcon, Send as SendIcon, Loader2 as Loader2Icon } from 'lucide-vue-next';
import type { BreakdownChatMessage } from '~~/shared/types/chat';
import type { CellBlock } from '~~/shared/types/cell';

const { rows, getColumn } = useSceneTable();
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

const editorRef = ref<HTMLDivElement | null>(null);
const chatContainerRef = ref<HTMLDivElement | null>(null);
const editContent = ref('');

const messages = ref<BreakdownChatMessage[]>([]);
const inputValue = ref('');
const isGenerating = ref(false);
const selectedGenerationType = ref<'text' | 'image' | 'video' | 'audio'>('text');

watch([() => activeCell.value, () => isDrawerOpen.value], async ([newCell, isOpen]) => {
  if (isOpen && newCell) {
    let initialContent = '';
    
    if (newCell.blocks && newCell.blocks.length > 0) {
      initialContent = newCell.blocks.map(b => {
        if (b.type === 'image') {
          return `<div class="mb-4"><img src="${b.content}" class="max-w-full rounded-md border border-neutral-700" /></div>`;
        }
        return b.content;
      }).join('');
    }

    editContent.value = initialContent;
    messages.value = []; // Reset chat history when opening a new cell
    inputValue.value = '';
    
    await nextTick();
    if (editorRef.value) {
      editorRef.value.innerHTML = editContent.value;
    }
    
    // Set default selected generation type based on column
    if (activeColumn.value?.cellType === 'media') {
      selectedGenerationType.value = 'image';
    } else {
      selectedGenerationType.value = 'text';
    }
  }
});

const onEditorInput = (e: Event) => {
  const target = e.target as HTMLDivElement;
  editContent.value = target.innerHTML;
};

const scrollToBottom = async () => {
  await nextTick();
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
  }
};

const handleSendMessage = async () => {
  if (!inputValue.value.trim() || isGenerating.value) return;

  const userText = inputValue.value.trim();
  inputValue.value = '';
  
  const newUserMsg: BreakdownChatMessage = {
    id: Date.now().toString(),
    role: 'user',
    text: userText,
  };

  messages.value.push(newUserMsg);
  isGenerating.value = true;
  scrollToBottom();

  const loadingMsgId = (Date.now() + 1).toString();
  messages.value.push({ id: loadingMsgId, role: 'model', text: '', isGenerating: true });
  scrollToBottom();

  try {
    // Hacemos la llamada al servidor de Nuxt en lugar de a la IA directamente
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        prompt: userText,
        generationType: selectedGenerationType.value
      }
    });

    // Update the loading message
    const msgIndex = messages.value.findIndex(m => m.id === loadingMsgId);
    if (msgIndex !== -1) {
       const msg = messages.value[msgIndex];
       if (msg) {
         if (response.type === 'image') {
           msg.imageUrl = response.imageUrl;
           msg.text = '';
         } else {
           msg.text = response.text;
         }
         msg.isGenerating = false;
       }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    const msgIndex = messages.value.findIndex(m => m.id === loadingMsgId);
    if (msgIndex !== -1) {
       const msg = messages.value[msgIndex];
       if (msg) {
         msg.text = "Sorry, I encountered an error generating the content.";
         msg.isGenerating = false;
       }
    }
  } finally {
    isGenerating.value = false;
    scrollToBottom();
  }
};

const handleAddToContent = (text: string, imageUrl?: string) => {
  if (!editorRef.value) return;
  
  let htmlToInsert = '<div class="mb-4">';
  
  if (text) {
    htmlToInsert += `<p class="mb-2 italic text-neutral-300">${text}</p>`;
  }
  
  if (imageUrl) {
    htmlToInsert += `<img src="${imageUrl}" class="max-w-full rounded-md border border-neutral-700" alt="Generated script element" />`;
  }
  htmlToInsert += '</div>';

  editorRef.value.insertAdjacentHTML('beforeend', htmlToInsert);
  editContent.value = editorRef.value.innerHTML;
  
  // Move cursor to end
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(editorRef.value);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
  editorRef.value.focus();
};

const saveAndClose = async () => {
  // Ensure we get the latest content from the editable div
  if (editorRef.value) {
    let content = editorRef.value.innerHTML;
    // Procesar imágenes incrustadas (base64, blob) subiéndolas a Replit App Storage
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
           if (el.outerHTML.trim()) {
             blocks.push({ id: `b${Date.now()}_${index}`, type: 'text', content: el.outerHTML });
           }
        }
      }
    });

    updateActiveCellContent(blocks);
  } else {
    updateActiveCellContent([]);
  }
  closeDrawer();
};
</script>

<template>
  <!-- We use a wrapper with pointer-events-none so it doesn't block clicks when closed. Drawer toggle handles the rest. -->
  <div class="drawer drawer-end absolute inset-0 z-50 pointer-events-none" :class="{ 'pointer-events-auto': isDrawerOpen }">
    <input id="cell-drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <div class="drawer-side pointer-events-auto">
      <label for="cell-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="w-[450px] min-h-full bg-[#18181b] border-l border-neutral-800 flex flex-col text-white shadow-2xl font-sans">
        
        <!-- Header -->
        <header class="flex justify-between items-center p-4 border-b border-neutral-800">
          <h1 class="text-sm font-semibold text-neutral-300">Edit Cell</h1>
          <button @click="closeDrawer()" class="text-neutral-500 hover:text-neutral-300 transition-colors">
            <XIcon :size="18" />
          </button>
        </header>

        <!-- Body -->
        <div class="flex-1 flex flex-col overflow-hidden" v-if="activeCell">
          
          <!-- Top Section: Cell Content Editor -->
          <section class="p-4 flex-shrink-0">
            <h2 class="text-[10px] font-bold text-neutral-400 mb-2 uppercase tracking-wider">CELL CONTENT</h2>
            <div 
              ref="editorRef"
              class="w-full min-h-[200px] max-h-[35vh] overflow-y-auto border border-neutral-700 rounded-md p-3 bg-transparent text-sm focus:outline-none focus:border-red-600 transition-colors"
              contenteditable="true"
              @input="onEditorInput"
              data-placeholder="Continue writing here..."
            >
            </div>
          </section>

          <div class="px-4">
            <hr class="border-neutral-800" />
          </div>

          <!-- Bottom Section: AI Assistant -->
          <section class="flex-1 flex flex-col p-4 overflow-hidden">
            <h2 class="text-[10px] font-bold text-neutral-400 mb-3 uppercase tracking-wider">AI ASSISTANT</h2>
            
            <!-- Chat History -->
            <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2" ref="chatContainerRef">
              <div v-if="messages.length === 0" class="text-center text-neutral-500 text-sm mt-10 italic">
                Ask me to generate descriptions or images for your script.
              </div>
              
              <div v-for="msg in messages" :key="msg.id" 
                class="flex flex-col max-w-[85%]" 
                :class="msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'">
                
                <div class="p-3 rounded-lg text-sm"
                  :class="msg.role === 'user' ? 'bg-[#333333] text-neutral-200 rounded-tr-none' : 'bg-[#262626] text-neutral-300 rounded-tl-none border border-neutral-700'">
                  
                  <div v-if="msg.isGenerating" class="flex items-center space-x-2 text-neutral-400">
                    <Loader2Icon :size="16" class="animate-spin" />
                    <span>Generating...</span>
                  </div>
                  
                  <template v-else>
                    <p v-if="msg.text" class="italic mb-2">{{ msg.text }}</p>
                    <img v-if="msg.imageUrl" :src="msg.imageUrl" alt="Generated" class="max-w-full rounded-md mt-2 border border-neutral-700" />
                  </template>
                </div>
                
                <button v-if="msg.role === 'model' && !msg.isGenerating && (msg.text || msg.imageUrl)"
                  @click="handleAddToContent(msg.text, msg.imageUrl)"
                  class="text-[#d97706] text-xs font-medium mt-1 hover:underline self-end mr-1">
                  Add to content
                </button>
              </div>
            </div>

            <!-- AI Generation Selector Badges -->
            <div class="flex items-center gap-2 mb-3" v-if="activeColumn">
              <button 
                @click="selectedGenerationType = 'text'"
                class="badge badge-sm cursor-pointer transition-colors"
                :class="selectedGenerationType === 'text' ? 'badge-primary' : 'badge-neutral hover:badge-outline'"
              >
                Text
              </button>
              
              <template v-if="activeColumn.cellType === 'media'">
                <button 
                  @click="selectedGenerationType = 'image'"
                  class="badge badge-sm cursor-pointer transition-colors"
                  :class="selectedGenerationType === 'image' ? 'badge-primary' : 'badge-neutral hover:badge-outline'"
                >
                  Image
                </button>
                
                <div class="tooltip tooltip-top tooltip-neutral before:text-xs" data-tip="Esta función aún no está activa">
                  <button 
                    disabled
                    class="badge badge-sm badge-neutral opacity-50 cursor-not-allowed"
                  >
                    Video
                  </button>
                </div>
                
                <div class="tooltip tooltip-top tooltip-neutral before:text-xs" data-tip="Esta función aún no está activa">
                  <button 
                    disabled
                    class="badge badge-sm badge-neutral opacity-50 cursor-not-allowed"
                  >
                    Audio
                  </button>
                </div>
              </template>
            </div>

            <!-- Chat Input -->
            <div class="relative mt-auto">
              <input
                type="text"
                v-model="inputValue"
                @keydown.enter="handleSendMessage"
                placeholder="Type a command..."
                class="w-full bg-[#2a2a2a] border border-neutral-700 rounded-full py-3 pl-4 pr-12 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 placeholder-neutral-500"
                :disabled="isGenerating"
              />
              <button 
                @click="handleSendMessage"
                :disabled="!inputValue.trim() || isGenerating"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-200 disabled:opacity-50 disabled:hover:text-neutral-400 transition-colors"
              >
                <SendIcon :size="18" />
              </button>
            </div>
          </section>

        </div>
        <div v-else class="p-6 text-center text-neutral-500 text-sm flex-1 flex items-center justify-center">
           No cell selected
        </div>

        <!-- Footer -->
        <footer class="p-4 bg-[#18181b] border-t border-neutral-800">
          <button @click="saveAndClose" :disabled="isUploading" class="w-full flex justify-center items-center gap-2 bg-[#e53e3e] hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-[#e53e3e] text-white font-bold py-3 rounded-md transition-colors text-sm">
            <Loader2Icon v-if="isUploading" :size="16" class="animate-spin" />
            <span>{{ isUploading ? 'Uploading & Saving...' : 'Save Changes' }}</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>



<style scoped>
/* Fix for blurry text on Chrome/Windows caused by daisyUI's transform and will-change */
:deep(.drawer-end .drawer-toggle:checked ~ .drawer-side > *:not(.drawer-overlay)) {
  transform: none !important;
  will-change: auto !important;
}

[contenteditable="true"]:empty:before {
  content: attr(data-placeholder);
  color: #737373; /* text-neutral-500 */
  pointer-events: none;
  display: block; /* For Firefox */
}
</style>