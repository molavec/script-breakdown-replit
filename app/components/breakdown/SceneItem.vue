<script setup lang="ts">
import type { Scene } from '~~/shared/types/scene';

defineProps<{
  scene: Scene;
  active?: boolean;
}>();

defineEmits(['select']);
</script>

<template>
  <div
    class="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors"
    :class="{
      'bg-neutral-800 text-white': active,
      'hover:bg-neutral-800/50 text-neutral-400': !active
    }"
    @click="$emit('select')"
  >
    <div class="drag-handle cursor-grab active:cursor-grabbing text-neutral-500 hover:text-neutral-300">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="12" r="1"></circle>
        <circle cx="9" cy="5" r="1"></circle>
        <circle cx="9" cy="19" r="1"></circle>
        <circle cx="15" cy="12" r="1"></circle>
        <circle cx="15" cy="5" r="1"></circle>
        <circle cx="15" cy="19" r="1"></circle>
      </svg>
    </div>
    <span class="text-sm font-medium">Scene {{ scene.order }}</span>
  </div>
</template>
