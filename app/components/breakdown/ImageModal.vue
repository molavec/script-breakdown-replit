<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps<{
  src?: string | null;
  alt?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isMounted = ref(false);

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.src) {
    emit('close');
  }
};

onMounted(() => {
  isMounted.value = true;
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Prevent body scroll when modal is open
watch(() => props.src, (newVal) => {
  if (typeof document !== 'undefined') {
    if (newVal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
});
</script>

<template>
  <Teleport to="body">
    <dialog 
      v-if="isMounted && src" 
      class="modal modal-open modal-middle z-[99999]"
      @click.self="emit('close')"
    >
      <div class="modal-box max-w-5xl w-auto p-4 bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden my-auto mx-4">
        
        <!-- Header Controls -->
        <div class="absolute top-3 right-3 flex items-center gap-1.5 z-20 bg-neutral-900/80 backdrop-blur-sm p-1 rounded-full border border-neutral-700/60 shadow-md">
          <a 
            :href="src" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-xs btn-circle btn-ghost text-neutral-400 hover:text-white"
            title="Abrir imagen en pestaña nueva"
            aria-label="Abrir imagen en pestaña nueva"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <button 
            type="button" 
            class="btn btn-xs btn-circle btn-ghost text-neutral-400 hover:text-white"
            title="Cerrar"
            aria-label="Cerrar modal"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Full Image -->
        <div class="w-full flex items-center justify-center pt-8 pb-2 px-2">
          <img 
            :src="src" 
            :alt="alt || 'Vista previa completa'" 
            class="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl border border-neutral-800 select-none transition-transform" 
          />
        </div>
      </div>
      
      <!-- Backdrop -->
      <form method="dialog" class="modal-backdrop bg-black/80 backdrop-blur-md" @submit.prevent="emit('close')">
        <button type="submit">close</button>
      </form>
    </dialog>
  </Teleport>
</template>
