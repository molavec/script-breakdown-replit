<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  maxHeight?: number;
}>();

const maxH = props.maxHeight || 250;
const containerRef = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);
const isExpanded = ref(false);

let observer: ResizeObserver | null = null;

const checkOverflow = () => {
  if (!containerRef.value) return;
  // Check if content naturally exceeds maxHeight
  isOverflowing.value = containerRef.value.scrollHeight > maxH;
};

onMounted(() => {
  checkOverflow();
  observer = new ResizeObserver(() => {
    checkOverflow();
  });
  if (containerRef.value) {
    observer.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="relative w-full">
    <div 
      ref="containerRef"
      class="w-full transition-all duration-300"
      :class="isExpanded ? '' : 'overflow-hidden'"
      :style="!isExpanded ? { maxHeight: `${maxH}px` } : {}"
    >
      <slot />
    </div>
    
    <!-- Gradient overlay when compressed -->
    <div 
      v-if="isOverflowing && !isExpanded" 
      class="absolute bottom-6 left-0 right-0 h-10 bg-gradient-to-t from-[#18181b] to-transparent pointer-events-none"
    ></div>
    
    <!-- Toggle Button -->
    <div v-if="isOverflowing" class="mt-2 flex justify-start">
      <button 
        @click.stop="toggle" 
        class="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
      >
        {{ isExpanded ? 'Ver menos' : 'Ver más' }}
      </button>
    </div>
  </div>
</template>
