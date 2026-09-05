<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { X as XIcon, Send as SendIcon, Loader2 as Loader2Icon, PlusCircle as PlusCircleIcon } from 'lucide-vue-next';
import type { BreakdownChatMessage } from '~~/shared/types/chat';
import type { CellBlock } from '~~/shared/types/cell';
import { parseMarkdown } from '~~/utils/markdown';

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

const selectedContextColumns = ref<string[]>([]);

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

const initContextColumns = () => {
  const currentOrder = activeColumn.value?.order;
  if (typeof currentOrder === 'number') {
    selectedContextColumns.value = (columns.value || [])
      .filter(c => c.id !== activeCellColId.value && typeof c.order === 'number' && c.order < currentOrder)
      .map(c => c.id);
  } else {
    const currentIndex = (columns.value || []).findIndex(c => c.id === activeCellColId.value);
    if (currentIndex > 0) {
      selectedContextColumns.value = (columns.value || [])
        .slice(0, currentIndex)
        .map(c => c.id);
    } else {
      selectedContextColumns.value = [];
    }
  }
};

const editorRef = ref<HTMLDivElement | null>(null);
const chatContainerRef = ref<HTMLDivElement | null>(null);
const editContent = ref('');

const messages = ref<BreakdownChatMessage[]>([]);
const inputValue = ref('');
const isGenerating = ref(false);
const selectedGenerationType = ref<'text' | 'image' | 'video' | 'audio'>('text');
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

const adjustTextareaHeight = () => {
  const el = chatInputRef.value;
  if (!el) return;
  el.style.height = 'auto';
  const borderOffset = el.offsetHeight - el.clientHeight;
  const targetHeight = Math.min(el.scrollHeight + borderOffset, 300);
  el.style.height = `${targetHeight}px`;
  el.style.overflowY = (el.scrollHeight + borderOffset) > 300 ? 'auto' : 'hidden';
};

const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024) ||
    window.innerWidth < 768
  );
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    if (e.isComposing) return;
    // En móviles o al presionar Shift / Ctrl / Cmd / Alt, no se envía el mensaje sino que hace un salto de línea
    if (isMobileDevice() || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    e.preventDefault();
    handleSendMessage();
  }
};

watch(inputValue, () => {
  nextTick(() => {
    adjustTextareaHeight();
  });
});

const createImageHtml = (src: string) => {
  return `<div class="image-wrapper not-prose mb-4 block" contenteditable="false"><div class="relative inline-block max-w-full group/img"><img src="${src}" class="max-w-full rounded-md border border-neutral-700 block m-0" alt="Cell image" /><button type="button" data-action="delete-image" class="image-delete-btn" title="Eliminar imagen" aria-label="Eliminar imagen"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div></div>`;
};

const wrapRawImages = (container: HTMLElement) => {
  const imgs = container.querySelectorAll('img');
  imgs.forEach((img) => {
    if (!img.closest('.image-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'image-wrapper not-prose mb-4 block';
      wrapper.setAttribute('contenteditable', 'false');
      
      const inner = document.createElement('div');
      inner.className = 'relative inline-block max-w-full group/img';
      
      img.className = 'max-w-full rounded-md border border-neutral-700 block m-0';
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-action', 'delete-image');
      btn.className = 'image-delete-btn';
      btn.title = 'Eliminar imagen';
      btn.setAttribute('aria-label', 'Eliminar imagen');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

      img.parentNode?.insertBefore(wrapper, img);
      inner.appendChild(img);
      inner.appendChild(btn);
      wrapper.appendChild(inner);
    }
  });

  // Ensure any existing delete buttons have updated class and centered SVG
  container.querySelectorAll('[data-action="delete-image"]').forEach((btn) => {
    btn.className = 'image-delete-btn';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  });
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
    messages.value = []; // Reset chat history when opening a new cell
    inputValue.value = '';
    initContextColumns();
    
    await nextTick();
    adjustTextareaHeight();
    
    
    await nextTick();
    if (editorRef.value) {
      editorRef.value.innerHTML = editContent.value;
      wrapRawImages(editorRef.value);
    }
    
    // Set default selected generation type based on column
    if (activeColumn.value?.cellType === 'media') {
      selectedGenerationType.value = 'image';
    } else {
      selectedGenerationType.value = 'text';
    }
  }
});

watch(columns, () => {
  if (isDrawerOpen.value && selectedContextColumns.value.length === 0) {
    initContextColumns();
  }
}, { deep: true });

const onEditorInput = (e: Event) => {
  const target = e.target as HTMLDivElement;
  wrapRawImages(target);
  editContent.value = target.innerHTML;
};

const handleEditorClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null;
  if (!target) return;
  
  const deleteBtn = target.closest('[data-action="delete-image"]');
  if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();
    
    const wrapper = deleteBtn.closest('.image-wrapper') || deleteBtn.closest('.image-container') || deleteBtn.parentElement?.parentElement;
    if (wrapper) {
      wrapper.remove();
      if (editorRef.value) {
        editContent.value = editorRef.value.innerHTML;
        editorRef.value.focus();
      }
    }
  }
};

const handleEditorPaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.type.indexOf('image') !== -1) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          if (base64 && editorRef.value) {
            const imgHtml = createImageHtml(base64);
            document.execCommand('insertHTML', false, imgHtml);
            editContent.value = editorRef.value.innerHTML;
          }
        };
        reader.readAsDataURL(file);
      }
      return;
    }
  }

  setTimeout(() => {
    if (editorRef.value) {
      wrapRawImages(editorRef.value);
      editContent.value = editorRef.value.innerHTML;
    }
  }, 0);
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
  nextTick(() => {
    adjustTextareaHeight();
  });
  
  // Build systemInstruction context
  let contextString = '';
  
  if (activeColumn.value?.options?.defaultPrompt) {
    contextString += `${activeColumn.value.options.defaultPrompt}\n\n`;
  }
  
  contextString += `Context from current row/shot:\n`;
  
  // Add Cell content as current_content
  let currentContent = 'Empty';
  if (editorRef.value) {
    const text = editorRef.value.innerText?.trim();
    const imgs = editorRef.value.querySelectorAll('img');
    const imageCount = imgs.length;
    const imgTag = imageCount > 1 ? `[${imageCount} Images]` : imageCount === 1 ? '[Image]' : '';
    
    if (text && imgTag) {
      currentContent = `${text} ${imgTag}`;
    } else if (text) {
      currentContent = text;
    } else if (imgTag) {
      currentContent = imgTag;
    } else if (activeCell.value?.numericValue != null) {
      currentContent = String(activeCell.value.numericValue);
    }
  } else if (editContent.value?.trim()) {
    currentContent = editContent.value.trim();
  } else if (activeCell.value?.numericValue != null) {
    currentContent = String(activeCell.value.numericValue);
  } else if (activeCell.value?.blocks && activeCell.value.blocks.length > 0) {
    currentContent = activeCell.value.blocks.map(b => b.type === 'image' ? '[Image]' : b.content).join(' ');
  }
  contextString += `- current_content: ${currentContent}\n`;
  
  // Add selected context columns
  if (currentRow.value) {
    for (const colId of selectedContextColumns.value) {
      const col = getColumn(colId);
      const cell = currentRow.value.cells[colId];
      let cellContent = 'Empty';
      if (cell) {
        if (cell.numericValue != null) {
           cellContent = String(cell.numericValue);
        } else if (cell.blocks && cell.blocks.length > 0) {
           cellContent = cell.blocks.map(b => b.type === 'image' ? '[Image]' : b.content).join(' ');
        }
      }
      contextString += `- ${col?.name || colId}: ${cellContent}\n`;
    }
  }

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
        projectId: project.value?.id,
        prompt: userText,
        systemInstruction: contextString,
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

const formatContentHtml = (text: string, imageUrl?: string) => {
  let htmlToInsert = '';
  
  if (text) {
    htmlToInsert += `<div class="mb-4 text-neutral-300">${parseMarkdown(text)}</div>`;
  }
  
  if (imageUrl) {
    htmlToInsert += createImageHtml(imageUrl);
  }
  return htmlToInsert;
};

const handleAddToContent = (text: string, imageUrl?: string) => {
  if (!editorRef.value) return;
  
  const htmlToInsert = formatContentHtml(text, imageUrl);
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

const handleReplaceContent = (text: string, imageUrl?: string) => {
  if (!editorRef.value) return;
  
  const htmlToInsert = formatContentHtml(text, imageUrl);
  editorRef.value.innerHTML = htmlToInsert;
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
      <div class="w-full lg:w-[450px] h-full bg-[#18181b] border-l border-neutral-800 flex flex-col text-white shadow-2xl font-sans">
        
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
              class="w-full h-[250px] overflow-y-auto border border-neutral-700 rounded-md p-3 bg-transparent text-sm focus:outline-none focus:border-red-600 transition-colors prose prose-sm prose-invert max-w-none"
              contenteditable="true"
              @input="onEditorInput"
              @click="handleEditorClick"
              @paste="handleEditorPaste"
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
            <div class="flex-1 overflow-y-auto space-y-4 pr-2" ref="chatContainerRef">
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
                    <div v-if="msg.text" class="mb-2 prose prose-sm prose-invert max-w-none" v-html="parseMarkdown(msg.text)"></div>
                    <img v-if="msg.imageUrl" :src="msg.imageUrl" alt="Generated" class="max-w-full rounded-md mt-2 border border-neutral-700" />
                  </template>

                  <div v-if="msg.role === 'model' && !msg.isGenerating && (msg.text || msg.imageUrl)" class="flex justify-end gap-1.5 mt-2.5">
                    <button
                      @click="handleReplaceContent(msg.text, msg.imageUrl)"
                      class="badge badge-sm py-2.5 px-2 bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 border-neutral-700 cursor-pointer transition-colors"
                    >
                      Replace
                    </button>
                    <button
                      @click="handleAddToContent(msg.text, msg.imageUrl)"
                      class="badge badge-sm py-2.5 px-2 bg-[#d97706]/15 text-[#d97706] hover:bg-[#d97706] hover:text-black border-[#d97706]/30 cursor-pointer transition-colors font-medium"
                    >
                      + Insert
                    </button>
                  </div>
                  
                </div>
                
              </div>
            </div>

          </section>

        </div>
        <div v-else class="p-6 text-center text-neutral-500 text-sm flex-1 flex items-center justify-center">
           No cell selected
        </div>

        <!-- Footer -->
        <footer class="p-4 bg-[#18181b] border-t border-neutral-800 flex flex-col gap-4 flex-shrink-0">
          <div v-if="activeCell" class="flex flex-col gap-3">
            
            <div class="flex items-center justify-between">
              <!-- AI Generation Selector Badges -->
              <div class="flex items-center gap-2" v-if="activeColumn">
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
                  
                  <div class="tooltip tooltip-top tooltip-neutral before:text-xs" data-tip="Not available yet">
                    <button 
                      disabled
                      class="badge badge-sm badge-neutral opacity-50 cursor-not-allowed"
                    >
                      Video
                    </button>
                  </div>
                  
                  <div class="tooltip tooltip-top tooltip-neutral before:text-xs" data-tip="Not available yet">
                    <button 
                      disabled
                      class="badge badge-sm badge-neutral opacity-50 cursor-not-allowed"
                    >
                      Audio
                    </button>
                  </div>
                </template>
              </div>

              <!-- Context Selection Dropdown -->
              <div class="dropdown dropdown-top dropdown-end" v-if="availableColumns.length > 0">
                <div tabindex="0" role="button" class="btn btn-xs btn-outline border-neutral-700 text-neutral-400 hover:text-white flex items-center gap-1">
                  <PlusCircleIcon :size="14" />
                  Context ({{ selectedContextColumns.length }})
                </div>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-[#262626] border border-neutral-700 rounded-box w-72 mb-2 max-h-60 overflow-y-auto">
                  <li class="menu-title px-2 py-1 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Include in Context</li>
                  <li v-for="col in availableColumns" :key="col.id">
                    <label class="label cursor-pointer flex justify-start gap-2 py-1.5 px-2 hover:bg-[#333333] rounded-md">
                      <input type="checkbox" :value="col.id" v-model="selectedContextColumns" class="checkbox checkbox-xs checkbox-primary border-neutral-500 rounded-sm" />
                      <span class="label-text text-neutral-300 text-xs truncate">{{ col.name }}</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Chat Input -->
            <div class="relative flex items-end">
              <textarea
                ref="chatInputRef"
                rows="1"
                v-model="inputValue"
                @keydown="handleKeyDown"
                @input="adjustTextareaHeight"
                placeholder="Type a command..."
                class="w-full bg-[#2a2a2a] border border-neutral-700 rounded-2xl py-2.5 pl-4 pr-12 text-sm text-neutral-200 focus:outline-none focus:border-neutral-500 placeholder-neutral-500 resize-none overflow-y-auto min-h-[42px] max-h-[300px] leading-relaxed block"
                :disabled="isGenerating"
              ></textarea>
              <button 
                @click="handleSendMessage"
                :disabled="!inputValue.trim() || isGenerating"
                class="absolute right-2 bottom-1.5 p-2 text-neutral-400 hover:text-neutral-200 disabled:opacity-50 disabled:hover:text-neutral-400 transition-colors rounded-lg"
              >
                <SendIcon :size="18" />
              </button>
            </div>
          </div>

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

textarea::-webkit-scrollbar {
  width: 6px;
}
textarea::-webkit-scrollbar-track {
  background: transparent;
}
textarea::-webkit-scrollbar-thumb {
  background-color: #404040;
  border-radius: 9999px;
}
textarea::-webkit-scrollbar-thumb:hover {
  background-color: #525252;
}

:deep(.image-wrapper) {
  position: relative;
  user-select: none;
}

:deep(.image-delete-btn) {
  position: absolute !important;
  top: 5px !important;
  right: 5px !important;
  width: 22px !important;
  height: 22px !important;
  min-width: 22px !important;
  min-height: 22px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 9999px !important;
  background-color: #dc2626 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45) !important;
  cursor: pointer !important;
  user-select: none !important;
  line-height: 0 !important;
  transition: transform 0.15s ease, background-color 0.15s ease !important;
  z-index: 10 !important;
}

:deep(.image-delete-btn:hover) {
  background-color: #b91c1c !important;
  transform: scale(1.1) !important;
}

:deep(.image-delete-btn:active) {
  transform: scale(0.92) !important;
}

:deep(.image-delete-btn svg) {
  display: block !important;
  width: 12px !important;
  height: 12px !important;
  stroke: #ffffff !important;
  stroke-width: 2.5 !important;
  margin: 0 !important;
  padding: 0 !important;
  pointer-events: none !important;
}
</style>