<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue';
import { 
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon
} from 'lucide-vue-next';

const props = defineProps<{
  modelValue: string;
  column: any;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'open-image-preview', url: string): void;
}>();

const editorRef = ref<HTMLDivElement | null>(null);
const isEditorFocused = ref(false);
const isEditorEmpty = ref(true);

const wordCount = computed(() => {
  if (!props.modelValue) return 0;
  const text = props.modelValue.replace(/<[^>]*>/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
});

const imageCount = computed(() => {
  if (!props.modelValue) return 0;
  const matches = props.modelValue.match(/<img\b[^>]*>/gi);
  return matches ? matches.length : 0;
});

const formatDoc = (command: string, value: string | undefined = undefined) => {
  if (!editorRef.value) return;
  if (document.activeElement !== editorRef.value) {
    editorRef.value.focus();
  }
  document.execCommand(command, false, value);
  emit('update:modelValue', editorRef.value.innerHTML);
  checkIsEmpty();
};

const editorPlaceholder = computed(() => {
  if (props.column?.cellType === 'tags') {
    return props.column?.options?.placeholder?.trim() || 'Item 1, Item 2, Item 3...';
  }
  if (props.column?.cellType === 'number') {
    return props.column?.options?.placeholder?.trim() || '0.00';
  }
  const desc = props.column?.description?.trim();
  if (desc) {
    return desc;
  }
  const colPlaceholder = props.column?.options?.placeholder?.trim();
  if (colPlaceholder) {
    return colPlaceholder;
  }
  const defaultPrompt = props.column?.options?.defaultPrompt?.trim();
  if (defaultPrompt) {
    return defaultPrompt;
  }
  if (props.column?.name) {
    return `Enter details for ${props.column.name}...`;
  }
  return 'Enter content here...';
});

const showPlaceholder = computed(() => {
  return isEditorEmpty.value && !isEditorFocused.value;
});

const checkIsEmpty = () => {
  if (!editorRef.value) {
    isEditorEmpty.value = true;
    return true;
  }
  if (editorRef.value.querySelector('img')) {
    isEditorEmpty.value = false;
    return false;
  }
  const text = (editorRef.value.innerText || editorRef.value.textContent || '')
    .replace(/[\s\u00A0\u200B-\u200D\uFEFF]/g, '');
  const empty = text.length === 0;
  isEditorEmpty.value = empty;
  return empty;
};

const ensureTrailingParagraph = (container: HTMLElement) => {
  if (!container) return;
  const lastChild = container.lastElementChild;
  if (!lastChild) {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    container.appendChild(p);
    return;
  }
  if (
    lastChild.classList.contains('image-wrapper') || 
    lastChild.getAttribute('contenteditable') === 'false' || 
    lastChild.tagName.toLowerCase() === 'img'
  ) {
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    container.appendChild(p);
  }
};

const normalizeEditorBlocks = (container: HTMLElement) => {
  if (!container) return;
  let current = container.firstElementChild;
  while (current) {
    if (current.classList && current.classList.contains('image-wrapper')) {
      const prev = current.previousElementSibling;
      if (!prev || prev.classList.contains('image-wrapper')) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        container.insertBefore(p, current);
      }
    }
    current = current.nextElementSibling;
  }
  ensureTrailingParagraph(container);
};

const setCursorInElement = (el: Node, atStart: boolean) => {
  const range = document.createRange();
  const sel = window.getSelection();
  
  if (el.nodeName === 'P' && el.childNodes.length === 1 && el.firstChild?.nodeName === 'BR') {
    range.setStart(el, 0);
    range.collapse(true);
  } else {
    range.selectNodeContents(el);
    range.collapse(atStart);
  }
  
  sel?.removeAllRanges();
  sel?.addRange(range);
};

const placeCaretAtEnd = (el: HTMLElement) => {
  normalizeEditorBlocks(el);
  el.focus();
  
  let targetNode: Node = el;
  const lastChild = el.lastElementChild;
  if (lastChild) {
    targetNode = lastChild;
  }
  
  setCursorInElement(targetNode, false);
};

const focusEditor = (e?: MouseEvent) => {
  if (!editorRef.value) return;
  isEditorFocused.value = true;
  if (e && e.target !== editorRef.value) {
    placeCaretAtEnd(editorRef.value);
  } else if (!e) {
    placeCaretAtEnd(editorRef.value);
  }
  if (document.activeElement !== editorRef.value) {
    editorRef.value.focus();
  }
};

const onEditorFocus = () => {
  isEditorFocused.value = true;
};

const onEditorBlur = () => {
  isEditorFocused.value = false;
  if (checkIsEmpty() && editorRef.value) {
    editorRef.value.innerHTML = '';
    emit('update:modelValue', '');
  }
};

const createImageHtml = (src: string) => {
  return `<div class="image-wrapper not-prose mb-4 block" contenteditable="false"><div class="relative inline-block max-w-full group/img"><img src="${src}" class="max-w-full rounded-md border border-base-300 block m-0" alt="Cell image" /><button type="button" data-action="delete-image" class="image-delete-btn" title="Eliminar imagen" aria-label="Eliminar imagen"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><button type="button" data-action="view-image" class="image-view-btn" title="Ver imagen completa" aria-label="Ver imagen completa"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg></button></div></div>`;
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
      
      img.className = 'max-w-full rounded-md border border-base-300 block m-0';
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-action', 'delete-image');
      btn.className = 'image-delete-btn';
      btn.title = 'Eliminar imagen';
      btn.setAttribute('aria-label', 'Eliminar imagen');
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.setAttribute('data-action', 'view-image');
      viewBtn.className = 'image-view-btn';
      viewBtn.title = 'Ver imagen completa';
      viewBtn.setAttribute('aria-label', 'Ver imagen completa');
      viewBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;

      img.parentNode?.insertBefore(wrapper, img);
      inner.appendChild(img);
      inner.appendChild(btn);
      inner.appendChild(viewBtn);
      wrapper.appendChild(inner);
    } else {
      const inner = img.parentElement;
      if (inner && !inner.querySelector('[data-action="view-image"]')) {
        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.setAttribute('data-action', 'view-image');
        viewBtn.className = 'image-view-btn';
        viewBtn.title = 'Ver imagen completa';
        viewBtn.setAttribute('aria-label', 'Ver imagen completa');
        viewBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
        inner.appendChild(viewBtn);
      }
    }
  });

  container.querySelectorAll('[data-action="delete-image"]').forEach((btn) => {
    btn.className = 'image-delete-btn';
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
  });
};

const onEditorInput = (e: Event) => {
  const target = e.target as HTMLDivElement;
  wrapRawImages(target);
  emit('update:modelValue', target.innerHTML);
  checkIsEmpty();
};

const handleEditorClick = (e: MouseEvent) => {
  isEditorFocused.value = true;
  const target = e.target as HTMLElement | null;
  if (!target || !editorRef.value) return;
  
  const viewBtn = target.closest('[data-action="view-image"]');
  if (viewBtn) {
    e.preventDefault();
    e.stopPropagation();
    
    const wrapper = viewBtn.closest('.image-wrapper') || viewBtn.parentElement?.parentElement || viewBtn.parentElement;
    const img = wrapper?.querySelector('img');
    const src = img?.getAttribute('src') || img?.src;
    if (src) {
      emit('open-image-preview', src);
    }
    return;
  }

  const deleteBtn = target.closest('[data-action="delete-image"]');
  if (deleteBtn) {
    e.preventDefault();
    e.stopPropagation();
    
    const wrapper = deleteBtn.closest('.image-wrapper') || deleteBtn.closest('.image-container') || deleteBtn.parentElement?.parentElement;
    if (wrapper) {
      wrapper.remove();
      if (editorRef.value) {
        normalizeEditorBlocks(editorRef.value);
        emit('update:modelValue', editorRef.value.innerHTML);
        placeCaretAtEnd(editorRef.value);
        checkIsEmpty();
      }
    }
    return;
  }

  const imgWrapper = target.closest('.image-wrapper');
  if (imgWrapper) {
    e.preventDefault();
    const rect = imgWrapper.getBoundingClientRect();
    const isTopHalf = (e.clientY - rect.top) < (rect.height / 2);
    
    let targetP: HTMLElement;
    if (isTopHalf) {
      let prevEl = imgWrapper.previousElementSibling as HTMLElement | null;
      if (!prevEl || prevEl.classList.contains('image-wrapper')) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        imgWrapper.parentNode?.insertBefore(p, imgWrapper);
        prevEl = p;
      }
      targetP = prevEl;
      
      editorRef.value.focus();
      setCursorInElement(targetP, false);
    } else {
      let nextEl = imgWrapper.nextElementSibling as HTMLElement | null;
      if (!nextEl || nextEl.classList.contains('image-wrapper')) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        imgWrapper.parentNode?.insertBefore(p, nextEl);
        nextEl = p;
      }
      targetP = nextEl;
      
      editorRef.value.focus();
      setCursorInElement(targetP, true);
    }
    
    if (editorRef.value) {
      emit('update:modelValue', editorRef.value.innerHTML);
    }
    return;
  }

  if (target === editorRef.value) {
    normalizeEditorBlocks(editorRef.value);
    const lastChild = editorRef.value.lastElementChild;
    if (lastChild) {
      const lastRect = lastChild.getBoundingClientRect();
      if (e.clientY > lastRect.bottom) {
        e.preventDefault();
        placeCaretAtEnd(editorRef.value);
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
            const imgHtml = createImageHtml(base64) + '<p><br></p>';
            document.execCommand('insertHTML', false, imgHtml);
            emit('update:modelValue', editorRef.value.innerHTML);
            checkIsEmpty();
            placeCaretAtEnd(editorRef.value);
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
      normalizeEditorBlocks(editorRef.value);
      emit('update:modelValue', editorRef.value.innerHTML);
      checkIsEmpty();
    }
  }, 0);
};

watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    editorRef.value.innerHTML = newVal;
    checkIsEmpty();
    
    nextTick(() => {
      if (editorRef.value) {
        wrapRawImages(editorRef.value);
        normalizeEditorBlocks(editorRef.value);
      }
    });
  }
});

const resetEditor = () => {
  isEditorFocused.value = false;
  if (editorRef.value) {
    editorRef.value.innerHTML = props.modelValue;
    wrapRawImages(editorRef.value);
    normalizeEditorBlocks(editorRef.value);
    checkIsEmpty();
    if (isEditorEmpty.value) {
      editorRef.value.innerHTML = '';
    }
  }
};

onMounted(() => {
  resetEditor();
});

defineExpose({
  resetEditor,
  editorRef
});
</script>

<template>
  <section class="p-4 flex-1 flex flex-col min-h-0">
    <!-- Rich Text Editor Container -->
    <div 
      class="w-full flex-1 flex flex-col rounded-box border border-base-300 bg-base-100 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-[border,box-shadow] overflow-hidden shadow-inner min-h-0"
    >
      <!-- Editor Toolbar Header -->
      <div class="flex items-center justify-between px-2.5 py-1.5 bg-base-200/90 border-b border-base-300 select-none flex-shrink-0">
        <div class="flex items-center gap-0.5">
          <button 
            type="button" 
            @mousedown.prevent="formatDoc('bold')" 
            title="Bold" 
            class="p-1 rounded text-base-content/60 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer"
          >
            <BoldIcon :size="14" />
          </button>
          <button 
            type="button" 
            @mousedown.prevent="formatDoc('italic')" 
            title="Italic" 
            class="p-1 rounded text-base-content/60 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer"
          >
            <ItalicIcon :size="14" />
          </button>
          
          <div class="w-px h-3.5 bg-base-300 mx-1"></div>

          <button 
            type="button" 
            @mousedown.prevent="formatDoc('insertUnorderedList')" 
            title="Bullet List" 
            class="p-1 rounded text-base-content/60 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer"
          >
            <ListIcon :size="14" />
          </button>
          <button 
            type="button" 
            @mousedown.prevent="formatDoc('insertOrderedList')" 
            title="Numbered List" 
            class="p-1 rounded text-base-content/60 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer"
          >
            <ListOrderedIcon :size="14" />
          </button>

          <div class="w-px h-3.5 bg-base-300 mx-1"></div>

          <button 
            type="button" 
            @mousedown.prevent="formatDoc('undo')" 
            title="Undo" 
            class="p-1 rounded text-base-content/60 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer"
          >
            <UndoIcon :size="13" />
          </button>
          <button 
            type="button" 
            @mousedown.prevent="formatDoc('redo')" 
            title="Redo" 
            class="p-1 rounded text-base-content/60 hover:text-base-content hover:bg-base-300 active:scale-95 transition-all cursor-pointer"
          >
            <RedoIcon :size="13" />
          </button>
        </div>

        <!-- Status & Counts & Expand -->
        <div class="flex items-center gap-2 text-xs lg:text-[11px] text-base-content/60 font-mono">
          <span v-if="imageCount > 0">{{ imageCount }} {{ imageCount === 1 ? 'img' : 'imgs' }}</span>
          <span v-if="imageCount > 0 && wordCount > 0" class="text-base-content/30">•</span>
          <span>{{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}</span>
          <span 
            class="inline-block w-1.5 h-1.5 rounded-full transition-colors ml-0.5" 
            :class="isEditorFocused ? 'bg-primary animate-pulse' : 'bg-base-content/30'"
            :title="isEditorFocused ? 'Editing...' : 'Click to edit'"
          ></span>
        </div>
      </div>

      <!-- Editable Text Body -->
      <div class="relative flex-1 min-h-0 cursor-text" @click.self="focusEditor">
        <div 
          ref="editorRef"
          class="w-full h-full overflow-y-auto p-3 bg-transparent text-base lg:text-sm focus:outline-none cursor-text prose lg:prose-sm prose-invert max-w-none relative z-10 editor-scroll text-base-content"
          contenteditable="true"
          @input="onEditorInput"
          @focus="onEditorFocus"
          @blur="onEditorBlur"
          @click="handleEditorClick"
          @paste="handleEditorPaste"
          :data-placeholder="editorPlaceholder"
        >
        </div>

      <!-- Placeholder Overlay -->
        <div
          v-if="showPlaceholder"
          class="absolute inset-0 p-3 pointer-events-none text-base lg:text-sm text-base-content/40 select-none leading-relaxed overflow-hidden italic z-20 border border-transparent"
        >
          {{ editorPlaceholder }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editor-scroll::-webkit-scrollbar {
  width: 6px;
}
.editor-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.editor-scroll::-webkit-scrollbar-thumb {
  background-color: #404040;
  border-radius: 9999px;
}
.editor-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #525252;
}

:deep(.image-wrapper) {
  position: relative;
  user-select: none;
  cursor: default;
}

:deep(.editor-scroll p) {
  min-height: 1.5em;
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

:deep(.image-view-btn) {
  position: absolute !important;
  bottom: 5px !important;
  right: 5px !important;
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  min-height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  margin: 0 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 6px !important;
  background-color: rgba(24, 24, 27, 0.85) !important;
  backdrop-filter: blur(4px) !important;
  color: #e5e5e5 !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45) !important;
  cursor: pointer !important;
  user-select: none !important;
  line-height: 0 !important;
  transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease !important;
  z-index: 10 !important;
}

:deep(.image-view-btn:hover) {
  background-color: rgba(38, 38, 38, 0.95) !important;
  color: #ffffff !important;
  transform: scale(1.1) !important;
}

:deep(.image-view-btn:active) {
  transform: scale(0.92) !important;
}

:deep(.image-view-btn svg) {
  display: block !important;
  width: 13px !important;
  height: 13px !important;
  stroke: currentColor !important;
  stroke-width: 2 !important;
  margin: 0 !important;
  padding: 0 !important;
  pointer-events: none !important;
}
</style>
