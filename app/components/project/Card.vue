<script setup lang="ts">
const props = defineProps<{
  to: string
  title: string
  type: string
  status: string
  image: string
  modifiedAt: string
  users?: boolean
}>()

const isDraft = computed(() => props.status?.toLowerCase() === 'draft')

const imageClasses = computed(() => {
  if (isDraft.value) {
    return 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-90'
  }
  return 'opacity-80 group-hover:opacity-100'
})

const statusContainerClasses = computed(() => {
  if (isDraft.value) {
    return 'text-base-content/60'
  }
  return ''
})

const statusDotClasses = computed(() => {
  if (isDraft.value) {
    return 'bg-base-content/40'
  }
  return 'bg-warning shadow-sm shadow-warning'
})

const formattedStatus = computed(() => {
  if (!props.status) return 'Unknown'
  return props.status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})
</script>

<template>
  <NuxtLink :to="to" class="card bg-base-200 border border-base-300 rounded-box overflow-hidden flex flex-col group cursor-pointer hover:border-base-content/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/50">
    <div class="relative h-[220px] bg-base-300 overflow-hidden">
      <img :src="image" :alt="title + ' cover'" class="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" :class="imageClasses" />
      <div class="absolute inset-0 bg-gradient-to-t from-base-200 via-transparent to-transparent opacity-80"></div>
      <div class="absolute top-4 left-4 badge badge-sm badge-neutral bg-base-100/80 backdrop-blur-md px-2.5 py-2 rounded-box text-xs font-medium flex items-center gap-2 border border-base-300 text-base-content" :class="statusContainerClasses">
        <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClasses"></span>
        {{ formattedStatus }}
      </div>
    </div>
    <div class="p-6 flex-1 flex flex-col justify-between -mt-2 relative z-10">
      <div>
        <h3 class="text-2xl font-semibold mb-2 text-base-content group-hover:text-primary transition-colors">{{ title }}</h3>
        <p class="text-base-content/60 font-mono text-xs uppercase tracking-wider">{{ type }}</p>
      </div>
      <div class="flex items-center justify-between mt-8 pt-4 border-t border-base-300 text-base-content/50 text-xs">
        <div class="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Modified {{ modifiedAt }}
        </div>
        <div v-if="users" class="flex -space-x-1.5">
          <div class="w-6 h-6 rounded-full bg-base-300 border-2 border-base-200"></div>
          <div class="w-6 h-6 rounded-full bg-base-100 border-2 border-base-200"></div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
