<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { 
  Send as SendIcon, 
  Loader2 as Loader2Icon, 
  PlusCircle as PlusCircleIcon,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Pencil as PencilIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon
} from 'lucide-vue-next';
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

const isEditorFocused = ref(false);
const isEditorEmpty = ref(true);

const editorHeight = ref(240);
const isExpanded = ref(false);
const savedHeight = ref(240);
const isResizing = ref(false);

const toggleExpand = () => {
  if (isExpanded.value) {
    editorHeight.value = savedHeight.value || 240;
    isExpanded.value = false;
  } else {
    savedHeight.value = editorHeight.value;
    const maxH = typeof window !== 'undefined' ? Math.max(300, window.innerHeight - 360) : 480;
    editorHeight.value = Math.min(maxH, 500);
    isExpanded.value = true;
  }
};

const startResize = (e: MouseEvent) => {
  e.preventDefault();
  isResizing.value = true;
  const startY = e.clientY;
  const startHeight = editorHeight.value;

  const onMouseMove = (moveEvent: MouseEvent) => {
    const deltaY = moveEvent.clientY - startY;
    const maxH = typeof window !== 'undefined' ? Math.max(260, window.innerHeight - 340) : 600;
    const newHeight = Math.min(Math.max(160, startHeight + deltaY), maxH);
    editorHeight.value = newHeight;
    isExpanded.value = newHeight > 380;
  };

  const onMouseUp = () => {
    isResizing.value = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
};

const wordCount = computed(() => {
  if (!editContent.value) return 0;
  const text = editContent.value.replace(/<[^>]*>/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
});

const imageCount = computed(() => {
  if (!editContent.value) return 0;
  const matches = editContent.value.match(/<img\b[^>]*>/gi);
  return matches ? matches.length : 0;
});

const formatDoc = (command: string, value: string | undefined = undefined) => {
  if (!editorRef.value) return;
  if (document.activeElement !== editorRef.value) {
    editorRef.value.focus();
  }
  document.execCommand(command, false, value);
  editContent.value = editorRef.value.innerHTML;
  checkIsEmpty();
};

const editorPlaceholder = computed(() => {
  if (activeColumn.value?.cellType === 'tags') {
    return activeColumn.value?.options?.placeholder?.trim() || 'Item 1, Item 2, Item 3...';
  }
  if (activeColumn.value?.cellType === 'number') {
    return activeColumn.value?.options?.placeholder?.trim() || '0.00';
  }
  const desc = activeColumn.value?.description?.trim();
  if (desc) {
    return desc;
  }
  const colPlaceholder = activeColumn.value?.options?.placeholder?.trim();
  if (colPlaceholder) {
    return colPlaceholder;
  }
  const defaultPrompt = activeColumn.value?.options?.defaultPrompt?.trim();
  if (defaultPrompt) {
    return defaultPrompt;
  }
  if (activeColumn.value?.name) {
    return `Enter details for ${activeColumn.value.name}...`;
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

const placeCaretAtEnd = (el: HTMLElement) => {
  ensureTrailingParagraph(el);
  el.focus();
  
  const range = document.createRange();
  const sel = window.getSelection();
  
  let targetNode: Node = el;
  const lastChild = el.lastElementChild;
  if (lastChild) {
    targetNode = lastChild;
  }
  
  range.selectNodeContents(targetNode);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
};

const focusEditor = (e?: MouseEvent) => {
  if (!editorRef.value) return;
  isEditorFocused.value = true;
  if (!e || e.target === editorRef.value || e.currentTarget !== editorRef.value) {
    placeCaretAtEnd(editorRef.value);
  } else if (document.activeElement !== editorRef.value) {
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
    editContent.value = '';
  }
};

const previewImageUrl = ref<string | null>(null);

const openImagePreview = (url: string) => {
  previewImageUrl.value = url;
};

const closeImagePreview = () => {
  previewImageUrl.value = null;
};

const messages = ref<BreakdownChatMessage[]>([]);
const inputValue = ref('');
const isGenerating = ref(false);
const selectedGenerationType = ref<'text' | 'image' | 'video' | 'audio'>('text');
const chatInputRef = ref<HTMLTextAreaElement | null>(null);

const aiExample = computed(() => {
  const col = activeColumn.value;
  const colName = col?.name?.toLowerCase() || '';
  const isImageMode = selectedGenerationType.value === 'image' || col?.cellType === 'media';

  if (isImageMode) {
    return {
      description: 'an image for this shot',
      promptExample: 'Cinematic 35mm wide shot, moody sunset lighting, rainy street',
      resultSummary: 'a high-resolution visual ready to insert',
      placeholder: 'e.g., Cinematic wide angle, moody warm lighting, rainy street...'
    };
  }

  if (col?.cellType === 'tags') {
    const isCast = colName.includes('cast') || colName.includes('personaje') || colName.includes('actor');
    return {
      description: `tags for ${col?.name || 'this cell'}`,
      promptExample: isCast 
        ? 'List main characters and background extras for this scene' 
        : `List all ${col?.name || 'items'} needed for this shot`,
      resultSummary: 'a list of tags ready to insert',
      placeholder: `e.g., List ${col?.name || 'items'} appearing in this shot...`
    };
  }

  if (col?.cellType === 'number') {
    return {
      description: `a calculated ${col?.name || 'value'} for this shot`,
      promptExample: 'Estimate shot duration in seconds based on dialogue',
      resultSummary: 'a numeric value to apply',
      placeholder: `e.g., Estimate ${col?.name || 'value'} in seconds...`
    };
  }

  // Text columns
  return {
    description: `content for ${col?.name || 'this cell'}`,
    promptExample: col?.options?.defaultPrompt || `Draft details for ${col?.name || 'this shot'}`,
    resultSummary: 'formatted text ready to insert or replace',
    placeholder: `e.g., Draft details for ${col?.name || 'this cell'}...`
  };
});

const chatInputPlaceholder = computed(() => aiExample.value.placeholder);

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
  return `<div class="image-wrapper not-prose mb-4 block" contenteditable="false"><div class="relative inline-block max-w-full group/img"><img src="${src}" class="max-w-full rounded-md border border-neutral-700 block m-0" alt="Cell image" /><button type="button" data-action="delete-image" class="image-delete-btn" title="Eliminar imagen" aria-label="Eliminar imagen"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><button type="button" data-action="view-image" class="image-view-btn" title="Ver imagen completa" aria-label="Ver imagen completa"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg></button></div></div>`;
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
      ensureTrailingParagraph(editorRef.value);
    }
    isEditorFocused.value = false;
    checkIsEmpty();
    if (isEditorEmpty.value && editorRef.value) {
      editorRef.value.innerHTML = '';
    }
    
    // Set default selected generation type based on column
    if (activeColumn.value?.cellType === 'media') {
      selectedGenerationType.value = 'image';
    } else {
      selectedGenerationType.value = 'text';
    }
  } else if (!isOpen) {
    isEditorFocused.value = false;
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
      openImagePreview(src);
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
        ensureTrailingParagraph(editorRef.value);
        editContent.value = editorRef.value.innerHTML;
        placeCaretAtEnd(editorRef.value);
        checkIsEmpty();
      }
    }
    return;
  }

  // If clicked on an image or inside image wrapper (which is contenteditable="false")
  const imgWrapper = target.closest('.image-wrapper');
  if (imgWrapper) {
    e.preventDefault();
    let nextEl = imgWrapper.nextElementSibling as HTMLElement | null;
    if (!nextEl || nextEl.classList.contains('image-wrapper')) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      imgWrapper.parentNode?.insertBefore(p, nextEl);
      nextEl = p;
    }
    
    editorRef.value.focus();
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(nextEl);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
    return;
  }

  // If clicked directly on the editor container (e.g. empty space below or between blocks)
  if (target === editorRef.value) {
    ensureTrailingParagraph(editorRef.value);
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
            editContent.value = editorRef.value.innerHTML;
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
      editContent.value = editorRef.value.innerHTML;
      checkIsEmpty();
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
    htmlToInsert += '<p><br></p>';
  }
  return htmlToInsert;
};

const handleAddToContent = (text: string, imageUrl?: string) => {
  if (!editorRef.value) return;
  
  const htmlToInsert = formatContentHtml(text, imageUrl);
  editorRef.value.insertAdjacentHTML('beforeend', htmlToInsert);
  ensureTrailingParagraph(editorRef.value);
  editContent.value = editorRef.value.innerHTML;
  checkIsEmpty();
  placeCaretAtEnd(editorRef.value);
};

const handleReplaceContent = (text: string, imageUrl?: string) => {
  if (!editorRef.value) return;
  
  const htmlToInsert = formatContentHtml(text, imageUrl);
  editorRef.value.innerHTML = htmlToInsert;
  ensureTrailingParagraph(editorRef.value);
  editContent.value = editorRef.value.innerHTML;
  checkIsEmpty();
  placeCaretAtEnd(editorRef.value);
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
  // Discard any unsaved changes and restore original cell content
  if (activeCell.value) {
    let initialContent = '';
    if (activeCell.value.blocks && activeCell.value.blocks.length > 0) {
      initialContent = activeCell.value.blocks.map(b => {
        if (b.type === 'image') {
          return createImageHtml(b.content);
        }
        return parseMarkdown(b.content);
      }).join('');
    }
    editContent.value = initialContent;
    if (editorRef.value) {
      editorRef.value.innerHTML = initialContent;
      wrapRawImages(editorRef.value);
      ensureTrailingParagraph(editorRef.value);
    }
    checkIsEmpty();
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
        </header>

        <!-- Body -->
        <div class="flex-1 flex flex-col overflow-hidden" v-if="activeCell">
          
          <!-- Top Section: Cell Content Editor -->
          <section class="p-4 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">CELL CONTENT</h2>
              <span v-if="activeColumn" class="text-xs text-neutral-400 font-medium truncate max-w-[200px]" :title="activeColumn.name">
                {{ activeColumn.name }}
              </span>
            </div>

            <!-- Declarative text & column description -->
            <div class="mb-2.5 space-y-0.5">
              <p v-if="activeColumn?.description" class="text-xs text-neutral-300 leading-relaxed">
                {{ activeColumn.description }}
              </p>
              <p class="text-[11px] text-neutral-400 leading-relaxed flex items-center gap-1.5">
                <PencilIcon :size="12" class="text-neutral-500 shrink-0" />
                <span>Click inside the editor below to write or edit content directly.</span>
              </p>
            </div>

            <!-- Rich Text Editor Container -->
            <div 
              class="w-full flex flex-col rounded-lg border border-neutral-700/80 bg-[#121215] focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-500/40 transition-[border,box-shadow] overflow-hidden shadow-inner"
              :style="{ height: `${editorHeight}px` }"
            >
              <!-- Editor Toolbar Header -->
              <div class="flex items-center justify-between px-2.5 py-1.5 bg-[#1e1e24] border-b border-neutral-800 select-none flex-shrink-0">
                <div class="flex items-center gap-0.5">
                  <button 
                    type="button" 
                    @mousedown.prevent="formatDoc('bold')" 
                    title="Bold" 
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <BoldIcon :size="14" />
                  </button>
                  <button 
                    type="button" 
                    @mousedown.prevent="formatDoc('italic')" 
                    title="Italic" 
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <ItalicIcon :size="14" />
                  </button>
                  
                  <div class="w-px h-3.5 bg-neutral-700 mx-1"></div>

                  <button 
                    type="button" 
                    @mousedown.prevent="formatDoc('insertUnorderedList')" 
                    title="Bullet List" 
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <ListIcon :size="14" />
                  </button>
                  <button 
                    type="button" 
                    @mousedown.prevent="formatDoc('insertOrderedList')" 
                    title="Numbered List" 
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <ListOrderedIcon :size="14" />
                  </button>

                  <div class="w-px h-3.5 bg-neutral-700 mx-1"></div>

                  <button 
                    type="button" 
                    @mousedown.prevent="formatDoc('undo')" 
                    title="Undo" 
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <UndoIcon :size="13" />
                  </button>
                  <button 
                    type="button" 
                    @mousedown.prevent="formatDoc('redo')" 
                    title="Redo" 
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <RedoIcon :size="13" />
                  </button>
                </div>

                <!-- Status & Counts & Expand -->
                <div class="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                  <span v-if="imageCount > 0">{{ imageCount }} {{ imageCount === 1 ? 'img' : 'imgs' }}</span>
                  <span v-if="imageCount > 0 && wordCount > 0" class="text-neutral-600">•</span>
                  <span>{{ wordCount }} {{ wordCount === 1 ? 'word' : 'words' }}</span>
                  <span 
                    class="inline-block w-1.5 h-1.5 rounded-full transition-colors ml-0.5" 
                    :class="isEditorFocused ? 'bg-red-500 animate-pulse' : 'bg-neutral-600'"
                    :title="isEditorFocused ? 'Editing...' : 'Click to edit'"
                  ></span>
                  <div class="w-px h-3.5 bg-neutral-700 mx-0.5"></div>
                  <button 
                    type="button" 
                    @click="toggleExpand" 
                    :title="isExpanded ? 'Collapse editor' : 'Expand editor vertically'"
                    class="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-700/60 active:scale-95 transition-all cursor-pointer"
                  >
                    <Minimize2Icon v-if="isExpanded" :size="13" />
                    <Maximize2Icon v-else :size="13" />
                  </button>
                </div>
              </div>

              <!-- Editable Text Body -->
              <div class="relative flex-1 min-h-0 cursor-text" @click="focusEditor">
                <div 
                  ref="editorRef"
                  class="w-full h-full overflow-y-auto p-3 bg-transparent text-sm focus:outline-none cursor-text prose prose-sm prose-invert max-w-none relative z-10 editor-scroll"
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
                  class="absolute inset-0 p-3 pointer-events-none text-sm text-neutral-500 select-none leading-relaxed overflow-hidden italic z-20 border border-transparent"
                >
                  {{ editorPlaceholder }}
                </div>
              </div>

              <!-- Resize Handle -->
              <div 
                class="h-3 w-full flex items-center justify-center cursor-row-resize bg-[#18181c] hover:bg-neutral-800 active:bg-neutral-700/80 transition-colors group select-none border-t border-neutral-800 flex-shrink-0"
                @mousedown="startResize"
                title="Drag to resize editor vertically"
              >
                <div class="w-10 h-1 rounded-full bg-neutral-600 group-hover:bg-neutral-400 group-active:bg-neutral-300 transition-colors"></div>
              </div>
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
              <!-- Empty state simple message -->
              <div v-if="messages.length === 0" class="text-center text-xs mt-10 px-6 space-y-1.5 select-none leading-relaxed">
                <p class="text-neutral-400">
                  Ask me to generate {{ aiExample.description }}.
                </p>
                <p class="text-neutral-500 italic">
                  Try: "{{ aiExample.promptExample }}" to receive {{ aiExample.resultSummary }}.
                </p>
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
                    <div v-if="msg.imageUrl" class="relative inline-block max-w-full group/msg-img mt-2">
                      <img :src="msg.imageUrl" alt="Generated" class="max-w-full rounded-md border border-neutral-700 block" />
                      <button 
                        type="button"
                        class="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-md bg-neutral-900/85 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        title="Ver imagen completa"
                        aria-label="Ver imagen completa"
                        @click.stop="openImagePreview(msg.imageUrl)"
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
                <div tabindex="0" role="button" class="btn btn-xs btn-warning text-black flex items-center gap-1">
                  <PlusCircleIcon :size="14" />
                  Context ({{ selectedContextColumns.length }})
                </div>
                <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-[#262626] border border-neutral-700 rounded-box w-72 mb-2 max-h-60 overflow-y-auto">
                  <li class="menu-title px-2 py-1 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Include in Context</li>
                  <li v-for="col in availableColumns" :key="col.id">
                    <label class="label cursor-pointer flex justify-start gap-2 py-1.5 px-2 hover:bg-[#333333] rounded-md">
                      <input type="checkbox" :value="col.id" v-model="selectedContextColumns" class="checkbox checkbox-xs checkbox-warning border-neutral-500 rounded-sm" />
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
                :placeholder="chatInputPlaceholder"
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

          <div class="flex items-center gap-3 w-full">
            <button 
              type="button" 
              @click="handleCancel" 
              :disabled="isUploading" 
              class="flex-1 flex justify-center items-center py-3 px-4 rounded-md border border-neutral-700 hover:border-neutral-600 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300 hover:text-white font-medium transition-colors text-sm cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="button" 
              @click="saveAndClose" 
              :disabled="isUploading" 
              class="flex-[2] flex justify-center items-center gap-2 bg-[#e53e3e] hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-[#e53e3e] text-white font-bold py-3 px-4 rounded-md transition-colors text-sm cursor-pointer shadow-md shadow-red-950/20"
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