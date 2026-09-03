<script setup lang="ts">
const props = defineProps<{
  to: string
  title: string
  type: string
  status: 'In Progress' | 'Draft'
  image: string
  modifiedAt: string
  users?: boolean
}>()

const imageClasses = computed(() => {
  if (props.status === 'Draft') {
    return 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-90'
  }
  return 'opacity-80 group-hover:opacity-100'
})

const statusContainerClasses = computed(() => {
  if (props.status === 'Draft') {
    return 'text-gray-300'
  }
  return ''
})

const statusDotClasses = computed(() => {
  if (props.status === 'Draft') {
    return 'bg-gray-400'
  }
  return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
})
</script>

<template>
  <NuxtLink :to="to" class="bg-[#1c1c1c] border border-white/5 rounded-xl overflow-hidden flex flex-col group cursor-pointer hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/50">
    <div class="relative h-[220px] bg-gray-900 overflow-hidden">
      <img :src="image" :alt="title + ' cover'" class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" :class="imageClasses" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#1c1c1c] via-transparent to-transparent opacity-80"></div>
      <div class="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-2 border border-white/10" :class="statusContainerClasses">
        <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClasses"></span>
        {{ status }}
      </div>
    </div>
    <div class="p-6 flex-1 flex flex-col justify-between -mt-2 relative z-10">
      <div>
        <h3 class="text-2xl font-semibold mb-2 text-gray-100 group-hover:text-white transition-colors">{{ title }}</h3>
        <p class="text-gray-400 font-mono text-xs uppercase tracking-wider">{{ type }}</p>
      </div>
      <div class="flex items-center justify-between mt-8 pt-4 border-t border-white/5 text-gray-500 text-xs">
        <div class="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Modified {{ modifiedAt }}
        </div>
        <div v-if="users" class="flex -space-x-1.5">
          <div class="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#1c1c1c]"></div>
          <div class="w-6 h-6 rounded-full bg-gray-600 border-2 border-[#1c1c1c]"></div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
