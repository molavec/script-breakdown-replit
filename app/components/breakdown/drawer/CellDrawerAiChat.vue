<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { 
  Send as SendIcon, 
  Loader2 as Loader2Icon, 
  PlusCircle as PlusCircleIcon
} from 'lucide-vue-next';
import { parseMarkdown } from '~~/utils/markdown';
import type { BreakdownChatMessage } from '~~/shared/types/chat';

const props = defineProps<{
  project: any;
  activeColumn: any;
  availableColumns: any[];
  currentRow: any;
  currentContent: string;
}>();

const emit = defineEmits<{
  (e: 'replace-content', text: string, imageUrl?: string): void;
  (e: 'insert-content', text: string, imageUrl?: string): void;
  (e: 'open-image-preview', url: string): void;
}>();

const messages = ref<BreakdownChatMessage[]>([]);
const inputValue = ref('');
const isGenerating = ref(false);
const selectedGenerationType = ref<'text' | 'image' | 'video' | 'audio'>('text');
const chatInputRef = ref<HTMLTextAreaElement | null>(null);
const chatContainerRef = ref<HTMLDivElement | null>(null);
const selectedContextColumns = ref<string[]>([]);

watch(() => props.activeColumn, (newCol) => {
  if (newCol?.cellType === 'media') {
    selectedGenerationType.value = 'image';
  } else {
    selectedGenerationType.value = 'text';
  }
}, { immediate: true });

const resetChat = (contextColIds: string[]) => {
  messages.value = [];
  inputValue.value = '';
  selectedContextColumns.value = contextColIds;
  nextTick(() => adjustTextareaHeight());
};

const aiExample = computed(() => {
  const col = props.activeColumn;
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
  
  let contextString = '';
  
  if (props.activeColumn?.options?.defaultPrompt) {
    contextString += `${props.activeColumn.options.defaultPrompt}\n\n`;
  }
  
  contextString += `Context from current row/shot:\n`;
  contextString += `- current_content: ${props.currentContent || 'Empty'}\n`;
  
  if (props.currentRow) {
    for (const colId of selectedContextColumns.value) {
      const col = props.availableColumns.find(c => c.id === colId);
      const cell = props.currentRow.cells[colId];
      let cellContent = 'Empty';
      if (cell) {
        if (cell.numericValue != null) {
           cellContent = String(cell.numericValue);
        } else if (cell.blocks && cell.blocks.length > 0) {
           cellContent = cell.blocks.map((b: any) => b.type === 'image' ? '[Image]' : b.content).join(' ');
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
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        projectId: props.project?.id,
        prompt: userText,
        systemInstruction: contextString,
        generationType: selectedGenerationType.value
      }
    });

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
  } catch (error: any) {
    console.error("Error generating content:", error);
    const msgIndex = messages.value.findIndex(m => m.id === loadingMsgId);
    if (msgIndex !== -1) {
       const msg = messages.value[msgIndex];
       if (msg) {
         const errorMessage = error?.data?.statusMessage || error?.statusMessage || error?.message || "Sorry, I encountered an error generating the content.";
         msg.text = errorMessage;
         msg.isGenerating = false;
       }
    }
  } finally {
    isGenerating.value = false;
    scrollToBottom();
  }
};

defineExpose({
  resetChat
});
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <section class="flex-1 flex flex-col p-4 overflow-hidden">
      <h2 class="text-xs lg:text-[10px] font-bold text-base-content/60 mb-3 uppercase tracking-wider">AI ASSISTANT</h2>
      
      <div class="flex-1 overflow-y-auto space-y-4 pr-2" ref="chatContainerRef">
        <div v-if="messages.length === 0" class="text-center text-sm lg:text-xs mt-10 px-6 space-y-1.5 select-none leading-relaxed">
          <p class="text-base-content/70">
            Ask me to generate {{ aiExample.description }}.
          </p>
          <p class="text-base-content/50 italic">
            Try: "{{ aiExample.promptExample }}" to receive {{ aiExample.resultSummary }}.
          </p>
        </div>
        
        <div v-for="msg in messages" :key="msg.id" 
          class="flex flex-col max-w-[85%]" 
          :class="msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'">
          
          <div class="p-3 rounded-box text-base lg:text-sm"
            :class="msg.role === 'user' ? 'bg-primary/20 text-base-content rounded-tr-none border border-primary/30' : 'bg-base-300/80 text-base-content rounded-tl-none border border-base-300'">
            
            <div v-if="msg.isGenerating" class="flex items-center space-x-2 text-base-content/60">
              <Loader2Icon :size="16" class="animate-spin" />
              <span>Generating...</span>
            </div>
            
            <template v-else>
              <div v-if="msg.text" class="mb-2 prose lg:prose-sm prose-invert max-w-none text-base-content" v-html="parseMarkdown(msg.text)"></div>
              <div v-if="msg.imageUrl" class="relative inline-block max-w-full group/msg-img mt-2">
                <img :src="msg.imageUrl" alt="Generated" class="max-w-full rounded-box border border-base-300 block" />
                <button 
                  type="button"
                  class="absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center rounded-md bg-base-200/90 hover:bg-base-300 text-base-content border border-base-300 shadow-lg backdrop-blur-sm transition-all hover:scale-110 active:scale-95 cursor-pointer"
                  title="Ver imagen completa"
                  aria-label="Ver imagen completa"
                  @click.stop="emit('open-image-preview', msg.imageUrl)"
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
                @click="emit('replace-content', msg.text, msg.imageUrl)"
                class="badge badge-sm py-2.5 px-2 bg-base-200 text-base-content/70 hover:text-base-content hover:bg-base-300 border-base-300 cursor-pointer transition-colors"
              >
                Replace
              </button>
              <button
                @click="emit('insert-content', msg.text, msg.imageUrl)"
                class="badge badge-sm py-2.5 px-2 bg-secondary/15 text-secondary hover:bg-secondary hover:text-secondary-content border-secondary/30 cursor-pointer transition-colors font-medium"
              >
                + Insert
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="p-4 pt-0">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
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

          <div class="dropdown dropdown-top dropdown-end" v-if="availableColumns.length > 0">
            <div tabindex="0" role="button" class="btn btn-xs btn-secondary text-secondary-content font-medium flex items-center gap-1">
              <PlusCircleIcon :size="14" />
              Context ({{ selectedContextColumns.length }})
            </div>
            <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-200 border border-base-300 rounded-box w-72 mb-2 max-h-60 overflow-y-auto">
              <li class="menu-title px-2 py-1 text-xs lg:text-[10px] text-base-content/50 font-bold uppercase tracking-wider">Include in Context</li>
              <li v-for="col in availableColumns" :key="col.id">
                <label class="label cursor-pointer flex justify-start gap-2 py-1.5 px-2 hover:bg-base-300 rounded-md">
                  <input type="checkbox" :value="col.id" v-model="selectedContextColumns" class="checkbox checkbox-xs checkbox-secondary border-base-300 rounded-sm" />
                  <span class="label-text text-base-content text-sm lg:text-xs truncate">{{ col.name }}</span>
                </label>
              </li>
            </ul>
          </div>
        </div>

        <div class="relative flex items-end">
          <textarea
            ref="chatInputRef"
            rows="1"
            v-model="inputValue"
            @keydown="handleKeyDown"
            @input="adjustTextareaHeight"
            :placeholder="chatInputPlaceholder"
            class="w-full bg-base-100 border border-base-300 rounded-2xl py-2.5 pl-4 pr-12 text-base lg:text-sm text-base-content focus:outline-none focus:border-primary placeholder:text-base-content/40 resize-none overflow-y-auto min-h-[42px] max-h-[300px] leading-relaxed block"
            :disabled="isGenerating"
          ></textarea>
          <button 
            @click="handleSendMessage"
            :disabled="!inputValue.trim() || isGenerating"
            class="absolute right-2 bottom-1.5 p-2 text-base-content/40 hover:text-primary disabled:opacity-30 transition-colors rounded-lg"
          >
            <SendIcon :size="18" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
