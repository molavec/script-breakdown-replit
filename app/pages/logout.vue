<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="bg-[#1e1e1e]/95 backdrop-blur-xl rounded-xl p-12 border border-white/5 shadow-2xl shadow-black/50 flex flex-col items-center justify-center gap-6">
    <div class="w-10 h-10 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
    <p class="text-xs font-bold text-gray-300 tracking-widest uppercase">Logging out...</p>
  </div>
</template>
